import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = '',
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}

            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="
                  flex items-center gap-1.5
                  text-gray-600 hover:text-primary-600
                  transition-colors
                "
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span
                className={`
                  flex items-center gap-1.5
                  ${isLast ? 'text-gray-900 font-medium' : 'text-gray-600'}
                `}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.icon}
                <span className="truncate max-w-[200px] md:max-w-none">
                  {item.label}
                </span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
