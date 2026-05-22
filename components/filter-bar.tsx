"use client";

const INPUT_BASE =
  "rounded-md border border-gray-300 dark:border-gray-600 " +
  "bg-white dark:bg-gray-800 dark:text-gray-100 px-3 py-2 text-sm";

export type FilterValues = Record<string, string>;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: "select" | "text";
  options?: FilterOption[];
  className?: string;
}

export interface FilterBarProps {
  filters: FilterDefinition[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}

export default function FilterBar({ filters, values, onChange }: FilterBarProps) {
  function handleChange(key: string, value: string) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-wrap">
      {filters.map((filter) =>
        filter.type === "select" ? (
          <select
            key={filter.key}
            value={values[filter.key] ?? ""}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            aria-label={filter.label}
            className={`${INPUT_BASE} ${filter.className ?? ""}`}
          >
            <option value="">{filter.label}</option>
            {filter.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            key={filter.key}
            type="text"
            placeholder={filter.label}
            value={values[filter.key] ?? ""}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            className={`${INPUT_BASE} ${filter.className ?? ""}`}
          />
        )
      )}
    </div>
  );
}
