// Placeholder module - Vector Transformations (Coming Soon)
interface ModuleProps {
  onComplete: (values: { a: number; f: number }) => void
  isVisible?: boolean
}

export function Module({ onComplete: _onComplete, isVisible: _isVisible }: ModuleProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
      <h1 className="text-2xl font-light mb-4">Vector Transformations</h1>
      <p className="text-gray-400">Coming Soon</p>
    </div>
  )
}

export default Module
