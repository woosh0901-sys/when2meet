import { useAuth } from '../contexts/AuthContext';

export default function UserStatus({ allDates, users }) {
  const { user } = useAuth();

  return (
    <div className="glass-card mx-4 p-4 animate-fade-in">
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">
        참여 현황
      </h3>
      <div className="flex flex-wrap gap-2">
        {users.map((u) => {
          const dateCount = allDates[u.id] ? allDates[u.id].size : 0;
          const isMe = u.id === user?.id;

          return (
            <div
              key={u.id}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                transition-all duration-300
                ${dateCount > 0 
                  ? 'bg-intersect/10 border border-intersect/20 text-intersect' 
                  : 'bg-white/5 border border-white/5 text-surface-500'
                }
                ${isMe ? 'ring-1 ring-brand-500/30' : ''}
              `}
            >
              <span className={`w-2 h-2 rounded-full ${dateCount > 0 ? 'bg-intersect animate-pulse' : 'bg-surface-600'}`} />
              <span className={`font-medium ${isMe ? 'text-white' : ''}`}>
                {u.name}
                {isMe && <span className="text-brand-400 ml-1 text-xs">(나)</span>}
              </span>
              <span className="text-xs opacity-60">{dateCount}일</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
