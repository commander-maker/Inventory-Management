import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Truck, Eye, Edit, Clock, CheckCircle, AlertCircle, X, Package, Plus, Trash2 } from 'lucide-react';
import { vehicleAPI, userAPI, inventoryAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

export default function VehicleManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ show: false, vehicleId: null });
  const [deleteLoadDialog, setDeleteLoadDialog] = useState({ show: false, loadId: null });

  const [formData, setFormData] = useState({
    id: '',
    status: 'Active',
    vehicleType: '',
    capacity: '',
    location: '',
    fuelLevel: 100,
    driverId: '',
  });

  const [loadFormData, setLoadFormData] = useState({
    inventoryId: '',
    quantity: ''
  });

  // Fetch vehicles and drivers on mount
  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchInventory();
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

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
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

  const handleLoadInputChange = (e) => {
    const { name, value } = e.target;
    setLoadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManageLoad = (vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadFormData({ inventoryId: '', quantity: '' });
    setShowLoadModal(true);
  };

  const handleAddLoad = async (e) => {
    e.preventDefault();
    if (!loadFormData.inventoryId || !loadFormData.quantity) {
      toast.error('Please select an item and enter quantity');
      return;
    }

    try {
      setLoading(true);
      const selectedItem = inventory.find(item => item.id === parseInt(loadFormData.inventoryId));
      
      await vehicleAPI.addLoad(selectedVehicle.id, {
        item: selectedItem.name,
        quantity: `${loadFormData.quantity} ${selectedItem.unit}`
      });

      await fetchVehicles();
      setLoadFormData({ inventoryId: '', quantity: '' });
      toast.success('Load added successfully!');
      
      // Update selected vehicle data
      const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id);
      setSelectedVehicle(updatedVehicle);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add load';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLoad = async (loadId) => {
    setDeleteLoadDialog({ show: true, loadId });
  };

  const confirmRemoveLoad = async () => {
    const loadId = deleteLoadDialog.loadId;
    setDeleteLoadDialog({ show: false, loadId: null });

    try {
      setLoading(true);
      await vehicleAPI.removeLoad(selectedVehicle.id, loadId);
      await fetchVehicles();
      toast.success('Load removed successfully!');
      
      // Update selected vehicle data
      const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id);
      setSelectedVehicle(updatedVehicle);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove load';
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-3 xs:p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen'>
      {/* Header Section */}
      <div className='mb-4 xs:mb-5 md:mb-6 flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4'>
        <div>
          <h1 className='text-xl xs:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>Vehicle Management</h1>
          <p className='text-xs xs:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1'>Manage your delivery fleet and track vehicle status.</p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={handleAddVehicle}
            className='flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors text-sm xs:text-base'
          >
            <span className='text-lg xs:text-xl'>+</span>
            <span className='font-medium'>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 mb-4 xs:mb-5 md:mb-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className='bg-white dark:bg-gray-900 rounded-xl p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 dark:text-gray-400 text-xs xs:text-sm mb-1'>{stat.label}</p>
                  <p className='text-lg xs:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white'>{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} dark:bg-opacity-20 p-2 xs:p-3 rounded-lg`}>
                  <Icon className={`w-5 h-5 xs:w-6 xs:h-6 md:w-8 md:h-8 ${stat.color}`} />
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
          <p className='text-gray-600 dark:text-gray-400'>Loading vehicles...</p>
        </div>
      )}

      {/* Vehicle Cards */}
      {!loading && vehicles.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-600 dark:text-gray-400'>No vehicles found. Add a vehicle to get started.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 md:gap-6'>
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className='bg-white dark:bg-gray-900 rounded-xl p-3 xs:p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
              {/* Vehicle Header */}
              <div className='flex items-start justify-between mb-3 xs:mb-4 gap-2'>
                <div className='min-w-0'>
                  <h3 className='text-base xs:text-lg font-bold text-gray-800 dark:text-white truncate'>{vehicle.id}</h3>
                  <p className='text-gray-600 dark:text-gray-400 text-xs xs:text-sm'>{vehicle.vehicleType}</p>
                </div>
                <span className={`px-2 xs:px-3 py-1 rounded-full text-[10px] xs:text-xs font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status === 'Active' && <CheckCircle className='w-3 h-3' />}
                  {vehicle.status === 'Loading' && <Clock className='w-3 h-3' />}
                  {vehicle.status === 'Maintenance' && <AlertCircle className='w-3 h-3' />}
                  {vehicle.status}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className='space-y-2 xs:space-y-3 mb-3 xs:mb-4'>
                <div className='flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm'>
                  <Truck className='w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                  <span className='text-gray-600 dark:text-gray-400'>Capacity:</span>
                  <span className='font-medium text-gray-800 dark:text-white ml-auto'>{vehicle.capacity}</span>
                </div>
                <div className='flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm'>
                  <MapPin className='w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0' />
                  <span className='text-gray-600 dark:text-gray-400'>Location:</span>
                  <span className='font-medium text-gray-800 dark:text-white ml-auto'>{vehicle.location}</span>
                </div>
                <div className='flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>Fuel Level:</span>
                  <span className='font-medium text-gray-800 dark:text-white ml-auto'>{vehicle.fuelLevel}%</span>
                </div>
                {/* Fuel Level Progress Bar */}
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full ${getFuelColor(vehicle.fuelLevel)}`}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  ></div>
                </div>
              </div>

              {/* Driver Info */}
              <div className='border-t border-gray-100 dark:border-gray-800 pt-3 xs:pt-4 mb-3 xs:mb-4'>
                <p className='text-xs xs:text-sm font-semibold text-gray-800 dark:text-white mb-1'>
                  Driver: {vehicle.driver ? vehicle.driver.name : 'Not Assigned'}
                </p>
                {vehicle.driver && (
                  <div className='flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-gray-600 dark:text-gray-400'>
                    <Phone className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                    <span>{vehicle.driver.phone}</span>
                  </div>
                )}
              </div>

              {/* Current Load (if exists) */}
              {vehicle.loads && vehicle.loads.length > 0 && (
                <div className='border-t border-gray-100 dark:border-gray-800 pt-3 xs:pt-4 mb-3 xs:mb-4'>
                  <p className='text-xs xs:text-sm font-semibold text-gray-800 dark:text-white mb-2'>Current load:</p>
                  {vehicle.loads.map((load) => (
                    <div key={load.id} className='flex justify-between text-xs xs:text-sm text-gray-600 dark:text-gray-400 mb-1'>
                      <span>{load.item}</span>
                      <span className='font-medium text-gray-800 dark:text-white'>{load.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex gap-2'>
                <button
                  onClick={() => handleManageLoad(vehicle)}
                  className='flex-1 flex items-center justify-center gap-1.5 xs:gap-2 px-2 xs:px-4 py-1.5 xs:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Package className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                  <span className='text-xs xs:text-sm font-medium'>Manage Load</span>
                </button>
              </div>
              <div className='flex gap-2 mt-2'>
                <button
                  onClick={() => handleViewDetails(vehicle)}
                  className='flex-1 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-4 py-1.5 xs:py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white'
                >
                  <Eye className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                  <span className='text-xs xs:text-sm font-medium'>Details</span>
                </button>
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className='flex-1 flex items-center justify-center gap-1 xs:gap-2 px-2 xs:px-4 py-1.5 xs:py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white'
                >
                  <Edit className='w-3.5 h-3.5 xs:w-4 xs:h-4' />
                  <span className='text-xs xs:text-sm font-medium'>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Add New Vehicle</h2>
              <button onClick={() => setShowAddModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
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
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Registration Number (Vehicle ID)</label>
                <input
                  type='text'
                  name='id'
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder='e.g., GJ-01-AB-1234'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Vehicle Type</label>
                <input
                  type='text'
                  name='vehicleType'
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  placeholder='e.g., Tata Ace'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Capacity</label>
                <input
                  type='text'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder='e.g., 1 Ton'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Status</label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                >
                  <option value='Active'>Active</option>
                  <option value='Loading'>Loading</option>
                  <option value='Maintenance'>Maintenance</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Location</label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder='e.g., Main Warehouse'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Fuel Level (%)</label>
                <input
                  type='number'
                  name='fuelLevel'
                  value={formData.fuelLevel}
                  onChange={handleInputChange}
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Assign Driver (Agent)</label>
                <select
                  name='driverId'
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
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
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Each agent can only be assigned to one vehicle</p>
              </div>
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='flex-1 px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-50'
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
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Vehicle Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
                <X className='w-6 h-6' />
              </button>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Vehicle ID:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.id}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Vehicle Type:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.vehicle}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedVehicle.statusColor}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Capacity:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.capacity}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Location:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.location}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Fuel Level:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.fuelLevel}%</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Driver:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.driver}</span>
              </div>
              <div className='flex justify-between py-2 border-b border-gray-100 dark:border-gray-800'>
                <span className='text-gray-600 dark:text-gray-400 font-medium'>Phone:</span>
                <span className='text-gray-800 dark:text-white'>{selectedVehicle.phone}</span>
              </div>
              {selectedVehicle.currentLoad && (
                <div className='pt-2'>
                  <span className='text-gray-600 dark:text-gray-400 font-medium block mb-2'>Current Load:</span>
                  {selectedVehicle.currentLoad.map((load, idx) => (
                    <div key={idx} className='flex justify-between text-sm py-1'>
                      <span className='text-gray-600 dark:text-gray-400'>{load.item}</span>
                      <span className='text-gray-800 dark:text-white'>{load.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className='w-full mt-6 px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Edit Vehicle</h2>
              <button onClick={() => setShowEditModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
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
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Registration Number (Vehicle ID)</label>
                <input
                  type='text'
                  name='id'
                  value={formData.id}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  disabled
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Vehicle Type</label>
                <input
                  type='text'
                  name='vehicleType'
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Capacity</label>
                <input
                  type='text'
                  name='capacity'
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Status</label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                >
                  <option value='Active'>Active</option>
                  <option value='Loading'>Loading</option>
                  <option value='Maintenance'>Maintenance</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Location</label>
                <input
                  type='text'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Fuel Level (%)</label>
                <input
                  type='number'
                  name='fuelLevel'
                  value={formData.fuelLevel}
                  onChange={handleInputChange}
                  min='0'
                  max='100'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Assign Driver (Agent)</label>
                <select
                  name='driverId'
                  value={formData.driverId}
                  onChange={handleInputChange}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
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
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Each agent can only be assigned to one vehicle</p>
              </div>
              <div className='flex gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowEditModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white'
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
                  className='flex-1 px-4 py-2 bg-black dark:bg-blue-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-50'
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Load Management Modal */}
      {showLoadModal && selectedVehicle && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-900 rounded-xl p-4 xs:p-5 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-3 xs:mx-4'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <h2 className='text-lg xs:text-xl md:text-2xl font-bold text-gray-800 dark:text-white'>Manage Vehicle Load</h2>
                <p className='text-xs xs:text-sm text-gray-600 dark:text-gray-400'>Vehicle: {selectedVehicle.id}</p>
              </div>
              <button onClick={() => setShowLoadModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'>
                <X className='w-6 h-6' />
              </button>
            </div>

            {/* Add Load Form */}
            <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                <Plus className='w-5 h-5' />
                Add New Load
              </h3>
              <form onSubmit={handleAddLoad} className='space-y-3'>
                <div className='grid grid-cols-1 xs:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Select Item</label>
                    <select
                      name='inventoryId'
                      value={loadFormData.inventoryId}
                      onChange={handleLoadInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      required
                    >
                      <option value=''>Choose from inventory...</option>
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.stock} {item.unit} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Quantity</label>
                    <input
                      type='number'
                      name='quantity'
                      value={loadFormData.quantity}
                      onChange={handleLoadInputChange}
                      placeholder='Enter quantity'
                      min='1'
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      required
                    />
                  </div>
                </div>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
                >
                  <Plus className='w-4 h-4' />
                  {loading ? 'Adding...' : 'Add to Vehicle'}
                </button>
              </form>
            </div>

            {/* Current Loads */}
            <div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2'>
                <Package className='w-5 h-5' />
                Current Loads ({selectedVehicle.loads?.length || 0})
              </h3>
              {selectedVehicle.loads && selectedVehicle.loads.length > 0 ? (
                <div className='space-y-2'>
                  {selectedVehicle.loads.map((load) => (
                    <div
                      key={load.id}
                      className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center'>
                          <Package className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-semibold text-gray-800 dark:text-white'>{load.item}</p>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>Quantity: {load.quantity}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveLoad(load.id)}
                        className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Remove load'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-gray-400'>
                  <Package className='w-12 h-12 mx-auto mb-2 opacity-30' />
                  <p>No loads on this vehicle</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLoadModal(false)}
              className='w-full mt-6 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-white'
            >
              Close
            </button>
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

      {/* Delete Load Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteLoadDialog.show}
        onClose={() => setDeleteLoadDialog({ show: false, loadId: null })}
        onConfirm={confirmRemoveLoad}
        title="Remove Load"
        message="Are you sure you want to remove this load from the vehicle?"
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
