import 'package:flutter/material.dart';
import '../screens/auth-screen.dart';

class AppRoutes {
  static const String auth = '/';
  static const String dashboard = '/dashboard';
  static const String profile = '/profile';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case auth:
        return MaterialPageRoute(builder: (_) => const AuthScreen());
      case dashboard:
        return MaterialPageRoute(
          builder: (_) => const DummyScreen(title: 'Dashboard'),
        );
      case profile:
        return MaterialPageRoute(
          builder: (_) => const DummyScreen(title: 'Profile'),
        );
      default:
        return MaterialPageRoute(builder: (_) => const AuthScreen());
    }
  }
}

// Placeholder screens for future implementation
class DummyScreen extends StatelessWidget {
  final String title;

  const DummyScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('$title Page - Coming Soon')),
    );
  }
}
