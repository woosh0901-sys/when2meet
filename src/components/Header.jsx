import { useAuth } from '../contexts/AuthContext';
import UserLegend from './ui/UserLegend';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-surface-900/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-intersect-glow flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="font-bold text-sm text-white hidden sm:block">CalSync</span>
      </div>

      {/* 범례 */}
      <div className="flex-1 overflow-x-auto">
        <UserLegend />
      </div>

      {/* 사용자 정보 */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
          style={{ backgroundColor: user?.color || '#4c6ef5' }}
        >
          {user?.name?.[0]}
        </div>
        <span className="text-sm text-white hidden sm:block">{user?.name}</span>
        <button
          onClick={logout}
          className="ml-1 px-2.5 py-1.5 text-xs font-medium text-surface-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
