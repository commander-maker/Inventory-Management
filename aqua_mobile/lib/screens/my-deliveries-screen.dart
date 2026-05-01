import 'package:flutter/material.dart';
import '../models/model.dart';
import '../services/api_service.dart';

class MyDeliveriesScreen extends StatefulWidget {
  final User user;

  const MyDeliveriesScreen({super.key, required this.user});

  @override
  State<MyDeliveriesScreen> createState() => _MyDeliveriesScreenState();
}

class _MyDeliveriesScreenState extends State<MyDeliveriesScreen> {
  String selectedFilter = 'All';
  final List<String> filterOptions = [
    'All',
    'Pending',
    'In Transit',
    'Delivered',
    'Failed',
  ];

  late List<Map<String, dynamic>> allDeliveries = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchDeliveries();
  }

  Future<void> _fetchDeliveries() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final deliveries = await DeliveryAPI.getMyDeliveries();
      setState(() {
        allDeliveries = deliveries;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load deliveries: $errorMessage')),
      );
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        automaticallyImplyLeading: false,
        title: const Text(
          'My Deliveries',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.black),
            onPressed: _fetchDeliveries,
          ),
        ],
      ),
      body: Container(
        color: Colors.grey.shade50,
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                ),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Section
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'My Deliveries',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'View and update your assigned deliveries',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Stats Cards
                    _buildStatsSection(),
                    const SizedBox(height: 24),
                    // Filter Buttons
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: filterOptions.map((filter) {
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: FilterChip(
                              label: Text(
                                filter,
                                style: TextStyle(
                                  color: selectedFilter == filter
                                      ? Colors.white
                                      : Colors.black,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              onSelected: (bool isSelected) {
                                setState(() {
                                  selectedFilter = filter;
                                });
                              },
                              backgroundColor: selectedFilter == filter
                                  ? Colors.blue
                                  : Colors.white,
                              side: BorderSide(
                                color: selectedFilter == filter
                                    ? Colors.blue
                                    : Colors.grey.shade300,
                                width: 1,
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Deliveries List or Empty State
                    _buildDeliveriesSection(),
                    const SizedBox(height: 24),
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
            Colors.grey,
            Icons.local_shipping,
          ),
          const SizedBox(width: 12),
          _buildStatCard(
            'Pending',
            stats['Pending'].toString(),
            Colors.orange,
            Icons.history,
          ),
          const SizedBox(width: 12),
          _buildStatCard(
            'In Transit',
            stats['In Transit'].toString(),
            Colors.blue,
            Icons.directions_car,
          ),
          const SizedBox(width: 12),
          _buildStatCard(
            'Delivered',
            stats['Delivered'].toString(),
            Colors.green,
            Icons.check_circle,
          ),
          const SizedBox(width: 12),
          _buildStatCard(
            'Failed',
            stats['Failed'].toString(),
            Colors.red,
            Icons.cancel,
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
        padding: const EdgeInsets.symmetric(vertical: 60),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200, width: 0.5),
        ),
        child: Column(
          children: [
            Icon(Icons.local_shipping, size: 64, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            const Text(
              'No Deliveries Found',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You don\'t have any $selectedFilter deliveries.',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredDeliveries.length,
      itemBuilder: (context, index) {
        final delivery = filteredDeliveries[index];
        return _buildDeliveryCard(delivery);
      },
    );
  }

  Widget _buildDeliveryCard(Map<String, dynamic> delivery) {
    final status = delivery['status'] ?? 'Pending';
    final statusColor = _getStatusColor(status);

    // Extract customer info from the Customer object
    final customer = delivery['Customer'] as Map<String, dynamic>? ?? {};
    final customerName = customer['shopName'] ?? 'Unknown Customer';
    final customerAddress = customer['address'] ?? 'N/A';
    final customerCity = customer['city'] ?? '';
    final customerPhone = customer['phone'] ?? 'N/A';

    // Extract order info
    final productName = delivery['productName'] ?? 'N/A';
    final quantity = delivery['quantity'] ?? '0';

    // Format location
    final location =
        '$customerAddress${customerCity.isNotEmpty ? ', $customerCity' : ''}';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200, width: 0.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
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
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.location_on, size: 14, color: Colors.grey.shade600),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  location,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.phone, size: 14, color: Colors.grey.shade600),
              const SizedBox(width: 6),
              Text(
                customerPhone,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Product',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      productName,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Quantity',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      quantity,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (status.toLowerCase() != 'delivered' &&
              status.toLowerCase() != 'failed')
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Handle delivery action
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Starting delivery for $customerName'),
                        backgroundColor: Colors.blue,
                      ),
                    );
                  },
                  icon: const Icon(Icons.check_circle, size: 18),
                  label: const Text('Start Delivery'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'in transit':
        return Colors.blue;
      case 'delivered':
        return Colors.green;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildStatCard(
    String title,
    String value,
    Color color,
    IconData icon,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 8),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
