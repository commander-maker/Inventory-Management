import 'api_service.dart';
import '../models/model.dart';

class AuthService {
  /// Sign in with email and password for Agent role
  static Future<AuthResponse> signIn({
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await ApiService.post("auth/login", {
        "email": email,
        "password": password,
        "role": role,
      });

      if (response != null && response is Map<String, dynamic>) {
        return AuthResponse.fromJson(response);
      } else {
        return AuthResponse(
          success: false,
          message: 'Invalid response from server',
        );
      }
    } catch (e) {
      return AuthResponse(success: false, message: 'Error: $e');
    }
  }

  /// Register new agent
  static Future<AuthResponse> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await ApiService.post("auth/register", {
        "name": name,
        "email": email,
        "password": password,
        "role": role,
      });

      if (response != null && response is Map<String, dynamic>) {
        return AuthResponse.fromJson(response);
      } else {
        return AuthResponse(
          success: false,
          message: 'Invalid response from server',
        );
      }
    } catch (e) {
      return AuthResponse(success: false, message: 'Error: $e');
    }
  }

  /// Sign out
  static Future<void> signOut() async {
    try {
      // Add logout logic if needed
    } catch (e) {
      throw Exception('Sign out failed: $e');
    }
  }
}
