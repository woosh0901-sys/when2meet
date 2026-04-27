import { useAuth } from '../contexts/AuthContext';

const COLORS = [
  'from-brand-500 to-brand-600',
  'from-emerald-500 to-teal-600', 
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
];

export default function Header() {
  const { user, users, logout } = useAuth();

  const userIndex = users.findIndex(u => u.id === user?.id);
  const gradient = COLORS[userIndex >= 0 ? userIndex : 0];

  return (
    <header className="glass-card mx-4 mt-4 px-4 py-3 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-sm">
            {user?.name?.[0]}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-surface-500">가능한 날짜를 선택하세요</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-white 
                   bg-white/5 hover:bg-white/10 rounded-lg border border-white/5
                   transition-all duration-200"
      >
        로그아웃
      </button>
    </header>
  );
}
