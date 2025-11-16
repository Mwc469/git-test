'use client';

import { cn } from '../lib/utils';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onClearSelection?: () => void;
  customActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: string;
    variant?: 'primary' | 'danger' | 'secondary';
  }>;
}

export default function BulkActions({
  selectedCount,
  onDelete,
  onExport,
  onClearSelection,
  customActions = []
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {selectedCount} selected
            </div>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <div className="flex gap-2">
            {customActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                  action.variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
                  action.variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
                  (!action.variant || action.variant === 'secondary') && 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </button>
            ))}

            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                📤 Export
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
