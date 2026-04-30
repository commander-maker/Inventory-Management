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
    <div className='p-3 xs:p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen'>
      {/* Header Section */}
      <div className='mb-4 md:mb-6 flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-0'>
        <div>
          <h1 className='text-xl xs:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>Agent Management</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base'>Manage sales agents in your system.</p>
        </div>
        <button
          onClick={handleAddUser}
          className='flex items-center gap-2 px-3 xs:px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors text-sm md:text-base self-start xs:self-auto'
        >
          <span className='text-lg md:text-xl'>+</span>
          <span className='font-medium'>Add Agent</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 gap-2 xs:gap-3 md:gap-4 mb-4 md:mb-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className='bg-white dark:bg-gray-900 rounded-xl p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1'>{stat.label}</p>
                  <p className='text-xl xs:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} dark:bg-opacity-20 p-2 xs:p-3 rounded-lg`}>
                  <Icon className={`w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter Section */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-4 md:mb-6'>
        {error && (
          <div className='mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg'>
            {error}
          </div>
        )}
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
            <input
              type='text'
              placeholder='Search Users By Name Or Email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

        </div>
      </div>

      {/* User Cards */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className='text-center py-12 bg-white dark:bg-gray-900 rounded-xl'>
          <UsersIcon className='w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4' />
          <p className='text-gray-600 dark:text-gray-400'>No users found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 md:gap-6'>
          {filteredUsers.map((user) => (
            <div key={user.id} className='bg-white dark:bg-gray-900 rounded-xl p-4 xs:p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
              {/* User Header */}
              <div className='flex items-start justify-between mb-3 md:mb-4'>
                <div className='flex items-center gap-2 xs:gap-3 min-w-0'>
                  <div className={`w-10 h-10 xs:w-11 xs:h-11 md:w-12 md:h-12 ${user.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-sm xs:text-base flex-shrink-0`}>
                    {user.avatar}
                  </div>
                  <div className='min-w-0'>
                    <h3 className='font-bold text-gray-800 dark:text-white text-sm xs:text-base truncate'>{user.name}</h3>
                    <p className='text-xs xs:text-sm text-gray-600 dark:text-gray-400 truncate'>{user.email}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                  ? 'bg-black dark:bg-gray-800 text-white'
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700'
                  }`}>
                  {user.role}
                </span>
              </div>

              {/* User Details */}
              <div className='space-y-2 xs:space-y-3 mb-3 md:mb-4'>
                <div className='flex items-center gap-2 text-xs xs:text-sm text-gray-600 dark:text-gray-400'>
                  <Phone className='w-3.5 h-3.5 xs:w-4 xs:h-4 flex-shrink-0' />
                  <span className='truncate'>{user.phone}</span>
                </div>
                <div className='flex items-center gap-2 text-xs xs:text-sm'>
                  <Calendar className='w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                  <span className='text-gray-600 dark:text-gray-400'>Joined:</span>
                  <span className='font-medium text-gray-800 dark:text-white ml-auto'>{user.joinedDate}</span>
                </div>
                {user.vehicle && (
                  <div className='flex items-center gap-2 text-xs xs:text-sm'>
                    <Truck className='w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                    <span className='text-gray-600 dark:text-gray-400'>Vehicle:</span>
                    <span className='font-medium text-gray-800 dark:text-white ml-auto'>{user.vehicle}</span>
                  </div>
                )}
                {user.monthlySales && (
                  <div className='flex items-center gap-2 text-xs xs:text-sm'>
                    <TrendingUp className='w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                    <span className='text-gray-600 dark:text-gray-400'>Monthly Sales:</span>
                    <span className='font-medium text-green-600 dark:text-green-400 ml-auto'>{user.monthlySales}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEditUser(user)}
                  className='flex-1 flex items-center justify-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 border border-gray-300 dark:border-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  <Edit className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                  <span className='text-xs xs:text-sm font-medium'>Edit</span>
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className='px-3 xs:px-4 py-1.5 xs:py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors'
                  >
                    <Trash2 className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='text-center mt-6 md:mt-8 text-xs xs:text-sm text-gray-600 dark:text-gray-400'>
        Copyright © 2024{' '}
        <span className='text-blue-600 dark:text-blue-400 font-medium'>AquaTrack</span> Design by Themesflat All
        rights reserved.
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-4 xs:p-5 md:p-6 w-full max-w-md mx-3 xs:mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl xs:text-2xl font-bold text-gray-800 dark:text-white'>Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <input type='hidden' name='role' value='agent' />
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Phone Number</label>
                <input
                  type='text'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='+91 98765 43210'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              {formData.role === 'agent' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Vehicle (Optional)</label>
                  <input
                    type='text'
                    name='vehicle'
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    placeholder='e.g., GJ-01-AB-1234'
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              )}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors'
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
        <div className='fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-4 xs:p-5 md:p-6 w-full max-w-md mx-3 xs:mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl xs:text-2xl font-bold text-gray-800 dark:text-white'>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Full Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <input type='hidden' name='role' value='agent' />
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Phone Number</label>
                <input
                  type='text'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              {formData.role === 'agent' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Vehicle (Optional)</label>
                  <input
                    type='text'
                    name='vehicle'
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              )}
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowEditModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors'
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
