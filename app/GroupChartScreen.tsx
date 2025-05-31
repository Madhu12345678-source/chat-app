import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = "http://192.168.29.187:3000";

export default function GroupChatScreen() {
  const params = useLocalSearchParams();
  const { groupId, groupName, members: membersString, description } = params;
  const members = JSON.parse(membersString as string);
  
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembersDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/users/bulk`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ids: members.join(',') }
        });
        setGroupMembers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching members:', error);
        setLoading(false);
      }
    };

    fetchMembersDetails();
  }, []);

  const renderMemberItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.memberItem}>
      <Image
        source={{ uri: item.profilePicture || `https://ui-avatars.com/api/?name=${item.name}&background=random` }}
        style={styles.memberAvatar}
      />
      <Text style={styles.memberName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading group members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.groupName}>{groupName}</Text>
        <Text style={styles.groupDescription}>{description}</Text>
      </View>
      
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>Members ({groupMembers.length})</Text>
      </View>
      
      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item._id}
        renderItem={renderMemberItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupDescription: {
    fontSize: 16,
    color: '#666',
  },
  membersHeader: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
});