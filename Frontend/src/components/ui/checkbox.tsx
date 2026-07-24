import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ className, checked = false, onCheckedChange, id, disabled, ...props }: CheckboxProps) {
  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only peer"
        {...props}
      />
      <div
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        className={cn(
          "h-5 w-5 rounded border border-slate-300 bg-white transition-all cursor-pointer flex items-center justify-center select-none shadow-xs",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 peer-focus-visible:ring-offset-1",
          checked && "bg-blue-600 border-blue-600 text-white",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </div>
    </div>
  );
}

export { Checkbox };
