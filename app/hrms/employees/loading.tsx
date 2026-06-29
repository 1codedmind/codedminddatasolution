export default function Loading() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-36 bg-stone-800 rounded mb-1" />
          <div className="h-3 w-24 bg-stone-800 rounded" />
        </div>
        <div className="h-10 w-40 bg-stone-800 rounded-xl" />
      </div>
      <div className="flex gap-3 mb-6">
        <div className="h-10 flex-1 max-w-sm bg-stone-800 rounded-xl" />
        <div className="h-10 w-36 bg-stone-800 rounded-xl" />
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="border-b border-stone-800 px-5 py-3.5 flex gap-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-16 bg-stone-800 rounded" />)}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-b border-stone-800/60 px-5 py-4 flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-800" />
              <div className="h-4 w-32 bg-stone-800 rounded" />
            </div>
            <div className="h-3 w-40 bg-stone-800 rounded hidden sm:block" />
            <div className="h-3 w-24 bg-stone-800 rounded hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
