// src/pages/Departments.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [name,        setName]        = useState('');
  const [error,       setError]       = useState('');
  const [delId,       setDelId]       = useState(null);

  const load = async () => {
    const r = await axios.get('/api/departments');
    setDepartments(r.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setName(''); setError(''); setModal(true); };
  const openEdit = (d) => { setEditing(d.DepartID); setName(d.DepartName); setError(''); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await axios.put(`/api/departments/${editing}`, { DepartName: name });
      else         await axios.post('/api/departments', { DepartName: name });
      setModal(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  const handleDelete = async () => {
    try { await axios.delete(`/api/departments/${delId}`); setDelId(null); load(); }
    catch (err) { alert(err.response?.data?.message || 'Cannot delete.'); setDelId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <button onClick={openAdd} className="btn-primary">+ Add Department</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">#</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Department Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">No departments yet.</td></tr>
            )}
            {departments.map((d, i) => (
              <tr key={d.DepartID} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{d.DepartName}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(d)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                  <button onClick={() => setDelId(d.DepartID)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Department</h2>
            {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">Department Name *</label>
                <input required className="input-field" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-sm mb-4">Delete this department? Employees assigned will be affected.</p>
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
