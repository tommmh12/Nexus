import React, { useState, useMemo } from 'react';
import { 
  MoreHorizontal, Plus, Search, Filter, Download, 
  Trash2, Edit, Shield, Mail, CheckCircle, XCircle 
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Esther Howard', email: 'esther@nexus.com', role: UserRole.ADMIN, department: 'IT / Engineering', status: UserStatus.ACTIVE, lastActive: '2 mins ago', avatar: 'https://picsum.photos/id/101/50/50' },
  { id: '2', name: 'Cameron Williamson', email: 'cameron@nexus.com', role: UserRole.MANAGER, department: 'Marketing', status: UserStatus.ACTIVE, lastActive: '1 hour ago', avatar: 'https://picsum.photos/id/102/50/50' },
  { id: '3', name: 'Robert Fox', email: 'robert@nexus.com', role: UserRole.STAFF, department: 'Sales', status: UserStatus.INACTIVE, lastActive: '2 days ago', avatar: 'https://picsum.photos/id/103/50/50' },
  { id: '4', name: 'Jenny Wilson', email: 'jenny@nexus.com', role: UserRole.STAFF, department: 'Human Resources', status: UserStatus.ACTIVE, lastActive: '5 hours ago', avatar: 'https://picsum.photos/id/104/50/50' },
  { id: '5', name: 'Marvin McKinney', email: 'marvin@nexus.com', role: UserRole.MANAGER, department: 'Finance', status: UserStatus.SUSPENDED, lastActive: '1 week ago', avatar: 'https://picsum.photos/id/105/50/50' },
  { id: '6', name: 'Kristin Watson', email: 'kristin@nexus.com', role: UserRole.STAFF, department: 'IT / Support', status: UserStatus.ACTIVE, lastActive: '10 mins ago', avatar: 'https://picsum.photos/id/106/50/50' },
];

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Implement search filtering
  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Manage access, roles, and departmental assignments.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all">
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or department..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={16} />
              Filter
            </button>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50">
              <option>All Roles</option>
              <option>Admins</option>
              <option>Managers</option>
              <option>Staff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                      user.role === UserRole.ADMIN 
                        ? 'border-violet-100 bg-violet-50 text-violet-700' 
                        : user.role === UserRole.MANAGER 
                        ? 'border-blue-100 bg-blue-50 text-blue-700'
                        : 'border-slate-100 bg-slate-100 text-slate-600'
                    }`}>
                      {user.role === UserRole.ADMIN && <Shield size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.status === UserStatus.ACTIVE && <CheckCircle size={14} className="text-emerald-500" />}
                      {user.status === UserStatus.INACTIVE && <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300"></div>}
                      {user.status === UserStatus.SUSPENDED && <XCircle size={14} className="text-red-500" />}
                      <span className={`text-xs font-medium ${
                        user.status === UserStatus.ACTIVE ? 'text-emerald-700' : 
                        user.status === UserStatus.SUSPENDED ? 'text-red-700' : 'text-slate-500'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm" title="Email">
                        <Mail size={16} />
                      </button>
                      <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {/* Fallback for mobile or non-hover states */}
                    <div className="sm:hidden">
                        <MoreHorizontal size={16} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="mb-2 h-8 w-8 text-slate-300" />
                    <p>No users found matching "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <p className="text-sm text-slate-500">Showing <span className="font-medium">{filteredUsers.length > 0 ? 1 : 0}</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{MOCK_USERS.length}</span> users</p>
          <div className="flex gap-2">
            <button className="rounded border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50">Previous</button>
            <button className="rounded border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;