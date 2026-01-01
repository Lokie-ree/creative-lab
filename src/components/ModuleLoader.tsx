import { colors } from "@/lib/colors"

export function ModuleLoader() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: colors.background.primary }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: colors.accent.primary, borderTopColor: 'transparent' }}
        />
        <p style={{ color: colors.text.secondary }}>Loading visualization...</p>
      </div>
    </div>
  )
}
