import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, Maximize, Grid3x3, User, X, Check, Trash2, Clock, Moon, Sun, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification removed');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get role display name
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'agent':
        return 'Sales Agent';
      default:
        return role?.charAt(0).toUpperCase() + role?.slice(1) || 'User';
    }
  };

  // Get avatar color based on role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-orange-400';
      case 'agent':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "just now";
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'danger': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <nav className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 xs:px-4 md:px-6 py-3 flex items-center justify-between w-full sticky top-0 z-30 transition-colors duration-200'>
      {/* Mobile menu button + Search Bar */}
      <div className='flex items-center gap-2 flex-1'>
        <button
          onClick={onMenuToggle}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 md:hidden'
        >
          <Menu className='w-5 h-5 text-gray-700 dark:text-gray-400' />
        </button>
        <div className='flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg flex-1 max-w-md transition-colors duration-200'>
          <Search className='w-5 h-5 text-gray-400 dark:text-gray-500' />
          <input
            type='text'
            placeholder='Search'
            className='bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300 w-full placeholder-gray-400 dark:placeholder-gray-500'
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className='flex items-center gap-4'>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200'
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className='w-5 h-5 text-yellow-500' />
          ) : (
            <Moon className='w-5 h-5 text-gray-600' />
          )}
        </button>

        {/* Notification Icon with Badge */}
        <div className='relative' ref={dropdownRef}>
          <div
            className='relative cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200'
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Bell className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            {unreadCount > 0 && (
              <span className='absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 border-2 border-white dark:border-gray-900'>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in duration-200'>
              <div className='p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200'>
                <h3 className='font-bold text-gray-800 dark:text-white flex items-center gap-2'>
                  Notifications
                  {unreadCount > 0 && (
                    <span className='text-[10px] bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold'>
                      New
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className='text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium'
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className='max-h-[400px] overflow-y-auto'>
                {notifications.length === 0 ? (
                  <div className='p-8 text-center text-gray-400 dark:text-gray-500'>
                    <Bell className='w-12 h-12 mx-auto mb-2 opacity-20' />
                    <p className='text-sm'>No notifications yet</p>
                  </div>
                ) : (
                  <div className='divide-y divide-gray-50 dark:divide-gray-700'>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors relative group ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className='flex gap-3'>
                          <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />
                          <div className='flex-1'>
                            <p className={`text-sm mb-1 ${!notif.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notif.title}
                            </p>
                            <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2'>
                              {notif.message}
                            </p>
                            <div className='flex items-center justify-between'>
                              <span className='text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1'>
                                <Clock className='w-3 h-3' />
                                {getTimeAgo(notif.createdAt)}
                              </span>
                              <button
                                onClick={(e) => deleteNotification(notif.id, e)}
                                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 rounded transition-all'
                              >
                                <Trash2 className='w-3.5 h-3.5' />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className='p-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200'>
                  <button className='text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium'>
                    View all history
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Fullscreen Icon */}
        <Maximize className='w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 box-content transition-colors duration-200' />

        {/* Grid Icon */}
        <Grid3x3 className='w-5 h-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1 box-content transition-colors duration-200' />

        {/* User Profile - Dynamic */}
        <div className='flex items-center gap-2 cursor-pointer pl-2 ml-2 border-l border-gray-200 dark:border-gray-700'>
          <div className={`w-9 h-9 rounded-full ${getAvatarColor(user?.role)} flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-900 shadow-sm`}>
            <span className='text-white font-bold text-sm'>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className='text-sm hidden md:block'>
            <div className='font-bold text-gray-800 dark:text-white leading-none mb-1'>{user?.name || 'User'}</div>
            <div className='text-gray-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider'>{getRoleDisplayName(user?.role)}</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
