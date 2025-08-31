import React from 'react';
import { cn } from '../utils/cn';
import { ChevronDown } from 'lucide-react';

/**
 * Select component for dropdown selections
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Child elements
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Select component
 */
const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
  </div>
));
Select.displayName = "Select";

/**
 * SelectItem component for select options
 * @param {Object} props - Component props
 * @param {string} props.value - Option value
 * @param {React.ReactNode} props.children - Option text
 * @returns {JSX.Element} SelectItem component
 */
const SelectItem = ({ value, children, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);
SelectItem.displayName = "SelectItem";

export { Select, SelectItem };