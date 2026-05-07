import { useNavigate } from 'react-router';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/page-bg.png"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/background-video.mp4"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-background/40 z-[1]" />

      {/* Navigation */}
      <nav className="relative z-10 flex flex-row justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DreamShot" className="w-10 h-10 object-contain" />
          <div
            className="text-3xl tracking-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            DreamShot<sup className="text-xs">&reg;</sup>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-foreground transition-colors">Home</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Studio</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Diary</a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</a>
        </div>

        <button
          onClick={() => navigate('/studio')}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03] cursor-pointer"
        >
          Begin Journey
        </button>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40 min-h-[calc(100vh-100px)]">
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-normal max-w-5xl animate-fade-rise"
          style={{
            fontFamily: "'Instrument Serif', serif",
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
          }}
        >
          Would you like to spend a{" "}
          <em className="not-italic text-muted-foreground">wonderful day</em>{" "}
          with me today
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
          오랫동안 뵙지 못했는데 당신이 무척 보고 싶어요 / I miss you～
        </p>

        <button
          onClick={() => navigate('/studio')}
          className="liquid-glass rounded-full px-14 py-5 text-base text-foreground mt-12 transition-transform hover:scale-[1.03] cursor-pointer animate-fade-rise-delay-2"
        >
          Begin Journey
        </button>

        <p className="text-muted-foreground/60 text-xs mt-6 animate-fade-rise-delay-2">
          PEACEMINUSONE · A LOVE DIARY 💛
        </p>
      </div>
    </section>
  );
}
