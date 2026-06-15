import { ChevronRight } from 'lucide-react';

interface QuestionScene {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
}

interface SceneSelectorProps {
  scenes: QuestionScene[];
  onSelectScene: (scene: QuestionScene) => void;
}

function getScenePreviewLabel(description: string): string {
  return description.replace(/^问/, '').split('、').slice(0, 2).join(' · ');
}

function getSelectSceneCardMood(sceneId: string) {
  const darkBase = {
    darkGlow: 'from-slate-400/18 via-indigo-300/10 to-transparent',
    darkBadge: 'dark:bg-transparent dark:px-0 dark:py-0 dark:text-slate-400 dark:ring-0',
    darkArrow: 'dark:text-slate-200',
  };

  const createMood = (config: {
    surface: string;
    darkSurface: string;
    softWash: string;
    darkWash: string;
    glow: string;
    orb: string;
    orbSecondary: string;
    darkOrb: string;
    darkOrbSecondary: string;
    badge: string;
    iconShell: string;
    darkIcon: string;
    arrow: string;
    outline: string;
  }) => ({
    ...darkBase,
    ...config,
  });

  switch (sceneId) {
    case 'career':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(255,249,244,0.96),rgba(252,242,232,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(55,49,43,0.96),rgba(40,35,31,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,247,240,0.24)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(215,176,140,0.18),transparent_62%)]',
        glow: 'from-[#D7B08C]/34 via-[#FFF8F3]/14 to-transparent',
        orb: 'bg-[#D7B08C]/36',
        orbSecondary: 'bg-[#F0D9C4]/42',
        darkOrb: 'dark:bg-[#D7B08C]/18',
        darkOrbSecondary: 'dark:bg-[#8B6D4F]/14',
        badge: 'text-[#C2825F]',
        iconShell: 'text-[#C2825F]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-sky-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#C2825F]',
        outline: 'hover:border-[#D7B08C]/85',
      });
    case 'relationship':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(255,247,247,0.96),rgba(252,236,236,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(62,46,49,0.96),rgba(46,34,37,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,243,243,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(201,124,109,0.2),transparent_60%)]',
        glow: 'from-[#C97C6D]/25 via-[#FFF8F3]/14 to-transparent',
        orb: 'bg-[#C97C6D]/28',
        orbSecondary: 'bg-[#F2D5D0]/40',
        darkOrb: 'dark:bg-[#C97C6D]/16',
        darkOrbSecondary: 'dark:bg-[#8A5A62]/14',
        badge: 'text-[#C97C6D]',
        iconShell: 'text-[#C97C6D]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-rose-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#C97C6D]',
        outline: 'hover:border-[#D8B38A]/85',
      });
    case 'health':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(247,252,247,0.96),rgba(237,247,238,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(43,53,48,0.96),rgba(33,42,38,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(242,250,243,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(149,178,154,0.2),transparent_62%)]',
        glow: 'from-[#95B29A]/34 via-[#FFF8F3]/16 to-transparent',
        orb: 'bg-[#95B29A]/36',
        orbSecondary: 'bg-[#D7E8D7]/42',
        darkOrb: 'dark:bg-[#95B29A]/18',
        darkOrbSecondary: 'dark:bg-[#5E7A65]/14',
        badge: 'text-[#86A08A]',
        iconShell: 'text-[#86A08A]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-emerald-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#86A08A]',
        outline: 'hover:border-[#BFD1BF]/85',
      });
    case 'wealth':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(255,249,241,0.96),rgba(251,241,225,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(59,49,37,0.96),rgba(43,35,27,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,246,235,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(216,179,138,0.22),transparent_60%)]',
        glow: 'from-[#D8B38A]/30 via-[#FFF8F3]/16 to-transparent',
        orb: 'bg-[#D8B38A]/32',
        orbSecondary: 'bg-[#EFD8BE]/42',
        darkOrb: 'dark:bg-[#D8B38A]/18',
        darkOrbSecondary: 'dark:bg-[#8E704F]/14',
        badge: 'text-[#C97C6D]',
        iconShell: 'text-[#C97C6D]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-amber-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#C97C6D]',
        outline: 'hover:border-[#D8B38A]/85',
      });
    case 'study':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(250,247,253,0.96),rgba(241,235,248,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(50,43,58,0.96),rgba(38,33,45,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(247,242,252,0.28)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(183,166,201,0.22),transparent_60%)]',
        glow: 'from-[#B7A6C9]/32 via-[#FFF8F3]/16 to-transparent',
        orb: 'bg-[#B7A6C9]/34',
        orbSecondary: 'bg-[#E1D6EE]/42',
        darkOrb: 'dark:bg-[#B7A6C9]/16',
        darkOrbSecondary: 'dark:bg-[#726187]/14',
        badge: 'text-[#9C82B3]',
        iconShell: 'text-[#9C82B3]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-violet-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#9C82B3]',
        outline: 'hover:border-[#CBB7DA]/85',
      });
    case 'travel':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(246,251,252,0.96),rgba(234,245,247,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(41,49,53,0.96),rgba(31,39,43,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(242,249,250,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(150,184,193,0.22),transparent_60%)]',
        glow: 'from-[#96B8C1]/32 via-[#FFF8F3]/16 to-transparent',
        orb: 'bg-[#96B8C1]/34',
        orbSecondary: 'bg-[#D6E8EC]/42',
        darkOrb: 'dark:bg-[#96B8C1]/16',
        darkOrbSecondary: 'dark:bg-[#5A7E88]/14',
        badge: 'text-[#7EABB6]',
        iconShell: 'text-[#7EABB6]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-cyan-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#7EABB6]',
        outline: 'hover:border-[#B6D0D6]/85',
      });
    case 'legal':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(253,247,246,0.96),rgba(248,235,232,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(58,42,44,0.96),rgba(44,32,34,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(252,242,240,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(201,131,119,0.22),transparent_60%)]',
        glow: 'from-[#C98377]/32 via-[#FFF8F3]/14 to-transparent',
        orb: 'bg-[#C98377]/34',
        orbSecondary: 'bg-[#EDD2CD]/42',
        darkOrb: 'dark:bg-[#C98377]/18',
        darkOrbSecondary: 'dark:bg-[#865654]/14',
        badge: 'text-[#B96D63]',
        iconShell: 'text-[#B96D63]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-rose-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#B96D63]',
        outline: 'hover:border-[#D8AAA0]/85',
      });
    case 'lost':
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(255,249,243,0.96),rgba(250,240,228,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(56,46,39,0.96),rgba(42,34,29,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,246,236,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(224,186,146,0.22),transparent_60%)]',
        glow: 'from-[#E0BA92]/34 via-[#FFF8F3]/14 to-transparent',
        orb: 'bg-[#E0BA92]/36',
        orbSecondary: 'bg-[#F1DABC]/42',
        darkOrb: 'dark:bg-[#E0BA92]/18',
        darkOrbSecondary: 'dark:bg-[#92714E]/14',
        badge: 'text-[#C79368]',
        iconShell: 'text-[#C79368]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-orange-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#C79368]',
        outline: 'hover:border-[#E7C39D]/85',
      });
    default:
      return createMood({
        surface: 'bg-[linear-gradient(135deg,rgba(255,248,242,0.96),rgba(251,241,232,0.92))]',
        darkSurface: 'dark:bg-[linear-gradient(135deg,rgba(56,47,39,0.96),rgba(41,34,28,0.94))]',
        softWash: 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,246,238,0.26)_62%)]',
        darkWash: 'dark:bg-[radial-gradient(circle_at_top,rgba(216,179,138,0.2),transparent_60%)]',
        glow: 'from-[#D8B38A]/28 via-[#FFF8F3]/15 to-transparent',
        orb: 'bg-[#D8B38A]/30',
        orbSecondary: 'bg-[#EFD8BE]/42',
        darkOrb: 'dark:bg-[#D8B38A]/16',
        darkOrbSecondary: 'dark:bg-[#8E704F]/14',
        badge: 'text-[#C97C6D]',
        iconShell: 'text-[#C97C6D]',
        darkIcon: 'dark:bg-[linear-gradient(145deg,rgba(30,41,59,0.86),rgba(17,24,39,0.92))] dark:text-amber-100 dark:ring-1 dark:ring-slate-500/35',
        arrow: 'text-[#C97C6D]',
        outline: 'hover:border-[#D8B38A]/85',
      });
  }
}

