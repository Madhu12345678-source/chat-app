import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import axios from 'axios';
import { useAuth } from './context/AuthContext';

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/users/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      await login(user, token); // Using AuthContext login

      Alert.alert('Success', 'Logged in successfully!');
      router.replace('/Chats');
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Left Panel - Welcome Section */}
        <View style={[styles.leftPanel, { display: width > 600 ? 'flex' : 'none' }]}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.brand}>ChatConnect</Text>
          </Text>
          <Text style={styles.subtitle}>Connect with friends and colleagues in real-time</Text>

          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#00FFA3" />
            <Text style={styles.featureText}>Secure end-to-end encryption</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#4D9FFF" />
            <Text style={styles.featureText}>Group and private chats</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="checkmark-circle" size={20} color="#B85FFF" />
            <Text style={styles.featureText}>File sharing capabilities</Text>
          </View>
        </View>

        {/* Right Panel - Login Form */}
        <View style={[styles.rightPanel, { width: width > 600 ? '50%' : '100%' }]}>
          <Text style={styles.loginTitle}>Login</Text>

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <LinearGradient
            colors={['#00FFA3', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text 
              style={styles.registerLink} 
              onPress={() => router.push('/RegisterScreen')}
            >
              Register
            </Text>
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  rightPanel: {
    backgroundColor: '#161B22',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  brand: {
    color: '#4D9FFF',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 16,
  },
  loginTitle: {
    color: '#00FFA3',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  loginButton: {
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 25,
  },
  buttonTouchable: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  registerText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 14,
  },
  registerLink: {
    color: '#00FFA3',
    fontWeight: '600',
  },
});