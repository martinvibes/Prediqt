import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ring-focus relative overflow-hidden',
  {
    variants: {
      variant: {
        primary:
          'bg-volt text-canvas hover:bg-volt-glow hover:shadow-glow-volt active:scale-[0.98] font-mono uppercase tracking-wider text-sm',
        secondary:
          'bg-canvas-raised text-ink border border-line hover:border-line-strong hover:bg-canvas-raised/80 font-mono uppercase tracking-wider text-sm',
        outline:
          'border border-line text-ink hover:border-volt hover:text-volt font-mono uppercase tracking-wider text-sm',
        ghost:
          'text-ink-dim hover:text-ink hover:bg-canvas-raised font-mono uppercase tracking-wider text-sm',
        danger:
          'bg-coral text-canvas hover:bg-coral-glow active:scale-[0.98] font-mono uppercase tracking-wider text-sm',
        link: 'text-volt underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 rounded-lg text-xs',
        md: 'h-10 px-5 rounded-xl',
        lg: 'h-12 px-7 rounded-xl text-base',
        xl: 'h-14 px-8 rounded-2xl text-base',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>working…</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
