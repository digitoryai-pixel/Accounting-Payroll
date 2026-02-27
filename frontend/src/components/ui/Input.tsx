'use client';

import React from 'react';

/* ─── Shared Styles ──────────────────────────────────────────────── */

const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

const baseInputClasses = `
  block w-full rounded-lg border px-3 py-2
  text-sm text-gray-900 placeholder-gray-400
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
  disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
`;

const normalBorder = 'border-gray-300';
const errorBorder = 'border-red-400 focus:ring-red-500 focus:border-red-500';

/* ─── TextInput ──────────────────────────────────────────────────── */

interface TextInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  name?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  disabled = false,
  name,
}: TextInputProps) {
  return (
    <div>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${baseInputClasses} ${error ? errorBorder : normalBorder}`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ─── SelectInput ────────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  name?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  disabled = false,
  name,
}: SelectInputProps) {
  return (
    <div>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`${baseInputClasses} ${error ? errorBorder : normalBorder} appearance-none bg-white`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ─── TextArea ───────────────────────────────────────────────────── */

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  name?: string;
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
  disabled = false,
  name,
}: TextAreaProps) {
  return (
    <div>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`${baseInputClasses} ${error ? errorBorder : normalBorder} resize-vertical`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
