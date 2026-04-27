import { useAuth } from '../../contexts/AuthContext';

export default function UserLegend() {
  const { users } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 glass-card mx-0 rounded-xl">
      {/* 내 일정 / 타인 / 교집합 범례 */}
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(32,201,151,0.4)', border: '1px solid rgba(32,201,151,0.6)' }} />
        <span className="text-xs text-surface-400">모두 여유</span>
      </div>
      <span className="text-surface-700 text-xs">|</span>
      {users.map(u => (
        <div key={u.id} className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: u.color }} />
          <span className="text-xs text-surface-400">{u.name}</span>
        </div>
      ))}
      <span className="text-surface-700 text-xs">|</span>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-surface-600" />
        <span className="text-xs text-surface-400">타인 바쁨</span>
      </div>
    </div>
  );
}
