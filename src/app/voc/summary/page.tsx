export default function VocSummaryPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[color:var(--foreground)] animate-fade-in-up">VoC Strategic Summary</h1>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pain Points */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Top Pain Points
          </h2>
          <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)]">Content will appear here</p>
        </div>

        {/* Feature Requests */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:60ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Top Feature Requests
          </h2>
          <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)]">Content will appear here</p>
        </div>

        {/* Objections */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:120ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full" />
            Top Objections
          </h2>
          <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)]">Content will appear here</p>
        </div>

        {/* Competitors */}
        <div className="bg-white dark:bg-[color:var(--card)] border border-slate-200 dark:border-[color:var(--border)] rounded-xl p-6 animate-fade-in-up [animation-delay:180ms]">
          <h2 className="font-semibold text-slate-900 dark:text-[color:var(--card-foreground)] mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-purple-500 rounded-full" />
            Competitors
          </h2>
          <p className="text-sm text-slate-500 dark:text-[color:var(--muted-foreground)]">Content will appear here</p>
        </div>
      </div>
    </div>
  );
}