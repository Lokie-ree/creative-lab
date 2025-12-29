import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const progress = Math.min((current / total) * 100, 100)

  return (
    <Progress
      value={progress}
      className={`h-1 bg-[var(--lab-border)] ${className}`}
    />
  )
}
