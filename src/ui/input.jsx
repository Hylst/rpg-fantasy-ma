import React from 'react';
import { cn } from '../utils/cn';

/**
 * Input component for form inputs with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Input component
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };