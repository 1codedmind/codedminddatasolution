export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="mb-6">
        <div className="h-7 w-40 bg-stone-800 rounded mb-1" />
        <div className="h-3 w-24 bg-stone-800 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-stone-900 border border-stone-800 rounded-2xl px-5 py-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-stone-800 shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-stone-800 rounded mb-1.5" />
                <div className="h-3 w-48 bg-stone-800 rounded" />
              </div>
            </div>
            <div className="h-3 w-24 bg-stone-800 rounded mt-4 pt-2 border-t border-stone-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
