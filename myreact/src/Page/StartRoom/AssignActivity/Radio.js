export default function Radio({ label, checked, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer select-none px-3 py-2 rounded-lg hover:bg-slate-800 transition"
    >
      <div className="w-5 h-5 rounded-full border border-slate-500 flex items-center justify-center">
        {checked && (
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
        )}
      </div>
      <span className="text-slate-200">{label}</span>
    </div>
  );
}