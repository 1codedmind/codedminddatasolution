export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-24 bg-stone-800 rounded mb-2" />
        <div className="h-7 w-48 bg-stone-800 rounded mb-1" />
        <div className="h-3 w-64 bg-stone-800 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-stone-900 border border-stone-800 rounded-2xl px-6 py-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-stone-800" />
            <div>
              <div className="h-6 w-12 bg-stone-800 rounded mb-1" />
              <div className="h-3 w-24 bg-stone-800 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-4 w-32 bg-stone-800 rounded mb-3" />
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-36 bg-stone-800 rounded-xl" />)}
      </div>
    </div>
  );
}
