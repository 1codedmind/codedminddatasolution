export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 w-40 bg-stone-800 rounded mb-1" />
          <div className="h-3 w-32 bg-stone-800 rounded" />
        </div>
        <div className="h-10 w-36 bg-stone-800 rounded-xl" />
      </div>
      <div className="flex gap-2 mb-5">
        {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-20 bg-stone-800 rounded-lg" />)}
      </div>
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="border-b border-stone-800 px-5 py-3.5 flex gap-8">
          {[...Array(5)].map((_, i) => <div key={i} className="h-3 w-16 bg-stone-800 rounded" />)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-stone-800/60 px-5 py-4 flex items-center gap-8">
            <div className="h-4 w-28 bg-stone-800 rounded" />
            <div className="h-4 w-20 bg-stone-800 rounded" />
            <div className="h-4 w-36 bg-stone-800 rounded hidden sm:block" />
            <div className="h-5 w-20 bg-stone-800 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
