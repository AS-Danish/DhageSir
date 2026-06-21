import React from 'react';
import { X, Save, Loader } from 'lucide-react';

export default function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSave, 
  isSaving, 
  saveText = 'Save',
  size = 'md' // sm, md, lg, xl
}) {
  if (!isOpen) return null;

  const maxWidth = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col transform transition-all`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {onSave && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saveText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
