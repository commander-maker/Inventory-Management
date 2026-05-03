import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';

  // Get authorization header
  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    final headers = {"Content-Type": "application/json"};

    if (token != null) {
      headers["Authorization"] = "Bearer $token";
    }

    return headers;
  }

  // GET request
  static Future<dynamic> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse("$baseUrl/$endpoint"),
      headers: headers,
    );

    return _handleResponse(response);
  }

  // POST request
  static Future<dynamic> post(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse("$baseUrl/$endpoint"),
      headers: headers,
      body: jsonEncode(data),
    );

    return _handleResponse(response);
  }

  // PUT request
  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse("$baseUrl/$endpoint"),
      headers: headers,
      body: jsonEncode(data),
    );

    return _handleResponse(response);
  }

  // DELETE request
  static Future<dynamic> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse("$baseUrl/$endpoint"),
      headers: headers,
    );

    return _handleResponse(response);
  }

  // Handle response
  static dynamic _handleResponse(http.Response response) {
    try {
      final body = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return body;
      } else {
        // Check if response has a message field
        final message =
            body['message'] ??
            body['error'] ??
            'Request failed with status ${response.statusCode}';
        throw Exception(message);
      }
    } catch (e) {
      // If JSON decode fails, return the raw response
      if (e is FormatException) {
        throw Exception('Invalid server response: ${response.body}');
      }
      rethrow;
    }
  }
}

// Vehicle API
class VehicleAPI {
  static Future<Map<String, dynamic>?> getMyVehicle() async {
    try {
      final response = await ApiService.get("vehicles/my-vehicle");
      if (response != null && response['success'] == true) {
        return response['data'];
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch vehicle: $e');
    }
  }

  static Future<List<Map<String, dynamic>>> getVehicleLoads(
    String vehicleId,
  ) async {
    try {
      final response = await ApiService.get("vehicles/$vehicleId/loads");
      if (response != null && response['success'] == true) {
        final data = response['data'];
        if (data is List) {
          return List<Map<String, dynamic>>.from(data);
        }
        return [];
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch loads: $e');
    }
  }

  static Future<void> addVehicleLoad(
    String vehicleId,
    Map<String, dynamic> loadData,
  ) async {
    try {
      await ApiService.post("vehicles/$vehicleId/loads", loadData);
    } catch (e) {
      throw Exception('Failed to add load: $e');
    }
  }

  static Future<void> updateVehicleLoad(
    String loadId,
    Map<String, dynamic> loadData,
  ) async {
    try {
      await ApiService.put("vehicles/loads/$loadId", loadData);
    } catch (e) {
      throw Exception('Failed to update load: $e');
    }
  }

  static Future<void> removeVehicleLoad(String vehicleId, String loadId) async {
    try {
      await ApiService.delete("vehicles/$vehicleId/loads/$loadId");
    } catch (e) {
      throw Exception('Failed to remove load: $e');
    }
  }
}

// Delivery API
class DeliveryAPI {
  static Future<List<Map<String, dynamic>>> getMyDeliveries() async {
    try {
      final response = await ApiService.get("deliveries/my-deliveries");
      if (response != null && response['success'] == true) {
        final data = response['data'];
        if (data is List) {
          return List<Map<String, dynamic>>.from(data);
        }
        return [];
      }
      return [];
    } catch (e) {
      throw Exception('Failed to fetch deliveries: $e');
    }
  }

  static Future<void> updateDeliveryStatus(
    String deliveryId,
    Map<String, dynamic> statusData,
  ) async {
    try {
      await ApiService.put("deliveries/$deliveryId/status", statusData);
    } catch (e) {
      throw Exception('Failed to update delivery status: $e');
    }
  }
}

// User API
class UserAPI {
  static Future<void> updateProfile(
    String userId,
    Map<String, dynamic> userData,
  ) async {
    try {
      await ApiService.put("users/$userId", userData);
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }

  static Future<void> updatePassword(Map<String, dynamic> passwordData) async {
    try {
      await ApiService.put("users/password/update", passwordData);
    } catch (e) {
      throw Exception('Failed to update password: $e');
    }
  }
}
