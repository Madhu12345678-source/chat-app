import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = "http://192.168.29.187:3000";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onClose, onCreateSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      fetchUsers();
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one member');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser) {
        throw new Error('User not found');
      }

      const memberIds = selectedUsers.map(user => user._id);
      // Include current user as a member
      memberIds.push(currentUser._id);

      await axios.post(`${API_BASE_URL}/groups`, {
        name: groupName,
        description,
        members: memberIds,
        password: password || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onCreateSuccess();
      onClose();
      resetForm();
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setDescription('');
    setPassword('');
    setSelectedUsers([]);
    setSearchQuery('');
    setError('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>New Group</Text>
          <TouchableOpacity onPress={createGroup} disabled={loading}>
            <Text style={styles.createButton}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Group Name"
            value={groupName}
            onChangeText={setGroupName}
          />
          <TextInput
            style={styles.input}
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (Optional)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.sectionTitle}>Add Members</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <FlatList
            data={users.filter(user => 
              user.name.toLowerCase().includes(searchQuery.toLowerCase())
            )}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.userItem}
                onPress={() => toggleUserSelection(item)}
              >
                <Image
                  source={{ uri: item.profilePicture || `https://ui-avatars.com/api/?name=${item.name}&background=random` }}
                  style={styles.userAvatar}
                />
                <Text style={styles.userName}>{item.name}</Text>
                {selectedUsers.some(u => u._id === item._id) && (
                  <Ionicons name="checkmark-circle" size={24} color="#25D366" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    color: '#25D366',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default CreateGroupModal;