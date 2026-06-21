import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function StatCard({ title, value, change, trend, icon: Icon, colorClass, bgColorClass, iconColorClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${bgColorClass} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColorClass}`} />
        </div>
        {change && (
          <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-black text-gray-900">{value}</p>
    </div>
  );
}
