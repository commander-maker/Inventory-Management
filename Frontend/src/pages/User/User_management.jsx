import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Trash2, Phone, Calendar, Truck, TrendingUp, X, Users as UsersIcon, UserCog } from 'lucide-react';
import { userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import InfoDialog from '../../components/InfoDialog/InfoDialog';

export default function UserManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ show: false, userId: null });
  const [passwordDialog, setPasswordDialog] = useState({ show: false, password: '', email: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    phone: '',
    vehicle: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getAll();
      if (response.data.success) {
        // Add avatar data for display
        const usersWithAvatars = response.data.data.map(user => ({
          ...user,
          avatar: user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          avatarColor: getRandomColor(),
          joinedDate: new Date(user.joinedDate).toLocaleDateString(),
          monthlySales: user.monthlySales ? `Rs ${user.monthlySales.toLocaleString()}` : null
        }));
        setUsers(usersWithAvatars);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Filter out admin users - admins are managed separately in Settings
  const agentUsers = users.filter(u => u.role !== 'admin');

  const stats = [
    { label: 'Total Agents', value: agentUsers.length.toString(), icon: UsersIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Sales Agents', value: agentUsers.filter(u => u.role === 'agent').length.toString(), icon: UserCog, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  // Enhanced search and filter function
  const filteredUsers = agentUsers.filter(user => {
    // Search matches name, email, phone, or vehicle
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.phone && user.phone.includes(searchLower)) ||
      (user.vehicle && user.vehicle.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'agent',
      phone: '',
      vehicle: ''
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      vehicle: user.vehicle || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    setDeleteDialog({ show: true, userId });
  };

  const confirmDeleteUser = async () => {
    const userId = deleteDialog.userId;
    setDeleteDialog({ show: false, userId: null });

    setLoading(true);
    try {
      const response = await userAPI.delete(userId);

      if (response.data.success) {
        toast.success('User deleted successfully!');
        await fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.create(formData);

      if (response.data.success) {
        // Show temporary password to admin
        const tempPassword = response.data.data.temporaryPassword;
        const email = formData.email;

        toast.success(
          `User created successfully! Temporary Password has been sent to ${email}`,
          { autoClose: 5000 }
        );

        // Show password dialog
        setPasswordDialog({
          show: true,
          password: tempPassword,
          email: email
        });

        // Refresh user list
        await fetchUsers();
        setShowAddModal(false);

        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'agent',
          phone: '',
          vehicle: ''
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create user';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.update(selectedUser.id, formData);

      if (response.data.success) {
        toast.success('User updated successfully!');
        await fetchUsers();
        setShowEditModal(false);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update user';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      {/* Header Section */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-800'>Agent Management</h1>
          <p className='text-gray-600 mt-1'>Manage sales agents in your system.</p>
        </div>
        <button
          onClick={handleAddUser}
          className='flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
        >
          <span className='text-xl'>+</span>
          <span className='font-medium'>Add Agent</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 gap-4 mb-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm mb-1'>{stat.label}</p>
                  <p className='text-3xl font-bold text-gray-800'>{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Section */}
      <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6'>
        {error && (
          <div className='mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
            {error}
          </div>
        )}
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search Users By Name Or Email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-xl'>
          <UsersIcon className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-600'>No users found</p>
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-6'>
          {filteredUsers.map((user) => (
            <div key={user.id} className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              {/* User Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className={`w-12 h-12 ${user.avatarColor} rounded-full flex items-center justify-center text-white font-bold`}>
                    {user.avatar}
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-800'>{user.name}</h3>
                    <p className='text-sm text-gray-600'>{user.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-gray-300'
                  }`}>
                  {user.role}
                </span>
              </div>

              {/* User Details */}
              <div className='space-y-3 mb-4'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Phone className='w-4 h-4' />
                  <span>{user.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar className='w-4 h-4 text-gray-400' />
                  <span className='text-gray-600'>Joined:</span>
                  <span className='font-medium text-gray-800 ml-auto'>{user.joinedDate}</span>
                </div>
                {user.vehicle && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Truck className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>Vehicle:</span>
                    <span className='font-medium text-gray-800 ml-auto'>{user.vehicle}</span>
                  </div>
                )}
                {user.monthlySales && (
                  <div className='flex items-center gap-2 text-sm'>
                    <TrendingUp className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>Monthly Sales:</span>
                    <span className='font-medium text-green-600 ml-auto'>{user.monthlySales}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditUser(user)}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <Edit className='w-4 h-4' />
                  <span className='text-sm font-medium'>Edit</span>
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className='px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='text-center mt-8 text-sm text-gray-600'>
        Copyright © 2024{' '}
        <span className='text-blue-600 font-medium'>AquaTrack</span> Design by Themesflat All
        rights reserved.
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className='text-gray-500 hover:text-gray-700'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <input type='hidden' name='role' value='agent' />
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                <input
                  type='text'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='+91 98765 43210'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              {formData.role === 'agent' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle (Optional)</label>
                  <input
                    type='text'
                    name='vehicle'
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    placeholder='e.g., GJ-01-AB-1234'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              )}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className='text-gray-500 hover:text-gray-700'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <input type='hidden' name='role' value='agent' />
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                <input
                  type='text'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              {formData.role === 'agent' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle (Optional)</label>
                  <input
                    type='text'
                    name='vehicle'
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              )}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowEditModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, userId: null })}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Password Info Dialog */}
      <InfoDialog
        isOpen={passwordDialog.show}
        onClose={() => setPasswordDialog({ show: false, password: '', email: '' })}
        title="User Created Successfully"
        message={`Temporary Password has been sent to ${passwordDialog.email}\n\nPlease share this password with the user:`}
        copyableText={passwordDialog.password}
      />
    </div>
  );
}
