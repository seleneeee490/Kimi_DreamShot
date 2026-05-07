import { useNavigate } from 'react-router';
import { ChevronLeft, BookOpen, Heart, Calendar, Camera, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { asset } from '../lib/path';

export default function DiaryPage() {
  const navigate = useNavigate();
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/studio')}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img src={asset('logo.png')} alt="DreamShot" className="w-9 h-9 object-contain hidden sm:block" />
          <div>
            <div
              className="text-xl tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Our Diary
            </div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
              {state.diaryEntries.length} 篇专属回忆
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="liquid-glass rounded-full px-4 py-1.5 text-xs flex items-center gap-2">
            <Heart className="w-3 h-3 text-purple-400" />
            今天和 GD 哥哥在一起 💕
          </div>
        </div>
      </header>

      {/* Diary Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {state.diaryEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white/30" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">还没有回忆</p>
            <p className="text-xs text-muted-foreground/60">
              去摄影棚和 GD 拍一张专属合照吧
            </p>
            <button
              onClick={() => navigate('/studio')}
              className="mt-6 liquid-glass rounded-full px-6 py-2.5 text-sm transition-transform hover:scale-[1.03]"
            >
              去拍摄
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.diaryEntries.map((entry) => (
              <article
                key={entry.id}
                className="liquid-glass rounded-2xl overflow-hidden group transition-transform hover:scale-[1.02]"
              >
                {/* Photo */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={entry.photo}
                    alt={entry.scene}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/40 backdrop-blur-sm text-white/90">
                      {entry.filter}
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/70 mb-1">
                      <Calendar className="w-3 h-3" />
                      {entry.date}
                      <Camera className="w-3 h-3 ml-1" />
                      {entry.scene}
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="p-4">
                  <p className="text-xs leading-relaxed text-foreground/90">
                    {entry.note}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    AI 合成 · 本地处理
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center">
        <p className="text-[10px] text-muted-foreground/50 tracking-widest">
          PEACEMINUSONE · A LOVE DIARY 💛 · DREAMSHOT
        </p>
      </footer>
    </div>
  );
}
