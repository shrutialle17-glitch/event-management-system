import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { UserCircle, Shield, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Users...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-8xl">
      <Link to="/admin" className="flex items-center text-textMuted hover:text-primary mb-6 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Manage Users</h1>
        <p className="text-textMuted">View and manage all platform accounts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-textMuted uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} className="w-10 h-10 rounded-full" alt="avatar"/>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserCircle className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-text">{u.name} {u._id === currentUser._id && <span className="text-xs text-primary ml-2">(You)</span>}</p>
                        <p className="text-xs text-textMuted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {u.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-purple-600" /> : 
                       u.role === 'organizer' ? <Shield className="w-4 h-4 text-blue-600" /> : 
                       <UserCircle className="w-4 h-4 text-gray-400" />}
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === currentUser._id}
                        className={`text-sm border-gray-200 rounded p-1 focus:ring-primary focus:border-primary
                          ${u.role === 'admin' ? 'text-purple-600 font-medium bg-purple-50 border-none' : ''}
                        `}
                      >
                        <option value="user">User</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(u._id)}
                      disabled={u._id === currentUser._id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-2"
                      title="Delete User"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
