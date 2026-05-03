import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    nameController = TextEditingController(text: widget.user.name);
    emailController = TextEditingController(text: widget.user.email);
    phoneController = TextEditingController();
    currentPasswordController = TextEditingController();
    newPasswordController = TextEditingController();
    confirmPasswordController = TextEditingController();
  }

  @override
  void dispose() {
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
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        automaticallyImplyLeading: false,
        title: const Text(
          'Settings',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Container(
        color: Colors.grey.shade50,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Settings',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Manage your profile and security settings',
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Tab Navigation
              Row(
                children: [
                  _buildTabButton('Agent Details', 'profile'),
                  const SizedBox(width: 12),
                  _buildTabButton('Password', 'security'),
                ],
              ),
              const SizedBox(height: 24),
              // Tab Content
              if (activeTab == 'profile') _buildProfileTab(),
              if (activeTab == 'security') _buildSecurityTab(),
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
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? Colors.blue : Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isActive ? Colors.blue : Colors.grey.shade300,
              width: 1,
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : Colors.black,
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
        _buildFormField('Full Name', nameController, Icons.person),
        const SizedBox(height: 16),
        _buildFormField('Email', emailController, Icons.email),
        const SizedBox(height: 16),
        _buildFormField('Phone', phoneController, Icons.phone),
        const SizedBox(height: 16),
        _buildFormField(
          'Role',
          TextEditingController(text: widget.user.role),
          Icons.badge,
          enabled: false,
        ),
        const SizedBox(height: 24),
        if (saveStatus.isNotEmpty) _buildStatusMessage(),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: isLoading ? null : () => _handleSaveProfile(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              disabledBackgroundColor: Colors.blue.shade300,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Save Changes',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
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
          Icons.lock,
          isPassword: true,
        ),
        const SizedBox(height: 16),
        _buildFormField(
          'New Password',
          newPasswordController,
          Icons.lock,
          isPassword: true,
        ),
        const SizedBox(height: 16),
        _buildFormField(
          'Confirm Password',
          confirmPasswordController,
          Icons.lock,
          isPassword: true,
        ),
        const SizedBox(height: 24),
        if (saveStatus.isNotEmpty) _buildStatusMessage(),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: isLoading ? null : () => _handleChangePassword(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              disabledBackgroundColor: Colors.blue.shade300,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Change Password',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
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
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          enabled: enabled,
          obscureText: isPassword && !showNewPassword,
          decoration: InputDecoration(
            hintText: 'Enter $label',
            hintStyle: TextStyle(color: Colors.grey.shade500),
            prefixIcon: Icon(icon, color: Colors.blue.shade300, size: 18),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      showNewPassword ? Icons.visibility : Icons.visibility_off,
                      color: Colors.grey.shade600,
                      size: 18,
                    ),
                    onPressed: () {
                      setState(() {
                        showNewPassword = !showNewPassword;
                      });
                    },
                  )
                : null,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Colors.blue, width: 2),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey.shade200, width: 1),
            ),
            filled: true,
            fillColor: enabled ? Colors.white : Colors.grey.shade100,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 12,
            ),
          ),
          style: const TextStyle(fontSize: 13, color: Colors.black),
        ),
      ],
    );
  }

  Widget _buildStatusMessage() {
    late Color statusColor;
    late IconData statusIcon;
    String statusText = '';

    if (saveStatus == 'success') {
      statusColor = Colors.green;
      statusIcon = Icons.check_circle;
      statusText = 'Changes saved successfully!';
    } else if (saveStatus == 'error') {
      statusColor = Colors.red;
      statusIcon = Icons.error;
      statusText = 'Failed to save changes';
    } else {
      statusColor = Colors.orange;
      statusIcon = Icons.info;
      statusText = 'Saving...';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: statusColor.withOpacity(0.3), width: 1),
      ),
      child: Row(
        children: [
          Icon(statusIcon, color: statusColor, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              statusText,
              style: TextStyle(
                fontSize: 12,
                color: statusColor,
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

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: Colors.green,
        ),
      );

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _handleChangePassword() async {
    // Validation
    if (currentPasswordController.text.isEmpty) {
      setState(() {
        saveStatus = 'error';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter current password'),
          backgroundColor: Colors.red,
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
          backgroundColor: Colors.red,
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
          backgroundColor: Colors.red,
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

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Password changed successfully!'),
          backgroundColor: Colors.green,
        ),
      );

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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceFirst('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
