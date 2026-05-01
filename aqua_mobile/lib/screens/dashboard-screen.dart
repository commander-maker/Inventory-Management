import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      // Fetch deliveries and vehicle data in parallel
      final deliveriesResult = await DeliveryAPI.getMyDeliveries();
      final vehicleResult = await VehicleAPI.getMyVehicle();

      setState(() {
        deliveries = deliveriesResult;
        vehicleData = vehicleResult;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
        isLoading = false;
      });
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a1f3a),
        elevation: 0,
        title: const Text(
          'AQUA',
          style: TextStyle(
            color: Colors.blue,
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        leading: Builder(
          builder: (BuildContext context) {
            return IconButton(
              icon: const Icon(Icons.menu, color: Colors.white),
              onPressed: () {
                Scaffold.of(context).openDrawer();
              },
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.red),
            onPressed: _handleLogout,
          ),
        ],
      ),
      drawer: _buildDrawerMenu(),
      body: Container(
        color: const Color(0xFF1a1f3a),
        child: isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                ),
              )
            : SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Dashboard Header
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Agent Dashboard',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Welcome back, ${widget.user.name}!',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade400,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                    // Stats Cards - 2x2 Grid
                    _buildStatsGrid(),
                    const SizedBox(height: 24),
                    // Today's Deliveries Section
                    _buildTodaysDeliveries(),
                    const SizedBox(height: 24),
                    // Vehicle Status Section
                    _buildVehicleStatus(),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    final stats = _calculateStats();
    final vehicleReg = vehicleData?['registration'] ?? 'N/A';

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.2,
      children: [
        _buildDashboardStatCard(
          'Assigned Vehicle',
          vehicleReg,
          Icons.directions_car,
        ),
        _buildDashboardStatCard('Monthly Sales', 'Rs 0', Icons.trending_up),
        _buildDashboardStatCard(
          'Deliveries Today',
          stats['total'].toString(),
          Icons.local_shipping,
        ),
        _buildDashboardStatCard(
          'Completed Today',
          stats['delivered'].toString(),
          Icons.check_circle,
        ),
      ],
    );
  }

  Widget _buildDashboardStatCard(String title, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF252d48),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade700, width: 0.5),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.blue.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: Colors.blue.shade300, size: 24),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
          ),
        ],
      ),
    );
  }

  Widget _buildTodaysDeliveries() {
    final todaysDeliveries = deliveries
        .where(
          (d) =>
              (d['status'] ?? '').toString().toLowerCase() == 'pending' ||
              (d['status'] ?? '').toString().toLowerCase() == 'in transit',
        )
        .take(1)
        .toList();

    if (todaysDeliveries.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF252d48),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade700, width: 0.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Today\'s Deliveries',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Your scheduled deliveries for today',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${deliveries.length} Total',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'No active deliveries right now',
                style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
              ),
            ),
          ],
        ),
      );
    }

    final delivery = todaysDeliveries.first;
    final customer = delivery['Customer'] as Map<String, dynamic>? ?? {};
    final customerName = customer['shopName'] ?? 'Unknown';
    final status = delivery['status'] ?? 'Pending';
    final statusColor = _getStatusColor(status);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF252d48),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade700, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Today\'s Deliveries',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Your scheduled deliveries for today',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${deliveries.length} Total',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customerName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 12,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            '${customer['address'] ?? 'N/A'}, ${customer['city'] ?? ''}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey.shade400,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Status: $status',
                      style: TextStyle(
                        fontSize: 12,
                        color: statusColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
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
                child: Icon(Icons.info, color: statusColor, size: 20),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleStatus() {
    if (vehicleData == null) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF252d48),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade700, width: 0.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.directions_car,
                  color: Colors.blue.shade300,
                  size: 20,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Vehicle Status',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                'No vehicle assigned',
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ),
          ],
        ),
      );
    }

    final registration = vehicleData?['registration'] ?? 'N/A';
    final type = vehicleData?['type'] ?? 'N/A';
    final location = vehicleData?['location'] ?? 'N/A';
    final status = vehicleData?['status'] ?? 'Active';
    final fuelLevel = vehicleData?['fuelLevel'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF252d48),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade700, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.directions_car, color: Colors.blue.shade300, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Vehicle Status',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildVehicleInfoRow('Registration', registration),
          const SizedBox(height: 12),
          _buildVehicleInfoRow('Type', type),
          const SizedBox(height: 12),
          _buildVehicleInfoRowWithIcon('Location', location, Icons.location_on),
          const SizedBox(height: 12),
          _buildVehicleStatusRow('Status', status, Colors.green),
          const SizedBox(height: 12),
          _buildFuelLevelRow('Fuel Level', fuelLevel is int ? fuelLevel : 0),
          const SizedBox(height: 12),
          _buildVehicleInfoRow('Last Service', '5 days ago'),
        ],
      ),
    );
  }

  Widget _buildVehicleInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildVehicleInfoRowWithIcon(
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
        Row(
          children: [
            Icon(icon, size: 14, color: Colors.blue.shade300),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ],
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

  Widget _buildVehicleStatusRow(String label, String value, Color statusColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 13, color: Colors.grey.shade400),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: statusColor,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFuelLevelRow(String label, int percentage) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade400),
            ),
            Text(
              '$percentage%',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: percentage / 100,
            minHeight: 6,
            backgroundColor: Colors.grey.shade700,
            valueColor: AlwaysStoppedAnimation<Color>(
              percentage > 50 ? Colors.green : Colors.orange,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivity() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.blue.shade400, Colors.purple.shade400],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.history, color: Colors.white, size: 24),
              const SizedBox(width: 8),
              const Text(
                'Recent Activity',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text(
                'No recent activity',
                style: TextStyle(fontSize: 14, color: Colors.white),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white30, thickness: 1),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildActivityStat('Total Today', '0'),
              _buildActivityStat('Completed', '0'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivityStat(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.8)),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildDrawerMenu() {
    return Drawer(
      backgroundColor: const Color(0xFF1a1f3a),
      child: Column(
        children: [
          // Drawer Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFF252d48),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: const Center(
                    child: Icon(Icons.person, color: Colors.white, size: 28),
                  ),
                ),
                const SizedBox(width: 12),
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
                          color: Colors.grey.shade400,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Menu Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildDrawerMenuItem('Dashboard', Icons.dashboard, () {
                  Navigator.pop(context);
                }),
                _buildDrawerMenuItem('My Deliveries', Icons.local_shipping, () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          MyDeliveriesScreen(user: widget.user),
                    ),
                  );
                }),
                _buildDrawerMenuItem(
                  'My Vehicle Inventory',
                  Icons.directions_car,
                  () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            MyVehicleInventoryScreen(user: widget.user),
                      ),
                    );
                  },
                ),
                _buildDrawerMenuItem('Settings', Icons.settings, () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => SettingsScreen(user: widget.user),
                    ),
                  );
                }),
              ],
            ),
          ),
          // Logout Button
          Padding(
            padding: const EdgeInsets.all(12),
            child: _buildDrawerMenuItem(
              'Log Out',
              Icons.logout,
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
    bool isLogout = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isLogout
            ? Colors.red.withOpacity(0.1)
            : Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isLogout ? Colors.red : Colors.blue.shade300,
          size: 22,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isLogout ? Colors.red : Colors.white,
          ),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 14,
          color: Colors.grey.shade600,
        ),
        onTap: onTap,
      ),
    );
  }

  void _handleLogout() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to logout?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.pop(context);

                // Clear SharedPreferences
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('token');
                await prefs.remove('user_id');
                await prefs.remove('user_data');

                // Use pushAndRemoveUntil to completely clear navigation stack
                // This ensures the AuthScreen appears immediately after logout
                if (!mounted) return;
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const AuthScreen()),
                  (route) => false,
                );
              },
              child: const Text('Logout'),
            ),
          ],
        );
      },
    );
  }
}
