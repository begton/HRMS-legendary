// src/components/Layout.js
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',            label: 'Dashboard',   icon: '🏠' },
  { to: '/employees',   label: 'Employees',   icon: '👥' },
  { to: '/departments', label: 'Departments', icon: '🏢' },
  { to: '/positions',   label: 'Positions',   icon: '💼' },
  { to: '/users',       label: 'Users',       icon: '🔑' },
  { to: '/report',      label: 'Leave Report',icon: '📋' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-blue-800">
          <h1 className="text-xl font-bold text-white leading-tight">DAB Enterprise</h1>
          <p className="text-blue-300 text-xs mt-1">HRMS — Human Resource Management</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-blue-700 text-white border-r-4 border-blue-300'
                   : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
              }
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="px-6 py-4 border-t border-blue-800">
          <p className="text-blue-300 text-xs mb-1">Logged in as</p>
          <p className="text-white text-sm font-semibold truncate">{user?.fullName || user?.username}</p>
          <button onClick={handleLogout}
            className="mt-3 w-full text-center bg-blue-700 hover:bg-red-600 text-white text-sm py-2 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:px-6">
          <button className="md:hidden text-gray-600 text-2xl" onClick={() => setOpen(!open)}>☰</button>
          <h2 className="text-gray-700 font-semibold text-sm hidden md:block">
            DAB Enterprise LTD — Kigali, Rwanda
          </h2>
          <span className="text-xs text-gray-400">{new Date().toLocaleDateString()}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
