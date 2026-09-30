import React, { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Gauge, Fuel, Calendar, AlertCircle, Search, RefreshCw, BarChart3, Boxes, Edit, Trash2, X, Minus, DollarSign, User } from 'lucide-react';
import { vehicleAPI, customerAPI, inventoryAPI, deliveryAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';

export default function MyVehicle() {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLoad, setSelectedLoad] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [customers, setCustomers] = useState([]);
    const [deliveryReservationsLoaded, setDeliveryReservationsLoaded] = useState(false);
    const [saleData, setSaleData] = useState({
        customerId: '',
        cashAmount: '',
        paymentMethod: 'Cash'
    });
    const [deleteDialog, setDeleteDialog] = useState({ show: false, loadId: null });

    useEffect(() => {
        fetchMyVehicle();
        fetchCustomers();
    }, []);

    const fetchMyVehicle = async () => {
        try {
            setLoading(true);
            setDeliveryReservationsLoaded(false);
            const response = await vehicleAPI.getMyVehicle();
            if (response.data.success) {
                const vehicleData = response.data.data;
                let reservedByItem = {};
                try {
                    const deliveryResponse = await deliveryAPI.getMyDeliveries();
                    const assignments = deliveryResponse.data.data || [];
                    assignments
                        .filter((delivery) => ['pending', 'in transit'].includes(String(delivery.status).toLowerCase()))
                        .forEach((delivery) => {
                            const itemName = String(delivery.productName || '').trim().toLowerCase();
                            const quantity = Number.parseFloat(String(delivery.quantity || '').match(/^\s*(\d+(?:\.\d+)?)/)?.[1] || '0');
                            reservedByItem[itemName] = (reservedByItem[itemName] || 0) + quantity;
                        });
                    setDeliveryReservationsLoaded(true);
                } catch (deliveryError) {
                    console.error('Error fetching delivery reservations:', deliveryError);
                    toast.error('Could not verify assigned delivery quantities. Refresh before recording a sale.');
                }
                let priceByName = {};
                try {
                    const inventoryResponse = await inventoryAPI.getAll();
                    const inventoryItems = inventoryResponse.data.data || [];
                    priceByName = Object.fromEntries(
                        inventoryItems.map((item) => [item.name.trim().toLowerCase(), item])
                    );
                } catch (inventoryError) {
                    console.error('Error fetching inventory prices:', inventoryError);
                }
                vehicleData.loads = (vehicleData.loads || []).map((load) => {
                    const itemName = load.item.trim().toLowerCase();
                    const inventoryItem = priceByName[itemName];
                    const loadedQuantity = Number.parseFloat(String(load.quantity).match(/^\s*(\d+(?:\.\d+)?)/)?.[1] || '0');
                    const reservedQuantity = reservedByItem[itemName] || 0;
                    return {
                        ...load,
                        unitPrice: inventoryItem?.price ?? null,
                        category: inventoryItem?.category ?? load.category,
                        reservedQuantity,
                        sellableQuantity: Math.max(0, loadedQuantity - reservedQuantity)
                    };
                });
                setVehicle(vehicleData);
            }
        } catch (error) {
            console.error('Error fetching vehicle:', error);
            toast.error('Failed to load vehicle details');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleEditLoad = (load) => {
        if (!deliveryReservationsLoaded) {
            toast.error('Assigned delivery quantities are not available. Refresh and try again.');
            return;
        }
        if (load.sellableQuantity <= 0) {
            toast.info('All remaining stock is reserved for assigned deliveries.');
            return;
        }
        setSelectedLoad(load);
        // Extract numeric value from quantity string (e.g., "100 Bottles" -> "100")
        const quantityMatch = load.quantity.match(/^(\d+)/);
        setEditQuantity(quantityMatch ? quantityMatch[1] : '');
        setSaleData({
            customerId: '',
            cashAmount: '0',
            paymentMethod: 'Cash'
        });
        setShowEditModal(true);
    };

    const getSuggestedSaleAmount = (load, remainingQuantity) => {
        const unitPrice = Number(load?.unitPrice);
        const originalQuantity = parseInt(load?.quantity?.match(/^\d+/)?.[0] || '0', 10);
        const remaining = parseInt(remainingQuantity || '0', 10);
        if (!Number.isFinite(unitPrice) || remaining > originalQuantity) return '';
        return (unitPrice * Math.max(0, originalQuantity - remaining)).toFixed(2);
    };

    const handleUpdateLoad = async (e) => {
        e.preventDefault();
        if (!editQuantity || parseInt(editQuantity) < 0) {
            toast.error('Please enter a valid quantity');
            return;
        }
        if (!saleData.customerId || !saleData.cashAmount) {
            toast.error('Please select customer and enter sale amount');
            return;
        }

        try {
            setLoading(true);
            // Extract the unit and original quantity
            const unitMatch = selectedLoad.quantity.match(/\d+\s+(.+)$/);
            const unit = unitMatch ? unitMatch[1] : 'Units';
            const originalQuantity = parseInt(selectedLoad.quantity.match(/^(\d+)/)[1]);
            const newQuantity = parseInt(editQuantity);
            const distributedQuantity = originalQuantity - newQuantity;

            if (newQuantity < selectedLoad.reservedQuantity) {
                toast.error(`Keep at least ${selectedLoad.reservedQuantity} units for assigned deliveries`);
                setLoading(false);
                return;
            }

            if (distributedQuantity < 0) {
                toast.error('New quantity cannot be greater than original quantity');
                setLoading(false);
                return;
            }

            // Update the load quantity with sale details
            await vehicleAPI.updateLoad(selectedLoad.id, {
                quantity: `${editQuantity} ${unit}`,
                saleData: {
                    ...saleData,
                    itemName: selectedLoad.item,
                    distributedQuantity: distributedQuantity,
                    unit: unit
                }
            });

            await fetchMyVehicle();
            setShowEditModal(false);
            toast.success('Sale recorded and inventory updated!');
        } catch (error) {
            console.error('Error updating load:', error);
            toast.error(error.response?.data?.message || 'Failed to update load quantity');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveLoad = (loadId) => {
        setDeleteDialog({ show: true, loadId });
    };

    const confirmRemoveLoad = async () => {
        const loadId = deleteDialog.loadId;
        setDeleteDialog({ show: false, loadId: null });

        try {
            setLoading(true);
            await vehicleAPI.removeLoad(vehicle.id, loadId);
            await fetchMyVehicle();
            toast.success('Item removed from vehicle!');
        } catch (error) {
            console.error('Error removing load:', error);
            toast.error('Failed to remove item');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-[400px]'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400'></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className='p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[400px] text-center'>
                <div className='w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4'>
                    <Truck className='w-10 h-10 text-gray-300 dark:text-gray-500' />
                </div>
                <h2 className='text-xl font-bold text-gray-800 dark:text-white mb-2'>No Vehicle Assigned</h2>
                <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
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
                    <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>My Assigned Vehicle</h1>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>Vehicle details and current inventory load</p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${vehicle.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${vehicle.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                        {vehicle.status}
                    </div>
                </div>
            </div>

            {/* Vehicle Info Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl'>
                            <Truck className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1'>Registration No.</p>
                        <h3 className='text-xl font-bold text-gray-800 dark:text-white'>{vehicle.id}</h3>
                    </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl'>
                            <BarChart3 className='w-6 h-6 text-indigo-600 dark:text-indigo-400' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1'>Capacity</p>
                        <h3 className='text-xl font-bold text-gray-800 dark:text-white'>{vehicle.capacity}</h3>
                    </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl'>
                            <Fuel className='w-6 h-6 text-orange-600 dark:text-orange-400' />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${vehicle.fuelLevel > 50 ? 'text-green-600 bg-green-50 dark:bg-green-500/20 dark:text-green-400' :
                            vehicle.fuelLevel > 20 ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/20 dark:text-orange-400' : 'text-red-600 bg-red-50 dark:bg-red-500/20 dark:text-red-400'
                            }`}>
                            {vehicle.fuelLevel}%
                        </span>
                    </div>
                    <div>
                        <p className='text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1'>Fuel Level</p>
                        <div className='w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full mt-2'>
                            <div
                                className={`h-full rounded-full ${vehicle.fuelLevel > 50 ? 'bg-green-500' :
                                    vehicle.fuelLevel > 20 ? 'bg-orange-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className='bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow'>
                    <div className='flex items-start justify-between mb-4'>
                        <div className='p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl'>
                            <MapPin className='w-6 h-6 text-purple-600 dark:text-purple-400' />
                        </div>
                    </div>
                    <div>
                        <p className='text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider mb-1'>Current Station</p>
                        <h3 className='text-xl font-bold text-gray-800 dark:text-white'>{vehicle.location || 'Depot'}</h3>
                    </div>
                </div>
            </div>

            {/* Inventory Section */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden'>
                <div className='p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                            <Package className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                        </div>
                        <h2 className='text-lg font-bold text-gray-800 dark:text-white'>Vehicle Inventory</h2>
                    </div>

                    <div className='relative w-full md:w-64'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500' />
                        <input
                            type='text'
                            placeholder='Search items...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all'
                        />
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gray-50/50 dark:bg-gray-900/50'>
                            <tr>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Item Name</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Quantity</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Category</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Loaded At</th>
                                <th className='px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50 dark:divide-gray-700'>
                            {filteredLoads.length > 0 ? (
                                filteredLoads.map((load) => (
                                    <tr key={load.id} className='hover:bg-blue-50/10 dark:hover:bg-gray-700/50 transition-colors'>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center'>
                                                    <Boxes className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                                                </div>
                                                <span className='text-sm font-semibold text-gray-700 dark:text-gray-200'>{load.item}</span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex flex-col items-start gap-1'>
                                                <span className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg'>
                                                    {load.quantity}
                                                </span>
                                                <span className='text-[11px] text-gray-500'>
                                                    {load.reservedQuantity} reserved · {load.sellableQuantity} sellable
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700'>
                                            {load.unitPrice != null
                                                ? `LKR ${Number(load.unitPrice).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : 'Price unavailable'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                                            {load.category || 'Product'}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400 dark:text-gray-500'>
                                            {new Date(load.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    onClick={() => handleEditLoad(load)}
                                                    className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                                                    title='Update quantity'
                                                >
                                                    <Edit className='w-4 h-4' />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveLoad(load.id)}
                                                    className='p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors'
                                                    title='Remove item'
                                                >
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan='5' className='px-6 py-12 text-center text-gray-400'>
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
                    <div className='p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-700'>
                        <p className='text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-center'>
                            Total {filteredLoads.length} item types loaded
                        </p>
                    </div>
                )}
            </div>

            {/* Edit Load Modal */}
            {showEditModal && selectedLoad && (
                <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto'>
                    <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md m-4 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700'>
                        <div className='flex justify-between items-center mb-4'>
                            <div>
                                <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>Record Sale</h2>
                                <p className='text-sm text-gray-600 dark:text-gray-400'>Item: {selectedLoad.item}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors'>
                                <X className='w-6 h-6' />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateLoad} className='space-y-4'>
                            <div className='bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg'>
                                <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2'>
                                    <Minus className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                                    <span>Distribution to customer</span>
                                </div>
                                <p className='text-xs text-gray-500'>Current: {selectedLoad.quantity}</p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2'>
                                    <User className='w-4 h-4' />
                                    Select Customer*
                                </label>
                                <select
                                    value={saleData.customerId}
                                    onChange={(e) => setSaleData({ ...saleData, customerId: e.target.value })}
                                    className='w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                >
                                    <option value=''>Choose a customer...</option>
                                    {customers.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.shopName} - {customer.ownerName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Remaining Quantity*</label>
                                <input
                                    type='number'
                                    value={editQuantity}
                                    onChange={(e) => {
                                        const remainingQuantity = e.target.value;
                                        setEditQuantity(remainingQuantity);
                                        const suggestedAmount = getSuggestedSaleAmount(selectedLoad, remainingQuantity);
                                        if (suggestedAmount !== '') {
                                            setSaleData((current) => ({ ...current, cashAmount: suggestedAmount }));
                                        }
                                    }}
                                    placeholder='Enter remaining quantity'
                                    min='0'
                                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Enter quantity left after distribution</p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2'>
                                    <DollarSign className='w-4 h-4' />
                                    Sale Amount (LKR)*
                                </label>
                                <input
                                    type='number'
                                    value={saleData.cashAmount}
                                    onChange={(e) => setSaleData({ ...saleData, cashAmount: e.target.value })}
                                    placeholder='Enter cash received'
                                    min='0'
                                    step='0.01'
                                    className='w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                                <p className='text-xs text-gray-500 mt-1'>Total amount received from customer</p>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>Payment Method</label>
                                <select
                                    value={saleData.paymentMethod}
                                    onChange={(e) => setSaleData({ ...saleData, paymentMethod: e.target.value })}
                                    className='w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value='Cash'>Cash</option>
                                    <option value='Bank Transfer'>Bank Transfer</option>
                                    <option value='Credit'>Credit</option>
                                </select>
                            </div>

                            <div className='flex gap-3 pt-4'>
                                <button
                                    type='button'
                                    onClick={() => setShowEditModal(false)}
                                    className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                                >
                                    {loading ? 'Recording...' : 'Record Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.show}
                onClose={() => setDeleteDialog({ show: false, loadId: null })}
                onConfirm={confirmRemoveLoad}
                title="Remove Item"
                message="Are you sure you want to remove this item from your vehicle? This indicates the item has been fully distributed."
                confirmText="Remove"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}