import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            onClick: () => setIsOpen(!isOpen),
            isOpen 
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, { 
            isOpen,
            onValueChange: (val) => {
              onValueChange(val);
              setIsOpen(false);
            }
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = ({ className = '', children, onClick, isOpen, ...props }) => {
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

export const SelectValue = ({ placeholder, children }) => {
  return <span>{children || placeholder}</span>;
};

export const SelectContent = ({ className = '', children, isOpen, onValueChange, ...props }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 ${className}`}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, { onValueChange });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const SelectItem = ({ className = '', children, value, onValueChange, ...props }) => {
  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={() => onValueChange && onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  );
};
