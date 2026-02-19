// Placeholder module - Phase Portraits (Coming Soon)
interface ModuleProps {
  onComplete: (values: Record<string, number>) => void
  isVisible?: boolean
}

export function Module(props: ModuleProps) {
  // Suppress unused props warning - stub module
  void props
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
      <h1 className="text-2xl font-light mb-4">Phase Portraits</h1>
      <p className="text-gray-400">Coming Soon</p>
    </div>
  )
}

export default Module
