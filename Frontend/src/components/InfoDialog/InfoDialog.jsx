import React from 'react';
import { Info, X, Copy, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function InfoDialog({ 
  isOpen, 
  onClose, 
  title = 'Information', 
  message,
  copyableText,
  onOk
}) {
  const { isDark } = useTheme();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (copyableText) {
      navigator.clipboard.writeText(copyableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOk = () => {
    if (onOk) onOk();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{message}</div>
          
          {copyableText && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 relative transition-colors duration-200">
              <code className="text-sm text-gray-800 dark:text-gray-300 break-all">{copyableText}</code>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200">
          <button
            onClick={handleOk}
            className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
