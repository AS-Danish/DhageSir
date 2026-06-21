import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import Pagination from './Pagination';

export default function AdminTable({ 
  items, 
  columns, 
  onEdit, 
  onDelete, 
  onViewImage,
  currentPage,
  itemsPerPage,
  onPageChange,
  hidePagination = false
}) {
  const totalItems = items.length;
  const startIndex = hidePagination ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedItems = hidePagination ? items : items.slice(startIndex, startIndex + itemsPerPage);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500 font-medium text-lg">No items found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4">
                    {col.render ? col.render(item) : (
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {item[col.accessor]}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onViewImage && item.preview_image_url && (
                      <button
                        onClick={() => onViewImage(item.preview_image_url)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Image"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!hidePagination && (
        <Pagination 
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
