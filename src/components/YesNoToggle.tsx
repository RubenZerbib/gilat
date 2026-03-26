"use client";

interface YesNoToggleProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function YesNoToggle({
  label,
  value,
  onChange,
  error,
}: YesNoToggleProps) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <span className="text-base text-gray-800 leading-relaxed flex-1">
          {label}
        </span>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              value === true
                ? "bg-red-500 text-white shadow-md scale-105"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            כן
          </button>
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              value === false
                ? "bg-green-500 text-white shadow-md scale-105"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            לא
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
