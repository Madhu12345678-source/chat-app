import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

// Define your API base URL based on environment
const API_BASE_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://192.168.29.187:3000' // Android emulator uses this IP to access host machine
    : 'http://localhost:3000' // iOS simulator uses localhost
  : 'https://your-production-server.com'; // Replace with your actual production URL

type GroupMessage = {
  _id: string;
  group: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: string;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
};

type Group = {
  _id: string;
  name: string;
  description: string;
  creator: string;
  members: string[];
  admins: string[];
  bio?: string;
  createdAt: string;
  password?: string; // Only for creation/verification
};

type GroupContextType = {
  socket: Socket | null;
  currentGroup: Group | null;
  setCurrentGroup: (group: Group | null) => void;
  groupMessages: GroupMessage[];
  sendGroupMessage: (text: string, file?: { uri: string; name: string; type: string }) => Promise<void>;
  markGroupMessageAsRead: (messageId: string) => void;
  loadingGroupMessages: boolean;
  error: string | null;
  fetchGroupMessages: (groupId: string) => Promise<void>;
  fetchGroups: () => Promise<Group[]>;
  createGroup: (name: string, description: string, members: string[], password: string) => Promise<Group>;
  deleteGroup: (groupId: string) => Promise<void>;
  verifyGroupPassword: (groupId: string, password: string) => Promise<boolean>;
  addMembersToGroup: (groupId: string, userIds: string[]) => Promise<Group>;
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<Group>;
  updateGroup: (groupId: string, updates: { name?: string; bio?: string; password?: string }) => Promise<Group>;
  getUnreadGroupMessagesCount: () => Promise<Array<{ groupId: string; count: number }>>;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
};

