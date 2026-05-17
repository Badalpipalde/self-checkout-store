export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-6 h-6 border-2', md: 'w-10 h-10 border-3', lg: 'w-16 h-16 border-4' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-brand-500/30 border-t-brand-500 rounded-full animate-spin`} />
      {text && <p className="text-white/50 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-900 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
