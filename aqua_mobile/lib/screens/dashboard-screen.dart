import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';
import 'auth-screen.dart';
import 'my-deliveries-screen.dart';
import 'my-vehicle-inventory-screen.dart';
import 'settings-screen.dart';

class DashboardScreen extends StatefulWidget {
  final User user;

  const DashboardScreen({super.key, required this.user});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late List<Map<String, dynamic>> deliveries = [];
  Map<String, dynamic>? vehicleData;
  List<Map<String, dynamic>> recentTransactions = [];
  double monthlySales = 0.0;
  bool isLoading = true;
  String? errorMessage;

  // Dark mode state - Dashboard only
  bool _isDarkMode = false;

  @override
  void initState() {
    super.initState();
    _loadThemePreference();
    _fetchDashboardData();
  }

  // Load saved dashboard theme
  Future<void> _loadThemePreference() async {
    final prefs = await SharedPreferences.getInstance();

    if (!mounted) return;

    setState(() {
      _isDarkMode = prefs.getBool('agent_dashboard_dark_mode') ?? false;
    });
  }

  // Save dashboard theme
  Future<void> _toggleTheme(bool value) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setBool('agent_dashboard_dark_mode', value);

    if (!mounted) return;

    setState(() {
      _isDarkMode = value;
    });
  }

  Future<void> _fetchDashboardData() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final deliveriesResult = await DeliveryAPI.getMyDeliveries();
      final vehicleResult = await VehicleAPI.getMyVehicle();

      // Fetch recent finance transactions & income
      List<Map<String, dynamic>> txList = [];
      List<Map<String, dynamic>> incomeList = [];

      try {
        txList = await FinanceAPI.getRecentTransactions(limit: 5);
        incomeList = await FinanceAPI.getAllIncome();
      } catch (e) {
        debugPrint('Finance API call silent fail: $e');
      }

      double totalSales = 0.0;

      for (var item in incomeList) {
        final amt = item['amount'] != null
            ? double.tryParse(item['amount'].toString()) ?? 0.0
            : 0.0;

        totalSales += amt;
      }

      if (mounted) {
        setState(() {
          deliveries = deliveriesResult;
          vehicleData = vehicleResult;
          recentTransactions = txList;
          monthlySales = totalSales;
          isLoading = false;
        });
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

  int _getDeliveriesCount(String status) {
    return deliveries
        .where(
          (d) =>
              (d['status'] ?? '').toString().toLowerCase() ==
              status.toLowerCase(),
        )
        .length;
  }

  Map<String, int> _calculateStats() {
    return {
      'pending': _getDeliveriesCount('pending'),
      'in transit': _getDeliveriesCount('in transit'),
      'delivered': _getDeliveriesCount('delivered'),
      'failed': _getDeliveriesCount('failed'),
      'total': deliveries.length,
    };
  }

  // Dashboard background
  Color get _backgroundColor =>
      _isDarkMode ? const Color(0xFF121212) : AppColors.scaffoldBackground;

  // Dashboard card background
  Color get _cardColor =>
      _isDarkMode ? const Color(0xFF1E1E1E) : Colors.white;

  // Primary text
  Color get _primaryTextColor =>
      _isDarkMode ? Colors.white : AppColors.textPrimary;

  // Secondary text
  Color get _secondaryTextColor =>
      _isDarkMode ? Colors.white70 : AppColors.textSecondary;

  // Divider/border
  Color get _borderColor =>
      _isDarkMode ? Colors.white12 : AppColors.borderLight;

  // Dashboard card decoration
  BoxDecoration get _dashboardCardDecoration {
    return BoxDecoration(
      color: _cardColor,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(
        color: _borderColor,
      ),
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

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(
        brightness: _isDarkMode ? Brightness.dark : Brightness.light,
        scaffoldBackgroundColor: _backgroundColor,
        cardColor: _cardColor,
        dividerColor: _borderColor,
        colorScheme: Theme.of(context).colorScheme.copyWith(
              brightness:
                  _isDarkMode ? Brightness.dark : Brightness.light,
              surface: _cardColor,
            ),
      ),
      child: Scaffold(
        backgroundColor: _backgroundColor,
        appBar: AppBar(
          backgroundColor: _cardColor,
          elevation: 0,
          scrolledUnderElevation: 0,
          iconTheme: IconThemeData(
            color: _primaryTextColor,
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.water_drop_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'AQUA',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: Icon(
                Icons.notifications_none_rounded,
                color: _primaryTextColor,
              ),
              onPressed: () {},
            ),
            IconButton(
              icon: Icon(
                Icons.refresh_rounded,
                color: _primaryTextColor,
              ),
              onPressed: _fetchDashboardData,
            ),
          ],
        ),
        drawer: _buildDrawerMenu(),
        body: isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor:
                      AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchDashboardData,
                color: AppColors.primary,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildWelcomeHeader(),
                      const SizedBox(height: 20),
                      _buildWebStyleStatGrid(),
                      const SizedBox(height: 20),
                      _buildTodaysDeliveriesCard(),
                      const SizedBox(height: 20),
                      _buildVehicleStatusCard(),
                      const SizedBox(height: 20),
                      _buildRecentDeliveriesSection(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Agent Dashboard',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Welcome back, ${widget.user.name}!',
                    style: TextStyle(
                      fontSize: 14,
                      color: _secondaryTextColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Date Badge
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.access_time_rounded,
                    color: Colors.white,
                    size: 14,
                  ),
                  SizedBox(width: 6),
                  Text(
                    'Monday, August 17, 2026',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWebStyleStatGrid() {
    final stats = _calculateStats();
    final vehicleReg = vehicleData?['registration'] ?? 'V7';

    final salesText = monthlySales > 0
        ? 'Rs ${monthlySales.toStringAsFixed(0)}'
        : 'Rs 0';

    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildMiniStatCard(
          label: 'Assigned Vehicle',
          value: vehicleReg,
          icon: Icons.local_shipping_outlined,
          iconBgColor: AppColors.badgeBlueBg,
          iconColor: AppColors.badgeBlueIcon,
        ),
        _buildMiniStatCard(
          label: 'Monthly Sales',
          value: salesText,
          icon: Icons.trending_up_rounded,
          iconBgColor: AppColors.badgeGreenBg,
          iconColor: AppColors.badgeGreenIcon,
        ),
        _buildMiniStatCard(
          label: 'Deliveries Today',
          value: stats['total'].toString(),
          icon: Icons.inventory_2_outlined,
          iconBgColor: AppColors.badgePurpleBg,
          iconColor: AppColors.badgePurpleIcon,
        ),
        _buildMiniStatCard(
          label: 'Completed Today',
          value: stats['delivered'].toString(),
          icon: Icons.task_alt_rounded,
          iconBgColor: AppColors.badgeOrangeBg,
          iconColor: AppColors.badgeOrangeIcon,
        ),
      ],
    );
  }

  Widget _buildMiniStatCard({
    required String label,
    required String value,
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: _dashboardCardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: _secondaryTextColor,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconBgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: iconColor,
                  size: 18,
                ),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: _primaryTextColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaysDeliveriesCard() {
    final stats = _calculateStats();
    final todayDeliveries = deliveries;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _dashboardCardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Today's Deliveries",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _primaryTextColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Your scheduled deliveries for today',
                    style: TextStyle(
                      fontSize: 12,
                      color: _secondaryTextColor,
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
                  border: Border.all(
                    color: AppColors.primary.withOpacity(0.2),
                  ),
                ),
                child: Text(
                  '${stats['total']} Total',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (todayDeliveries.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.inventory_outlined,
                      size: 40,
                      color: _secondaryTextColor,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No deliveries assigned yet',
                      style: TextStyle(
                        fontSize: 14,
                        color: _secondaryTextColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: todayDeliveries.take(3).length,
              separatorBuilder: (_, __) => Divider(
                color: _borderColor,
                height: 16,
              ),
              itemBuilder: (context, index) {
                final d = todayDeliveries[index];

                final customer =
                    d['Customer'] as Map<String, dynamic>? ?? {};

                final status =
                    (d['status'] ?? 'Pending').toString();

                return Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _getStatusBgColor(status),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _getStatusIcon(status),
                        color: _getStatusTextColor(status),
                        size: 18,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            customer['shopName'] ??
                                customer['name'] ??
                                'Customer #${d['id']}',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _primaryTextColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            customer['address'] ??
                                'No address listed',
                            style: TextStyle(
                              fontSize: 12,
                              color: _secondaryTextColor,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    _buildStatusPill(status),
                  ],
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildVehicleStatusCard() {
    final reg = vehicleData?['registration'] ?? 'V7';
    final type = vehicleData?['type'] ?? 'Tata Ace';
    final location = vehicleData?['location'] ?? 'Colombo 07';
    final status = vehicleData?['status'] ?? 'Active';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _dashboardCardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(
                Icons.local_shipping_rounded,
                color: AppColors.primary,
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'Vehicle Status',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildDetailRow('Registration', reg.toString()),
          const SizedBox(height: 10),
          _buildDetailRow('Type', type.toString()),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Location',
                style: TextStyle(
                  color: _secondaryTextColor,
                  fontSize: 13,
                ),
              ),
              Row(
                children: [
                  const Icon(
                    Icons.location_on_outlined,
                    size: 14,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    location.toString(),
                    style: TextStyle(
                      color: _primaryTextColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Status',
                style: TextStyle(
                  color: _secondaryTextColor,
                  fontSize: 13,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 3,
                ),
                decoration: BoxDecoration(
                  color: AppColors.badgeGreenBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status.toString(),
                  style: const TextStyle(
                    color: AppColors.badgeGreenText,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Fuel Level',
                    style: TextStyle(
                      color: _secondaryTextColor,
                      fontSize: 13,
                    ),
                  ),
                  Text(
                    '75%',
                    style: TextStyle(
                      color: _primaryTextColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: const LinearProgressIndicator(
                  value: 0.75,
                  minHeight: 8,
                  backgroundColor: AppColors.borderLight,
                  valueColor:
                      AlwaysStoppedAnimation<Color>(
                    AppColors.badgeGreenIcon,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentDeliveriesSection() {
    if (recentTransactions.isNotEmpty) {
      return Container(
        padding: const EdgeInsets.all(18),
        decoration: _dashboardCardDecoration,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment:
                  MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Transactions',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: _primaryTextColor,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.badgeGreenBg,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Live Activity',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.badgeGreenText,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            ListView.separated(
              shrinkWrap: true,
              physics:
                  const NeverScrollableScrollPhysics(),
              itemCount:
                  recentTransactions.take(4).length,
              separatorBuilder: (_, __) => Divider(
                color: _borderColor,
                height: 16,
              ),
              itemBuilder: (context, index) {
                final tx = recentTransactions[index];

                final custName =
                    tx['customerName'] ?? 'Customer';

                final pName =
                    tx['productName'] ?? 'Product';

                final qty = tx['quantity'] ?? '1';

                final amountVal = tx['amount'] != null
                    ? double.tryParse(
                            tx['amount'].toString()) ??
                        0.0
                    : 0.0;

                final amountStr =
                    'Rs ${amountVal.toStringAsFixed(0)}';

                return Row(
                  mainAxisAlignment:
                      MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment:
                            CrossAxisAlignment.start,
                        children: [
                          Text(
                            custName.toString(),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight:
                                  FontWeight.w600,
                              color: _primaryTextColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '$pName • Qty: $qty',
                            style: TextStyle(
                              fontSize: 12,
                              color:
                                  _secondaryTextColor,
                            ),
                            maxLines: 1,
                            overflow:
                                TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      amountStr,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      );
    }

    final recent = deliveries.take(3).toList();

    if (recent.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _dashboardCardDecoration,
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            'Recent Activity',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: _primaryTextColor,
            ),
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics:
                const NeverScrollableScrollPhysics(),
            itemCount: recent.length,
            separatorBuilder: (_, __) => Divider(
              color: _borderColor,
              height: 16,
            ),
            itemBuilder: (context, index) {
              final d = recent[index];

              final customer =
                  d['Customer']
                      as Map<String, dynamic>? ??
                  {};

              final status =
                  (d['status'] ?? 'Pending').toString();

              return Row(
                mainAxisAlignment:
                    MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          customer['shopName'] ??
                              'Customer Order',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight:
                                FontWeight.w600,
                            color: _primaryTextColor,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          customer['address'] ??
                              'Colombo, Sri Lanka',
                          style: TextStyle(
                            fontSize: 12,
                            color:
                                _secondaryTextColor,
                          ),
                          maxLines: 1,
                          overflow:
                              TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  _buildStatusPill(status),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment:
          MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: _secondaryTextColor,
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: _primaryTextColor,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusPill(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: _getStatusBgColor(status),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: _getStatusTextColor(status),
        ),
      ),
    );
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return Icons.check_circle_outline_rounded;
      case 'in transit':
        return Icons.local_shipping_outlined;
      case 'failed':
        return Icons.error_outline_rounded;
      default:
        return Icons.schedule_rounded;
    }
  }

  Color _getStatusBgColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return AppColors.badgeGreenBg;
      case 'in transit':
        return AppColors.badgePurpleBg;
      case 'failed':
        return AppColors.badgeRedBg;
      default:
        return AppColors.badgeOrangeBg;
    }
  }

  Color _getStatusTextColor(String status) {
    switch (status.toLowerCase()) {
      case 'delivered':
        return AppColors.badgeGreenIcon;
      case 'in transit':
        return AppColors.badgePurpleIcon;
      case 'failed':
        return AppColors.badgeRedIcon;
      default:
        return AppColors.badgeOrangeIcon;
    }
  }

  Widget _buildDrawerMenu() {
    return Drawer(
      backgroundColor: _cardColor,
      child: Column(
        children: [
          // Drawer Header
          Container(
            padding: const EdgeInsets.fromLTRB(
              20,
              50,
              20,
              20,
            ),
            decoration: const BoxDecoration(
              color: AppColors.primary,
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color:
                        Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.person,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
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
                          color:
                              Colors.white.withOpacity(
                            0.8,
                          ),
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
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 12,
              ),
              children: [
                _buildDrawerMenuItem(
                  'Dashboard',
                  Icons.dashboard_rounded,
                  () {
                    Navigator.pop(context);
                  },
                  isSelected: true,
                ),

                _buildDrawerMenuItem(
                  'My Deliveries',
                  Icons.local_shipping_rounded,
                  () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            MyDeliveriesScreen(
                          user: widget.user,
                        ),
                      ),
                    );
                  },
                ),

                _buildDrawerMenuItem(
                  'My Vehicle Inventory',
                  Icons.directions_car_rounded,
                  () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            MyVehicleInventoryScreen(
                          user: widget.user,
                        ),
                      ),
                    );
                  },
                ),

                _buildDrawerMenuItem(
                  'Settings',
                  Icons.settings_rounded,
                  () {
                    Navigator.pop(context);

                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            SettingsScreen(
                          user: widget.user,
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 12),

                // =========================================
                // DARK / LIGHT MODE OPTION
                // =========================================
                Container(
                  margin:
                      const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: _isDarkMode
                        ? Colors.white.withOpacity(0.06)
                        : Colors.grey.withOpacity(0.06),
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                  child: SwitchListTile(
                    secondary: Icon(
                      _isDarkMode
                          ? Icons.dark_mode_rounded
                          : Icons.light_mode_rounded,
                      color: AppColors.primary,
                    ),
                    title: Text(
                      _isDarkMode
                          ? 'Dark Mode'
                          : 'Light Mode',
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
        leading: Icon(
          icon,
          color: fg,
          size: 20,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected
                ? FontWeight.bold
                : FontWeight.w500,
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
            style: TextStyle(
              color: _secondaryTextColor,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () =>
                  Navigator.pop(dialogContext),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    AppColors.badgeRedIcon,
              ),
              onPressed: () async {
                Navigator.pop(dialogContext);

                final navigator =
                    Navigator.of(context);

                final prefs =
                    await SharedPreferences
                        .getInstance();

                await prefs.remove('token');
                await prefs.remove('user_id');
                await prefs.remove('user_data');

                if (!mounted) return;

                navigator.pushAndRemoveUntil(
                  MaterialPageRoute(
                    builder: (_) =>
                        const AuthScreen(),
                  ),
                  (route) => false,
                );
              },
              child: const Text(
                'Logout',
                style: TextStyle(
                  color: Colors.white,
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}