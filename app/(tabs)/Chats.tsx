// app/ChatListScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Menu } from 'react-native-paper';
import { useChat } from "../context/ChatContext";

// Define the API base URL
const API_BASE_URL = "http://192.168.29.187:3000"; // Replace with your actual API base URL

const FILTERS = ["All", "Unread", "Favorite", "Groups"];

export default function ChatListScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuVisible, setMenuVisible] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notificationAnimation] = useState(new Animated.Value(1));
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const { socket, messages } = useChat(); // Use the chat context
  const router = useRouter();

  // Animation for notification badge
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(notificationAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(notificationAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        let token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = await AsyncStorage.getItem("user");
        const currentUser = userData ? JSON.parse(userData) : null;
        const currentUserId = currentUser?._id;

        const data = response.data;
        const processedChats = data.map((user: any, index: number) => ({
          id: user._id,
          name: user.name,
          message: "Hey! Let's chat!",
          time: "Yesterday",
          avatar: user.profilePicture,
          unread: false, // We'll update this dynamically based on messages
          favorite: index % 3 === 0,
          isGroup: index % 4 === 0,
          gender: user.gender
        }));
        setChats(processedChats);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chats", error);
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    console.log("hello");
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json())
      .then(json => {
        console.log("world---",json)
      })
  })

  // Initialize with existing unread messages
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!token || !currentUser?._id) return;

        // Fetch unread messages from server
        const response = await axios.get(`${API_BASE_URL}/messages/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Group unread messages by sender
        const counts: Record<string, number> = {};
        response.data.forEach((msg: { sender: string; receiver: string; status: string }) => {
          if (msg.receiver === currentUser._id && msg.status !== 'read') {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
          }
        });

        // Update counts and mark chats as unread
        setUnreadCounts(counts);

        // Update chat UI to show unread indicators
        setChats(prevChats =>
          prevChats.map(chat => {
            if (counts[chat.id] && counts[chat.id] > 0) {
              return { ...chat, unread: true };
            }
            return chat;
          })
        );
      } catch (error) {
        console.error("Error fetching unread messages", error);
      }
    };

    fetchUnreadMessages();
  }, []);

  // Update unread status when receiving new messages
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = async (data: any) => {
      const newMessage = data.message;
      if (!newMessage) return;

      // Get current user to check if the message is for them
      const userData = await AsyncStorage.getItem("user");
      const currentUser = userData ? JSON.parse(userData) : null;

      // Only show notifications for messages sent to the current user
      if (newMessage.receiver === currentUser?._id) {
        // Update the chat list to show notification for the sender
        setChats(prevChats =>
          prevChats.map(chat => {
            // If this chat is from the message sender, mark it as unread
            if (chat.id === newMessage.sender) {
              // Also update the last message preview
              return {
                ...chat,
                unread: true,
                message: newMessage.text || "New message",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // e.g., "04:35 PM"
              };
            }
            return chat;
          })
        );

        // Increment unread count for this sender
        setUnreadCounts(prev => ({
          ...prev,
          [newMessage.sender]: (prev[newMessage.sender] || 0) + 1
        }));
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket]);

  // Function to handle marking messages as read when opening a chat
  const handleChatOpen = (chatItem: any) => {
    // Mark this chat as read in the UI
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatItem.id) {
          return { ...chat, unread: false };
        }
        return chat;
      })
    );

    // Reset unread count for this chat
    setUnreadCounts(prev => ({
      ...prev,
      [chatItem.id]: 0
    }));

    // Navigate to the chat screen
    router.push({
      pathname: "/ChatScreen",
      params: {
        id: chatItem.id,
        name: chatItem.name,
        message: chatItem.message,
        time: chatItem.time,
        avatar: chatItem.avatar,
        gender: chatItem.gender
      },
    });
  };

  const getFilteredChats = () => {
    let filtered = chats;

    if (activeFilter === "Unread") {
      filtered = filtered.filter((chat) => chat.unread);
    } else if (activeFilter === "Favorite") {
      filtered = filtered.filter((chat) => chat.favorite);
    } else if (activeFilter === "Groups") {
      filtered = filtered.filter((chat) => chat.isGroup);
    }

    if (search) {
      filtered = filtered.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Chats</Text>
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <Ionicons name="ellipsis-vertical" size={24} color="black" />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { closeMenu(); }} title="New Group" />
            <Menu.Item onPress={() => { closeMenu(); }} title="New Broadcast" />
            <Menu.Item onPress={() => { closeMenu(); }} title="Linked Devices" />
            <Menu.Item onPress={() => router.push('/Profile')} title="Settings" />
            <Menu.Item onPress={() => router.push('/')} title="Logout" />
          </Menu>
        </View>
        <TextInput style={styles.searchBar} placeholder="Search" value={search} onChangeText={setSearch} />

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
            >
              <Text
                style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={getFilteredChats()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chatItem, item.unread && styles.unreadChatItem]}
              onPress={() => handleChatOpen(item)}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: item.avatar
                      ? item.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&length=1`
                  }}
                  style={styles.avatar}
                />
                {item.unread && unreadCounts[item.id] > 0 && (
                  <Animated.View
                    style={[
                      styles.notificationBadge,
                      { transform: [{ scale: notificationAnimation }] }
                    ]}
                  >
                    <Text style={styles.notificationText}>
                      {unreadCounts[item.id]}
                    </Text>
                  </Animated.View>
                )}
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={[styles.chatName, item.unread && styles.unreadChatName]}>{item.name}</Text>
                  <Text style={[styles.chatTime, item.unread && styles.unreadChatTime]}>{item.time}</Text>
                </View>
                <Text
                  style={[styles.chatMessage, item.unread && styles.unreadChatMessage]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", margin: 15, marginTop: 10 },
  searchBar: {
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  unreadChatItem: {
    backgroundColor: "rgba(37, 211, 102, 0.1)",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: "#25D366",
  },
  filterText: {
    color: "#555",
    fontSize: 14,
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: "green",
    borderWidth: 1
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 20,
    minHeight: 20,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'white',
  },
  notificationText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatContent: { flex: 1, marginLeft: 15, justifyContent: "center" },
  chatHeader: { flexDirection: "row", justifyContent: "space-between" },
  chatName: { fontWeight: "bold", fontSize: 16, maxWidth: '70%' },
  unreadChatName: { fontWeight: "900" },
  chatTime: { color: "gray", fontSize: 12 },
  unreadChatTime: { color: "#25D366", fontWeight: "bold" },
  chatMessage: { color: "gray", marginTop: 3, fontSize: 14 },
  unreadChatMessage: { color: "#000", fontWeight: "500" },
});