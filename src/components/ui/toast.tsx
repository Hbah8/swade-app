import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toastVariants = cva(
  'rounded-md border px-3 py-2 text-sm',
  {
    variants: {
      variant: {
        success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
        destructive: 'border-red-400/40 bg-red-500/10 text-red-200',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  },
)

function Toast({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof toastVariants>) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Toast }
