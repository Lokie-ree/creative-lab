export function ModuleLoader() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-(--lab-bg)">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-(--lab-accent) border-t-transparent" />
        <p className="lab-silk lab-display-font text-(--lab-text-muted)">Loading visualization...</p>
      </div>
    </div>
  )
}
