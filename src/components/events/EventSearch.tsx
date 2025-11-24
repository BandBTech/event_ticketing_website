'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';

interface EventSearchProps {
  onSearch: (query: string) => void;
  value?: string;
  placeholder?: string;
  className?: string;
}

export function EventSearch({ 
  onSearch, 
  value: externalValue,
  placeholder = "Search events...", 
  className 
}: EventSearchProps) {
  const [query, setQuery] = useState(externalValue || '');

  // Sync with external value changes
  useEffect(() => {
    if (externalValue !== undefined) {
      setQuery(externalValue);
    }
  }, [externalValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
            weight="duotone"
          />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            className={cn(
              "pl-10 pr-4 h-12",
              "glass border text-gray-900 placeholder:text-gray-500",
              "focus:bg-white/90 focus:border-blue-400/50",
              "transition-all duration-300"
            )}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MagnifyingGlassIcon size={20} weight="bold" className="mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
}
