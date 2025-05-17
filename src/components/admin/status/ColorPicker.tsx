
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const TAILWIND_COLORS = [
  'bg-red-500 text-white',
  'bg-pink-500 text-white',
  'bg-purple-500 text-white',
  'bg-indigo-500 text-white',
  'bg-blue-500 text-white',
  'bg-cyan-500 text-white',
  'bg-teal-500 text-white',
  'bg-green-500 text-white',
  'bg-lime-500 text-white',
  'bg-yellow-500 text-yellow-800',
  'bg-orange-500 text-white',
  'bg-amber-500 text-amber-900',
  'bg-amber-800 text-white',
  'bg-gray-500 text-white',
  'bg-gray-400 text-gray-800',
  'bg-red-300 text-red-800',
  'bg-pink-300 text-pink-800',
  'bg-purple-300 text-purple-800',
  'bg-indigo-300 text-indigo-800',
  'bg-blue-300 text-blue-800',
  'bg-cyan-300 text-cyan-800',
  'bg-teal-300 text-teal-800',
  'bg-green-300 text-green-800',
  'bg-lime-300 text-lime-800',
  'bg-yellow-300 text-yellow-800',
  'bg-orange-300 text-orange-800'
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center col-span-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 w-full md:w-40"
            onClick={() => setIsOpen(true)}
          >
            <div className={`w-5 h-5 rounded ${color}`} />
            <span>Couleur</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid grid-cols-5 gap-2 p-2">
            {TAILWIND_COLORS.map((colorClass, index) => (
              <button
                key={index}
                className={`w-10 h-10 rounded-md ${colorClass} hover:ring-2 hover:ring-offset-2`}
                onClick={() => {
                  onChange(colorClass);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {color && (
        <div className="ml-4 flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${color}`} />
          <span className="text-sm text-muted-foreground">{color.split(' ')[0].replace('bg-', '')}</span>
        </div>
      )}
    </div>
  );
}
