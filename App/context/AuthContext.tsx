import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../utils/api';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Load user from AsyncStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const token = await AsyncStorage.getItem('token');

                if (storedUser && token) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Failed to load user form AsyncStorage", error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: any) => {
        try {
            console.log('[AuthContext] Attempting login with email:', credentials.email);
            const response = await authAPI.login(credentials);
            console.log('[AuthContext] Login response:', response.data);

            if (response.data.success) {
                const { user, token } = response.data.data;

                // Store user and token
                await AsyncStorage.setItem('user', JSON.stringify(user));
                await AsyncStorage.setItem('token', token);
                setUser(user);

                return { success: true, user };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error: any) {
            console.error('[AuthContext] Login error:', error);
            console.error('[AuthContext] Error message:', error.message);
            console.error('[AuthContext] Error response:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'Login failed. Please try again.'
            };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
