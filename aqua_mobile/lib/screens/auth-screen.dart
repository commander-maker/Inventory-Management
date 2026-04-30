import 'package:flutter/material.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = const Color(0xFF2F67F6);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF2F6FF), Color(0xFFE8F0FF)],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: primary,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x332F67F6),
                            blurRadius: 14,
                            offset: Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.water_drop, color: Colors.white),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'AquaTrack Pro',
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1F2A44),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Login Portal',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF5B6B86),
                      ),
                    ),
                    const SizedBox(height: 28),
                    Card(
                      elevation: 8,
                      shadowColor: const Color(0x1A2F67F6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'Welcome Back',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1F2A44),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Sign in to continue',
                              textAlign: TextAlign.center,
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: const Color(0xFF6B7A95),
                              ),
                            ),
                            const SizedBox(height: 22),
                            Text(
                              'Username',
                              style: theme.textTheme.labelLarge?.copyWith(
                                color: const Color(0xFF344056),
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              decoration: InputDecoration(
                                hintText: 'Enter your username',
                                filled: true,
                                fillColor: const Color(0xFFF7F9FE),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFD9E2F2),
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFD9E2F2),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Password',
                              style: theme.textTheme.labelLarge?.copyWith(
                                color: const Color(0xFF344056),
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextFormField(
                              obscureText: true,
                              decoration: InputDecoration(
                                hintText: 'Enter your password',
                                filled: true,
                                fillColor: const Color(0xFFF7F9FE),
                                suffixIcon: const Icon(
                                  Icons.visibility_off_outlined,
                                  color: Color(0xFF94A3B8),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFD9E2F2),
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFD9E2F2),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            SizedBox(
                              height: 48,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: primary,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () {},
                                child: const Text('Sign In'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'AquaTrack Pro. All rights reserved.',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF7C8AA3),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
