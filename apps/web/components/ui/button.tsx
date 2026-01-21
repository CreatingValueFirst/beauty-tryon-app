import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation active-scale',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-brand text-white shadow-brand hover:shadow-glow hover:scale-105 active:scale-95',
        glass:
          'glass-card text-gray-900 shadow-medium hover:shadow-large hover:scale-102',
        outline:
          'border-2 border-gray-200 bg-white hover:bg-gradient-brand hover:text-white hover:border-transparent shadow-soft hover:shadow-medium',
        gradient:
          'bg-gradient-sunset text-white shadow-large hover:shadow-extra animate-gradient hover:scale-105',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-soft hover:shadow-medium',
        ghost:
          'hover:bg-gray-100 hover:shadow-soft',
        link:
          'text-brand-purple underline-offset-4 hover:underline',
        destructive:
          'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-medium hover:shadow-large hover:scale-105',
        success:
          'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-medium hover:shadow-large hover:scale-105',
        premium:
          'relative overflow-hidden bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white shadow-large hover:shadow-extra gradient-shine font-bold',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-14 rounded-xl px-10 text-base',
        xl: 'h-16 rounded-2xl px-12 text-lg',
        icon: 'h-11 w-11',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
