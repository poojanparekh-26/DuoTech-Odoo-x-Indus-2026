// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/components/dashboard/TopProductsTable.jsx
import React from 'react';

export const TopProductsTable = ({ data }) => {
  return (
    <div className="w-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-700 shrink-0">
        <h3 className="text-lg font-medium text-gray-200">Top Products</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900 border-b border-gray-700 text-gray-400">
            <tr>
              <th className="px-5 py-3 w-16 text-center font-medium">Rank</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 text-right font-medium">Qty</th>
              <th className="px-5 py-3 text-right font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data && data.length > 0 ? (
              data.slice(0, 10).map((row, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-4 text-center text-gray-500 font-semibold">#{index + 1}</td>
                  <td className="px-5 py-4 font-medium text-gray-200">{row.name}</td>
                  <td className="px-5 py-4 text-right text-gray-400">{row.total_qty}</td>
                  <td className="px-5 py-4 text-right font-bold text-amber-500">${Number(row.revenue).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
