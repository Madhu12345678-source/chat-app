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

type Message = {
  _id: string;
  sender: string;
  receiver: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  status: 'sent' | 'delivered' | 'read';
  timestamp: string; // Changed from createdAt to timestamp
  readAt?: string;
  clearedBy?: string[];
};

type User = {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  online?: boolean;
};

type ChatContextType = {
  socket: Socket | null;
  currentChat: User | null;
  setCurrentChat: (user: User | null) => void;
  messages: Message[];
  sendMessage: (text: string, file?: { uri: string; name: string; type: string }) => Promise<void>;
  markAsRead: (messageId: string, senderId: string) => void;
  onlineUsers: string[];
  loadingMessages: boolean;
  error: string | null;
  fetchMessages: (userId: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType>({
  socket: null,
  currentChat: null,
  setCurrentChat: () => { },
  messages: [],
  sendMessage: async () => { },
  markAsRead: () => { },
  onlineUsers: [],
  loadingMessages: false,
  error: null,
  fetchMessages: async () => { },
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentChat, setCurrentChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingMessages = useRef<Set<string>>(new Set()); // Track pending messages

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

        // FIXED: Listen for incoming messages
        newSocket.on('receive_message', (data) => {
          console.log('Received message:', data);
          if (data.message) {
            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some(msg => msg._id === data.message._id);
              if (exists) return prev;

              return [...prev, data.message].sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            });
          }
        });

        // FIXED: Listen for message status updates
        newSocket.on('message_status_update', ({ messageId, status, readAt }) => {
          console.log('Status update received:', { messageId, status, readAt });

          setMessages((prevMessages) => {
            return prevMessages.map((msg) => {
              if (msg._id?.startsWith("temp")) {
                return {
                  ...msg,
                  _id: messageId, // Replace temp ID with actual ID
                };
              }
              return msg;
            });
          });

          setMessages((prev) => {
            const updated = prev.map((msg) => {
              if (msg._id === messageId) {
                console.log(`Updating message ${messageId}: ${msg.status} -> ${status}`);
                return {
                  ...msg,
                  status,
                  ...(readAt && { readAt })
                };
              }
              return msg;
            });

            // Log the updated message to verify
            const updatedMsg = updated.find(m => m._id === messageId);
            console.log('Updated message:', updatedMsg);

            return updated;
          });
        });

        // Listen for online users updates
        newSocket.on('users_status_update', (users) => {
          setOnlineUsers(users.filter((u: { _id: string; online: boolean }) => u.online).map((u: { _id: string }) => u._id));
        });

        newSocket.on('user_status_change', ({ userId, online }) => {
          if (online) {
            setOnlineUsers(prev => Array.from(new Set([...prev, userId])));
          } else {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
          }
        });

        newSocket.on('message_error', (data) => {
          console.error('Message error:', data);
          setError(data.error || 'Failed to send message');
        });

      } catch (err) {
        console.error('Socket initialization error:', err);
        setError('Failed to initialize chat connection');
      }
    };

    initializeSocket();
  }, []);

  // Fetch messages when current chat changes
  const fetchMessages = useCallback(async (userId: string) => {
    try {
      setLoadingMessages(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoadingMessages(false);
        return;
      }

      console.log('Fetching messages for user:', userId);
      const response = await axios.get(`${API_BASE_URL}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Fetched messages count:', response.data?.length);
      setMessages(response.data);
      setLoadingMessages(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
      setLoadingMessages(false);
    }
  }, []);



  // FIXED: Send message function
  const sendMessage = useCallback(
    async (
      text: string,
      file?: { uri: string; name: string; type: string }
    ) => {
      if (!currentChat || !socketRef.current) {
        console.log('Cannot send message: missing chat or socket');
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

        let fileUrl = '';
        let fileName = '';
        let fileType = '';

        // Handle file upload if present
        if (file && file.uri) {
          console.log('Uploading file:', file);

          const formData = new FormData();
          const filename = file.name || file.uri.split('/').pop() || `file-${Date.now()}`;
          const filetype = file.type || getMimeType(filename);

          formData.append('file', {
            uri: file.uri,
            name: filename,
            type: filetype,
          } as any);

          const uploadResponse = await axios.post(`${API_BASE_URL}/upload/file`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`,
            },
            transformRequest: () => formData,
          });

          if (uploadResponse.status !== 201) {
            throw new Error('File upload failed');
          }

          fileUrl = uploadResponse.data.fileUrl;
          fileName = uploadResponse.data.fileName;
          fileType = uploadResponse.data.fileType;
        }

        const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const messagePayload = {
          senderId: currentUser._id,
          receiverId: currentChat._id,
          text: messageText,
          ...(fileUrl && { fileUrl, fileName, fileType })
        };

        // FIXED: Create optimistic message with correct timestamp field
        const tempMessage: Message = {
          _id: tempMessageId,
          sender: currentUser._id,
          receiver: currentChat._id,
          text: messageText,
          ...(fileUrl && { fileUrl, fileName, fileType }),
          status: 'sent',
          timestamp: new Date().toISOString(), // Use timestamp instead of createdAt
        };

        setMessages((prev) => [...prev, tempMessage]);
        socketRef.current.emit('send_message', messagePayload);

        // Clean up pending message after 3 seconds
        // setTimeout(() => {
        //   pendingMessages.current.delete(messageKey);
        // }, 3000);

      } catch (err) {
        console.error('Error sending message:', err);

        // Remove failed message
        setMessages((prev) => prev.filter(msg => !msg._id.startsWith('temp-')));

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
    [currentChat]
  );

  // FIXED: Mark message as read
  const markAsRead = useCallback(
    (messageId: string, senderId: string) => {
      if (!socketRef.current) {
        console.log('Socket not available for markAsRead');
        return;
      }

      const message = messages.find((m) => m._id === messageId);
      if (!message) {
        console.log('Message not found:', messageId);
        return;
      }

      if (message.status === 'read') {
        console.log('Message already read:', messageId);
        return;
      }

      AsyncStorage.getItem('user').then(userData => {
        const currentUser = userData ? JSON.parse(userData) : null;
        if (!currentUser?._id) return;

        // Only mark as read if we are the receiver
        if (message.receiver === currentUser._id && message.sender !== currentUser._id) {
          console.log('Emitting message_read for:', messageId);

          // IMPORTANT: Update local state immediately to show read status
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, status: 'read', readAt: new Date().toISOString() } : msg
            )
          );

          // Then notify server
          socketRef.current?.emit('message_read', {
            messageId,
            readBy: currentUser._id,
            senderId: message.sender,
          });
        }
      });
    },
    [messages]
  );

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
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        currentChat,
        setCurrentChat,
        messages,
        sendMessage,
        markAsRead,
        onlineUsers,
        loadingMessages,
        error,
        fetchMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);