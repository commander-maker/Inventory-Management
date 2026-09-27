import 'package:flutter/material.dart';
import '../core/app_theme.dart';
import '../models/model.dart';
import '../services/api_service.dart';

class SettingsScreen extends StatefulWidget {
  final User user;

  const SettingsScreen({super.key, required this.user});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String activeTab = 'profile';
  bool showNewPassword = false;
  String saveStatus = '';
  bool isLoading = false;

  late TextEditingController nameController;
  late TextEditingController emailController;
  late TextEditingController phoneController;
  late TextEditingController currentPasswordController;
  late TextEditingController newPasswordController;
  late TextEditingController confirmPasswordController;

  // ------------------------------------------------------------
  // DARK / LIGHT MODE (shared across all screens via ThemeController)
  // ------------------------------------------------------------

  bool get _isDarkMode => ThemeController.isDarkMode.value;

  void _onThemeChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _toggleTheme(bool value) => ThemeController.toggle(value);

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

  BoxDecoration get _cardDecoration => BoxDecoration(
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

  @override
  void initState() {
    super.initState();
    ThemeController.isDarkMode.addListener(_onThemeChanged);
    ThemeController.load();
    nameController = TextEditingController(text: widget.user.name);
    emailController = TextEditingController(text: widget.user.email);
    phoneController = TextEditingController();
    currentPasswordController = TextEditingController();
    newPasswordController = TextEditingController();
    confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
    ThemeController.isDarkMode.removeListener(_onThemeChanged);
    nameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    currentPasswordController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

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
            'Settings',
            style: TextStyle(
              color: _primaryTextColor,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Title
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Account Settings',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Manage your agent profile, credentials & security',
                    style: TextStyle(fontSize: 14, color: _secondaryTextColor),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // Profile Summary Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: _cardDecoration,
                child: Row(
                  children: [
                    Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.person_rounded,
                          color: AppColors.primary,
                          size: 30,
                        ),
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
                                : 'Sales Agent',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: _primaryTextColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.user.email,
                            style: TextStyle(
                              fontSize: 12,
                              color: _secondaryTextColor,
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
                        color: AppColors.badgeBlueBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        widget.user.role.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppColors.badgeBlueIcon,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Tab Switcher Pills
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: _isDarkMode
                      ? const Color(0xFF2A2A2A)
                      : AppColors.borderLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    _buildTabButton('Agent Details', 'profile'),
                    _buildTabButton('Security', 'security'),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Form Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: _cardDecoration,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (activeTab == 'profile') _buildProfileTab(),
                    if (activeTab == 'security') _buildSecurityTab(),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(String label, String tabId) {
    final isActive = activeTab == tabId;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            activeTab = tabId;
            saveStatus = '';
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? _cardColor : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                color: isActive ? AppColors.primary : _secondaryTextColor,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFormField('Full Name', nameController, Icons.person_outlined),
        const SizedBox(height: 16),
        _buildFormField('Email Address', emailController, Icons.email_outlined),
        const SizedBox(height: 16),
        _buildFormField('Phone Number', phoneController, Icons.phone_outlined),
        const SizedBox(height: 16),
        _buildFormField(
          'Role & Authorization',
          TextEditingController(text: widget.user.role),
          Icons.badge_outlined,
          enabled: false,
        ),
        const SizedBox(height: 20),
        if (saveStatus.isNotEmpty) _buildStatusMessage(),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 46,
          child: ElevatedButton(
            onPressed: isLoading ? null : () => _handleSaveProfile(),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text('Save Profile Changes'),
          ),
        ),
      ],
    );
  }

  Widget _buildSecurityTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFormField(
          'Current Password',
          currentPasswordController,
          Icons.lock_outline_rounded,
          isPassword: true,
        ),
        const SizedBox(height: 16),
        _buildFormField(
          'New Password',
          newPasswordController,
          Icons.lock_reset_rounded,
          isPassword: true,
        ),
        const SizedBox(height: 16),
        _buildFormField(
          'Confirm New Password',
          confirmPasswordController,
          Icons.check_circle_outline_rounded,
          isPassword: true,
        ),
        const SizedBox(height: 20),
        if (saveStatus.isNotEmpty) _buildStatusMessage(),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          height: 46,
          child: ElevatedButton(
            onPressed: isLoading ? null : () => _handleChangePassword(),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text('Update Security Password'),
          ),
        ),
      ],
    );
  }

  Widget _buildFormField(
    String label,
    TextEditingController controller,
    IconData icon, {
    bool isPassword = false,
    bool enabled = true,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: _primaryTextColor,
          ),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          enabled: enabled,
          obscureText: isPassword && !showNewPassword,
          decoration: InputDecoration(
            hintText: 'Enter $label',
            prefixIcon: Icon(icon, color: _mutedTextColor, size: 20),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      showNewPassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      color: _mutedTextColor,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() {
                        showNewPassword = !showNewPassword;
                      });
                    },
                  )
                : null,
            fillColor: enabled ? _cardColor : _backgroundColor,
          ),
          style: TextStyle(fontSize: 14, color: _primaryTextColor),
        ),
      ],
    );
  }

  Widget _buildStatusMessage() {
    late Color statusBg;
    late Color statusFg;
    late IconData statusIcon;
    String statusText = '';

    if (saveStatus == 'success') {
      statusBg = AppColors.badgeGreenBg;
      statusFg = AppColors.badgeGreenIcon;
      statusIcon = Icons.check_circle_outline_rounded;
      statusText = 'Settings updated successfully!';
    } else if (saveStatus == 'error') {
      statusBg = AppColors.badgeRedBg;
      statusFg = AppColors.badgeRedIcon;
      statusIcon = Icons.error_outline_rounded;
      statusText = 'Failed to save changes. Please try again.';
    } else {
      statusBg = AppColors.badgeOrangeBg;
      statusFg = AppColors.badgeOrangeIcon;
      statusIcon = Icons.sync_rounded;
      statusText = 'Saving settings...';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: statusBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(statusIcon, color: statusFg, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              statusText,
              style: TextStyle(
                fontSize: 13,
                color: statusFg,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleSaveProfile() async {
    setState(() {
      isLoading = true;
      saveStatus = 'saving';
    });

    try {
      await UserAPI.updateProfile(widget.user.id, {
        'name': nameController.text,
        'email': emailController.text,
        'phone': phoneController.text,
      });

      setState(() {
        isLoading = false;
        saveStatus = 'success';
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully!'),
            backgroundColor: AppColors.badgeGreenIcon,
          ),
        );
      }

      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            saveStatus = '';
          });
        }
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        saveStatus = 'error';
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: AppColors.badgeRedIcon,
          ),
        );
      }
    }
  }

  void _handleChangePassword() async {
    if (currentPasswordController.text.isEmpty) {
      setState(() {
        saveStatus = 'error';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter current password'),
          backgroundColor: AppColors.badgeRedIcon,
        ),
      );
      return;
    }

    if (newPasswordController.text.isEmpty ||
        newPasswordController.text.length < 6) {
      setState(() {
        saveStatus = 'error';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password must be at least 6 characters'),
          backgroundColor: AppColors.badgeRedIcon,
        ),
      );
      return;
    }

    if (newPasswordController.text != confirmPasswordController.text) {
      setState(() {
        saveStatus = 'error';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Passwords do not match'),
          backgroundColor: AppColors.badgeRedIcon,
        ),
      );
      return;
    }

    setState(() {
      isLoading = true;
      saveStatus = 'saving';
    });

    try {
      await UserAPI.updatePassword({
        'oldPassword': currentPasswordController.text,
        'newPassword': newPasswordController.text,
      });

      setState(() {
        isLoading = false;
        saveStatus = 'success';
        currentPasswordController.clear();
        newPasswordController.clear();
        confirmPasswordController.clear();
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password changed successfully!'),
            backgroundColor: AppColors.badgeGreenIcon,
          ),
        );
      }

      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            saveStatus = '';
          });
        }
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        saveStatus = 'error';
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceFirst('Exception: ', '')),
            backgroundColor: AppColors.badgeRedIcon,
          ),
        );
      }
    }
  }
}
