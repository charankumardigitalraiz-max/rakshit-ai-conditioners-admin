import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange, label = 'Records Found' }) {
  if (!pagination) return null;

  const getPageNumbers = () => {
    const totalPages = pagination?.pages || 0;
    const currentPage = pagination?.page || 1;
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="px-4 py-2.5 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between bg-slate-50/20">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {pagination.total} {label}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${
                pagination.page === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