const GroupContext = createContext<GroupContextType>({
  socket: null,
  currentGroup: null,
  setCurrentGroup: () => {},
  groupMessages: [],
  sendGroupMessage: async () => {},
  markGroupMessageAsRead: () => {},
  loadingGroupMessages: false,
  error: null,
  fetchGroupMessages: async () => {},
  fetchGroups: async () => [],
  createGroup: async () => ({} as Group),
  deleteGroup: async () => {},
  verifyGroupPassword: async () => false,
  addMembersToGroup: async () => ({} as Group),
  removeMemberFromGroup: async () => ({} as Group),
  updateGroup: async () => ({} as Group),
  getUnreadGroupMessagesCount: async () => [],
  joinGroup: () => {},
  leaveGroup: () => {},
});

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [loadingGroupMessages, setLoadingGroupMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!token || !currentUser?._id) {
          console.log('Missing token or user data');
          return;
        }

        console.log('Initializing socket connection to:', API_BASE_URL);

        const newSocket = io(API_BASE_URL, {
          auth: { token },
          transports: ['websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          setSocket(newSocket);
          newSocket.emit('user_connected', currentUser._id);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          if (currentUser?._id) {
            newSocket.emit('user_disconnected', currentUser._id);
          }
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError('Failed to connect to chat server');
        });

        // Listen for incoming group messages
        newSocket.on('receive_group_message', (data) => {
          console.log('Received group message:', data);
          if (data.message) {
            setGroupMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some(msg => msg._id === data.message._id);
              if (exists) return prev;

              return [...prev, data.message].sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              );
            });
          }
        });

        // Listen for group message read updates
        newSocket.on('group_message_status_update', ({ messageId, groupId, readBy }) => {
          console.log('Group message status update:', { messageId, groupId, readBy });
          
          setGroupMessages((prev) => {
            return prev.map((msg) => {
              if (msg._id === messageId) {
                return {
                  ...msg,
                  readBy: readBy,
                };
              }
              return msg;
            });
          });
        });

        newSocket.on('group_message_error', (data) => {
          console.error('Group message error:', data);
          setError(data.error || 'Failed to send group message');
        });

      } catch (err) {
        console.error('Socket initialization error:', err);
        setError('Failed to initialize chat connection');
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Fetch group messages when current group changes
  const fetchGroupMessages = useCallback(async (groupId: string) => {
    try {
      setLoadingGroupMessages(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoadingGroupMessages(false);
        return;
      }

      console.log('Fetching messages for group:', groupId);
      const response = await axios.get(`${API_BASE_URL}/group-messages/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Fetched group messages count:', response.data?.length);
      setGroupMessages(response.data);
      setLoadingGroupMessages(false);
    } catch (err) {
      console.error('Error fetching group messages:', err);
      setError('Failed to load group messages');
      setLoadingGroupMessages(false);
    }
  }, []);

  // Send group message
  const sendGroupMessage = useCallback(
    async (
      text: string,
      file?: { uri: string; name: string; type: string }
    ) => {
      if (!currentGroup || !socketRef.current) {
        console.log('Cannot send message: missing group or socket');
        return;
      }

      const messageText = text.trim();
      if (!messageText && !file) {
        console.log('Cannot send empty message');
        return;
      }

      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!currentUser?._id) throw new Error('Current user not found');

        const filesnew = {
          fileUrl: file?.uri || '',
          fileName: file?.name || `file-${Date.now()}`,
          fileType: file?.type || getMimeType(file?.name || ''),
        }

        console.log('Sending group message:', filesnew)

        const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create optimistic message
        const tempMessage: GroupMessage = {
          _id: tempMessageId,
          group: currentGroup._id,
          sender: {
            _id: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            profilePicture: currentUser.profilePicture,
          },
          text: messageText,
          ...filesnew,
          timestamp: new Date().toISOString(),
          readBy: [{ user: currentUser._id, readAt: new Date().toISOString() }],
        };

        // setGroupMessages((prev) => [...prev, tempMessage]);

        // Send message via socket
        socketRef.current.emit('send_group_message', {
          groupId: currentGroup._id,
          senderId: currentUser._id,
          text: messageText,
          ...filesnew,
        });

      } catch (err) {
        console.error('Error sending group message:', err);

        // Remove failed message
        setGroupMessages((prev) => prev.filter(msg => !msg._id.startsWith('temp-')));

        if (axios.isAxiosError(err)) {
          if (err.response) {
            throw new Error(err.response.data?.message || 'Message send failed');
          } else if (err.request) {
            throw new Error('No response from server. Check your connection.');
          }
        }
        throw err;
      }
    },
    [currentGroup]
  );

  // Mark group message as read
  const markGroupMessageAsRead = useCallback(
    async (messageId: string) => {
      if (!socketRef.current || !currentGroup) {
        console.log('Socket or current group not available');
        return;
      }

      const message = groupMessages.find((m) => m._id === messageId);
      if (!message) {
        console.log('Message not found:', messageId);
        return;
      }

      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;
      if (!currentUser?._id) return;

      // Check if already read by this user
      if (message.readBy.some(read => read.user === currentUser._id)) {
        return;
      }

      // Emit read event
      socketRef.current.emit('group_message_read', {
        messageId,
        userId: currentUser._id,
        groupId: currentGroup._id,
      });
    },
    [groupMessages, currentGroup]
  );

  // Join a group room
  const joinGroup = useCallback((groupId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_group', groupId);
    }
  }, []);

  // Leave a group room
  const leaveGroup = useCallback((groupId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_group', groupId);
    }
  }, []);

  // Fetch user's groups
  const fetchGroups = useCallback(async (): Promise<Group[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (err) {
      console.error('Error fetching groups:', err);
      throw err;
    }
  }, []);

  // Create a new group
  const createGroup = useCallback(async (
    name: string,
    description: string,
    members: string[],
    password: string
  ): Promise<Group> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/groups`,
        { name, description, members, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  }, []);

  // Delete a group
  const deleteGroup = useCallback(async (groupId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Error deleting group:', err);
      throw err;
    }
  }, []);

  // Verify group password
  const verifyGroupPassword = useCallback(async (
    groupId: string,
    password: string
  ): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/groups/${groupId}/verify-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.status === 200;
    } catch (err) {
      console.error('Error verifying group password:', err);
      throw err;
    }
  }, []);

  // Add members to group
  const addMembersToGroup = useCallback(async (
    groupId: string,
    userIds: string[]
  ): Promise<Group> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/groups/add-member`,
        { groupId, userIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.group;
    } catch (err) {
      console.error('Error adding members to group:', err);
      throw err;
    }
  }, []);

  // Remove member from group
  const removeMemberFromGroup = useCallback(async (
    groupId: string,
    userId: string
  ): Promise<Group> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/groups/remove-member`,
        { groupId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data.group;
    } catch (err) {
      console.error('Error removing member from group:', err);
      throw err;
    }
  }, []);

  // Update group
  const updateGroup = useCallback(async (
    groupId: string,
    updates: { name?: string; bio?: string; password?: string }
  ): Promise<Group> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        `${API_BASE_URL}/groups/${groupId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  }, []);

  // Get unread group messages count
  const getUnreadGroupMessagesCount = useCallback(async (): Promise<Array<{ groupId: string; count: number }>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(`${API_BASE_URL}/group-messages/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (err) {
      console.error('Error fetching unread group messages count:', err);
      throw err;
    }
  }, []);

  // Helper function for MIME types
  function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg': case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'mp4': return 'video/mp4';
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }

  return (
    <GroupContext.Provider
      value={{
        socket: socketRef.current,
        currentGroup,
        setCurrentGroup,
        groupMessages,
        sendGroupMessage,
        markGroupMessageAsRead,
        loadingGroupMessages,
        error,
        fetchGroupMessages,
        fetchGroups,
        createGroup,
        deleteGroup,
        verifyGroupPassword,
        addMembersToGroup,
        removeMemberFromGroup,
        updateGroup,
        getUnreadGroupMessagesCount,
        joinGroup,
        leaveGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);