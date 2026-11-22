export function StorefrontSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-b-2xl bg-ink">
        <div className="mx-auto w-full max-w-[1280px] space-y-4 px-3 py-5 sm:px-5">
          <div className="h-10 w-full rounded-lg bg-ink-hover" />
          <div className="h-16 w-2/3 rounded-lg bg-ink-hover" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] space-y-4 px-3 py-5 sm:px-5">
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-full bg-surface-2" />
          <div className="h-9 w-24 rounded-full bg-surface-2" />
          <div className="h-9 w-28 rounded-full bg-surface-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded-lg bg-surface-2" />
          <div className="h-10 w-36 rounded-lg bg-surface-2" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              <div className="aspect-square w-full bg-surface-2" />
              <div className="space-y-2.5 p-3">
                <div className="h-3 w-16 rounded bg-surface-2" />
                <div className="h-4 w-full rounded bg-surface-2" />
                <div className="h-4 w-3/4 rounded bg-surface-2" />
                <div className="h-6 w-24 rounded bg-surface-2" />
                <div className="h-10 w-full rounded-lg bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
