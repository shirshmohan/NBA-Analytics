import { useState } from 'react'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
  highlight?: boolean
}

interface SortableTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  rowKey: keyof T
  onRowHover?: (row: T | null) => void
  onRowClick?: (row: T) => void
  highlightRow?: (row: T) => boolean
  maxHeight?: string
}

export function SortableTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowHover,
  onRowClick,
  highlightRow,
  maxHeight,
}: SortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey] as number | string
        const bv = b[sortKey] as number | string
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  return (
    <div className="overflow-auto" style={maxHeight ? { maxHeight } : {}}>
      <table className="data-table">
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th
                key={col.key as string}
                onClick={() => col.sortable !== false && handleSort(col.key as string)}
                style={{ textAlign: col.align ?? 'left', cursor: col.sortable !== false ? 'pointer' : 'default' }}
                className={col.highlight ? 'text-orange-400' : ''}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(row => (
            <tr
              key={row[rowKey] as string}
              onMouseEnter={() => onRowHover?.(row)}
              onMouseLeave={() => onRowHover?.(null)}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                background: highlightRow?.(row) ? 'rgba(249,115,22,0.08)' : undefined,
              }}
            >
              {columns.map(col => (
                <td key={col.key as string} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
