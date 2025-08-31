import React from 'react';
import { cn } from '../utils/cn';

/**
 * Label component for form labels with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Child elements
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Label component
 */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };