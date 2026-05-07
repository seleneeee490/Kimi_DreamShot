const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

if (!REPLICATE_API_KEY) {
  console.warn('VITE_REPLICATE_API_KEY is not set. Face fusion will not work.');
}

const API_BASE = '/api/replicate';

const PHOTOMAKER_VERSION = 'ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4';

async function replicateFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Replicate error (${res.status}): ${err}`);
  }
  return res.json();
}

async function pollPrediction(url: string): Promise<any> {
  const proxyUrl = url.replace('https://api.replicate.com', API_BASE);
  while (true) {
    const res = await fetch(proxyUrl, {
      headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
    });
    const data = await res.json();
    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed') throw new Error(data.error || 'Generation failed');
    await new Promise((r) => setTimeout(r, 1000));
  }
}

export async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generate a couple photo using tencentarc/photomaker.
 * Takes two face reference images and a text prompt describing the scene.
 * The model generates a NEW photo with both faces in the described setting.
 */
export async function generateCouplePhoto(
  userFaceImage: string,
  gdFaceImage: string,
  scenePrompt: string,
): Promise<string> {
  // Build the prompt with the "img" trigger word for the first face
  const prompt = scenePrompt.includes('img') ? scenePrompt : `${scenePrompt} img`;

  const prediction = await replicateFetch(
    `/v1/models/tencentarc/photomaker/versions/${PHOTOMAKER_VERSION}/predictions`,
    {
      method: 'POST',
      body: JSON.stringify({
        input: {
          input_image: userFaceImage,
          input_image2: gdFaceImage,
          prompt,
          style_name: 'Photographic (Default)',
          num_outputs: 1,
          guidance_scale: 5,
          num_steps: 30,
          style_strength_ratio: 20,
        },
      }),
    }
  );

  if (prediction.status === 'succeeded') {
    return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  }

  const output = await pollPrediction(prediction.urls.get);
  return Array.isArray(output) ? output[0] : output;
}
