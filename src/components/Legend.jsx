const TOTAL_USERS = 5;

export default function Legend() {
  return (
    <div className="glass-card mx-4 px-4 py-3 animate-fade-in">
      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-center sm:gap-5">
        <LegendItem 
          color="bg-mine/30 border-mine/40" 
          label="내가 선택한 날" 
        />
        <LegendItem 
          color="bg-others/20 border-others/30" 
          label="다른 친구도 선택" 
        />
        <LegendItem 
          color="bg-intersect/30 border-intersect/50 shadow-sm shadow-intersect/20" 
          label={`${TOTAL_USERS}명 모두 가능 ✨`}
          bold
        />
        <LegendItem 
          color="bg-white/5 border-white/10" 
          label="선택 안 됨" 
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label, bold }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-md border ${color} shrink-0`} />
      <span className={`text-xs ${bold ? 'text-intersect font-semibold' : 'text-surface-400'}`}>
        {label}
      </span>
    </div>
  );
}
