import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-auto'>
        <Navbar />
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}