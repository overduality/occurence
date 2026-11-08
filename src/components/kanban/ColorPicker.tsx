"use client";

import React from "react";
import { Check } from "lucide-react";
import { AVAILABLE_COLORS } from "./constants";

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <div>
      <span className="block text-xs font-medium text-ink-primary">Color</span>
      <div className="mt-2 flex items-center gap-2">
        {AVAILABLE_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectColor(c.id)}
            className={`h-6 w-6 rounded-full ${c.bg} transition-all flex items-center justify-center ${
              selectedColor === c.id
                ? "ring-2 ring-offset-2 ring-offset-card ring-accent scale-110"
                : "opacity-80 hover:opacity-100"
            }`}
            title={c.label}
          >
            {selectedColor === c.id && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  );
}
