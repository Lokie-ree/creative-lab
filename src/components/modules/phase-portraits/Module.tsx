// Placeholder module - Phase Portraits (Coming Soon)
interface ModuleProps {
  onComplete: (values: Record<string, number>) => void
  isVisible?: boolean
}

export function Module(props: ModuleProps) {
  // Suppress unused props warning - stub module
  void props
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-(--lab-bg) text-(--lab-text)">
      <h1 className="text-2xl font-light mb-4 lab-display-font">Phase Portraits</h1>
      <p className="text-(--lab-text-muted) lab-silk lab-display-font">Coming Soon</p>
    </div>
  )
}

export default Module
