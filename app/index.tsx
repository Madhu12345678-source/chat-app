import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';


const { width } = useWindowDimensions();


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required.';
    } else {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors)?.length === 0;
  };

  //  const handleLogin = () => {
  //    if (!validateForm()) return;

  //    if (email === 'test@example.com' && password === '123456') {
  //      Alert.alert('Login Successful', 'Welcome!');
  //      router.push('/Chats');
  //    } else {
  //      Alert.alert('Login Failed', 'Invalid email or password.');
  //    }
  //  };
  const handleLogin = async () => {
    console.log('Login button pressed');

    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    try {
      console.log('Sending API request');
      const response = await axios.post('http://192.168.29.187:3000/users/login', {
        email,
        password,
      });
      Alert.alert('Login Successful', 'Welcome!');

      console.log('Response:', response.data);
      const { token, user } = response.data;
      
      // Store the token and stringified user object
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user)); // Stringify the user object
      
      // Make authenticated request (optional, if you need to verify the token)
      await axios.get('http://192.168.29.187:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Token:', token);
      router.push('/Chats');
    } catch (error: any) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        Alert.alert('Login Failed', error.response.data.message || 'Invalid email or password.');
      } else {
        Alert.alert('Login Failed', 'Something went wrong. Please try again.');
      }
    }
  };
  return (
    <>
      {/* <StatusBar style="light" /> */}
      <View style={styles.container}>
        {/* Left Side */}
        <View style={styles.leftPanel}>
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

        {/* Right Side - Login Form */}
        <View style={styles.rightPanel}>
          <Text style={styles.loginTitle}>Login</Text>

          <TextInput
            style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <LinearGradient
            colors={['#00FFA3', '#4D9FFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            <TouchableOpacity
              style={{ width: '100%', alignItems: 'center' }}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </LinearGradient>

         
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink} onPress={() => router.push('/RegisterScreen')} >Register</Text>
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
    flexDirection: width > 600 ? 'row' : 'column',
    padding: 20,
  },
  leftPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // ⬅️ add this
    paddingRight: 20,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    marginTop: width > 600 ? 0 : 20,
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
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // slightly more space for clean separation
    gap: 10, // 
  },
  featureText: {
    color: '#ccc',
    marginLeft: 10,
    fontSize: 16,
  },
  loginTitle: {
    color: '#00FFA3',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,

    textAlign: 'center', // 👈 this centers the title horizontally
    alignSelf: 'center',

  },
  input: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 15,
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerText: {
    color: '#aaa',
    textAlign: 'center',
  },
  registerLink: {
    color: '#00FFA3',
    fontWeight: 'bold',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 8,
    fontSize: 12,
    marginLeft: 5,
  },
});