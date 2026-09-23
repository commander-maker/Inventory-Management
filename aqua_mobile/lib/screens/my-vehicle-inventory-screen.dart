import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';
import 'auth-screen.dart';

class MyVehicleInventoryScreen extends StatefulWidget {
  final User user;
  final ValueChanged<int>? onTabSelect;

  const MyVehicleInventoryScreen({
    super.key,
    required this.user,
    this.onTabSelect,
  });

  @override
  State<MyVehicleInventoryScreen> createState() =>
      _MyVehicleInventoryScreenState();
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

  // ------------------------------------------------------------
  // DARK / LIGHT MODE (shared across all screens via ThemeController)
  // ------------------------------------------------------------

  bool get _isDarkMode => ThemeController.isDarkMode.value;

  void _onThemeChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _toggleTheme(bool value) => ThemeController.toggle(value);

  Color get _backgroundColor =>
      _isDarkMode ? const Color(0xFF121212) : AppColors.scaffoldBackground;

  Color get _cardColor => _isDarkMode ? const Color(0xFF1E1E1E) : Colors.white;

  Color get _primaryTextColor =>
      _isDarkMode ? Colors.white : AppColors.textPrimary;

  Color get _secondaryTextColor =>
      _isDarkMode ? Colors.white70 : AppColors.textSecondary;

  Color get _mutedTextColor =>
      _isDarkMode ? Colors.white54 : AppColors.textMuted;

  Color get _borderColor =>
      _isDarkMode ? Colors.white12 : AppColors.borderLight;

  BoxDecoration get _cardDecoration => BoxDecoration(
    color: _cardColor,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: _borderColor),
    boxShadow: _isDarkMode
        ? []
        : [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
  );

  @override
  void initState() {
    super.initState();
    ThemeController.isDarkMode.addListener(_onThemeChanged);
    ThemeController.load();
    _fetchVehicleData();
    _fetchCustomers();
  }

