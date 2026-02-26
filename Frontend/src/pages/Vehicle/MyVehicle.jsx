import React, { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Gauge, Fuel, Calendar, AlertCircle, Search, RefreshCw, BarChart3, Boxes } from 'lucide-react';
import { vehicleAPI } from '../../utils/api';
import { toast } from 'react-toastify';

export default function MyVehicle() {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyVehicle();
    }, []);

    const fetchMyVehicle = async () => {
        try {
            setLoading(true);
            const response = await vehicleAPI.getMyVehicle();
            if (response.data.success) {
                setVehicle(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            toast.error('Failed to load vehicle details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className='p-8 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] text-center'>
                <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
                    <Truck className='w-10 h-10 text-gray-300' />
                </div>
                <h2 className='text-xl font-bold text-gray-800 mb-2'>No Vehicle Assigned</h2>
                <p className='text-gray-500 max-w-sm'>
                    You currently don't have a vehicle assigned to you. Please contact your administrator for assignment.
                </p>
                <button
                    onClick={fetchMyVehicle}
                    className='mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
                >
                    <RefreshCw className='w-4 h-4' />
                    Try Refreshing
                </button>
            </div>
        );
    }

    const filteredLoads = vehicle.loads?.filter(load =>
        load.item.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className='space-y-6 animate-in fade-in duration-500'>
            {/* Page Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>My Assigned Vehicle</h1>
                    <p className='text-gray-500 text-sm'>Vehicle details and current inventory load</p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vehicle.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${vehicle.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                        {vehicle.status}
                    </div>
                </div>
            </div>

            {/* Vehicle Info Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-blue-50 rounded-xl'>
                            <Truck className='w-6 h-6 text-blue-600' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-1'>Registration No.</p>
                        <h3 className='text-xl font-bold text-gray-800'>{vehicle.id}</h3>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-indigo-50 rounded-xl'>
                            <BarChart3 className='w-6 h-6 text-indigo-600' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-1'>Capacity</p>
                        <h3 className='text-xl font-bold text-gray-800'>{vehicle.capacity}</h3>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-orange-50 rounded-xl'>
                            <Fuel className='w-6 h-6 text-orange-600' />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${vehicle.fuelLevel > 50 ? 'text-green-600 bg-green-50' :
                            vehicle.fuelLevel > 20 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50'
                            }`}>
                            {vehicle.fuelLevel}%
                        </span>
                    </div>
                    <div>
                        <p className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-1'>Fuel Level</p>
                        <div className='w-full bg-gray-100 h-2 rounded-full mt-2'>
                            <div
                                className={`h-full rounded-full ${vehicle.fuelLevel > 50 ? 'bg-green-500' :
                                    vehicle.fuelLevel > 20 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-purple-50 rounded-xl'>
                            <MapPin className='w-6 h-6 text-purple-600' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 text-xs font-medium uppercase tracking-wider mb-1'>Current Station</p>
                        <h3 className='text-xl font-bold text-gray-800'>{vehicle.location || 'Depot'}</h3>
                    </div>
                </div>
            </div>

            {/* Inventory Section */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 rounded-lg'>
                            <Package className='w-5 h-5 text-blue-600' />
                        </div>
                        <h2 className='text-lg font-bold text-gray-800'>Vehicle Inventory</h2>
                    </div>

                    <div className='relative w-full md:w-64'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input
                            type='text'
                            placeholder='Search items...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all'
                        />
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50/50'>
                            <tr>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Item Name</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Quantity</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Category</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Loaded At</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50'>
                            {filteredLoads.length > 0 ? (
                                filteredLoads.map((load) => (
                                    <tr key={load.id} className='hover:bg-blue-50/10 transition-colors'>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-8 h-8 bg-gray-100 rounded flex items-center justify-center'>
                                                    <Boxes className='w-4 h-4 text-gray-500' />
                                                </div>
                                                <span className='text-sm font-semibold text-gray-700'>{load.item}</span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <span className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg'>
                                                {load.quantity} Units
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                                            {load.category || 'Product'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
                                            {new Date(load.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='4' className='px-6 py-12 text-center text-gray-400'>
                                        <div className='mb-2'>
                                            <Search className='w-8 h-8 mx-auto opacity-20' />
                                        </div>
                                        {searchTerm ? 'No matching items found' : 'Vehicle is currently empty'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredLoads.length > 0 && (
                    <div className='p-4 bg-gray-50/50 border-t border-gray-50'>
                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center'>
                            Total {filteredLoads.length} item types loaded
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
