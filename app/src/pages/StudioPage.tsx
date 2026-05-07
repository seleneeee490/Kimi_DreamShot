import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Camera,
  Upload,
  Heart,
  Sparkles,
  Image,
  Film,
  Sun,
  RotateCcw,
  Palette,
  Aperture,
  ChevronLeft,
  BookOpen,
  MessageCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ChatPanel, { useSceneChat } from '../components/ChatPanel';
import { generateCouplePhoto, toBase64 } from '../lib/replicate';

const scenes = [
  {
    id: 'photobooth',
    name: '情侣四格大头贴',
    tags: ['参考图', '四格', '纪念'],
    icon: '📸',
    prompt:
      'A Korean style 4-cut photo booth strip of a cute couple, two young Asian people taking selfies together in a photo booth making heart poses and peace signs, warm soft romantic lighting, pinkish warm tone, photobooth selfie style,胶片感, each frame shows different cute couple pose, high quality, cute atmosphere img',
  },
  {
    id: 'sakura',
    name: '樱花合照',
    tags: ['复古', '樱花', '浪漫'],
    icon: '🌸',
    prompt:
      'a man and a woman standing under cherry blossom trees, spring season, falling pink petals, soft warm sunlight filtering through blossoms, romantic atmosphere, couple looking at each other, gentle smile,复古胶片色调, warm tone, high quality, beautiful bokeh background img',
  },
  {
    id: 'beach',
    name: '海边日落散步',
    tags: ['海边', '日落', '氛围'],
    icon: '🌅',
    prompt:
      'a couple walking on the beach at sunset, golden hour, warm orange and pink sky, ocean waves, silhouette or backlit, romantic and dreamy atmosphere, two people walking hand in hand along the shoreline, soft warm glow, cinematic lighting, high quality, serene mood img',
  },
  {
    id: 'cafe',
    name: '演唱会后台',
    tags: ['后台', '专属', '心动'],
    icon: '🎤',
    prompt:
      'a couple at a concert backstage, dim warm lighting, casual intimate moment, two people standing close together, stage lights in background, warm amber tones, candid atmosphere, mirror selfie style, cozy and exclusive vibe, high quality, cinematic moody lighting img',
  },
  {
    id: 'couple',
    name: '情侣写真',
    tags: ['专属', '纪念', '亲密'],
    icon: '💑',
    prompt:
      'a romantic couple photoshoot, close embrace, two people holding each other intimately, soft studio lighting, warm beige and rose tones, depth of field blur background, elegant and tender atmosphere, couple looking at each other with affection, high quality portrait photography, dreamy soft focus img',
  },
  {
    id: 'dream',
    name: '梦幻联动',
    tags: ['星空', '梦幻', '艺术'],
    icon: '🔮',
    prompt:
      'two people under a magical starry night sky, cosmic dreamy atmosphere, purple and blue nebula colors, silhouette or soft glow on faces, surreal fantasy art style, twinkling stars and galaxy background, romantic and ethereal mood, cinematic wide shot, high quality, fantasy concept art, mysterious beautiful lighting img',
  },
];

const filters = [
  '无',
  '富士 Classic Chrome',
  '富士 Provia',
  '富士 Astia',
  '富士 Velvia',
  'CCD 复古',
  '柯达 Portra',
  '拍立得',
  '黑白胶片',
];

const filterTabs = [
  { id: 'camera', label: '相机', icon: Camera },
  { id: 'light', label: '光影', icon: Sun },
  { id: 'angle', label: '角度', icon: RotateCcw },
  { id: 'color', label: '调色', icon: Palette },
];

