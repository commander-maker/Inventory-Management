import React, { useState } from 'react';
import { Search, UserPlus, Edit, Trash2, Phone, Calendar, Truck, TrendingUp, X, Users as UsersIcon, UserCheck, UserCog } from 'lucide-react';

export default function UserManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@aquatrack.com',
      role: 'admin',
      phone: '+91 98765 00000',
      joinedDate: '3/15/2024',
      avatar: 'AU',
      avatarColor: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Rajesh Kumar',
      email: 'rajesh@aquatrack.com',
      role: 'agent',
      phone: '+91 98765 43210',
      joinedDate: '3/15/2024',
      vehicle: 'GJ-01-AB-1234',
      monthlySales: 'Rs 125,000',
      avatar: 'RK',
      avatarColor: 'bg-indigo-500'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      email: 'priya@aquatrack.com',
      role: 'agent',
      phone: '+91 98765 43212',
      joinedDate: '5/20/2024',
      vehicle: 'GJ-01-EF-9012',
      monthlySales: 'Rs 98,000',
      avatar: 'PS',
      avatarColor: 'bg-purple-500'
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    phone: '',
    vehicle: ''
  });

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: UsersIcon, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length.toString(), icon: UserCheck, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { label: 'Sales Agent', value: users.filter(u => u.role === 'agent').length.toString(), icon: UserCog, color: 'text-green-600', bgColor: 'bg-green-50' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
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

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    
    const newUser = {
      id: users.length + 1,
      ...formData,
      joinedDate: new Date().toLocaleDateString(),
      avatar: initials,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      monthlySales: formData.role === 'agent' ? 'Rs 0' : undefined
    };
    
    setUsers([...users, newUser]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...formData }
        : u
    ));
    setShowEditModal(false);
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
          <h1 className='text-3xl font-bold text-gray-800'>User Management</h1>
          <p className='text-gray-600 mt-1'>Manage admins and also sales agents in your system.</p>
        </div>
        <button 
          onClick={handleAddUser}
          className='flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
        >
          <span className='text-xl'>+</span>
          <span className='font-medium'>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
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
          <div className='relative'>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className='appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value='all'>All Roles</option>
              <option value='admin'>Admin</option>
              <option value='agent'>Agent</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Cards */}
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
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
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value='agent'>Agent</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
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
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
                <select
                  name='role'
                  value={formData.role}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value='agent'>Agent</option>
                  <option value='admin'>Admin</option>
                </select>
              </div>
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
    </div>
  );
}
