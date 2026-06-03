// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users() {
  const [employees, setEmployees] = useState([]);
  const [form,      setForm]      = useState({ username: '', password: '', empId: '' });
  const [message,   setMessage]   = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    axios.get('/api/employees').then(r => setEmployees(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setMessage(''); setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/register', form);
      setMessage('User account created successfully!');
      setForm({ username: '', password: '', empId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating user.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Accounts</h1>
        <p className="text-gray-500 text-sm mt-1">Create login accounts for employees.</p>
      </div>

      <div className="max-w-md card">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Account</h2>

        {message && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-2 text-sm mb-4">{message}</div>}
        {error   && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Select Employee *</label>
            <select required className="input-field" value={form.empId}
              onChange={e => setForm({ ...form, empId: e.target.value })}>
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.EmpID} value={emp.EmpID}>
                  {emp.EmpFirstName} {emp.EmpLastName} — {emp.DepartName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Username *</label>
            <input required className="input-field" placeholder="e.g. alice.uwase"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password *</label>
            <input required type="password" className="input-field" placeholder="Min 6 characters"
              minLength={6} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
