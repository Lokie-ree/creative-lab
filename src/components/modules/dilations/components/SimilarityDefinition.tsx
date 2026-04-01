// src/components/modules/dilations/components/SimilarityDefinition.tsx
//
// Earned reveal overlay shown on similarity-inverse completion.
// Presents the formal definition of similar figures as a discovered insight.

import { AnimatePresence, motion } from 'motion/react'
import { EARNED_REVEALS } from '../dilations-copy'

interface SimilarityDefinitionProps {
  visible: boolean
  onContinue: () => void
}

export function SimilarityDefinition({ visible, onContinue }: SimilarityDefinitionProps) {
  const reveal = EARNED_REVEALS['similarity-inverse']

  return (
    <AnimatePresence>
      {visible && reveal && (
        <motion.div
          key="similarity-definition"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-(--lab-bg)/80"
        >
          <div className="flex flex-col gap-4 w-full max-w-sm border-2 border-(--lab-earned) bg-(--lab-surface) p-5">
            {/* Header */}
            <div className="lab-silk lab-display-font text-[8px] tracking-[0.2em] text-(--lab-earned)">
              DISCOVERED
            </div>

            {/* Definition text */}
            <p className="text-sm font-medium lab-display-font text-(--lab-text) leading-relaxed">
              {reveal.text}
            </p>

            {/* Continue button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onContinue}
                className="min-h-[44px] px-5 bg-(--lab-earned) lab-silk lab-display-font text-[9px] tracking-[0.1em] text-(--lab-bg) transition-opacity duration-150 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-earned)"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
