
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { id, name, avatar, time, gender, isGroup, members, description } = useLocalSearchParams();
  console.log('id:', id, 'name:', name, 'avatar:', avatar, 'time:', time);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setIsCurrentUser(parsedUser._id === id || parsedUser?._id === id);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };

    checkCurrentUser();
  }, [id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`http://192.168.29.187:3000/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const matchedUser = res.data.find((user: any) => user._id === id);
        setUserData(matchedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserDetails();
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (id && name && avatar) {
          setUserData({
            id,
            name,
            profileImage: avatar,
            bio: `Last seen at ${time}`,
            email: '-',
            phone: '-',
            gender: gender,
            nickname: '-',
            online: false,
          });
        } else {
          const userString = await AsyncStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            setUserData(user);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id, name, avatar, time, gender]);




  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C2185B" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>No user data found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: userData.profilePicture
              ? userData.profilePicture
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&length=1`,
          }}
          style={styles.profilePicture}
        /> 
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{userData.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Nickname</Text>
        <Text style={styles.value}>{userData.nickname || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>About</Text>
        <Text style={styles.value}>{userData.bio || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{userData.phone || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{userData.gender || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>
          {userData.online ? 'Online 🟢' : 'Offline ⚪️'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#C2185B',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#C2185B',
  },
  uploadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#C2185B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  infoCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});