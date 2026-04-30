import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On desktop, sidebar is always visible; sidebarOpen controls collapsed vs expanded
  // On mobile, sidebarOpen controls overlay visibility
  return (
    <div className='flex h-screen overflow-hidden bg-white dark:bg-gray-950 transition-colors duration-200'>
      <Sidebar
        isOpen={sidebarOpen}
        isDesktop={isDesktop}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />
      <div className='flex-1 flex flex-col overflow-auto bg-white dark:bg-gray-950'>
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className='p-3 xs:p-4 md:p-6 flex-1 overflow-auto'>{children}</div>
      </div>
    </div>
  );
}