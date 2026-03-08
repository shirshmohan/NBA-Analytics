interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  label?: string
  className?: string
}

export function Select({ value, onChange, options, placeholder = 'All', label, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-dark appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