export default function SceneSelector({ scenes, onSelectScene }: SceneSelectorProps) {
  return (
    <div className="animate-slideInUp space-y-7">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 px-6 py-8 shadow-[0_30px_80px_-50px_rgba(146,64,14,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55 dark:shadow-[0_30px_80px_-50px_rgba(234,179,8,0.2)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_transparent_62%)] dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_58%)]" />
        <div className="absolute -right-12 top-0 h-36 w-36 rounded-full bg-[#D8B38A]/38 blur-3xl dark:bg-rose-500/10" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-[#F3E7DC]/50 blur-3xl dark:bg-amber-400/10" />

        <div className="relative text-center">
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-4 py-1.5 text-xs font-medium tracking-[0.25em] text-[#6B5549] shadow-sm dark:border-white/10 dark:bg-neutral-950/60 dark:text-yellow-200/85">
            轻轻起一念
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-[0.08em] text-[#4B3A33] dark:text-yellow-50 sm:text-4xl">
            把想问的事，轻轻放进卦里
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6B5549] dark:text-yellow-100/70 sm:text-base">
            不必急着给自己答案，先选一个最贴近此刻心事的场景，
            让接下来的解读更温柔，也更贴近你真正想问的那件事。
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/45">
              <p className="text-xs tracking-[0.22em] text-[#C97C6D] dark:text-yellow-500/70">01</p>
              <p className="mt-2 text-sm leading-6 text-[#5A463E] dark:text-yellow-50/85">
                先想清楚这次最想问的一件事
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/45">
              <p className="text-xs tracking-[0.22em] text-[#C97C6D] dark:text-yellow-500/70">02</p>
              <p className="mt-2 text-sm leading-6 text-[#5A463E] dark:text-yellow-50/85">
                选择一个最接近心事的问事场景
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-neutral-950/45">
              <p className="text-xs tracking-[0.22em] text-[#C97C6D] dark:text-yellow-500/70">03</p>
              <p className="mt-2 text-sm leading-6 text-[#5A463E] dark:text-yellow-50/85">
                再用三个数字，开始这次问事
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#C97C6D] dark:text-yellow-600/80">
          CHOOSE A SCENE
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-[#4B3A33] dark:text-yellow-100">
          从一个最贴近的问题开始
        </h3>
        <p className="mt-2 text-sm text-[#8A6658] dark:text-yellow-200/65">
          没有完全一样也没关系，选最接近的一项就好。
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[58rem] grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {scenes.map((scene, index) => {
          const mood = getSelectSceneCardMood(scene.id);
          const previewLabel = getScenePreviewLabel(scene.description);

          return (
            <button
              key={scene.id}
              onClick={() => onSelectScene(scene)}
              className={`group relative min-h-[150px] overflow-hidden rounded-[1.8rem] border border-white/70 px-5 py-3.5 text-left shadow-[0_26px_62px_-42px_rgba(146,64,14,0.32)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_68px_-44px_rgba(146,64,14,0.32)] active:scale-[0.99] dark:border-white/10 dark:shadow-[0_28px_72px_-48px_rgba(234,179,8,0.18)] dark:hover:border-white/15 dark:hover:shadow-[0_34px_78px_-50px_rgba(234,179,8,0.24)] ${mood.surface} ${mood.darkSurface} ${mood.outline}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`absolute inset-0 ${mood.softWash} ${mood.darkWash}`} />
              <div className={`absolute -right-10 top-0 h-32 w-32 rounded-full blur-3xl ${mood.orb} ${mood.darkOrb}`} />
              <div className={`absolute -left-10 bottom-0 h-32 w-32 rounded-full ${mood.orbSecondary} ${mood.darkOrbSecondary} blur-3xl`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.glow} opacity-65 dark:opacity-18`} />
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/15" />

              <div className="relative flex h-full items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-[0_16px_30px_-22px_rgba(255,255,255,0.82)] dark:border-white/10 dark:bg-neutral-950/58 dark:shadow-none ${mood.iconShell} ${mood.darkIcon} dark:ring-0`}>
                  {scene.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <span className={`inline-flex rounded-full border border-white/70 bg-white/78 px-3 py-1 text-xs font-medium tracking-[0.18em] text-[#6B5549] dark:border-white/10 dark:bg-neutral-950/58 dark:text-yellow-100/82 ${mood.badge} ${mood.darkBadge} dark:ring-0`}>
                    {previewLabel}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold text-[#4B3A33] dark:text-yellow-50">
                    {scene.name}
                  </h3>
                  <p className="mt-2.5 pr-6 text-sm leading-6 text-[#6B5549]/90 dark:text-yellow-100/70">
                    {scene.description}
                  </p>
                </div>

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/82 opacity-75 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:border-white/10 dark:bg-neutral-950/60 dark:opacity-100 ${mood.arrow} dark:text-yellow-100/86`}>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
