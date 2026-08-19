import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';

class MyDeliveriesScreen extends StatefulWidget {
  final User user;

  const MyDeliveriesScreen({super.key, required this.user});

  @override
  State<MyDeliveriesScreen> createState() => _MyDeliveriesScreenState();
}

class _MyDeliveriesScreenState extends State<MyDeliveriesScreen> {
  // Active main tab: 'deliveries' or 'transactions'
  String activeMainTab = 'deliveries';

  // Delivery filters
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

  // Search filter for transactions
  String txSearchQuery = '';
  final TextEditingController _txSearchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
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

      // Build unified transaction list from incomeList and txList
      final List<Map<String, dynamic>> transactionList = [];

      // 1. Process all income records from the backend database
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

      // 2. Merge any recentTransactions items if present
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
    if (deliveryId == null || updatingDeliveryId != null) return;

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
    if (txSearchQuery.trim().isEmpty) return transactions;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: const Text(
          'Deliveries & Sales',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(
              Icons.refresh_rounded,
              color: AppColors.textPrimary,
            ),
            onPressed: _fetchData,
          ),
        ],
      ),
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
                    // Segmented Tab Switcher (Deliveries vs Transactions)
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.borderLight,
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
                    ),
                    const SizedBox(height: 20),

                    // Active Tab View Content
                    if (activeMainTab == 'deliveries') ...[
                      // Header Section
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Delivery Schedule',
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Track & manage your assigned customer orders',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Stats Cards Section
                      _buildStatsSection(),
                      const SizedBox(height: 18),

                      // Filter Chips Bar
                      SingleChildScrollView(
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
                                backgroundColor: Colors.white,
                                labelStyle: TextStyle(
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.textPrimary,
                                  fontWeight: isSelected
                                      ? FontWeight.bold
                                      : FontWeight.w500,
                                  fontSize: 13,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                side: BorderSide(
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.border,
                                  width: 1,
                                ),
                                showCheckmark: false,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 8,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Deliveries List
                      _buildDeliveriesSection(),
                    ] else ...[
                      // Sales Transactions View
                      _buildTransactionsTabContent(),
                    ],

                    const SizedBox(height: 24),
                  ],
                ),
              ),
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
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
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
                color: isActive ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                  color: isActive ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

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
      decoration: AppTheme.cardDecoration,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bg,
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
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
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

  Widget _buildDeliveriesSection() {
    final filteredDeliveries = _getFilteredDeliveries();

    if (filteredDeliveries.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 48),
        decoration: AppTheme.cardDecoration,
        child: Column(
          children: [
            const Icon(
              Icons.local_shipping_outlined,
              size: 48,
              color: AppColors.textMuted,
            ),
            const SizedBox(height: 12),
            const Text(
              'No Deliveries Found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'There are no $selectedFilter deliveries right now.',
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
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
        final delivery = filteredDeliveries[index];
        return _buildDeliveryCard(delivery);
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
      decoration: AppTheme.cardDecoration,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  customerName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
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
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(
                Icons.phone_outlined,
                size: 15,
                color: AppColors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                customerPhone,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Product Details Inner Container
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.scaffoldBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PRODUCT',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      productName,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'QUANTITY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
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

  // --- Transactions Tab Content ---
  Widget _buildTransactionsTabContent() {
    final filteredTx = _getFilteredTransactions();
    final totalRev = _calculateTotalRevenue();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Header
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'Sales Transactions History',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'View all customer sales, distributions & cash receipts',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: 18),

        // Summary Cards (Total Count & Total Revenue)
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: AppTheme.cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'TOTAL SALES',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textMuted,
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
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Completed Transactions',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
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
                decoration: AppTheme.cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'TOTAL REVENUE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textMuted,
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
                    Text(
                      'Rs ${totalRev.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Collected Cash / Credit',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),

        // Search Bar for Transactions
        TextField(
          controller: _txSearchController,
          onChanged: (val) {
            setState(() {
              txSearchQuery = val;
            });
          },
          decoration: InputDecoration(
            hintText: 'Search customer, product or payment...',
            prefixIcon: const Icon(
              Icons.search_rounded,
              color: AppColors.textMuted,
              size: 20,
            ),
            suffixIcon: txSearchQuery.isNotEmpty
                ? IconButton(
                    icon: const Icon(
                      Icons.clear_rounded,
                      size: 18,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () {
                      _txSearchController.clear();
                      setState(() {
                        txSearchQuery = '';
                      });
                    },
                  )
                : null,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 14,
              vertical: 12,
            ),
          ),
        ),
        const SizedBox(height: 18),

        // Transactions List
        if (filteredTx.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 48),
            decoration: AppTheme.cardDecoration,
            child: Column(
              children: const [
                Icon(
                  Icons.receipt_long_outlined,
                  size: 48,
                  color: AppColors.textMuted,
                ),
                SizedBox(height: 12),
                Text(
                  'No Transactions Found',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'No recorded sales match your search.',
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
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
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Date: $dateStr',
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
          const Divider(color: AppColors.borderLight, height: 1),
          const SizedBox(height: 12),
          // Product & Amount Details
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PRODUCT & QTY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$pName ($qty)',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
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
