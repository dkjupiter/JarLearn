export default function Segment({ options, value, onChange }) {
  return (
    <div className="flex border border-slate-700 rounded-xl overflow-hidden bg-slate-800">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`flex-1 py-3 text-sm font-medium whitespace-pre-line transition
              ${
                active
                  ? "bg-cyan-400 text-slate-900"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}