// // app/ChatListScreen.tsx

// import { Ionicons } from '@expo/vector-icons';
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { useRouter } from "expo-router";
// import { StatusBar } from 'expo-status-bar';
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   FlatList,
//   Image,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Menu } from 'react-native-paper';
// import { useChat } from "../context/ChatContext";
// import CreateGroupModal from '../GroupModal';


// // Define the API base URL
// const API_BASE_URL = "http://192.168.29.187:3000"; // Replace with your actual API base URL

// const FILTERS = ["All", "Unread", "Favorite", "Groups"];

// export default function ChatListScreen() {
//   const [chats, setChats] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
//   const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
//   const [notificationAnimation] = useState(new Animated.Value(1));
//   const openMenu = () => setMenuVisible(true);
//   const closeMenu = () => setMenuVisible(false);

//   const { socket, messages } = useChat(); // Use the chat context
//   const router = useRouter();

//   // Animation for notification badge
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(notificationAnimation, {
//           toValue: 1.2,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(notificationAnimation, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         // let token = await AsyncStorage.getItem("token");
//         // const response = await axios.get(`${API_BASE_URL}/users`, {
//         //   headers: { Authorization: `Bearer ${token}` }
//         // });

//         // const userData = await AsyncStorage.getItem("user");
//         // const currentUser = userData ? JSON.parse(userData) : null;
//         // const currentUserId = currentUser?._id;

//         // const data = response.data;
//         // const processedChats = data.map((user: any, index: number) => ({
//         //   id: user._id,
//         //   name: user.name,
//         //   message: "Hey! Let's chat!",
//         //   time: "Yesterday",
//         //   avatar: user.profilePicture,
//         //   unread: false, // We'll update this dynamically based on messages
//         //   favorite: index % 3 === 0,
//         //   isGroup: index % 4 === 0,
//         //   gender: user.gender
//         // }));
//         // setChats(processedChats);
//         // setLoading(false);

//  const token = await AsyncStorage.getItem("token");
//         const userData = await AsyncStorage.getItem("user");
//         const currentUser = userData ? JSON.parse(userData) : null;
//         const currentUserId = currentUser?._id;

//         // Fetch both individual chats and groups
//         const [usersResponse, groupsResponse] = await Promise.all([
//           axios.get(`${API_BASE_URL}/users`, {
//             headers: { Authorization: `Bearer ${token}` }
//           }),
//           axios.get(`${API_BASE_URL}/groups`, {
//             headers: { Authorization: `Bearer ${token}` }
//           })
//         ]);

//         // Process individual chats
//         const individualChats = usersResponse.data
//           .filter((user: any) => user._id !== currentUserId)
//           .map((user: any) => ({
//             id: user._id,
//             name: user.name,
//             message: "Hey! Let's chat!",
//             time: "Yesterday",
//             avatar: user.profilePicture,
//             unread: false,
//             favorite: false,
//             isGroup: false,
//             gender: user.gender
//           }));

//         // Process group chats
//         const groupChats = groupsResponse.data.map((group: any) => ({
//           id: group._id,
//           name: group.name,
//           message: "Group chat",
//           time: "Today",
//           avatar: group.profilePicture,
//           unread: false,
//           favorite: false,
//           isGroup: true,
//           members: group.members,
//           description: group.description
//         }));

//         setChats([...individualChats, ...groupChats]);
//         setLoading(false);

//       } catch (error) {
//         console.error("Error fetching chats", error);
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, []);

//   useEffect(() => {
   
//     fetch('https://jsonplaceholder.typicode.com/posts/1')
//       .then(response => response.json())
//       .then(json => {
       
//       })
//   })

//   // Initialize with existing unread messages
//   useEffect(() => {
//     const fetchUnreadMessages = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const userData = await AsyncStorage.getItem("user");
//         const currentUser = userData ? JSON.parse(userData) : null;

//         if (!token || !currentUser?._id) return;

//         // Fetch unread messages from server
//         const response = await axios.get(`${API_BASE_URL}/messages/unread`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         // Group unread messages by sender
//         const counts: Record<string, number> = {};
//         response.data.forEach((msg: { sender: string; receiver: string; status: string }) => {
//           if (msg.receiver === currentUser._id && msg.status !== 'read') {
//             counts[msg.sender] = (counts[msg.sender] || 0) + 1;
//           }
//         });

//         // Update counts and mark chats as unread
//         setUnreadCounts(counts);

//         // Update chat UI to show unread indicators
//         setChats(prevChats =>
//           prevChats.map(chat => {
//             if (counts[chat.id] && counts[chat.id] > 0) {
//               return { ...chat, unread: true };
//             }
//             return chat;
//           })
//         );
//       } catch (error) {
//         console.error("Error fetching unread messages", error);
//       }
//     };

//     fetchUnreadMessages();
//   }, []);



// const handleLogout = async () => {
//   try {
//     // Clear token and user data
//     await AsyncStorage.removeItem('token');
//     await AsyncStorage.removeItem('user');

//     // Navigate to login or home screen
//     router.push('/'); // or router.replace('/login') for better UX

//   } catch (error) {
//     console.error('Logout error:', error);
//     Alert.alert('Logout Failed', 'An error occurred during logout.');
//   }
// };


//   // Update unread status when receiving new messages
//   useEffect(() => {
//     if (!socket) return;

//     // Listen for new messages
//     const handleNewMessage = async (data: any) => {
//       const newMessage = data.message;
//       if (!newMessage) return;

//       // Get current user to check if the message is for them
//       const userData = await AsyncStorage.getItem("user");
//       const currentUser = userData ? JSON.parse(userData) : null;

//       // Only show notifications for messages sent to the current user
//       if (newMessage.receiver === currentUser?._id) {
//         // Update the chat list to show notification for the sender
//         setChats(prevChats =>
//           prevChats.map(chat => {
//             // If this chat is from the message sender, mark it as unread
//             if (chat.id === newMessage.sender) {
//               // Also update the last message preview
//               return {
//                 ...chat,
//                 unread: true,
//                 message: newMessage.text || "New message",
//                 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // e.g., "04:35 PM"
//               };
//             }
//             return chat;
//           })
//         );

//         // Increment unread count for this sender
//         setUnreadCounts(prev => ({
//           ...prev,
//           [newMessage.sender]: (prev[newMessage.sender] || 0) + 1
//         }));
//       }
//     };

//     socket.on('receive_message', handleNewMessage);

//     return () => {
//       socket.off('receive_message', handleNewMessage);
//     };
//   }, [socket]);

//     // Function to handle group chat press
//   const handleGroupChatOpen = (groupItem: any) => {
//     router.push({
//       pathname: "/GroupChatScreen",
//       params: {
//         groupId: groupItem.id,
//         groupName: groupItem.name,
//         members: JSON.stringify(groupItem.members),
//         description: groupItem.description
//       },
//     });
//   };
//   // Function to handle marking messages as read when opening a chat
//   const handleChatOpen = (chatItem: any) => {
//       if (chatItem.isGroup) {
//       handleGroupChatOpen(chatItem);
//       return;
//     }

//     // Mark this chat as read in the UI
//     setChats(prevChats =>
//       prevChats.map(chat => {
//         if (chat.id === chatItem.id) {
//           return { ...chat, unread: false };
//         }
//         return chat;
//       })
//     );

//     // Reset unread count for this chat
//     setUnreadCounts(prev => ({
//       ...prev,
//       [chatItem.id]: 0
//     }));

//     // Navigate to the chat screen
//     router.push({
//       pathname: "/ChatScreen",
//       params: {
//         id: chatItem.id,
//         name: chatItem.name,
//         message: chatItem.message,
//         time: chatItem.time,
//         avatar: chatItem.avatar,
//         gender: chatItem.gender
//       },
//     });
//   };

//     // Render group chat item differently
//   const renderGroupChatItem = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={[styles.chatItem, item.unread && styles.unreadChatItem]}
//       onPress={() => handleChatOpen(item)}
//     >
//       <View style={styles.avatarContainer}>
//         <Image
//           source={{
//             uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&length=1`
//           }}
//           style={styles.avatar}
//         />
//         {item.isGroup && (
//           <View style={styles.groupBadge}>
//             <Ionicons name="people" size={16} color="white" />
//           </View>
//         )}
//         {item.unread && unreadCounts[item.id] > 0 && (
//           <Animated.View
//             style={[
//               styles.notificationBadge,
//               { transform: [{ scale: notificationAnimation }] }
//             ]}
//           >
//             <Text style={styles.notificationText}>
//               {unreadCounts[item.id]}
//             </Text>
//           </Animated.View>
//         )}
//       </View>

//       <View style={styles.chatContent}>
//         <View style={styles.chatHeader}>
//           <Text style={[styles.chatName, item.unread && styles.unreadChatName]}>
//             {item.name}
//             {item.isGroup && " (Group)"}
//           </Text>
//           <Text style={[styles.chatTime, item.unread && styles.unreadChatTime]}>{item.time}</Text>
//         </View>
//         <Text
//           style={[styles.chatMessage, item.unread && styles.unreadChatMessage]}
//           numberOfLines={1}
//           ellipsizeMode="tail"
//         >
//           {item.isGroup ? `${item.members?.length || 0} members` : item.message}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const getFilteredChats = () => {
//     let filtered = chats;

//     if (activeFilter === "Unread") {
//       filtered = filtered.filter((chat) => chat.unread);
//     } else if (activeFilter === "Favorite") {
//       filtered = filtered.filter((chat) => chat.favorite);
//     } else if (activeFilter === "Groups") {
//       filtered = filtered.filter((chat) => chat.isGroup);
//     }

//     if (search) {
//       filtered = filtered.filter((chat) =>
//         chat.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     return filtered;
//   };

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color="#2196F3" />
//       </View>
//     );
//   }

//   return (
//     <>
//       <StatusBar style="light" />
     
//       <View style={styles.container}>
//         <View style={styles.headerRow}>
//           <Text style={styles.title}>Chats</Text>
//           <Menu
//             visible={menuVisible}
//             onDismiss={closeMenu}
//             anchor={
//               <TouchableOpacity onPress={openMenu}>
//                 <Ionicons name="ellipsis-vertical" size={24} color="black" />
//               </TouchableOpacity>
//             }
//           >
//             <Menu.Item onPress={() => { closeMenu();setCreateGroupModalVisible(true); }} title="New Group" />
//             <Menu.Item onPress={() => { closeMenu(); }} title="New Broadcast" />
//             <Menu.Item onPress={() => { closeMenu(); }} title="Linked Devices" />
//             <Menu.Item onPress={() => router.push('/Profile')} title="Settings" />
//             <Menu.Item onPress={handleLogout} title="Logout" />

//           </Menu>
//         </View>
//         <TextInput style={styles.searchBar} placeholder="Search" value={search} onChangeText={setSearch} />

//         <View style={styles.filterRow}>
//           {FILTERS.map((filter) => (
//             <TouchableOpacity
//               key={filter}
//               onPress={() => setActiveFilter(filter)}
//               style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
//             >
//               <Text
//                 style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}
//               >
//                 {filter}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <FlatList
//           data={getFilteredChats()}
//           keyExtractor={(item) => item.id}
//             renderItem={renderGroupChatItem}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={[styles.chatItem, item.unread && styles.unreadChatItem]}
//               onPress={() => handleChatOpen(item)}
//             >
//               <View style={styles.avatarContainer}>
//                 <Image
//                   source={{
//                     uri: item.avatar
//                       ? item.avatar
//                       : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&length=1`
//                   }}
//                   style={styles.avatar}
//                 />
//                 {item.unread && unreadCounts[item.id] > 0 && (
//                   <Animated.View
//                     style={[
//                       styles.notificationBadge,
//                       { transform: [{ scale: notificationAnimation }] }
//                     ]}
//                   >
//                     <Text style={styles.notificationText}>
//                       {unreadCounts[item.id]}
//                     </Text>
//                   </Animated.View>
//                 )}
//               </View>

//               <View style={styles.chatContent}>
//                 <View style={styles.chatHeader}>
//                   <Text style={[styles.chatName, item.unread && styles.unreadChatName]}>{item.name}</Text>
//                   <Text style={[styles.chatTime, item.unread && styles.unreadChatTime]}>{item.time}</Text>
//                 </View>
//                 <Text
//                   style={[styles.chatMessage, item.unread && styles.unreadChatMessage]}
//                   numberOfLines={1}
//                   ellipsizeMode="tail"
//                 >
//                   {item.message}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
//      <CreateGroupModal
//   visible={createGroupModalVisible}
//   onClose={() => setCreateGroupModalVisible(false)}
//   onCreateSuccess={() => {
//     setCreateGroupModalVisible(false);
//     // You might want to refresh the chat list here
//     fetchChats(); // Uncomment if you want to refresh the list after creation
//   }}
// />
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1,  },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 24, fontWeight: "bold", margin: 15, marginTop: 10 },
//   searchBar: {
//     marginHorizontal: 15,
//     marginBottom: 10,
//     padding: 10,
//     borderRadius: 20,
//     backgroundColor: "#f0f0f0",
//   },
//   chatItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
//   unreadChatItem: {
//     backgroundColor: "rgba(37, 211, 102, 0.1)",
//   },
//   filterRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 10,
//   },
//   filterButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     backgroundColor: "#eee",
//     borderRadius: 20,
//   },
//   activeFilterButton: {
//     backgroundColor: "#25D366",
//   },
//   filterText: {
//     color: "#555",
//     fontSize: 14,
//   },
//   activeFilterText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginHorizontal: 15,
//     marginTop: 40,
//   },
//   avatarContainer: {
//     position: 'relative',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderColor: "green",
//     borderWidth: 1
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: -5,
//     right: -5,
//     backgroundColor: '#FF3B30',
//     borderRadius: 12,
//     minWidth: 20,
//     minHeight: 20,
//     paddingHorizontal: 4,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//     borderWidth: 1,
//     borderColor: 'white',
//   },
//   notificationText: {
//     color: 'white',
//     fontSize: 11,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   chatContent: { flex: 1, marginLeft: 15, justifyContent: "center" },
//   chatHeader: { flexDirection: "row", justifyContent: "space-between" },
//   chatName: { fontWeight: "bold", fontSize: 16, maxWidth: '70%' },
//   unreadChatName: { fontWeight: "900" },
//   chatTime: { color: "gray", fontSize: 12 },
//   unreadChatTime: { color: "#25D366", fontWeight: "bold" },
//   chatMessage: { color: "gray", marginTop: 3, fontSize: 14 },
//   unreadChatMessage: { color: "#000", fontWeight: "500" },
// });


