// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import Employees   from './pages/Employees';
import Departments from './pages/Departments';
import Positions   from './pages/Positions';
import Report      from './pages/Report';
import Users       from './pages/Users';
import Layout      from './components/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-blue-600 text-xl">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="employees"   element={<Employees />} />
            <Route path="departments" element={<Departments />} />
            <Route path="positions"   element={<Positions />} />
            <Route path="report"      element={<Report />} />
            <Route path="users"       element={<Users />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
