import 'package:flutter/material.dart';
import '../core/app_theme.dart';
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
      DashboardScreen(user: widget.user, onTabSelect: _onNavItemTapped),
      MyDeliveriesScreen(user: widget.user, onTabSelect: _onNavItemTapped),
      MyVehicleInventoryScreen(
        user: widget.user,
        onTabSelect: _onNavItemTapped,
      ),
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
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Color(0x08000000),
              blurRadius: 16,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: BottomNavigationBar(
              backgroundColor: Colors.white,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              currentIndex: _selectedIndex,
              selectedItemColor: AppColors.primary,
              unselectedItemColor: AppColors.textMuted,
              selectedFontSize: 12,
              unselectedFontSize: 12,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
              unselectedLabelStyle: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
              items: const [
                BottomNavigationBarItem(
                  icon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(Icons.dashboard_outlined),
                  ),
                  activeIcon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(
                      Icons.dashboard_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                  label: 'Dashboard',
                ),
                BottomNavigationBarItem(
                  icon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(Icons.local_shipping_outlined),
                  ),
                  activeIcon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(Icons.local_shipping, color: AppColors.primary),
                  ),
                  label: 'Deliveries',
                ),
                BottomNavigationBarItem(
                  icon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(Icons.directions_car_outlined),
                  ),
                  activeIcon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(
                      Icons.directions_car_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                  label: 'Vehicle',
                ),
                BottomNavigationBarItem(
                  icon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(Icons.settings_outlined),
                  ),
                  activeIcon: Padding(
                    padding: EdgeInsets.only(bottom: 4),
                    child: Icon(
                      Icons.settings_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                  label: 'Settings',
                ),
              ],
              onTap: _onNavItemTapped,
            ),
          ),
        ),
      ),
    );
  }
}