export default function StudioPage() {
  const navigate = useNavigate();
  const { state, setState, selectScene, selectFilter, addChatMessage, addDiaryEntry, toggleChat } = useApp();
  const [activeFilterTab, setActiveFilterTab] = useState('camera');
  const [showDiaryInput, setShowDiaryInput] = useState(false);
  const [userUpload, setUserUpload] = useState<string | null>(null);
  const [gdUpload, setGdUpload] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'shoot' | 'preview' | 'params'>('preview');
  const [apiError, setApiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gdFileInputRef = useRef<HTMLInputElement>(null);

  const sendSceneChat = useSceneChat();

  const handleGdUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGdUpload(url);
    }
  }, []);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserUpload(url);
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      addChatMessage({ id: Date.now().toString(), sender: 'user', text: '照片传好了', time });
      setTimeout(() => {
        const replies = [
          '看到了。拍得不错。你挺上镜的。',
          '嗯，收到了。这张照片...角度很好。',
          '看到了。很自然。不像那些修过头的。',
        ];
        addChatMessage({
          id: (Date.now() + 1).toString(),
          sender: 'gd',
          text: replies[Math.floor(Math.random() * replies.length)],
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        });
      }, 800);
    }
  }, [addChatMessage]);

  const handleCapture = async () => {
    setApiError(null);

    if (!state.selectedScene) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const replies = [
        '等一下。场景还没选。你想去哪儿？',
        '...先选个场景吧。不然拍出来不知道放在哪儿。',
      ];
      addChatMessage({ id: Date.now().toString(), sender: 'gd', text: replies[Math.floor(Math.random() * replies.length)], time });
      return;
    }

    if (!userUpload) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      addChatMessage({ id: Date.now().toString(), sender: 'gd', text: '...照片呢？没照片我怎么帮你拍。', time });
      return;
    }

    setState((prev) => ({ ...prev, isCapturing: true }));

    try {
      // Convert both photos to base64
      const userBase64 = await toBase64(userUpload);
      if (!gdUpload) {
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        addChatMessage({ id: Date.now().toString(), sender: 'gd', text: '...我的照片呢？没我的脸怎么合照。', time });
        setState((prev) => ({ ...prev, isCapturing: false }));
        return;
      }
      const gdBase64 = await toBase64(gdUpload);
      const scene = scenes.find((s) => s.id === state.selectedScene);
      const scenePrompt = scene?.prompt || 'a selfie of two people';

      // Generate using PhotoMaker with both faces and scene prompt
      const finalResult = await generateCouplePhoto(userBase64, gdBase64, scenePrompt);

      setState((prev) => ({ ...prev, isCapturing: false, generatedPhoto: finalResult }));

      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const replies = [
        '3... 2... 1... 好了。还不错。',
        '拍完了。你看一下，我觉得这张还行。',
        '搞定了。效果...比我想象的好。要记下来吗？',
      ];
      addChatMessage({ id: Date.now().toString(), sender: 'gd', text: replies[Math.floor(Math.random() * replies.length)], time });
      setShowDiaryInput(true);
    } catch (err: any) {
      setApiError(err.message || '生成失败，请重试');
      setState((prev) => ({ ...prev, isCapturing: false }));
      addChatMessage({
        id: Date.now().toString(),
        sender: 'gd',
        text: '...出了点问题。再试一次？',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      });
    }
  };

  const handleSaveDiary = () => {
    if (!state.generatedPhoto || !state.selectedScene) return;
    const scene = scenes.find((s) => s.id === state.selectedScene);
    const entry = {
      id: Date.now().toString(),
      photo: state.generatedPhoto,
      scene: scene?.name || '',
      filter: state.selectedFilter,
      note: state.diaryNote || '今天和你在一起的每一秒，都像电影画面。',
      date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.'),
    };
    addDiaryEntry(entry);
    setShowDiaryInput(false);

    addChatMessage({
      id: Date.now().toString(),
      sender: 'gd',
      text: '记下来了。这样以后回看的时候...就能想起今天了。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const mobileTabs = [
    { id: 'shoot' as const, label: '拍摄', icon: Camera },
    { id: 'preview' as const, label: '预览', icon: Aperture },
    { id: 'params' as const, label: '参数', icon: Film },
  ];

  const renderShootPanel = () => (
    <div className="space-y-6 p-4 overflow-y-auto h-full">
      {/* Upload Photos */}
      <div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Upload className="w-3.5 h-3.5" />
          上传照片
        </div>
        <div className="flex gap-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="liquid-glass rounded-xl flex-1 aspect-square flex flex-col items-center justify-center cursor-pointer max-w-[120px]"
          >
            {userUpload ? (
              <img src={userUpload} alt="你" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-1.5">
                  <span className="text-sm">👤</span>
                </div>
                <span className="text-[10px] text-muted-foreground">你</span>
              </>
            )}
          </div>
          <div
            onClick={() => gdFileInputRef.current?.click()}
            className="liquid-glass rounded-xl flex-1 aspect-square flex flex-col items-center justify-center cursor-pointer max-w-[120px]"
          >
            {gdUpload ? (
              <img src={gdUpload} alt="GD" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-1.5">
                  <Heart className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-[10px] text-muted-foreground">GD 옴파</span>
              </>
            )}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <input ref={gdFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGdUpload} />
      </div>

      {/* Scene Selection */}
      <div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Image className="w-3.5 h-3.5" />
          拍摄场景
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {['情侣写真', '梦幻联动', 'Lulabu风写真', '创意主题'].map((tag) => (
            <button
              key={tag}
              className="px-2.5 py-1 rounded-full text-[10px] bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => { selectScene(scene.id); sendSceneChat(scene.id, scene.name); }}
              className={`w-full liquid-glass rounded-xl p-3 text-left transition-colors ${
                state.selectedScene === scene.id
                  ? 'ring-1 ring-white/30 bg-white/10 animate-ring-pulse'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span>{scene.icon}</span>
                <span className="text-xs font-medium text-foreground">{scene.name}</span>
              </div>
              <div className="flex gap-1.5">
                {scene.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Scene Reference */}
      <div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Image className="w-3.5 h-3.5" />
          场景参考图（可选）
        </div>
        <div className="liquid-glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors border-dashed">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">上传你的参考场景图</span>
        </div>
      </div>
    </div>
  );

  const renderPreviewPanel = () => (
    <div className="flex-1 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Aperture className="w-3.5 h-3.5" />
          <span>监视器</span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {state.selectedScene ? scenes.find((s) => s.id === state.selectedScene)?.name : '等待拍摄...'}
        </div>
      </div>

      <div className="flex-1 liquid-glass rounded-2xl relative overflow-hidden min-h-[300px] animate-monitor-breathe">
        {/* Monitor frame overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/20" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/20" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/20" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/20" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-[1px] bg-white/30" />
            <div className="w-[1px] h-8 bg-white/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-rec" />
            <span className="text-[10px] text-white/50 tracking-wider">REC</span>
          </div>

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white" />
            <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white" />
            <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white" />
            <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white" />
          </div>
        </div>

        {state.isCapturing ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/40">
            {/* Scan line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="w-full h-[2px] bg-white/10 animate-scan" />
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-white/60 mb-4" />
            <div className="text-sm text-white/60 animate-pulse">AI 合成中... 3, 2, 1</div>
            <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        ) : state.generatedPhoto ? (
          <div className="absolute inset-0 z-0">
            <img src={state.generatedPhoto} alt="generated" className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 right-4 z-10">
              {showDiaryInput ? (
                <div className="liquid-glass rounded-xl p-4 space-y-3">
                  <p className="text-xs text-white/80">💜 写点什么记下来吧...</p>
                  <textarea
                    value={state.diaryNote}
                    onChange={(e) => setState((prev) => ({ ...prev, diaryNote: e.target.value }))}
                    placeholder="他说樱花飘落的速度是每秒五厘米..."
                    className="w-full bg-black/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none resize-none h-20"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowDiaryInput(false)} className="flex-1 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">跳过</button>
                    <button onClick={handleSaveDiary} className="flex-1 py-2 rounded-lg text-xs bg-white/15 text-foreground hover:bg-white/20 transition-colors">记入日记</button>
                  </div>
                </div>
              ) : (
                <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-white/80">✨ 已生成 · {state.selectedFilter}</span>
                  <button onClick={() => setState((prev) => ({ ...prev, generatedPhoto: null }))} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">重新拍摄</button>
                </div>
              )}
            </div>
          </div>
        ) : apiError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
            <AlertCircle className="w-8 h-8 text-red-400/60 mb-3" />
            <p className="text-sm text-red-400/80 mb-1">合成失败</p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-[240px]">{apiError}</p>
            <button onClick={() => setApiError(null)} className="mt-4 text-xs text-muted-foreground hover:text-foreground underline transition-colors">重试</button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">上传照片 + 选择场景</p>
            <p className="text-xs text-muted-foreground/60">调节摄影棚参数 → 按下快门</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderParamsPanel = () => (
    <div className="space-y-5 p-4 overflow-y-auto h-full">
      <div>
        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
          <Film className="w-3.5 h-3.5" />
          摄影棚参数
        </div>
        <div className="flex gap-1 mb-4">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilterTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-[10px] flex flex-col items-center gap-1 transition-colors ${
                  activeFilterTab === tab.id
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-muted-foreground mb-2">胶片模拟</div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => selectFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-[10px] transition-colors ${
                state.selectedFilter === filter
                  ? 'bg-white/15 text-foreground ring-1 ring-white/20'
                  : 'bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="liquid-glass rounded-xl p-3 space-y-2">
        <div className="text-[10px] text-muted-foreground mb-1">当前设置</div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">对象</span>
          <span className="text-foreground">GD 옴파</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">场景</span>
          <span className="text-foreground">{scenes.find((s) => s.id === state.selectedScene)?.name || '未选择'}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">滤镜</span>
          <span className="text-foreground">{state.selectedFilter}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col overflow-hidden">
      {/* Full-screen background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: 'url(/daisy-wallpaper.png)' }}
      />

      {/* Subtle dark overlay for readability */}
      <div className="fixed inset-0 bg-background/40 z-[1]" />

      {/* Animated ambient orbs */}
      <div className="absolute top-24 left-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none z-[2] animate-orb" />
      <div className="absolute bottom-20 right-12 w-48 h-48 rounded-full bg-purple-400/8 blur-3xl pointer-events-none z-[2] animate-orb" style={{ animationDelay: '-9s' }} />
      <div className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-cyan-400/6 blur-2xl pointer-events-none z-[2] animate-orb" style={{ animationDelay: '-5s' }} />

      {/* Floating sparkle particles */}
      <div className="absolute top-32 left-1/4 w-1 h-1 bg-white/40 rounded-full pointer-events-none z-[2] animate-sparkle" />
      <div className="absolute top-48 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none z-[2] animate-sparkle" style={{ animationDelay: '-1.5s' }} />
      <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-white/25 rounded-full pointer-events-none z-[2] animate-sparkle" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-2/3 right-20 w-1 h-1 bg-white/20 rounded-full pointer-events-none z-[2] animate-sparkle" style={{ animationDelay: '-0.5s' }} />
      <div className="absolute bottom-64 right-1/2 w-1.5 h-1.5 bg-white/30 rounded-full pointer-events-none z-[2] animate-float-particle" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="DreamShot" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <div className="text-xl tracking-tight" style={{ fontFamily: "'Instrument Serif', serif" }}>DreamShot</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">PEACEMINUSONE · A LOVE DIARY</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            너무 보고 싶다.💗
          </div>
          <button onClick={() => navigate('/diary')} className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
            <BookOpen className="w-5 h-5" />
            {state.diaryEntries.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-background text-[10px] rounded-full flex items-center justify-center font-medium">
                {state.diaryEntries.length}
              </span>
            )}
          </button>
          <button onClick={toggleChat} className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <aside className="w-[280px] border-r border-border/50 overflow-y-auto hidden lg:block">
          {renderShootPanel()}
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden flex border-b border-border/50">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id)}
                  className={`flex-1 py-3 flex items-center justify-center gap-1.5 text-xs transition-colors ${
                    mobileTab === tab.id
                      ? 'text-foreground border-b-2 border-foreground'
                      : 'text-muted-foreground hover:text-foreground/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="lg:hidden flex-1 overflow-y-auto">
              {mobileTab === 'shoot' && renderShootPanel()}
              {mobileTab === 'preview' && renderPreviewPanel()}
              {mobileTab === 'params' && renderParamsPanel()}
            </div>
            <div className="hidden lg:flex flex-1 flex-col">
              {renderPreviewPanel()}
            </div>
          </div>

          {/* Shutter button */}
          <div className="px-4 pb-4 space-y-3">
            <button
              onClick={handleCapture}
              disabled={state.isCapturing}
              className="w-full liquid-glass rounded-full py-4 text-sm text-foreground flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-shutter"
            >
              {state.isCapturing ? (
                <><Loader2 className="w-4 h-4 animate-spin" />处理中...</>
              ) : (
                <><Sparkles className="w-4 h-4" />按下快门 — 开始拍摄</>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60">
              <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
              由 Replicate API 驱动 · 照片仅用于本次合成
            </div>
          </div>
        </main>

        <aside className="w-[260px] border-l border-border/50 overflow-y-auto hidden xl:block">
          {renderParamsPanel()}
        </aside>
      </div>

      {state.chatOpen && <ChatPanel />}
    </div>
  );
}