import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  Animated, 
  FlatList, 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from "react-native";
import { Menu } from 'react-native-paper';
import { useChat } from "../context/ChatContext";
import CreateGroupModal from '../GroupModal';

const API_BASE_URL = "http://192.168.29.187:3000";
const FILTERS = ["All", "Unread", "Favorite", "Groups"];

export default function ChatListScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [menuVisible, setMenuVisible] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notificationAnimation] = useState(new Animated.Value(1));
  
  const { socket } = useChat();
  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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

  const fetchChats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      const currentUser = userData ? JSON.parse(userData) : null;
      const currentUserId = currentUser?._id;

      if (!token || !currentUserId) {
        throw new Error("Authentication required");
      }

      // Fetch both individual chats and groups
      const [usersResponse, groupsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process individual chats
      const individualChats = usersResponse.data
        .filter((user: any) => user._id !== currentUserId)
        .map((user: any) => ({
          id: user._id,
          name: user.name,
          message: user.lastMessage?.text || "Hey! Let's chat!",
          time: user.lastMessage?.createdAt 
            ? new Date(user.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : "Yesterday",
          avatar: user.profilePicture,
          unread: false,
          favorite: false,
          isGroup: false,
          gender: user.gender
        }));

      // Process group chats
      const groupChats = groupsResponse.data.map((group: any) => ({
        id: group._id,
        name: group.name,
        message: group.lastMessage?.text || "Group chat",
        time: group.lastMessage?.createdAt 
          ? new Date(group.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : "Today",
        avatar: group.profilePicture,
        unread: false,
        favorite: false,
        isGroup: true,
        members: group.members,
        description: group.description
      }));

      setChats([...individualChats, ...groupChats]);
    } catch (error) {
      console.error("Error fetching chats", error);
      Alert.alert("Error", "Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userData = await AsyncStorage.getItem("user");
        const currentUser = userData ? JSON.parse(userData) : null;

        if (!token || !currentUser?._id) return;

        const [individualUnread, groupUnread] = await Promise.all([
          axios.get(`${API_BASE_URL}/messages/unread`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE_URL}/group-messages/unread`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const counts: Record<string, number> = {};

        // Individual messages
        individualUnread.data.forEach((msg: { sender: string; receiver: string; status: string }) => {
          if (msg.receiver === currentUser._id && msg.status !== 'read') {
            counts[msg.sender] = (counts[msg.sender] || 0) + 1;
          }
        });

        // Group messages
        groupUnread.data.forEach((group: { groupId: string; count: number }) => {
          counts[group.groupId] = group.count;
        });

        setUnreadCounts(counts);
        setChats(prevChats =>
          prevChats.map(chat => ({
            ...chat,
            unread: counts[chat.id] > 0
          }))
        );
      } catch (error) {
        console.error("Error fetching unread messages", error);
      }
    };

    fetchUnreadMessages();
  }, []);

  // Handle new messages from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const newMessage = data.message;
      if (!newMessage) return;

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === newMessage.sender) {
            return {
              ...chat,
              unread: true,
              message: newMessage.text || "New message",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return chat;
        })
      );

      setUnreadCounts(prev => ({
        ...prev,
        [newMessage.sender]: (prev[newMessage.sender] || 0) + 1
      }));
    };

    const handleNewGroupMessage = (data: any) => {
      const newMessage = data.message;
      if (!newMessage) return;

      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.isGroup && chat.id === newMessage.group) {
            return {
              ...chat,
              unread: true,
              message: newMessage.text || "New group message",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return chat;
        })
      );

      setUnreadCounts(prev => ({
        ...prev,
        [newMessage.group]: (prev[newMessage.group] || 0) + 1
      }));
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('receive_group_message', handleNewGroupMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('receive_group_message', handleNewGroupMessage);
    };
  }, [socket]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  };

  const handleChatOpen = (chatItem: any) => {
    // Mark as read in UI
    setChats(prevChats =>
      prevChats.map(chat => {
        if (chat.id === chatItem.id) {
          return { ...chat, unread: false };
        }
        return chat;
      })
    );

    // Reset unread count
    setUnreadCounts(prev => ({
      ...prev,
      [chatItem.id]: 0
    }));

    // Navigate to ChatScreen with appropriate parameters
    router.push({
      pathname: "/ChatScreen",
      params: {
        id: chatItem.id,
        name: chatItem.name,
        avatar: chatItem.avatar,
        isGroup: chatItem.isGroup ? "true" : "false",
        ...(chatItem.isGroup && {
          members: JSON.stringify(chatItem.members),
          description: chatItem.description
        })
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

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.chatItem, item.unread && styles.unreadChatItem]}
      onPress={() => handleChatOpen(item)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&length=1`
          }}
          style={styles.avatar}
        />
        {item.isGroup && (
          <View style={styles.groupBadge}>
            <Ionicons name="people" size={16} color="white" />
          </View>
        )}
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
          <Text style={[styles.chatName, item.unread && styles.unreadChatName]}>
            {item.name}
            {item.isGroup && " (Group)"}
          </Text>
          <Text style={[styles.chatTime, item.unread && styles.unreadChatTime]}>
            {item.time}
          </Text>
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
  );

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
            <Menu.Item 
              onPress={() => { 
                closeMenu(); 
                setCreateGroupModalVisible(true); 
              }} 
              title="New Group" 
            />
            <Menu.Item onPress={() => { closeMenu(); }} title="New Broadcast" />
             <Menu.Item onPress={() => { closeMenu(); }} title="Linked Devices" />
           <Menu.Item onPress={() => router.push('/Profile')} title="Settings" />
            <Menu.Item 
              onPress={() => { 
                closeMenu(); 
                handleLogout();
              }} 
              title="Logout" 
            />
          </Menu>
        </View>

        <TextInput
          style={styles.searchBar}
          placeholder="Search chats..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton, 
                activeFilter === filter && styles.activeFilterButton
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={getFilteredChats()}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search ? "No matching chats found" : "No chats available"}
              </Text>
            </View>
          }
        />
      </View>

      <CreateGroupModal
        visible={createGroupModalVisible}
        onClose={() => setCreateGroupModalVisible(false)}
        onCreateSuccess={() => {
          setCreateGroupModalVisible(false);
          fetchChats();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#25D366',
  },
  filterText: {
    color: '#555',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadChatItem: {
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#eee',
  },
  groupBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#25D366',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    maxWidth: '70%',
  },
  unreadChatName: {
    fontWeight: 'bold',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadChatTime: {
    color: '#25D366',
    fontWeight: 'bold',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadChatMessage: {
    color: '#000',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});