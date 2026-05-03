import 'package:flutter/material.dart';
import '../models/model.dart';
import 'dashboard-screen.dart';
import 'my-deliveries-screen.dart';
import 'my-vehicle-inventory-screen.dart';
import 'settings-screen.dart';

class NavigationShellScreen extends StatefulWidget {
  final User user;

  const NavigationShellScreen({super.key, required this.user});

  @override
  State<NavigationShellScreen> createState() => _NavigationShellScreenState();
}

class _NavigationShellScreenState extends State<NavigationShellScreen> {
  int _selectedIndex = 0;

  late List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      DashboardScreen(user: widget.user),
      MyDeliveriesScreen(user: widget.user),
      MyVehicleInventoryScreen(user: widget.user),
      SettingsScreen(user: widget.user),
    ];
  }

  void _onNavItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          backgroundColor: Colors.white,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          currentIndex: _selectedIndex,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(
              icon: Icon(Icons.local_shipping),
              label: 'Deliveries',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.directions_car),
              label: 'Vehicle',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings),
              label: 'Settings',
            ),
          ],
          onTap: _onNavItemTapped,
        ),
      ),
    );
  }
}
