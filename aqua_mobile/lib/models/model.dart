// User Model
class User {
  final String id;
  final String email;
  final String name;
  final String role;
  final String? avatar;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.avatar,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'Agent',
      avatar: json['avatar'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'avatar': avatar,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

// Authentication Response Model
class AuthResponse {
  final bool success;
  final String message;
  final User? user;
  final String? token;

  AuthResponse({
    required this.success,
    required this.message,
    this.user,
    this.token,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    // Handle the nested 'data' object from API response
    Map<String, dynamic> data = json['data'] ?? {};

    return AuthResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? 'Login successful',
      user: data['user'] != null ? User.fromJson(data['user']) : null,
      token: data['token'],
    );
  }
}

// Login Request Model
class LoginRequest {
  final String email;
  final String password;
  final String role;

  LoginRequest({
    required this.email,
    required this.password,
    required this.role,
  });

  Map<String, dynamic> toJson() {
    return {'email': email, 'password': password, 'role': role};
  }
}
