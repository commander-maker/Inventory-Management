import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';

class MyVehicleInventoryScreen extends StatefulWidget {
  final User user;

  const MyVehicleInventoryScreen({super.key, required this.user});

  @override
  State<MyVehicleInventoryScreen> createState() => _MyVehicleInventoryScreenState();
}

class _MyVehicleInventoryScreenState extends State<MyVehicleInventoryScreen> {
  Map<String, dynamic>? vehicle;
  List<Map<String, dynamic>> inventory = [];
  List<Map<String, dynamic>> customers = [];
  bool isLoading = true;
  String? errorMessage;

  // Search filter
  String searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchVehicleData();
    _fetchCustomers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCustomers() async {
    try {
      final customerList = await CustomerAPI.getCustomers();
      if (mounted) {
        setState(() {
          customers = customerList;
        });
      }
    } catch (e) {
      debugPrint('Failed to load customers: $e');
    }
  }

  Future<void> _fetchVehicleData() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final vehicleData = await VehicleAPI.getMyVehicle();
      if (vehicleData != null) {
        final loads = await VehicleAPI.getVehicleLoads(vehicleData['id'].toString());
        if (mounted) {
          setState(() {
            vehicle = vehicleData;
            inventory = loads;
            isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            errorMessage = 'No vehicle assigned';
            isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = e.toString().replaceFirst('Exception: ', '');
          isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> get filteredInventory {
    if (searchQuery.trim().isEmpty) return inventory;
    return inventory.where((item) {
      final name = (item['item'] ?? item['name'] ?? '').toString().toLowerCase();
      return name.contains(searchQuery.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'My Vehicle Inventory',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textPrimary),
            onPressed: () {
              _fetchVehicleData();
              _fetchCustomers();
            },
          ),
        ],
      ),
      body: isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
              ),
            )
          : errorMessage != null
              ? _buildErrorState()
              : vehicle == null
                  ? _buildNoVehicleState()
                  : RefreshIndicator(
                      onRefresh: () async {
                        await _fetchVehicleData();
                        await _fetchCustomers();
                      },
                      color: AppColors.primary,
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Section matching Web
                            _buildHeaderWithStatus(),
                            const SizedBox(height: 16),

                            // 4 Stat Cards Row matching Web Screenshot 1
                            _buildVehicleStatsGrid(),
                            const SizedBox(height: 20),

                            // Vehicle Inventory Section
                            _buildInventorySectionHeader(),
                            const SizedBox(height: 14),

                            // Inventory items list
                            filteredInventory.isEmpty
                                ? _buildEmptyInventory()
                                : ListView.separated(
                                    shrinkWrap: true,
                                    physics: const NeverScrollableScrollPhysics(),
                                    itemCount: filteredInventory.length,
                                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                                    itemBuilder: (context, index) {
                                      return _buildInventoryItemCard(filteredInventory[index]);
                                    },
                                  ),
                            const SizedBox(height: 24),
                          ],
                        ),
                      ),
                    ),
    );
  }

  Widget _buildHeaderWithStatus() {
    final status = (vehicle?['status'] ?? 'Active').toString();
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                'My Assigned Vehicle',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Vehicle details and current inventory load',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: AppColors.badgeGreenBg,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.badgeGreenIcon,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                status.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.badgeGreenText,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 4 Top Cards matching Web Screenshot 1
  Widget _buildVehicleStatsGrid() {
    final reg = vehicle?['registration'] ?? vehicle?['registrationNo'] ?? vehicle?['id'] ?? 'V820224993';
    final capacity = vehicle?['capacity'] != null ? '${vehicle?['capacity']}' : '1 Ton';
    final fuelLevel = (vehicle != null && vehicle!['fuelLevel'] is int) ? vehicle!['fuelLevel'] as int : 100;
    final location = vehicle?['location'] ?? 'Main warehouse';

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.45,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        // 1. REGISTRATION NO.
        _buildStatCardItem(
          label: 'REGISTRATION NO.',
          value: reg,
          icon: Icons.directions_bus_outlined,
          iconBg: AppColors.badgeBlueBg,
          iconColor: AppColors.badgeBlueIcon,
        ),
        // 2. CAPACITY
        _buildStatCardItem(
          label: 'CAPACITY',
          value: capacity,
          icon: Icons.bar_chart_rounded,
          iconBg: AppColors.badgePurpleBg,
          iconColor: AppColors.badgePurpleIcon,
        ),
        // 3. FUEL LEVEL
        _buildStatCardItem(
          label: 'FUEL LEVEL',
          value: '$fuelLevel%',
          icon: Icons.local_gas_station_outlined,
          iconBg: AppColors.badgeOrangeBg,
          iconColor: AppColors.badgeOrangeIcon,
          extraWidget: Padding(
            padding: const EdgeInsets.only(top: 6),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: fuelLevel / 100,
                minHeight: 5,
                backgroundColor: AppColors.borderLight,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.badgeGreenIcon),
              ),
            ),
          ),
        ),
        // 4. CURRENT STATION
        _buildStatCardItem(
          label: 'CURRENT STATION',
          value: location,
          icon: Icons.location_on_outlined,
          iconBg: AppColors.badgePurpleBg,
          iconColor: AppColors.badgePurpleIcon,
        ),
      ],
    );
  }

  Widget _buildStatCardItem({
    required String label,
    required String value,
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    Widget? extraWidget,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: AppColors.textMuted,
              letterSpacing: 0.5,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (extraWidget != null) extraWidget,
        ],
      ),
    );
  }

  Widget _buildInventorySectionHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.inventory_2_outlined, color: AppColors.primary, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Vehicle Inventory',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${inventory.length} Items Loaded',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Search Field
          TextField(
            controller: _searchController,
            onChanged: (val) {
              setState(() {
                searchQuery = val;
              });
            },
            decoration: InputDecoration(
              hintText: 'Search items...',
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.textMuted, size: 20),
              suffixIcon: searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18, color: AppColors.textMuted),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          searchQuery = '';
                        });
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInventoryItemCard(Map<String, dynamic> item) {
    final itemName = item['item'] ?? item['name'] ?? 'Pepsi 300ml';
    final qty = item['quantity'] ?? '0';
    final category = item['category'] ?? 'Product';
    final date = item['createdAt'] != null
        ? item['createdAt'].toString().split('T')[0]
        : '8/17/2026';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.scaffoldBackground,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Icon(Icons.blur_on_rounded, color: AppColors.textSecondary, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            itemName,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$category  •  Loaded: $date',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Action Buttons: Edit (Record Sale) & Delete
              Row(
                children: [
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.edit_outlined, size: 18, color: AppColors.primary),
                    ),
                    tooltip: 'Record Sale',
                    onPressed: () => _showRecordSaleModal(item),
                  ),
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.badgeRedBg,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.badgeRedIcon),
                    ),
                    tooltip: 'Remove Load',
                    onPressed: () => _confirmRemoveLoad(item),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppColors.borderLight, height: 1),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Available Load Quantity:',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.badgeBlueBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  '$qty',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.badgeBlueIcon,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Record Sale Modal Dialog matching Web Screenshot 2
  void _showRecordSaleModal(Map<String, dynamic> item) {
    final itemName = item['item'] ?? item['name'] ?? 'Pepsi 300ml';
    final rawQty = item['quantity']?.toString() ?? '0';

    final match = RegExp(r'^(\d+)\s*(.*)$').firstMatch(rawQty.trim());
    int currentQtyNum = 0;
    String unitStr = 'units';
    if (match != null) {
      currentQtyNum = int.tryParse(match.group(1) ?? '0') ?? 0;
      if ((match.group(2) ?? '').isNotEmpty) {
        unitStr = match.group(2)!;
      }
    } else {
      currentQtyNum = int.tryParse(rawQty) ?? 0;
    }

    int? selectedCustomerId;
    final remainingQtyController = TextEditingController(text: currentQtyNum.toString());
    final saleAmountController = TextEditingController();
    String selectedPaymentMethod = 'Cash';

    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              backgroundColor: Colors.white,
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Dialog Title Header matching Web Screenshot 2
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Record Sale',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Item: $itemName',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, color: AppColors.textMuted),
                            onPressed: () => Navigator.pop(dialogContext),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Soft blue info container matching Screenshot 2
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withOpacity(0.15)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(Icons.remove_rounded, color: AppColors.primary, size: 16),
                                SizedBox(width: 6),
                                Text(
                                  'Distribution to customer',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Current: $rawQty',
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // 1. Select Customer*
                      Row(
                        children: const [
                          Icon(Icons.person_outline_rounded, size: 16, color: AppColors.textPrimary),
                          SizedBox(width: 6),
                          Text(
                            'Select Customer*',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<int>(
                        initialValue: selectedCustomerId,
                        hint: const Text('Choose a customer...', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                        items: customers.map((c) {
                          final cId = c['id'] is int ? c['id'] as int : int.parse(c['id'].toString());
                          final shop = c['shopName'] ?? c['ownerName'] ?? 'Customer #$cId';
                          return DropdownMenuItem<int>(
                            value: cId,
                            child: Text(shop, style: const TextStyle(fontSize: 14)),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setModalState(() {
                            selectedCustomerId = val;
                          });
                        },
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // 2. Remaining Quantity*
                      const Text(
                        'Remaining Quantity*',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: remainingQtyController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Enter quantity left after distribution',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 16),

                      // 3. Sale Amount (LKR)*
                      Row(
                        children: const [
                          Text(
                            'Rs',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Sale Amount (LKR)*',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: saleAmountController,
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        decoration: const InputDecoration(
                          hintText: 'Enter cash received',
                          contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Total amount received from customer',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 16),

                      // 4. Payment Method
                      const Text(
                        'Payment Method',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        initialValue: selectedPaymentMethod,
                        items: const [
                          DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                          DropdownMenuItem(value: 'Online', child: Text('Online / Card')),
                          DropdownMenuItem(value: 'Credit', child: Text('Credit / Cheque')),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() {
                              selectedPaymentMethod = val;
                            });
                          }
                        },
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Action buttons: Cancel and Record Sale
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: isSubmitting ? null : () => Navigator.pop(dialogContext),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.border),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Cancel', style: TextStyle(color: AppColors.textPrimary)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: isSubmitting
                                  ? null
                                  : () async {
                                      // Validate Customer
                                      if (selectedCustomerId == null) {
                                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                                          const SnackBar(
                                            content: Text('Please select a customer'),
                                            backgroundColor: AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      // Validate Remaining Qty
                                      final remQty = int.tryParse(remainingQtyController.text.trim());
                                      if (remQty == null || remQty < 0 || remQty > currentQtyNum) {
                                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                                          SnackBar(
                                            content: Text('Remaining quantity must be between 0 and $currentQtyNum'),
                                            backgroundColor: AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      // Validate Amount
                                      final amount = double.tryParse(saleAmountController.text.trim());
                                      if (amount == null || amount < 0) {
                                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                                          const SnackBar(
                                            content: Text('Please enter a valid sale amount'),
                                            backgroundColor: AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      setModalState(() {
                                        isSubmitting = true;
                                      });

                                      try {
                                        final distributedQty = currentQtyNum - remQty;
                                        final newQtyString = unitStr.isNotEmpty ? '$remQty $unitStr' : '$remQty';

                                        final saleData = {
                                          'customerId': selectedCustomerId,
                                          'cashAmount': amount,
                                          'distributedQuantity': distributedQty,
                                          'unit': unitStr,
                                          'itemName': itemName,
                                          'paymentMethod': selectedPaymentMethod,
                                        };

                                        await VehicleAPI.updateVehicleLoad(
                                          item['id'].toString(),
                                          {
                                            'quantity': newQtyString,
                                            'saleData': saleData,
                                          },
                                        );

                                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                                          const SnackBar(
                                            content: Text('Sale recorded successfully!'),
                                            backgroundColor: AppColors.badgeGreenIcon,
                                          ),
                                        );
                                        Navigator.pop(dialogContext);
                                        _fetchVehicleData();
                                      } catch (e) {
                                        setModalState(() {
                                          isSubmitting = false;
                                        });
                                        ScaffoldMessenger.of(dialogContext).showSnackBar(
                                          SnackBar(
                                            content: Text('Failed to record sale: $e'),
                                            backgroundColor: AppColors.badgeRedIcon,
                                          ),
                                        );
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: isSubmitting
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : const Text('Record Sale', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _confirmRemoveLoad(Map<String, dynamic> item) {
    final itemName = item['item'] ?? item['name'] ?? 'Item';
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Remove Load Item', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Text('Are you sure you want to remove "$itemName" from vehicle inventory? Stock will be restored to warehouse.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.badgeRedIcon),
              onPressed: () async {
                Navigator.pop(dialogContext);
                try {
                  await VehicleAPI.removeVehicleLoad(
                    vehicle!['id'].toString(),
                    item['id'].toString(),
                  );
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Load item removed successfully'),
                        backgroundColor: AppColors.badgeGreenIcon,
                      ),
                    );
                    _fetchVehicleData();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Failed to remove load: $e'),
                        backgroundColor: AppColors.badgeRedIcon,
                      ),
                    );
                  }
                }
              },
              child: const Text('Remove', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildEmptyInventory() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 40),
      decoration: AppTheme.cardDecoration,
      child: Column(
        children: const [
          Icon(Icons.inventory_2_outlined, size: 48, color: AppColors.textMuted),
          SizedBox(height: 12),
          Text(
            'No Items Found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            'No vehicle inventory items match your search criteria.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(24),
        margin: const EdgeInsets.all(20),
        decoration: AppTheme.cardDecoration,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: AppColors.badgeRedIcon, size: 48),
            const SizedBox(height: 12),
            const Text(
              'Error Loading Vehicle',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              errorMessage ?? 'Unknown error occurred',
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                _fetchVehicleData();
                _fetchCustomers();
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoVehicleState() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(24),
        margin: const EdgeInsets.all(20),
        decoration: AppTheme.cardDecoration,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.directions_car_outlined, color: AppColors.textMuted, size: 48),
            SizedBox(height: 12),
            Text(
              'No Vehicle Assigned',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 6),
            Text(
              'You currently don\'t have a vehicle assigned. Please contact your manager.',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
