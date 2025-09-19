'use client';

import { useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EventSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function EventSearch({ 
  onSearch, 
  placeholder = "Search events...", 
  className 
}: EventSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounced search - trigger search after user stops typing
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <MagnifyingGlass 
          size={20} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          className={cn(
            "pl-10 pr-4 py-2 w-full",
            "glass border text-gray-900 placeholder:text-gray-500",
            "focus:bg-white/90 focus:border-blue-400/50",
            "transition-all duration-300"
          )}
        />
      </div>
    </form>
  );
}
