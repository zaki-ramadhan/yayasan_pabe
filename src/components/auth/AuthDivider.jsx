export function AuthDivider({ text = "atau" }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 border-t border-slate-200" />
      <span className="text-xs text-slate-500 font-medium lowercase">
        {text}
      </span>
      <div className="flex-1 border-t border-slate-200" />
    </div>
  );
}
