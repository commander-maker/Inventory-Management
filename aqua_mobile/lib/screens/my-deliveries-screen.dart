import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';
import 'auth-screen.dart';

class MyDeliveriesScreen extends StatefulWidget {
  final User user;
  final ValueChanged<int>? onTabSelect;

  const MyDeliveriesScreen({super.key, required this.user, this.onTabSelect});

  @override
  State<MyDeliveriesScreen> createState() => _MyDeliveriesScreenState();
}

class _MyDeliveriesScreenState extends State<MyDeliveriesScreen> {
  String activeMainTab = 'deliveries';

  String selectedFilter = 'All';

  final List<String> filterOptions = [
    'All',
    'Pending',
    'In Transit',
    'Delivered',
    'Failed',
  ];

  late List<Map<String, dynamic>> allDeliveries = [];
  late List<Map<String, dynamic>> transactions = [];

  bool isLoading = true;
  String? errorMessage;
  String? updatingDeliveryId;

  String txSearchQuery = '';
  final TextEditingController _txSearchController = TextEditingController();

  // ------------------------------------------------------------
  // DARK / LIGHT MODE (shared across all screens via ThemeController)
  // ------------------------------------------------------------

  bool get _isDarkMode => ThemeController.isDarkMode.value;

  @override
  void initState() {
    super.initState();

    ThemeController.isDarkMode.addListener(_onThemeChanged);
    ThemeController.load();
    _fetchData();
  }

  void _onThemeChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _toggleTheme(bool value) => ThemeController.toggle(value);

  // ------------------------------------------------------------
  // DARK MODE COLORS
  // ------------------------------------------------------------

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

  BoxDecoration get _cardDecoration {
    return BoxDecoration(
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
  }

  // ------------------------------------------------------------
  // DATA
  // ------------------------------------------------------------

  @override
  void dispose() {
    ThemeController.isDarkMode.removeListener(_onThemeChanged);
    _txSearchController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final deliveries = await DeliveryAPI.getMyDeliveries();

      List<Map<String, dynamic>> txList = [];
      List<Map<String, dynamic>> incomeList = [];

      try {
        txList = await FinanceAPI.getRecentTransactions(limit: 50);
      } catch (e) {
        debugPrint('Failed to load recent transactions: $e');
      }

      try {
        incomeList = await FinanceAPI.getAllIncome();
      } catch (e) {
        debugPrint('Failed to load income: $e');
      }

      final List<Map<String, dynamic>> transactionList = [];

      for (var inc in incomeList) {
        final cust = inc['Customer'] as Map<String, dynamic>?;

        String custName = 'Walk-in Customer';

        if (cust != null) {
          custName = (cust['shopName'] ?? cust['ownerName'] ?? 'Customer')
              .toString();
        }

        final desc = (inc['description'] ?? 'Product Sale').toString();

        final amt = inc['amount'];

        final payMethod = (inc['paymentMethod'] ?? 'Cash').toString();

        final date = inc['date'] ?? inc['createdAt'];

        transactionList.add({
          'id': inc['id'],
          'type': inc['type'] ?? 'Sale',
          'productName': desc,
          'quantity': '1',
          'amount': amt,
          'customerName': custName,
          'paymentMethod': payMethod,
          'createdAt': date,
          'status': 'Completed',
        });
      }

      for (var tx in txList) {
        final txId = tx['id'];

        bool exists = transactionList.any((t) => t['id'] == txId);

        if (!exists) {
          transactionList.add({
            'id': txId,
            'type': tx['type'] ?? 'Sale',
            'productName': tx['productName'] ?? 'Product Sale',
            'quantity': tx['quantity'] ?? '1',
            'amount': tx['amount'],
            'customerName': tx['customerName'] ?? 'Walk-in Customer',
            'paymentMethod': tx['paymentMethod'] ?? 'Cash',
            'createdAt': tx['createdAt'],
            'status': tx['status'] ?? 'Completed',
          });
        }
      }

      if (mounted) {
        setState(() {
          allDeliveries = deliveries;
          transactions = transactionList;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          errorMessage = e.toString().replaceFirst('Exception: ', '');
          isLoading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load data: $errorMessage'),
            backgroundColor: AppColors.badgeRedIcon,
          ),
        );
      }
    }
  }

