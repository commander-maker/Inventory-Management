import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Single source of truth for the agent app's dark/light mode so every
/// screen toggles and stays in sync together.
class ThemeController {
  static const String _prefsKey = 'agent_dashboard_dark_mode';
  static final ValueNotifier<bool> isDarkMode = ValueNotifier<bool>(false);

  static Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    isDarkMode.value = prefs.getBool(_prefsKey) ?? false;
  }

  static Future<void> toggle(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefsKey, value);
    isDarkMode.value = value;
  }
}

class AppColors {
  // Brand & Primary Palette
  static const Color primary = Color(0xFF2563EB); // Royal Blue
  static const Color primaryLight = Color(0xFFEFF6FF); // Light Blue Tint
  static const Color primaryDark = Color(0xFF1D4ED8);
  static const Color primaryAccent = Color(0xFF3B82F6);

  // Backgrounds & Surfaces
  static const Color scaffoldBackground = Color(0xFFF8FAFC); // Slate 50
  static const Color cardBackground = Colors.white;
  static const Color surfaceHeader = Colors.white;

  // Typography / Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400

  // Borders & Dividers
  static const Color border = Color(0xFFE2E8F0); // Slate 200
  static const Color borderLight = Color(0xFFF1F5F9); // Slate 100

  // Feature Badge Pastel Colors (Web Match)
  // Vehicle Card (Blue)
  static const Color badgeBlueBg = Color(0xFFEFF6FF);
  static const Color badgeBlueIcon = Color(0xFF2563EB);

  // Sales / Completed / Active Status (Green)
  static const Color badgeGreenBg = Color(0xFFDCFCE7);
  static const Color badgeGreenIcon = Color(0xFF16A34A);
  static const Color badgeGreenText = Color(0xFF15803D);

  // Deliveries Today / In Transit (Purple)
  static const Color badgePurpleBg = Color(0xFFF3E8FF);
  static const Color badgePurpleIcon = Color(0xFF9333EA);

  // Completed Today / Pending (Orange/Amber)
  static const Color badgeOrangeBg = Color(0xFFFFEDD5);
  static const Color badgeOrangeIcon = Color(0xFFEA580C);

  // Failed / Danger (Red)
  static const Color badgeRedBg = Color(0xFFFEE2E2);
  static const Color badgeRedIcon = Color(0xFFDC2626);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.scaffoldBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        surface: AppColors.cardBackground,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceHeader,
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.badgeRedIcon),
        ),
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
        labelStyle: const TextStyle(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  // Reusable Container BoxDecorations
  static BoxDecoration cardDecoration = BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: AppColors.border, width: 1),
    boxShadow: const [
      BoxShadow(color: Color(0x08000000), blurRadius: 10, offset: Offset(0, 4)),
    ],
  );

  static BoxDecoration badgeDecoration(Color bgColor, {Color? borderColor}) {
    return BoxDecoration(
      color: bgColor,
      borderRadius: BorderRadius.circular(12),
      border: borderColor != null
          ? Border.all(color: borderColor, width: 1)
          : null,
    );
  }
}
