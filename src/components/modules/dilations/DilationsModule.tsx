import type { ModuleProps } from '@/config/modules'

/**
 * Dilations & Similarity module — coming soon.
 * Placeholder component for module registration.
 */
export default function DilationsModule(_props: ModuleProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-(--lab-bg)">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-(--lab-text)">
          Dilations & Similarity
        </h1>
        <p className="mt-2 text-(--lab-text-muted)">Coming soon...</p>
      </div>
    </div>
  )
}
