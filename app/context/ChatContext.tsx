import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';

// Define your API base URL based on environment
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://192.168.29.187:3000' // Android emulator uses 10.0.2.2 to access host machine
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
  createdAt: string;
  updatedAt: string;
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
  setCurrentChat: () => {},
  messages: [],
  sendMessage: async () => {},
  markAsRead: () => {},
  onlineUsers: [],
  loadingMessages: false,
  error: null,
  fetchMessages: async () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentChat, setCurrentChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Get user data and token
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
          
          // Important: Notify server of user connection
          newSocket.emit('user_connected', currentUser._id);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          // Emit user_disconnected before the socket disconnects
          if (currentUser?._id) {
            newSocket.emit('user_disconnected', currentUser._id);
          }
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError('Failed to connect to chat server');
        });

        // Listen for incoming messages - match server's event structure
        newSocket.on('receive_message', (data) => {
          console.log('Received message:', data);
          if (data.message) {
            setMessages((prev) => [...prev, data.message]);
          }
        });

        // Listen for message status updates
        newSocket.on('message_status_update', ({ messageId, status, readAt }) => {
          console.log('Message status update:', { messageId, status, readAt });
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, status, ...(readAt && { readAt }) } : msg
            )
          );
        });

        // Listen for online users updates
        newSocket.on('users_status_update', (users) => {
          console.log('Users status update:', users);
            setOnlineUsers(users.filter((u: { _id: string; online: boolean }) => u.online).map((u: { _id: string }) => u._id));
        });

        // Listen for user status changes
        newSocket.on('user_status_change', ({ userId, online }) => {
          console.log('User status change:', { userId, online });
          if (online) {
            setOnlineUsers(prev => [...prev, userId]);
          } else {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
          }
        });

        return () => {
          if (socketRef.current) {
            // Notify server before disconnecting
            if (currentUser?._id) {
              socketRef.current.emit('user_disconnected', currentUser._id);
            }
            socketRef.current.disconnect();
          }
        };
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

  // Send a new 
// Send a new message
const sendMessage = useCallback(
  async (
    text: string, 
    file?: { uri: string; name: string; type: string }
  ) => {
    if (!currentChat || !socketRef.current) return;

    console.log(text,"text")

    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;

      console.log(currentUser)
      
      if (!currentUser?._id) throw new Error('Current user not found');

      let fileUrl = '';
      let fileName = '';
      let fileType = '';
      
      // Handle file upload if present
      if (file && file.uri) {
        console.log('Preparing file upload:', file);
        
        // Mobile-specific file preparation
        const formData = new FormData();
        
        // Extract filename from URI if not provided
        const filename = file.name || file.uri.split('/').pop() || `file-${Date.now()}`;
        
        // Determine file type if not provided
        const filetype = file.type || getMimeType(filename);
        
        formData.append('file', {
          uri: file.uri,
          name: filename,
          type: filetype,
        } as any);

        console.log('FormData prepared:', formData);
        
        const uploadResponse = await axios.post(`${API_BASE_URL}/upload/file`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
          transformRequest: () => formData, // Bypass Axios serialization
        });

        if (uploadResponse.status !== 201) {
          throw new Error('File upload failed');
        }

        fileUrl = uploadResponse.data.fileUrl;
        fileName = uploadResponse.data.fileName;
        fileType = uploadResponse.data.fileType;
      }

      // Prepare message payload
      const messagePayload = {
        sender: currentUser._id,
        receiver: currentChat._id,
        text: text || '',
        ...(fileUrl && { 
          fileUrl, 
          fileName, 
          fileType 
        }),
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
      };

      // Emit message to socket
      socketRef.current.emit('send_message', {
        ...messagePayload,
        _id: `temp-${Date.now()}`, // Temporary ID
      });

      // Optimistically add message to local state
      setMessages((prev) => [...prev, {
        ...messagePayload,
        _id: `temp-${Date.now()}`,
        updatedAt: new Date().toISOString(), // Add placeholder for updatedAt
      }]);

    } catch (err) {
      console.error('Error in sendMessage:', err);
      
      // More detailed error handling
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status
          // code that falls out of the range of 2xx
          throw new Error(err.response.data?.message || 'File upload failed');
        } else if (err.request) {
          // The request was made but no response was received
          throw new Error('No response from server. Check your internet connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error('Error preparing message upload');
        }
      }
      
      throw err;
    }
  },
  [currentChat]
);

// Helper function to guess MIME type from filename
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

  // Mark a message as read
  const markAsRead = useCallback(
    (messageId: string, senderId: string) => {
      if (!socketRef.current) {
        console.log('Cannot mark as read: missing socket');
        return;
      }

      const message = messages.find((m) => m._id === messageId);
      if (!message || message.status === 'read') return;

      AsyncStorage.getItem('user').then(userData => {
        const currentUser = userData ? JSON.parse(userData) : null;
        if (!currentUser?._id) return;

        if (message.sender !== currentUser._id) {
          console.log('Marking message as read:', messageId);
          socketRef.current?.emit('message_read', {
            messageId,
            readBy: currentUser._id,
            senderId: message.sender,
          });

          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === messageId ? { ...msg, status: 'read' } : msg
            )
          );
        }
      });
    },
    [messages]
  );

  // Added debug function
  const debugConnectionStatus = () => {
    console.log('Current connection status:');
    console.log('- Socket connected:', socketRef.current?.connected);
    console.log('- Current chat:', currentChat?._id);
    console.log('- Online users:', onlineUsers);
    console.log('- Messages count:', messages?.length);
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping');
    }
  };

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