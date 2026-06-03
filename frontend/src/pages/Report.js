// src/pages/Report.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function Report() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    axios.get('/api/employees/report/on-leave')
      .then(r => setData(r.data))
      .catch(() => setData({ total: 0, employees: [] }))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Employee On-Leave Report — DAB Enterprise LTD</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1a1a1a; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .sub { color: #555; font-size: 13px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; }
        td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
        .dept-row td { background: #dbeafe; font-weight: bold; color: #1e3a8a; }
        .total { margin-top: 16px; font-weight: bold; font-size: 14px; }
        .footer { margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
      </style></head><body>
      ${content}
      <div class="footer">Generated on ${new Date().toLocaleString()} — HRMS | DAB Enterprise LTD, Kigali, Rwanda</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // Group by department
  const grouped = data ? data.employees.reduce((acc, emp) => {
    if (!acc[emp.DepartName]) acc[emp.DepartName] = [];
    acc[emp.DepartName].push(emp);
    return acc;
  }, {}) : {};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Leave Report</h1>
          <p className="text-gray-500 text-sm mt-1">Employees currently on leave, organised by department</p>
        </div>
        {data && (
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            🖨️ Print Report
          </button>
        )}
      </div>

      {loading && <p className="text-gray-400">Loading report…</p>}

      {data && (
        <div ref={printRef}>
          {/* Report Header */}
          <div className="bg-blue-900 text-white rounded-t-xl px-6 py-5">
            <h1 className="text-xl font-bold">DAB Enterprise LTD</h1>
            <p className="text-blue-300 text-sm">Kigali, Rwanda — Human Resource Management System</p>
            <h2 className="text-lg font-semibold mt-3">Employee Status Report: On Leave</h2>
            <p className="text-blue-200 text-sm">Generated: {new Date().toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {data.total === 0 ? (
            <div className="bg-white border border-gray-100 rounded-b-xl px-6 py-12 text-center text-gray-400">
              No employees are currently on leave.
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-b-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['#','Full Name','Gender','Position','Email','Telephone','Hire Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).map(([dept, emps]) => (
                    <React.Fragment key={dept}>
                      {/* Department header row */}
                      <tr className="bg-blue-50 border-b border-blue-100">
                        <td colSpan={7} className="px-4 py-2 font-bold text-blue-800 text-sm">
                          🏢 {dept} — {emps.length} employee{emps.length !== 1 ? 's' : ''}
                        </td>
                      </tr>
                      {emps.map((emp, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{emp.FullName}</td>
                          <td className="px-4 py-3 text-gray-600">{emp.EmpGender}</td>
                          <td className="px-4 py-3 text-gray-600">{emp.PosName}</td>
                          <td className="px-4 py-3 text-gray-600">{emp.EmpEmail}</td>
                          <td className="px-4 py-3 text-gray-600">{emp.EmpTelephone}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(emp.EmpHireDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total summary */}
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 flex items-center justify-between">
            <span className="text-blue-800 font-semibold">Total Employees on Leave</span>
            <span className="text-3xl font-bold text-blue-700">{data.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
