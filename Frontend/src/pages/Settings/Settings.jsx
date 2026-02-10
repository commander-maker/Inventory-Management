import React, { useState } from 'react';
import {
    User,
    Bell,
    Shield,
    Database,
    Key,
    Building2,
    Palette,
    Globe,
    Save,
    Lock,
    Mail,
    Phone,
    Camera,
    Check,
    AlertCircle,
    Download,
    Upload,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [formData, setFormData] = useState({
        // Profile
        name: 'Admin User',
        email: 'admin@inventory.com',
        phone: '+94 77 123 4567',
        role: 'Admin',

        // Business
        companyName: 'ABC Distribution',
        companyEmail: 'contact@abc.com',
        companyPhone: '+94 11 234 5678',
        address: '123, Main Street, Colombo',
        taxId: 'TAX123456',
        currency: 'LKR',

        // Security
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,

        // Preferences
        theme: 'light',
        language: 'en',
        notifications: {
            email: true,
            lowStock: true,
            newOrders: true,
            agentUpdates: false
        },

        // Database
        autoBackup: true,
        backupFrequency: 'daily'
    });

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'business', label: 'Business', icon: Building2 },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'database', label: 'Database', icon: Database },
        { id: 'api', label: 'API Keys', icon: Key }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNotificationChange = (key) => {
        setFormData(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        }, 1500);
    };

    const handleBackup = () => {
        alert('Database backup initiated...');
    };

    const handleRestore = () => {
        alert('Select backup file to restore...');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
                </div>
            </div>

            <div className="px-8 py-6">
                <div className="grid grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-32">
                            <div className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon size={20} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
                                        <p className="text-gray-600">Update your personal information</p>
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="flex items-center gap-6 pb-6 border-b">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                                {formData.name.charAt(0)}
                                            </div>
                                            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-blue-500 hover:bg-blue-50 transition">
                                                <Camera size={16} className="text-blue-600" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                                            <p className="text-gray-600">{formData.role}</p>
                                            <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                                                Change Photo
                                            </button>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.role}
                                                disabled
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Business Tab */}
                            {activeTab === 'business' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Settings</h2>
                                        <p className="text-gray-600">Manage your company information</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Company Email
                                            </label>
                                            <input
                                                type="email"
                                                name="companyEmail"
                                                value={formData.companyEmail}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Company Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="companyPhone"
                                                value={formData.companyPhone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Tax ID
                                            </label>
                                            <input
                                                type="text"
                                                name="taxId"
                                                value={formData.taxId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Currency
                                            </label>
                                            <select
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            >
                                                <option value="LKR">LKR - Sri Lankan Rupee</option>
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="INR">INR - Indian Rupee</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
                                        <p className="text-gray-600">Customize your experience</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Theme Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Theme
                                            </label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['light', 'dark', 'auto'].map((theme) => (
                                                    <button
                                                        key={theme}
                                                        onClick={() => setFormData(prev => ({ ...prev, theme }))}
                                                        className={`p-4 border-2 rounded-lg transition-all ${formData.theme === theme
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                    >
                                                        <Palette className={`mx-auto mb-2 ${formData.theme === theme ? 'text-blue-600' : 'text-gray-600'}`} size={24} />
                                                        <p className="text-sm font-medium capitalize text-gray-900">{theme}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <select
                                                name="language"
                                                value={formData.language}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            >
                                                <option value="en">English</option>
                                                <option value="si">Sinhala</option>
                                                <option value="ta">Tamil</option>
                                            </select>
                                        </div>

                                        {/* Notifications */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Notifications
                                            </label>
                                            <div className="space-y-3">
                                                {Object.entries(formData.notifications).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                        <div>
                                                            <p className="font-medium text-gray-900 capitalize">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Receive notifications about {key.toLowerCase()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleNotificationChange(key)}
                                                            className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-gray-300'
                                                                }`}
                                                        >
                                                            <span
                                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''
                                                                    }`}
                                                            />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h2>
                                        <p className="text-gray-600">Manage your account security</p>
                                    </div>

                                    {/* Change Password */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>

                                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                                            Update Password
                                        </button>
                                    </div>

                                    {/* Two-Factor Authentication */}
                                    <div className="pt-6 border-t">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">Two-Factor Authentication</h3>
                                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                                            </div>
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.twoFactorEnabled ? 'translate-x-6' : ''
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Database Tab */}
                            {activeTab === 'database' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Management</h2>
                                        <p className="text-gray-600">Backup and restore your data</p>
                                    </div>

                                    {/* Auto Backup */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">Automatic Backups</h3>
                                            <p className="text-sm text-gray-600">Enable automatic database backups</p>
                                        </div>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.autoBackup ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.autoBackup ? 'translate-x-6' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Backup Frequency */}
                                    {formData.autoBackup && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Backup Frequency
                                            </label>
                                            <select
                                                name="backupFrequency"
                                                value={formData.backupFrequency}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            >
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Backup Actions */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={handleBackup}
                                            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md hover:shadow-lg"
                                        >
                                            <Download size={20} />
                                            <span className="font-medium">Backup Now</span>
                                        </button>

                                        <button
                                            onClick={handleRestore}
                                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                        >
                                            <Upload size={20} />
                                            <span className="font-medium">Restore Backup</span>
                                        </button>
                                    </div>

                                    {/* Database Info */}
                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                                        <h3 className="font-semibold text-gray-900 mb-4">Database Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Last Backup</p>
                                                <p className="font-medium text-gray-900">2 hours ago</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Database Size</p>
                                                <p className="font-medium text-gray-900">45.2 MB</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Records</p>
                                                <p className="font-medium text-gray-900">1,247</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <p className="font-medium text-green-600 flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                    Healthy
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* API Tab */}
                            {activeTab === 'api' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Keys</h2>
                                        <p className="text-gray-600">Manage your API keys and integrations</p>
                                    </div>

                                    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-yellow-900">Important</h3>
                                            <p className="text-sm text-yellow-800">Keep your API keys secure. Never share them in publicly accessible areas.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">Production API Key</h3>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded font-mono text-sm">
                                                    sk_prod_••••••••••••••••••••1234
                                                </code>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Created on Jan 15, 2026</p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold text-gray-900">Development API Key</h3>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Active</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded font-mono text-sm">
                                                    sk_dev_••••••••••••••••••••5678
                                                </code>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                                    Copy
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Created on Jan 10, 2026</p>
                                        </div>
                                    </div>

                                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md">
                                        <Key size={18} />
                                        <span className="font-medium">Generate New API Key</span>
                                    </button>
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="pt-6 border-t mt-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {saveStatus === 'success' && (
                                            <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                                                <Check size={20} />
                                                <span className="font-medium">Changes saved successfully!</span>
                                            </div>
                                        )}
                                        {saveStatus === 'saving' && (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <RefreshCw size={20} className="animate-spin" />
                                                <span className="font-medium">Saving...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saveStatus === 'saving'}
                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save size={18} />
                                            <span className="font-medium">Save Changes</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
