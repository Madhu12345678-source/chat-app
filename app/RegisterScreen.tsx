import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, Platform,Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';

const RegisterScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>({});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRegister = async (data: Object) => {
    console.log('Register button pressed'); // Debugging
    try {
      const response = await axios.post("http://192.168.29.187:3000/users/register", data)
      console.log(response.data); // Handle success response
       Alert.alert('Registration Successful', 'Your account has been created successfully.');
         router.push('/');
    } 
    
    
    catch (error) {
      console.log("error", error)
       Alert.alert('Registration Failed', 'Something went wrong. Please try again.');
    }
  }


  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.nickname.trim()) newErrors.nickname = 'Nickname is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Features Panel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Join Our Community</Text>
        <Text style={styles.subtext}>Create your account and unlock amazing features</Text>

        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#00FFA3" />
          <View>
            <Text style={styles.featureTitle}>AI Chatbot Support</Text>
            <Text style={styles.featureText}>Get instant answers from our smart AI assistant</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#4D9FFF" />
          <View>
            <Text style={styles.featureTitle}>Group Chat</Text>
            <Text style={styles.featureText}>Create groups with unlimited members</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <Ionicons name="checkmark-circle" size={20} color="#B85FFF" />
          <View>
            <Text style={styles.featureTitle}>File Sharing</Text>
            <Text style={styles.featureText}>Share files up to 2GB with encryption</Text>
          </View>
        </View>
      </View>

      {/* Form Panel */}
      <View style={styles.panel}>
        <Text style={styles.formTitle}>Create Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#aaa"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Nickname"
          placeholderTextColor="#aaa"
          value={formData.nickname}
          onChangeText={(text) => setFormData({ ...formData, nickname: text })}
        />
        {errors.nickname && <Text style={styles.error}>{errors.nickname}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Phone (Optional)"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Password (6+ characters)"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        />
        {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Tell us about yourself..."
          placeholderTextColor="#aaa"
          multiline
          value={formData.bio}
          onChangeText={(text) => setFormData({ ...formData, bio: text })}
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity onPress={() => setGender('Male')} style={styles.radio}>
            <Ionicons name={gender === 'Male' ? 'radio-button-on' : 'radio-button-off'} size={18} color="#00FFA3" />
            <Text style={styles.radioText}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender('Female')} style={styles.radio}>
            <Ionicons name={gender === 'Female' ? 'radio-button-on' : 'radio-button-off'} size={18} color="#00FFA3" />
            <Text style={styles.radioText}>Female</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.uploadText}>{image ? 'File Chosen' : 'Choose file (No file chosen)'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => {
            if (validateForm()) {
              console.log('Form is valid:', formData);
              handleRegister({ ...formData, gender, image });
            }
          }}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <Text style={styles.signInLink}>Already have an account? <Text style={styles.signInText} onPress={() => router.push('/')}>Sign In</Text></Text>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0D1117',
  },
  panel: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  heading: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginRight: 50,
  },
  featureTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featureText: {
    color: '#aaa',
    fontSize: 13,
  },
  formTitle: {
    color: '#00FFA3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#0D1117',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 10,
  },
  label: {
    color: '#ccc',
    marginTop: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioText: {
    color: '#ccc',
    marginLeft: 5,
  },
  uploadButton: {
    backgroundColor: '#0D1117',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadText: {
    color: '#aaa',
  },
  registerButton: {
    backgroundColor: '#00FFA3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signInLink: {
    color: '#aaa',
    textAlign: 'center',
  },
  signInText: {
    color: '#4D9FFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});
