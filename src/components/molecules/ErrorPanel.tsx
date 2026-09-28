import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../atoms/Button';

interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
  /** Smaller padding, for panels inside a card or modal */
  compact?: boolean;
}

/** Shared error state for recipe screens: the message and a Retry button. */
export const ErrorPanel: React.FC<ErrorPanelProps> = ({ message, onRetry, compact = false }) => (
  <div
    role="alert"
    data-testid="error-panel"
    className={`bg-white rounded-xl border border-red-200 text-center ${compact ? 'p-6' : 'p-12 shadow-sm'}`}
  >
    <AlertTriangle className={`${compact ? 'w-10 h-10' : 'w-16 h-16'} text-red-400 mx-auto mb-4`} />
    <p className="text-gray-800 mb-6">{message}</p>
    <div className="flex justify-center">
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  </div>
);
