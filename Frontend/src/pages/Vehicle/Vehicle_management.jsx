import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Truck, Eye, Edit, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { vehicleAPI, userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

export default function VehicleManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ show: false, vehicleId: null });

  const [formData, setFormData] = useState({
    id: '',
    status: 'Active',
    vehicleType: '',
    capacity: '',
    location: '',
    fuelLevel: 100,
    driverId: '',
  });

  // Fetch vehicles and drivers on mount
  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      setVehicles(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await userAPI.getAll();
      // Filter only agent role users
      const agentUsers = response.data.data.filter(user => user.role === 'agent');
      setDrivers(agentUsers);
    } catch (err) {
      console.error('Failed to fetch drivers:', err);
    }
  };

  // Get list of driver IDs already assigned to vehicles
  const getAssignedDriverIds = () => {
    return vehicles
      .filter(v => v.driverId)
      .map(v => v.driverId);
  };

  // Get available drivers for assignment (unassigned + current vehicle's driver)
  const getAvailableDrivers = (currentVehicleId = null) => {
    const assignedIds = getAssignedDriverIds();
    return drivers.map(driver => {
      const assignedVehicle = vehicles.find(v => v.driverId === driver.id);
      const isAssignedToOther = assignedVehicle && assignedVehicle.id !== currentVehicleId;
      return {
        ...driver,
        isAssigned: isAssignedToOther,
        assignedVehicleId: assignedVehicle?.id || null
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-black text-white';
      case 'Loading': return 'bg-white text-black border border-gray-300';
      case 'Maintenance': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getFuelColor = (fuelLevel) => {
    if (fuelLevel > 50) return 'bg-green-500';
    if (fuelLevel > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
      vehicleType: '',
      capacity: '',
      location: '',
      fuelLevel: 100,
      driverId: '',
    });
    setShowAddModal(true);
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      id: vehicle.id,
      status: vehicle.status,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      location: vehicle.location,
      fuelLevel: vehicle.fuelLevel,
      driverId: vehicle.driverId || '',
    });
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await vehicleAPI.create(formData);
      await fetchVehicles();
      setShowAddModal(false);
      setError('');
      toast.success('Vehicle added successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create vehicle';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { id, ...updateData } = formData;
      await vehicleAPI.update(selectedVehicle.id, updateData);
      await fetchVehicles();
      setShowEditModal(false);
      setError('');
      toast.success('Vehicle updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update vehicle';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    setDeleteDialog({ show: true, vehicleId });
  };

  const confirmDeleteVehicle = async () => {
    const vehicleId = deleteDialog.vehicleId;
    setDeleteDialog({ show: false, vehicleId: null });

    try {
      setLoading(true);
      await vehicleAPI.delete(vehicleId);
      await fetchVehicles();
      setError('');
      toast.success('Vehicle deleted successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete vehicle';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
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

      {/* Error Message */}
      {error && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg'>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && vehicles.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-600'>Loading vehicles...</p>
        </div>
      )}

      {/* Vehicle Cards */}
      {!loading && vehicles.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600'>No vehicles found. Add a vehicle to get started.</p>
        </div>
      ) : (
        <div className='grid grid-cols-3 gap-6'>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
              {/* Vehicle Header */}
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h3 className='text-lg font-bold text-gray-800'>{vehicle.id}</h3>
                  <p className='text-gray-600 text-sm'>{vehicle.vehicleType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(vehicle.status)}`}>
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
                    className={`h-2 rounded-full ${getFuelColor(vehicle.fuelLevel)}`}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Driver Info */}
              <div className='border-t border-gray-100 pt-4 mb-4'>
                <p className='text-sm font-semibold text-gray-800 mb-1'>
                  Driver: {vehicle.driver ? vehicle.driver.name : 'Not Assigned'}
                </p>
                {vehicle.driver && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Phone className='w-4 h-4' />
                    <span>{vehicle.driver.phone}</span>
                  </div>
                )}
              </div>

              {/* Current Load (if exists) */}
              {vehicle.loads && vehicle.loads.length > 0 && (
                <div className='border-t border-gray-100 pt-4 mb-4'>
                  <p className='text-sm font-semibold text-gray-800 mb-2'>Current load:</p>
                  {vehicle.loads.map((load) => (
                    <div key={load.id} className='flex justify-between text-sm text-gray-600 mb-1'>
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
      )}

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
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg'>
                  {error}
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Registration Number (Vehicle ID)</label>
                <input
                  type='text'
                  name='id'
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder='e.g., GJ-01-AB-1234'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Vehicle Type</label>
                <input
                  type='text'
                  name='vehicleType'
                  value={formData.vehicleType}
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
                <label className='block text-sm font-medium text-gray-700 mb-1'>Assign Driver (Agent)</label>
                <select
                  name='driverId'
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>No Driver Assigned</option>
                  {getAvailableDrivers().map((driver) => (
                    <option
                      key={driver.id}
                      value={driver.id}
                      disabled={driver.isAssigned}
                    >
                      {driver.name} - {driver.phone}{driver.isAssigned ? ` (Assigned to ${driver.assignedVehicleId})` : ''}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-500 mt-1'>Each agent can only be assigned to one vehicle</p>
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
                  disabled={loading}
                  className='flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50'
                >
                  {loading ? 'Adding...' : 'Add Vehicle'}
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
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg'>
                  {error}
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Registration Number (Vehicle ID)</label>
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
                  name='vehicleType'
                  value={formData.vehicleType}
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
                <label className='block text-sm font-medium text-gray-700 mb-1'>Assign Driver (Agent)</label>
                <select
                  name='driverId'
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>No Driver Assigned</option>
                  {getAvailableDrivers(selectedVehicle?.id).map((driver) => (
                    <option
                      key={driver.id}
                      value={driver.id}
                      disabled={driver.isAssigned}
                    >
                      {driver.name} - {driver.phone}{driver.isAssigned ? ` (Assigned to ${driver.assignedVehicleId})` : ''}
                    </option>
                  ))}
                </select>
                <p className='text-xs text-gray-500 mt-1'>Each agent can only be assigned to one vehicle</p>
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
                  type='button'
                  onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                >
                  Delete
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50'
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, vehicleId: null })}
        onConfirm={confirmDeleteVehicle}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