  Future<void> _updateDeliveryStatus(
    Map<String, dynamic> delivery,
    String status,
  ) async {
    final deliveryId = delivery['id']?.toString();

    if (deliveryId == null || updatingDeliveryId != null) {
      return;
    }

    setState(() {
      updatingDeliveryId = deliveryId;
    });

    try {
      await DeliveryAPI.updateDeliveryStatus(deliveryId, {'status': status});

      await _fetchData();

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Delivery marked as $status')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update delivery: $e'),
            backgroundColor: AppColors.badgeRedIcon,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          updatingDeliveryId = null;
        });
      }
    }
  }

  List<Map<String, dynamic>> _getFilteredDeliveries() {
    if (selectedFilter == 'All') {
      return allDeliveries;
    }

    return allDeliveries
        .where(
          (d) =>
              (d['status'] ?? '').toString().toLowerCase() ==
              selectedFilter.toLowerCase(),
        )
        .toList();
  }

  List<Map<String, dynamic>> _getFilteredTransactions() {
    if (txSearchQuery.trim().isEmpty) {
      return transactions;
    }

    final query = txSearchQuery.toLowerCase();

    return transactions.where((tx) {
      final cust = (tx['customerName'] ?? '').toString().toLowerCase();

      final prod = (tx['productName'] ?? '').toString().toLowerCase();

      final method = (tx['paymentMethod'] ?? '').toString().toLowerCase();

      return cust.contains(query) ||
          prod.contains(query) ||
          method.contains(query);
    }).toList();
  }

  Map<String, int> _calculateStats() {
    return {
      'Total': allDeliveries.length,
      'Pending': allDeliveries
          .where(
            (d) => (d['status'] ?? '').toString().toLowerCase() == 'pending',
          )
          .length,
      'In Transit': allDeliveries
          .where(
            (d) => (d['status'] ?? '').toString().toLowerCase() == 'in transit',
          )
          .length,
      'Delivered': allDeliveries
          .where(
            (d) => (d['status'] ?? '').toString().toLowerCase() == 'delivered',
          )
          .length,
      'Failed': allDeliveries
          .where(
            (d) => (d['status'] ?? '').toString().toLowerCase() == 'failed',
          )
          .length,
    };
  }

  double _calculateTotalRevenue() {
    double total = 0.0;

    for (var tx in transactions) {
      if (tx['amount'] != null) {
        final val = double.tryParse(tx['amount'].toString()) ?? 0.0;

        total += val;
      }
    }

    return total;
  }

  // ------------------------------------------------------------
  // BUILD
  // ------------------------------------------------------------

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
            'Deliveries & Sales',
            style: TextStyle(
              color: _primaryTextColor,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),

          actions: [
            IconButton(
              icon: Icon(Icons.refresh_rounded, color: _primaryTextColor),
              onPressed: _fetchData,
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
            : RefreshIndicator(
                onRefresh: _fetchData,
                color: AppColors.primary,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildMainTabs(),

                      const SizedBox(height: 20),

                      if (activeMainTab == 'deliveries') ...[
                        _buildDeliveryHeader(),

                        const SizedBox(height: 18),

                        _buildStatsSection(),

                        const SizedBox(height: 18),

                        _buildFilterBar(),

                        const SizedBox(height: 18),

                        _buildDeliveriesSection(),
                      ] else ...[
                        _buildTransactionsTabContent(),
                      ],

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  // ------------------------------------------------------------
  // DRAWER WITH DARK / LIGHT MODE
  // ------------------------------------------------------------

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: _cardColor,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
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
                _buildDrawerMenuItem('Dashboard', Icons.dashboard_rounded, () {
                  Navigator.pop(context);
                  widget.onTabSelect?.call(0);
                }),

                _buildDrawerMenuItem(
                  'My Deliveries',
                  Icons.local_shipping_rounded,
                  () {
                    Navigator.pop(context);
                  },
                  isSelected: true,
                ),

                _buildDrawerMenuItem(
                  'My Vehicle Inventory',
                  Icons.directions_car_rounded,
                  () {
                    Navigator.pop(context);
                    widget.onTabSelect?.call(2);
                  },
                ),

                _buildDrawerMenuItem('Settings', Icons.settings_rounded, () {
                  Navigator.pop(context);
                  widget.onTabSelect?.call(3);
                }),

                const SizedBox(height: 12),

                // Theme switch
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

  // ------------------------------------------------------------
  // MAIN TABS
  // ------------------------------------------------------------

  Widget _buildMainTabs() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: _isDarkMode ? const Color(0xFF2A2A2A) : AppColors.borderLight,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          _buildMainTabButton(
            'Delivery Schedule',
            'deliveries',
            Icons.local_shipping_rounded,
          ),
          _buildMainTabButton(
            'Sales Transactions',
            'transactions',
            Icons.receipt_long_rounded,
          ),
        ],
      ),
    );
  }

  Widget _buildMainTabButton(String label, String tabId, IconData icon) {
    final isActive = activeMainTab == tabId;

    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            activeMainTab = tabId;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? _cardColor : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive && !_isDarkMode
                ? const [
                    BoxShadow(
                      color: Color(0x0A000000),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isActive ? AppColors.primary : _secondaryTextColor,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                  color: isActive ? AppColors.primary : _secondaryTextColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeliveryHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Delivery Schedule',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Track & manage your assigned customer orders',
          style: TextStyle(fontSize: 13, color: _secondaryTextColor),
        ),
      ],
    );
  }

  // ------------------------------------------------------------
  // STATS
  // ------------------------------------------------------------

  Widget _buildStatsSection() {
    final stats = _calculateStats();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildStatCard(
            'Total',
            stats['Total'].toString(),
            AppColors.badgeBlueBg,
            AppColors.badgeBlueIcon,
            Icons.inventory_2_outlined,
          ),
          const SizedBox(width: 10),
          _buildStatCard(
            'Pending',
            stats['Pending'].toString(),
            AppColors.badgeOrangeBg,
            AppColors.badgeOrangeIcon,
            Icons.schedule_rounded,
          ),
          const SizedBox(width: 10),
          _buildStatCard(
            'In Transit',
            stats['In Transit'].toString(),
            AppColors.badgePurpleBg,
            AppColors.badgePurpleIcon,
            Icons.local_shipping_outlined,
          ),
          const SizedBox(width: 10),
          _buildStatCard(
            'Delivered',
            stats['Delivered'].toString(),
            AppColors.badgeGreenBg,
            AppColors.badgeGreenIcon,
            Icons.task_alt_rounded,
          ),
          const SizedBox(width: 10),
          _buildStatCard(
            'Failed',
            stats['Failed'].toString(),
            AppColors.badgeRedBg,
            AppColors.badgeRedIcon,
            Icons.cancel_outlined,
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    String title,
    String value,
    Color bg,
    Color fg,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: _cardDecoration,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _isDarkMode ? fg.withOpacity(0.18) : bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: fg),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: _secondaryTextColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: fg,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------

  Widget _buildFilterBar() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filterOptions.map((filter) {
          final isSelected = selectedFilter == filter;

          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(filter),
              selected: isSelected,
              onSelected: (_) {
                setState(() {
                  selectedFilter = filter;
                });
              },
              selectedColor: AppColors.primary,
              backgroundColor: _cardColor,
              labelStyle: TextStyle(
                color: isSelected ? Colors.white : _primaryTextColor,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                fontSize: 13,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              side: BorderSide(
                color: isSelected ? AppColors.primary : _borderColor,
                width: 1,
              ),
              showCheckmark: false,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ------------------------------------------------------------
  // DELIVERIES
  // ------------------------------------------------------------

  Widget _buildDeliveriesSection() {
    final filteredDeliveries = _getFilteredDeliveries();

    if (filteredDeliveries.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 48),
        decoration: _cardDecoration,
        child: Column(
          children: [
            Icon(
              Icons.local_shipping_outlined,
              size: 48,
              color: _mutedTextColor,
            ),
            const SizedBox(height: 12),
            Text(
              'No Deliveries Found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: _primaryTextColor,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'There are no $selectedFilter deliveries right now.',
              style: TextStyle(fontSize: 13, color: _secondaryTextColor),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredDeliveries.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _buildDeliveryCard(filteredDeliveries[index]);
      },
    );
  }

  Widget _buildDeliveryCard(Map<String, dynamic> delivery) {
    final deliveryId = delivery['id']?.toString();

    final status = (delivery['status'] ?? 'Pending').toString();

    final customer = delivery['Customer'] as Map<String, dynamic>? ?? {};

    final customerName =
        customer['shopName'] ?? customer['name'] ?? 'Unknown Customer';

    final customerAddress = customer['address'] ?? 'N/A';

    final customerCity = customer['city'] ?? '';

    final customerPhone = customer['phone'] ?? 'N/A';

    final productName = delivery['productName'] ?? 'Aqua Water Container';

    final quantity = delivery['quantity']?.toString() ?? '0';

    final location =
        '$customerAddress${customerCity.isNotEmpty ? ', $customerCity' : ''}';

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
                child: Text(
                  customerName.toString(),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: _primaryTextColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              _buildStatusBadge(status),
            ],
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 15,
                color: AppColors.primary,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  location,
                  style: TextStyle(fontSize: 13, color: _secondaryTextColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),

          const SizedBox(height: 6),

          Row(
            children: [
              Icon(Icons.phone_outlined, size: 15, color: _mutedTextColor),
              const SizedBox(width: 6),
              Text(
                customerPhone.toString(),
                style: TextStyle(fontSize: 13, color: _secondaryTextColor),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _isDarkMode
                  ? const Color(0xFF292929)
                  : AppColors.scaffoldBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _borderColor),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PRODUCT',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _mutedTextColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      productName.toString(),
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _primaryTextColor,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'QUANTITY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _mutedTextColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$quantity Units',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          if (status.toLowerCase() == 'pending')
            Padding(
              padding: const EdgeInsets.only(top: 14),
              child: SizedBox(
                width: double.infinity,
                height: 44,
                child: ElevatedButton.icon(
                  onPressed: updatingDeliveryId == deliveryId
                      ? null
                      : () => _updateDeliveryStatus(delivery, 'In Transit'),
                  icon: const Icon(Icons.navigation_rounded, size: 18),
                  label: const Text('Start Delivery'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ),

          if (status.toLowerCase() == 'in transit')
            Padding(
              padding: const EdgeInsets.only(top: 14),
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton.icon(
                        onPressed: updatingDeliveryId == deliveryId
                            ? null
                            : () =>
                                  _updateDeliveryStatus(delivery, 'Delivered'),
                        icon: const Icon(Icons.check_circle_outline, size: 18),
                        label: const Text('Mark Delivered'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.badgeGreenIcon,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  Expanded(
                    child: SizedBox(
                      height: 44,
                      child: ElevatedButton.icon(
                        onPressed: updatingDeliveryId == deliveryId
                            ? null
                            : () => _updateDeliveryStatus(delivery, 'Failed'),
                        icon: const Icon(Icons.cancel_outlined, size: 18),
                        label: const Text('Mark Failed'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.badgeRedIcon,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // TRANSACTIONS
  // ------------------------------------------------------------

  Widget _buildTransactionsTabContent() {
    final filteredTx = _getFilteredTransactions();

    final totalRev = _calculateTotalRevenue();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Sales Transactions History',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'View all customer sales, distributions & cash receipts',
              style: TextStyle(fontSize: 13, color: _secondaryTextColor),
            ),
          ],
        ),

        const SizedBox(height: 18),

        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: _cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TOTAL SALES',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _mutedTextColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.badgeGreenBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.receipt_rounded,
                            size: 16,
                            color: AppColors.badgeGreenIcon,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    Text(
                      '${transactions.length}',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: _primaryTextColor,
                      ),
                    ),

                    const SizedBox(height: 2),

                    Text(
                      'Completed Transactions',
                      style: TextStyle(
                        fontSize: 11,
                        color: _secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(width: 12),

            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: _cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'TOTAL REVENUE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: _mutedTextColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.badgeBlueBg,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.payments_rounded,
                            size: 16,
                            color: AppColors.badgeBlueIcon,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    const Text(''),

                    Text(
                      'Rs ${totalRev.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),

                    const SizedBox(height: 2),

                    Text(
                      'Collected Cash / Credit',
                      style: TextStyle(
                        fontSize: 11,
                        color: _secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 18),

        TextField(
          controller: _txSearchController,
          onChanged: (val) {
            setState(() {
              txSearchQuery = val;
            });
          },
          style: TextStyle(color: _primaryTextColor),
          decoration: InputDecoration(
            hintText: 'Search customer, product or payment...',
            hintStyle: TextStyle(color: _secondaryTextColor),
            prefixIcon: Icon(
              Icons.search_rounded,
              color: _mutedTextColor,
              size: 20,
            ),
            suffixIcon: txSearchQuery.isNotEmpty
                ? IconButton(
                    icon: Icon(
                      Icons.clear_rounded,
                      size: 18,
                      color: _mutedTextColor,
                    ),
                    onPressed: () {
                      _txSearchController.clear();

                      setState(() {
                        txSearchQuery = '';
                      });
                    },
                  )
                : null,
            filled: true,
            fillColor: _cardColor,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
          ),
        ),

        const SizedBox(height: 18),

        if (filteredTx.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 48),
            decoration: _cardDecoration,
            child: Column(
              children: [
                Icon(
                  Icons.receipt_long_outlined,
                  size: 48,
                  color: _mutedTextColor,
                ),
                const SizedBox(height: 12),
                Text(
                  'No Transactions Found',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: _primaryTextColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'No recorded sales match your search.',
                  style: TextStyle(fontSize: 13, color: _secondaryTextColor),
                ),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filteredTx.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              return _buildTransactionCard(filteredTx[index]);
            },
          ),
      ],
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> tx) {
    final custName = (tx['customerName'] ?? 'Walk-in Customer').toString();

    final pName = (tx['productName'] ?? 'Product Sale').toString();

    final qty = (tx['quantity'] ?? '1').toString();

    final amountVal = tx['amount'] != null
        ? double.tryParse(tx['amount'].toString()) ?? 0.0
        : 0.0;

    final amountStr = 'Rs ${amountVal.toStringAsFixed(2)}';

    final payMethod = (tx['paymentMethod'] ?? 'Cash').toString();

    final dateRaw = (tx['createdAt'] ?? tx['date'] ?? '').toString();

    final dateStr = dateRaw.contains('T')
        ? dateRaw.split('T')[0]
        : (dateRaw.isNotEmpty ? dateRaw : 'Today');

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
                        color: AppColors.badgeGreenBg,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.shopping_bag_outlined,
                        color: AppColors.badgeGreenIcon,
                        size: 20,
                      ),
                    ),

                    const SizedBox(width: 12),

                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            custName,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: _primaryTextColor,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Date: $dateStr',
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

              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.badgeGreenBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'COMPLETED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.badgeGreenText,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          Divider(color: _borderColor, height: 1),

          const SizedBox(height: 12),

          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PRODUCT & QTY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _mutedTextColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$pName ($qty)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _primaryTextColor,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          payMethod,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ),

                      const SizedBox(width: 4),

                      Text(
                        amountStr,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // STATUS BADGE
  // ------------------------------------------------------------

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;

    switch (status.toLowerCase()) {
      case 'delivered':
        bg = AppColors.badgeGreenBg;
        fg = AppColors.badgeGreenIcon;
        break;

      case 'in transit':
        bg = AppColors.badgePurpleBg;
        fg = AppColors.badgePurpleIcon;
        break;

      case 'failed':
        bg = AppColors.badgeRedBg;
        fg = AppColors.badgeRedIcon;
        break;

      default:
        bg = AppColors.badgeOrangeBg;
        fg = AppColors.badgeOrangeIcon;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: fg),
      ),
    );
  }
}
