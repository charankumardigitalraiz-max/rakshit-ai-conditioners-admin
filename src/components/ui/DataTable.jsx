import React from 'react';
import Pagination from './Pagination';

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  loadingMessage = "Loading...", 
  emptyMessage = "No results found.", 
  renderRow, 
  pagination, 
  onPageChange, 
  totalLabel = "Records Found" 
}) {
  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar flex-1">
        <table className="w-full min-w-[900px] text-left text-[12px] whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${col.className || ''}`}>
                  {col.label || col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-20 text-slate-300 animate-pulse font-bold">
                  {loadingMessage}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-20 text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <Pagination 
          pagination={pagination}
          onPageChange={onPageChange}
          label={totalLabel}
        />
      )}
    </div>
  );
}
