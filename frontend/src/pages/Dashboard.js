// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/employees'),
      axios.get('/api/departments'),
      axios.get('/api/positions'),
    ]).then(([emp, dep, pos]) => {
      const employees = emp.data;
      setStats({
        total:       employees.length,
        active:      employees.filter(e => e.EmpStatus === 'Active').length,
        onLeave:     employees.filter(e => e.EmpStatus === 'On Leave').length,
        onMission:   employees.filter(e => e.EmpStatus === 'On Mission').length,
        left:        employees.filter(e => e.EmpStatus === 'Left').length,
        blacklisted: employees.filter(e => e.EmpStatus === 'Blacklisted').length,
        deceased:    employees.filter(e => e.EmpStatus === 'Deceased').length,
        departments: dep.data.length,
        positions:   pos.data.length,
      });
    }).catch(() => {});
  }, []);

  const cards = stats ? [
    { label: 'Total Employees',  value: stats.total,       color: 'bg-blue-600',   icon: '👥' },
    { label: 'Active',           value: stats.active,      color: 'bg-green-600',  icon: '✅' },
    { label: 'On Leave',         value: stats.onLeave,     color: 'bg-yellow-500', icon: '🌴' },
    { label: 'On Mission',       value: stats.onMission,   color: 'bg-purple-600', icon: '✈️' },
    { label: 'Left',             value: stats.left,        color: 'bg-gray-500',   icon: '🚪' },
    { label: 'Blacklisted',      value: stats.blacklisted, color: 'bg-red-600',    icon: '🚫' },
    { label: 'Departments',      value: stats.departments, color: 'bg-indigo-600', icon: '🏢' },
    { label: 'Positions',        value: stats.positions,   color: 'bg-teal-600',   icon: '💼' },
  ] : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to DAB Enterprise HRMS — Overview</p>
      </div>

      {!stats ? (
        <p className="text-gray-400">Loading statistics…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`${c.color} px-4 py-3 flex items-center justify-between`}>
                <span className="text-white text-sm font-semibold">{c.label}</span>
                <span className="text-2xl">{c.icon}</span>
              </div>
              <div className="px-4 py-3">
                <span className="text-3xl font-bold text-gray-800">{c.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Quick Guide</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Use <strong>Employees</strong> to add, edit, search, and manage all staff.</li>
          <li>Use <strong>Departments</strong> and <strong>Positions</strong> to manage organisation structure.</li>
          <li>Use <strong>Users</strong> to create login accounts for employees.</li>
          <li>Use <strong>Leave Report</strong> to generate and print the official on-leave status report.</li>
        </ul>
      </div>
    </div>
  );
}
