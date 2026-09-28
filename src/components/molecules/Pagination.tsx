import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Previous/next paging; hidden when everything fits on one page. */
export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(page - 1, totalPages))}
        disabled={page <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
};
