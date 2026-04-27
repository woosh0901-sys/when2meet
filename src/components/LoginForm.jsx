import { useAuth } from '../contexts/AuthContext';

const COLORS = [
  'from-brand-500 to-brand-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
];

const EMOJIS = ['🐻', '🦊', '🐰', '🦋', '🐳'];

export default function LoginForm() {
  const { users, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-surface-500">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-intersect-glow mb-4 shadow-lg shadow-brand-600/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-surface-400 bg-clip-text text-transparent">
            ScheduleSync
          </h1>
          <p className="text-surface-500 mt-1 text-sm">
            모두가 가능한 날, 함께 찾아요
          </p>
        </div>

        {/* Name Selection Card */}
        <div className="glass-card-strong p-6">
          <label className="block text-sm font-medium text-surface-400 mb-4 text-center">
            본인 이름을 선택하세요
          </label>
          <div className="space-y-2.5">
            {users.map((u, i) => (
              <button
                key={u.id}
                type="button"
                onClick={() => login(u)}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-xl
                  bg-white/5 border border-white/5
                  hover:bg-white/10 hover:border-white/15 hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200 group
                `}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COLORS[i % COLORS.length]} 
                                 flex items-center justify-center shadow-lg text-lg
                                 group-hover:shadow-xl transition-shadow`}>
                  {EMOJIS[i % EMOJIS.length]}
                </div>
                <span className="text-white font-semibold text-base group-hover:translate-x-0.5 transition-transform">
                  {u.name}
                </span>
                <svg className="w-5 h-5 text-surface-600 ml-auto group-hover:text-surface-400 group-hover:translate-x-1 transition-all" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-surface-600 text-xs mt-6">
          ScheduleSync &copy; 2026
        </p>
      </div>
    </div>
  );
}
