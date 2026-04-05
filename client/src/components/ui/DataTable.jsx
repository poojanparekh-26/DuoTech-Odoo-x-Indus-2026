// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/ui/DataTable.jsx
import React from 'react';
import { Spinner } from './Spinner';

export const DataTable = ({
  columns,
  data: rawData,
  loading = false,
  emptyText = 'No data available',
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectAll,
  onSelectRow,
}) => {
  // Defensive: always ensure data is an array to prevent crashes
  const data = Array.isArray(rawData) ? rawData : [];
  const allSelected = data.length > 0 && selectedRows.length === data.length;

  return (
    <div className="w-full overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-gray-900 border-b border-gray-700 text-gray-400">
          <tr>
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 focus:ring-amber-500 text-amber-600"
                />
              </th>
            )}
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center">
                <Spinner size="md" />
              </td>
            </tr>
          ) : data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-12 text-center text-gray-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-700 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {selectable && (
                  <td className="px-4 py-3 w-12" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 focus:ring-amber-500 text-amber-600"
                    />
                  </td>
                )}
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
