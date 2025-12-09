import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    // Always show first page
    pages.push(1);
    
    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if near start or end
    if (currentPage <= 3) {
      end = Math.min(totalPages - 1, 4);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    // Add ellipsis if gap exists after first page
    if (start > 2) {
      pages.push('...');
    }

    // Add range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if gap exists before last page
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 h-10 w-10 p-0 flex items-center justify-center"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="text-slate-500 px-2">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-magenta-600 text-white shadow-lg shadow-magenta-900/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 h-10 w-10 p-0 flex items-center justify-center"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
