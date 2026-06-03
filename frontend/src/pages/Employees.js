// src/pages/Employees.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const STATUSES = ['Active', 'On Leave', 'Left', 'Blacklisted', 'Deceased', 'On Mission'];
const GENDERS  = ['Male', 'Female', 'Other'];

const empty = {
  EmpFirstName: '', EmpLastName: '', EmpGender: 'Male', EmpDateOfBirth: '',
  EmpEmail: '', EmpTelephone: '', EmpAddress: '', EmpHireDate: '',
  EmpStatus: 'Active', DepartID: '', PosID: '',
};

const statusColor = {
  'Active':      'bg-green-100 text-green-700',
  'On Leave':    'bg-yellow-100 text-yellow-700',
  'Left':        'bg-gray-100 text-gray-600',
  'Blacklisted': 'bg-red-100 text-red-700',
  'Deceased':    'bg-purple-100 text-purple-700',
  'On Mission':  'bg-blue-100 text-blue-700',
};

export default function Employees() {
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(empty);
  const [error,       setError]       = useState('');
  const [delId,       setDelId]       = useState(null);

  const load = useCallback(async () => {
    const [e, d, p] = await Promise.all([
      axios.get('/api/employees', { params: { search } }),
      axios.get('/api/departments'),
      axios.get('/api/positions'),
    ]);
    setEmployees(e.data);
    setDepartments(d.data);
    setPositions(p.data);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setError('');
    setModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp.EmpID);
    setForm({
      EmpFirstName: emp.EmpFirstName, EmpLastName: emp.EmpLastName,
      EmpGender: emp.EmpGender, EmpDateOfBirth: emp.EmpDateOfBirth?.split('T')[0],
      EmpEmail: emp.EmpEmail, EmpTelephone: emp.EmpTelephone,
      EmpAddress: emp.EmpAddress, EmpHireDate: emp.EmpHireDate?.split('T')[0],
      EmpStatus: emp.EmpStatus, DepartID: emp.DepartID, PosID: emp.PosID,
    });
    setError('');
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await axios.put(`/api/employees/${editing}`, form);
      } else {
        await axios.post('/api/employees', form);
      }
      setModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving employee.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/employees/${delId}`);
      setDelId(null);
      load();
    } catch (err) {
      alert('Error deleting employee.');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm">{employees.length} record(s) found</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search name, email, dept…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-full sm:w-64"
          />
          <button onClick={openAdd} className="btn-primary whitespace-nowrap">+ Add</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['#','Full Name','Gender','Email','Telephone','Department','Position','Status','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-gray-600 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">No employees found.</td></tr>
            )}
            {employees.map((emp, i) => (
              <tr key={emp.EmpID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {emp.EmpFirstName} {emp.EmpLastName}
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.EmpGender}</td>
                <td className="px-4 py-3 text-gray-600">{emp.EmpEmail}</td>
                <td className="px-4 py-3 text-gray-600">{emp.EmpTelephone}</td>
                <td className="px-4 py-3 text-gray-600">{emp.DepartName}</td>
                <td className="px-4 py-3 text-gray-600">{emp.PosName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[emp.EmpStatus] || 'bg-gray-100'}`}>
                    {emp.EmpStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(emp)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    <button onClick={() => setDelId(emp.EmpID)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editing ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm">{error}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">First Name *</label>
                  <input required className="input-field" value={form.EmpFirstName}
                    onChange={e => setForm({ ...form, EmpFirstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Last Name *</label>
                  <input required className="input-field" value={form.EmpLastName}
                    onChange={e => setForm({ ...form, EmpLastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Gender *</label>
                  <select required className="input-field" value={form.EmpGender}
                    onChange={e => setForm({ ...form, EmpGender: e.target.value })}>
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Date of Birth *</label>
                  <input required type="date" className="input-field" value={form.EmpDateOfBirth}
                    onChange={e => setForm({ ...form, EmpDateOfBirth: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Email *</label>
                  <input required type="email" className="input-field" value={form.EmpEmail}
                    onChange={e => setForm({ ...form, EmpEmail: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Telephone *</label>
                  <input required className="input-field" value={form.EmpTelephone}
                    onChange={e => setForm({ ...form, EmpTelephone: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Address *</label>
                  <input required className="input-field" value={form.EmpAddress}
                    onChange={e => setForm({ ...form, EmpAddress: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Hire Date *</label>
                  <input required type="date" className="input-field" value={form.EmpHireDate}
                    onChange={e => setForm({ ...form, EmpHireDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Status *</label>
                  <select required className="input-field" value={form.EmpStatus}
                    onChange={e => setForm({ ...form, EmpStatus: e.target.value })}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Department *</label>
                  <select required className="input-field" value={form.DepartID}
                    onChange={e => setForm({ ...form, DepartID: e.target.value })}>
                    <option value="">-- Select --</option>
                    {departments.map(d => <option key={d.DepartID} value={d.DepartID}>{d.DepartName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">Position *</label>
                  <select required className="input-field" value={form.PosID}
                    onChange={e => setForm({ ...form, PosID: e.target.value })}>
                    <option value="">-- Select --</option>
                    {positions.map(p => <option key={p.PosID} value={p.PosID}>{p.PosName}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-sm mb-4">Are you sure you want to delete this employee? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