  @override
  void dispose() {
    ThemeController.isDarkMode.removeListener(_onThemeChanged);
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
        final loads = await VehicleAPI.getVehicleLoads(
          vehicleData['id'].toString(),
        );
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
      final name = (item['item'] ?? item['name'] ?? '')
          .toString()
          .toLowerCase();
      return name.contains(searchQuery.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        brightness: _isDarkMode ? Brightness.dark : Brightness.light,
        scaffoldBackgroundColor: _backgroundColor,
        cardColor: _cardColor,
        dividerColor: _borderColor,
      ),
      child: Scaffold(
        backgroundColor: _backgroundColor,
        appBar: AppBar(
          backgroundColor: _cardColor,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: IconThemeData(color: _primaryTextColor),
          title: Text(
            'My Vehicle Inventory',
            style: TextStyle(
              color: _primaryTextColor,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.refresh_rounded, color: _primaryTextColor),
              onPressed: () {
                _fetchVehicleData();
                _fetchCustomers();
              },
            ),
          ],
        ),
        drawer: _buildDrawer(),
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
                              separatorBuilder: (_, __) =>
                                  const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                return _buildInventoryItemCard(
                                  filteredInventory[index],
                                );
                              },
                            ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: _cardColor,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 30, 20, 20),
              decoration: const BoxDecoration(color: AppColors.primary),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.user.name.isNotEmpty
                              ? widget.user.name
                              : 'Agent',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.user.role,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  _buildDrawerMenuItem(
                    'Dashboard',
                    Icons.dashboard_rounded,
                    () {
                      Navigator.pop(context);
                      widget.onTabSelect?.call(0);
                    },
                  ),

                  _buildDrawerMenuItem(
                    'My Deliveries',
                    Icons.local_shipping_rounded,
                    () {
                      Navigator.pop(context);
                      widget.onTabSelect?.call(1);
                    },
                  ),

                  _buildDrawerMenuItem(
                    'My Vehicle Inventory',
                    Icons.directions_car_rounded,
                    () {
                      Navigator.pop(context);
                    },
                    isSelected: true,
                  ),

                  _buildDrawerMenuItem('Settings', Icons.settings_rounded, () {
                    Navigator.pop(context);
                    widget.onTabSelect?.call(3);
                  }),

                  const SizedBox(height: 12),

                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    decoration: BoxDecoration(
                      color: _isDarkMode
                          ? Colors.white.withOpacity(0.06)
                          : Colors.grey.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: SwitchListTile(
                      secondary: Icon(
                        _isDarkMode
                            ? Icons.dark_mode_rounded
                            : Icons.light_mode_rounded,
                        color: AppColors.primary,
                      ),
                      title: Text(
                        _isDarkMode ? 'Dark Mode' : 'Light Mode',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: _primaryTextColor,
                        ),
                      ),
                      subtitle: Text(
                        _isDarkMode
                            ? 'Dark theme enabled'
                            : 'Light theme enabled',
                        style: TextStyle(
                          fontSize: 11,
                          color: _secondaryTextColor,
                        ),
                      ),
                      value: _isDarkMode,
                      activeColor: AppColors.primary,
                      onChanged: _toggleTheme,
                    ),
                  ),
                ],
              ),
            ),

            // Logout Button
            Padding(
              padding: const EdgeInsets.all(16),
              child: _buildDrawerMenuItem(
                'Log Out',
                Icons.logout_rounded,
                _handleLogout,
                isLogout: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerMenuItem(
    String title,
    IconData icon,
    VoidCallback onTap, {
    bool isSelected = false,
    bool isLogout = false,
  }) {
    Color bg = isLogout
        ? AppColors.badgeRedBg
        : isSelected
        ? AppColors.primaryLight
        : Colors.transparent;

    Color fg = isLogout
        ? AppColors.badgeRedIcon
        : isSelected
        ? AppColors.primary
        : _primaryTextColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(icon, color: fg, size: 20),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: fg,
          ),
        ),
        trailing: Icon(
          Icons.chevron_right_rounded,
          size: 18,
          color: fg.withOpacity(0.5),
        ),
        onTap: onTap,
      ),
    );
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: _cardColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            'Logout',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: _primaryTextColor,
            ),
          ),
          content: Text(
            'Are you sure you want to logout?',
            style: TextStyle(color: _secondaryTextColor),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.badgeRedIcon,
              ),
              onPressed: () async {
                Navigator.pop(dialogContext);

                final navigator = Navigator.of(context);

                final prefs = await SharedPreferences.getInstance();

                await prefs.remove('token');
                await prefs.remove('user_id');
                await prefs.remove('user_data');

                if (!mounted) return;

                navigator.pushAndRemoveUntil(
                  MaterialPageRoute(builder: (_) => const AuthScreen()),
                  (route) => false,
                );
              },
              child: const Text(
                'Logout',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
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
            children: [
              Text(
                'My Assigned Vehicle',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: _primaryTextColor,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Vehicle details and current inventory load',
                style: TextStyle(fontSize: 13, color: _secondaryTextColor),
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
    final reg =
        vehicle?['registration'] ??
        vehicle?['registrationNo'] ??
        vehicle?['id'] ??
        'V820224993';
    final capacity = vehicle?['capacity'] != null
        ? '${vehicle?['capacity']}'
        : '1 Ton';
    final fuelLevel = (vehicle != null && vehicle!['fuelLevel'] is int)
        ? vehicle!['fuelLevel'] as int
        : 100;
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
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.badgeGreenIcon,
                ),
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
      decoration: _cardDecoration,
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
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: _mutedTextColor,
              letterSpacing: 0.5,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _primaryTextColor,
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
      decoration: _cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.inventory_2_outlined,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Vehicle Inventory',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _primaryTextColor,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
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
            style: TextStyle(color: _primaryTextColor),
            decoration: InputDecoration(
              hintText: 'Search items...',
              fillColor: _cardColor,
              prefixIcon: Icon(
                Icons.search_rounded,
                color: _mutedTextColor,
                size: 20,
              ),
              suffixIcon: searchQuery.isNotEmpty
                  ? IconButton(
                      icon: Icon(
                        Icons.clear_rounded,
                        size: 18,
                        color: _mutedTextColor,
                      ),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          searchQuery = '';
                        });
                      },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 10,
              ),
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
      decoration: _cardDecoration,
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
                        color: _backgroundColor,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: _borderColor),
                      ),
                      child: Icon(
                        Icons.blur_on_rounded,
                        color: _secondaryTextColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            itemName,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: _primaryTextColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$category  •  Loaded: $date',
                            style: TextStyle(
                              fontSize: 12,
                              color: _secondaryTextColor,
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
                      child: const Icon(
                        Icons.edit_outlined,
                        size: 18,
                        color: AppColors.primary,
                      ),
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
                      child: const Icon(
                        Icons.delete_outline_rounded,
                        size: 18,
                        color: AppColors.badgeRedIcon,
                      ),
                    ),
                    tooltip: 'Remove Load',
                    onPressed: () => _confirmRemoveLoad(item),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: _borderColor, height: 1),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Available Load Quantity:',
                style: TextStyle(fontSize: 13, color: _secondaryTextColor),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
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
    final remainingQtyController = TextEditingController(
      text: currentQtyNum.toString(),
    );
    final saleAmountController = TextEditingController();
    String selectedPaymentMethod = 'Cash';

    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
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
                            icon: const Icon(
                              Icons.close_rounded,
                              color: AppColors.textMuted,
                            ),
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
                          border: Border.all(
                            color: AppColors.primary.withOpacity(0.15),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Icon(
                                  Icons.remove_rounded,
                                  color: AppColors.primary,
                                  size: 16,
                                ),
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
                          Icon(
                            Icons.person_outline_rounded,
                            size: 16,
                            color: AppColors.textPrimary,
                          ),
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
                        hint: const Text(
                          'Choose a customer...',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textMuted,
                          ),
                        ),
                        items: customers.map((c) {
                          final cId = c['id'] is int
                              ? c['id'] as int
                              : int.parse(c['id'].toString());
                          final shop =
                              c['shopName'] ??
                              c['ownerName'] ??
                              'Customer #$cId';
                          return DropdownMenuItem<int>(
                            value: cId,
                            child: Text(
                              shop,
                              style: const TextStyle(fontSize: 14),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setModalState(() {
                            selectedCustomerId = val;
                          });
                        },
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
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
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Enter quantity left after distribution',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
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
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        decoration: const InputDecoration(
                          hintText: 'Enter cash received',
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Total amount received from customer',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textMuted,
                        ),
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
                          DropdownMenuItem(
                            value: 'Online',
                            child: Text('Online / Card'),
                          ),
                          DropdownMenuItem(
                            value: 'Credit',
                            child: Text('Credit / Cheque'),
                          ),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() {
                              selectedPaymentMethod = val;
                            });
                          }
                        },
                        decoration: InputDecoration(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Action buttons: Cancel and Record Sale
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: isSubmitting
                                  ? null
                                  : () => Navigator.pop(dialogContext),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.border),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: const Text(
                                'Cancel',
                                style: TextStyle(color: AppColors.textPrimary),
                              ),
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
                                        ScaffoldMessenger.of(
                                          dialogContext,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Please select a customer',
                                            ),
                                            backgroundColor:
                                                AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      // Validate Remaining Qty
                                      final remQty = int.tryParse(
                                        remainingQtyController.text.trim(),
                                      );
                                      if (remQty == null ||
                                          remQty < 0 ||
                                          remQty > currentQtyNum) {
                                        ScaffoldMessenger.of(
                                          dialogContext,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(
                                              'Remaining quantity must be between 0 and $currentQtyNum',
                                            ),
                                            backgroundColor:
                                                AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      // Validate Amount
                                      final amount = double.tryParse(
                                        saleAmountController.text.trim(),
                                      );
                                      if (amount == null || amount < 0) {
                                        ScaffoldMessenger.of(
                                          dialogContext,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Please enter a valid sale amount',
                                            ),
                                            backgroundColor:
                                                AppColors.badgeRedIcon,
                                          ),
                                        );
                                        return;
                                      }

                                      setModalState(() {
                                        isSubmitting = true;
                                      });

                                      try {
                                        final distributedQty =
                                            currentQtyNum - remQty;
                                        final newQtyString = unitStr.isNotEmpty
                                            ? '$remQty $unitStr'
                                            : '$remQty';

                                        final saleData = {
                                          'customerId': selectedCustomerId,
                                          'cashAmount': amount,
                                          'distributedQuantity': distributedQty,
                                          'unit': unitStr,
                                          'itemName': itemName,
                                          'paymentMethod':
                                              selectedPaymentMethod,
                                        };

                                        await VehicleAPI.updateVehicleLoad(
                                          item['id'].toString(),
                                          {
                                            'quantity': newQtyString,
                                            'saleData': saleData,
                                          },
                                        );

                                        ScaffoldMessenger.of(
                                          dialogContext,
                                        ).showSnackBar(
                                          const SnackBar(
                                            content: Text(
                                              'Sale recorded successfully!',
                                            ),
                                            backgroundColor:
                                                AppColors.badgeGreenIcon,
                                          ),
                                        );
                                        Navigator.pop(dialogContext);
                                        _fetchVehicleData();
                                      } catch (e) {
                                        setModalState(() {
                                          isSubmitting = false;
                                        });
                                        ScaffoldMessenger.of(
                                          dialogContext,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(
                                              'Failed to record sale: $e',
                                            ),
                                            backgroundColor:
                                                AppColors.badgeRedIcon,
                                          ),
                                        );
                                      }
                                    },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: isSubmitting
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Text(
                                      'Record Sale',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
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
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: const Text(
            'Remove Load Item',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          content: Text(
            'Are you sure you want to remove "$itemName" from vehicle inventory? Stock will be restored to warehouse.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text(
                'Cancel',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.badgeRedIcon,
              ),
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
              child: const Text(
                'Remove',
                style: TextStyle(color: Colors.white),
              ),
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
      decoration: _cardDecoration,
      child: Column(
        children: [
          Icon(Icons.inventory_2_outlined, size: 48, color: _mutedTextColor),
          const SizedBox(height: 12),
          Text(
            'No Items Found',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _primaryTextColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'No vehicle inventory items match your search criteria.',
            style: TextStyle(fontSize: 13, color: _secondaryTextColor),
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
        decoration: _cardDecoration,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              color: AppColors.badgeRedIcon,
              size: 48,
            ),
            const SizedBox(height: 12),
            Text(
              'Error Loading Vehicle',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: _primaryTextColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              errorMessage ?? 'Unknown error occurred',
              style: TextStyle(fontSize: 13, color: _secondaryTextColor),
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
        decoration: _cardDecoration,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.directions_car_outlined,
              color: _mutedTextColor,
              size: 48,
            ),
            const SizedBox(height: 12),
            Text(
              'No Vehicle Assigned',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: _primaryTextColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'You currently don\'t have a vehicle assigned. Please contact your manager.',
              style: TextStyle(fontSize: 13, color: _secondaryTextColor),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
