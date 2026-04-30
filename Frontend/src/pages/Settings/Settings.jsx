import React, { useState, useEffect } from 'react';
import {
    User,
    Shield,
    Save,
    Lock,
    Mail,
    Phone,
    Check,
    Eye,
    EyeOff,
    Loader,
    AlertCircle
} from 'lucide-react';
import { userAPI } from '../../utils/api';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        // Profile
        name: '',
        email: '',
        phone: '',
        role: '',

        // Security
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Load user data on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || ''
            }));
        }
    }, []);

    const tabs = [
        { id: 'profile', label: 'Agent Details', icon: User },
        { id: 'security', label: 'Password', icon: Shield }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            setSaveStatus('saving');
            const user = JSON.parse(localStorage.getItem('user'));
            
            const response = await userAPI.update(user.id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            if (response.data.success) {
                // Update localStorage
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                }));
                
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setError(response.data.message || 'Failed to update profile');
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 3000);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            setError(error.response?.data?.message || 'Error saving profile');
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!formData.currentPassword) {
            setError('Please enter current password');
            return;
        }

        try {
            setLoading(true);
            setSaveStatus('saving');
            
            const response = await userAPI.updatePassword({
                oldPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setSaveStatus('success');
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
                setError(null);
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setError(response.data.message || 'Failed to change password');
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(null), 3000);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setError(error.response?.data?.message || 'Error changing password');
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm sticky top-0 z-10">
                <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
                    <h1 className="text-xl xs:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">Manage your account details and password</p>
                </div>
            </div>

            <div className="px-4 xs:px-5 md:px-8 py-4 xs:py-5 md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 xs:p-4 md:sticky md:top-32">
                            <div className="flex md:flex-col gap-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 md:flex-none w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <Icon size={18} className="md:w-5 md:h-5" />
                                            <span className="font-medium text-sm md:text-base">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 xs:p-5 md:p-8">

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-red-900 dark:text-red-300">Error</p>
                                        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl xs:text-2xl font-bold text-gray-900 dark:text-white mb-2">Agent Details</h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Update your personal information</p>
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="flex items-center gap-4 md:gap-6 pb-4 md:pb-6 border-b dark:border-gray-800">
                                        <div className="relative">
                                            <div className="w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl xs:text-2xl md:text-3xl font-bold shadow-lg">
                                                {formData.name.charAt(0).toUpperCase() || 'A'}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-base xs:text-lg font-semibold text-gray-900 dark:text-white">{formData.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 capitalize text-sm md:text-base">{formData.role}</p>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.role}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed capitalize"
                                            />
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-4 md:pt-6 border-t dark:border-gray-800 mt-6 md:mt-8">
                                        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
                                            <div className="flex items-center gap-2">
                                                {saveStatus === 'success' && (
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                        <Check size={20} />
                                                        <span className="font-medium">Changes saved successfully!</span>
                                                    </div>
                                                )}
                                                {saveStatus === 'saving' && (
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                        <Loader size={20} className="animate-spin" />
                                                        <span className="font-medium">Saving...</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={loading}
                                                className="flex items-center gap-2 px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full xs:w-auto justify-center xs:justify-start"
                                            >
                                                <Save size={18} />
                                                <span className="font-medium">Save Changes</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl xs:text-2xl font-bold text-gray-900 dark:text-white mb-2">Change Password</h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Update your password to keep your account secure</p>
                                    </div>

                                    {/* Change Password Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Enter your current password"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 6 characters</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    autoComplete="off"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                    placeholder="Confirm new password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Password Button */}
                                    <div className="pt-4 md:pt-6 border-t dark:border-gray-800 mt-6 md:mt-8">
                                        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
                                            <div className="flex items-center gap-2">
                                                {saveStatus === 'success' && (
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                        <Check size={20} />
                                                        <span className="font-medium">Password changed successfully!</span>
                                                    </div>
                                                )}
                                                {saveStatus === 'saving' && (
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                        <Loader size={20} className="animate-spin" />
                                                        <span className="font-medium">Updating...</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={handleChangePassword}
                                                disabled={loading}
                                                className="flex items-center gap-2 px-4 xs:px-6 py-2.5 xs:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base w-full xs:w-auto justify-center xs:justify-start"
                                            >
                                                <Lock size={18} />
                                                <span className="font-medium">Change Password</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
