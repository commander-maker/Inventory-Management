import React, { useState } from 'react';
import { MapPin, Phone, Truck, Eye, Edit, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';

export default function VehicleManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([
    {
      id: 'GJ-01-AB-1234',
      status: 'Active',
      statusColor: 'bg-black text-white',
      vehicle: 'Tata Ace',
      capacity: '1 Ton',
      location: 'Route A - Ahmedabad east',
      fuelLevel: 85,
      fuelColor: 'bg-green-500',
      driver: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      currentLoad: [
        { item: 'Water 500ml', quantity: '25 cases' },
        { item: 'Pepsi 300ml', quantity: '15 cases' },
      ],
    },
    {
      id: 'GJ-01-AB-1234',
      status: 'Loading',
      statusColor: 'bg-white text-black border border-gray-300',
      vehicle: 'Tata Ace',
      capacity: '1.5 Ton',
      location: 'Main Warehouse',
      fuelLevel: 92,
      fuelColor: 'bg-green-500',
      driver: 'Amit Singh',
      phone: '+91 98765 43211',
    },
    {
      id: 'GJ-01-AB-1234',
      status: 'Maintenance',
      statusColor: 'bg-red-500 text-white',
      vehicle: 'Tata Ace',
      capacity: '1.2 Ton',
      location: 'Service Center',
      fuelLevel: 15,
      fuelColor: 'bg-red-500',
      driver: 'Priya Sharma',
      phone: '+91 98765 43212',
    },
  ]);

  const [formData, setFormData] = useState({
    id: '',
    status: 'Active',
    vehicle: '',
    capacity: '',
    location: '',
    fuelLevel: 100,
    driver: '',
    phone: '',
  });

  const stats = [
    { label: 'Total Vehicles', value: vehicles.length.toString(), icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Active', value: vehicles.filter(v => v.status === 'Active').length.toString(), icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Loading', value: vehicles.filter(v => v.status === 'Loading').length.toString(), icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Maintenance', value: vehicles.filter(v => v.status === 'Maintenance').length.toString(), icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const handleAddVehicle = () => {
    setFormData({
      id: '',
      status: 'Active',
      vehicle: '',
      capacity: '',
      location: '',
      fuelLevel: 100,
      driver: '',
      phone: '',
    });
    setShowAddModal(true);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData(vehicle);
    setShowEditModal(true);
  };

  const handleSubmitAdd = (e) => {
    e.preventDefault();
    const statusColor = 
      formData.status === 'Active' ? 'bg-black text-white' :
      formData.status === 'Loading' ? 'bg-white text-black border border-gray-300' :
      'bg-red-500 text-white';
    
    const fuelColor = 
      formData.fuelLevel > 50 ? 'bg-green-500' :
      formData.fuelLevel > 20 ? 'bg-yellow-500' :
      'bg-red-500';

    setVehicles([...vehicles, { ...formData, statusColor, fuelColor }]);
    setShowAddModal(false);
  };

  const handleSubmitEdit = (e) => {
    e.preventDefault();
    const statusColor = 
      formData.status === 'Active' ? 'bg-black text-white' :
      formData.status === 'Loading' ? 'bg-white text-black border border-gray-300' :
      'bg-red-500 text-white';
    
    const fuelColor = 
      formData.fuelLevel > 50 ? 'bg-green-500' :
      formData.fuelLevel > 20 ? 'bg-yellow-500' :
      'bg-red-500';

    setVehicles(vehicles.map(v => 
      v.id === selectedVehicle.id ? { ...formData, statusColor, fuelColor } : v
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
          <h1 className='text-3xl font-bold text-gray-800'>Vehicle Management</h1>
          <p className='text-gray-600 mt-1'>Manage your delivery fleet and track vehicle status.</p>
        </div>
        <div className='flex gap-3'>
          <button 
            onClick={handleAddVehicle}
            className='flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
          >
            <span className='text-xl'>+</span>
            <span className='font-medium'>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
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

      {/* Vehicle Cards */}
      <div className='grid grid-cols-3 gap-6'>
        {vehicles.map((vehicle, index) => (
          <div key={index} className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
            {/* Vehicle Header */}
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h3 className='text-lg font-bold text-gray-800'>{vehicle.id}</h3>
                <p className='text-gray-600 text-sm'>{vehicle.vehicle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${vehicle.statusColor}`}>
                {vehicle.status === 'Active' && <CheckCircle className='w-3 h-3' />}
                {vehicle.status === 'Loading' && <Clock className='w-3 h-3' />}
                {vehicle.status === 'Maintenance' && <AlertCircle className='w-3 h-3' />}
                {vehicle.status}
              </span>
            </div>

            {/* Vehicle Details */}
            <div className='space-y-3 mb-4'>
              <div className='flex items-center gap-2 text-sm'>
                <Truck className='w-4 h-4 text-gray-400' />
                <span className='text-gray-600'>Capacity:</span>
                <span className='font-medium text-gray-800 ml-auto'>{vehicle.capacity}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <MapPin className='w-4 h-4 text-gray-400' />
                <span className='text-gray-600'>Location:</span>
                <span className='font-medium text-gray-800 ml-auto'>{vehicle.location}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-gray-600'>Fuel Level:</span>
                <span className='font-medium text-gray-800 ml-auto'>{vehicle.fuelLevel}%</span>
              </div>
              {/* Fuel Level Progress Bar */}
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className={`h-2 rounded-full ${vehicle.fuelColor}`}
                  style={{ width: `${vehicle.fuelLevel}%` }}
                ></div>
              </div>
            </div>

            {/* Driver Info */}
            <div className='border-t border-gray-100 pt-4 mb-4'>
              <p className='text-sm font-semibold text-gray-800 mb-1'>Driver: {vehicle.driver}</p>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Phone className='w-4 h-4' />
                <span>{vehicle.phone}</span>
              </div>
            </div>

            {/* Current Load (if exists) */}
            {vehicle.currentLoad && (
              <div className='border-t border-gray-100 pt-4 mb-4'>
                <p className='text-sm font-semibold text-gray-800 mb-2'>Current load:</p>
                {vehicle.currentLoad.map((load, idx) => (
                  <div key={idx} className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>{load.item}</span>
                    <span className='font-medium text-gray-800'>{load.quantity}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className='flex gap-2'>
              <button 
                onClick={() => handleViewDetails(vehicle)}
                className='flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Eye className='w-4 h-4' />
                <span className='text-sm font-medium'>Details</span>
              </button>
              <button 
                onClick={() => handleEditVehicle(vehicle)}
                className='flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Edit className='w-4 h-4' />
                <span className='text-sm font-medium'>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>Add New Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className='text-gray-500 hover:text-gray-700'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle ID</label>
                <input
                  type='text'
                  name='id'
                  value={formData.id}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Type</label>
                <input
                  type='text'
                  name='vehicle'
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  placeholder='e.g., Tata Ace'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Capacity</label>
                <input
                  type='text'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder='e.g., 1 Ton'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value='Active'>Active</option>
                  <option value='Loading'>Loading</option>
                  <option value='Maintenance'>Maintenance</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder='e.g., Main Warehouse'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Fuel Level (%)</label>
                <input
                  type='number'
                  name='fuelLevel'
                  value={formData.fuelLevel}
                  onChange={handleInputChange}
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Driver Name</label>
                <input
                  type='text'
                  name='driver'
                  value={formData.driver}
                  onChange={handleInputChange}
                  placeholder='e.g., Rajesh Kumar'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
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
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>Vehicle Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className='text-gray-500 hover:text-gray-700'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Vehicle ID:</span>
                <span className='text-gray-800'>{selectedVehicle.id}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Vehicle Type:</span>
                <span className='text-gray-800'>{selectedVehicle.vehicle}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedVehicle.statusColor}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Capacity:</span>
                <span className='text-gray-800'>{selectedVehicle.capacity}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Location:</span>
                <span className='text-gray-800'>{selectedVehicle.location}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Fuel Level:</span>
                <span className='text-gray-800'>{selectedVehicle.fuelLevel}%</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Driver:</span>
                <span className='text-gray-800'>{selectedVehicle.driver}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100'>
                <span className='text-gray-600 font-medium'>Phone:</span>
                <span className='text-gray-800'>{selectedVehicle.phone}</span>
              </div>
              {selectedVehicle.currentLoad && (
                <div className='pt-2'>
                  <span className='text-gray-600 font-medium block mb-2'>Current Load:</span>
                  {selectedVehicle.currentLoad.map((load, idx) => (
                    <div key={idx} className='flex justify-between text-sm py-1'>
                      <span className='text-gray-600'>{load.item}</span>
                      <span className='text-gray-800'>{load.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className='w-full mt-6 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800'>Edit Vehicle</h2>
              <button onClick={() => setShowEditModal(false)} className='text-gray-500 hover:text-gray-700'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle ID</label>
                <input
                  type='text'
                  name='id'
                  value={formData.id}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100'
                  disabled
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Type</label>
                <input
                  type='text'
                  name='vehicle'
                  value={formData.vehicle}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Capacity</label>
                <input
                  type='text'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value='Active'>Active</option>
                  <option value='Loading'>Loading</option>
                  <option value='Maintenance'>Maintenance</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Location</label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Fuel Level (%)</label>
                <input
                  type='number'
                  name='fuelLevel'
                  value={formData.fuelLevel}
                  onChange={handleInputChange}
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Driver Name</label>
                <input
                  type='text'
                  name='driver'
                  value={formData.driver}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
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

      {/* Footer */}
      <div className='text-center mt-8 text-sm text-gray-600'>
        Copyright © 2024{' '}
        <span className='text-blue-600 font-medium'>AquaTrack</span> Design by Themesflat All
        rights reserved.
      </div>
    </div>
  );
}
