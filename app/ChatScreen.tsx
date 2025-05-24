import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Image, StyleSheet, FlatList,
  TextInput, Platform, KeyboardAvoidingView,
  TouchableOpacity, ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ChatBox from "./chatBox/ChatBox";


import emoji from "emoji-dictionary";
import { ScrollView } from "react-native";
import { useChat } from "./context/ChatContext";
import { useAuth } from "./context/AuthContext";

const emojiList: string[] = emoji.names.map((name: string) => emoji.getUnicode(name));

// FIXED ChatScreen.tsx - Key sections that need updates

export default function ChatScreen() {
  const { name, avatar, id } = useLocalSearchParams();
  const router = useRouter();
  const {
    messages,
    sendMessage,
    markAsRead,
    onlineUsers,
    loadingMessages,
    setCurrentChat,
    fetchMessages,
    socket,
    error,
  } = useChat();
  const { user: currentUser } = useAuth();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const lastMessageReadRef = useRef<string>('');


  // Set current chat when screen loads
  useEffect(() => {
    console.log("Setting up chat with:", { id, name });

    if (!id) {
      Alert.alert("Error", "Invalid chat ID");
      router.replace("/Chats");
      return;
    }

    setCurrentChat({
      _id: id as string,
      name: name as string,
      email: '',
      profilePicture: avatar as string,
    });

    fetchMessages(id as string);
  }, [id]);

    // FIXED: Auto-mark messages as read when screen is active
  useEffect(() => {
    if (!currentUser?._id || !messages.length) return;

    const unreadMessages = messages.filter(
      (msg) =>
        msg.receiver === currentUser._id &&
        msg.sender === id &&
        msg.status !== 'read'
    );

    if (unreadMessages.length > 0) {
      console.log(`Auto-marking ${unreadMessages.length} messages as read`);
      
      // Add small delay to ensure messages are visible
      const timer = setTimeout(() => {
        unreadMessages.forEach((msg) => {
          console.log('Auto-marking message as read:', msg._id);
          markAsRead(msg._id, msg.sender);
        });
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [messages, currentUser?._id, id, markAsRead]);

  // FIXED: Mark messages as read (prevent duplicate reads)
  useEffect(() => {
    if (!currentUser?._id || !messages.length) return;

    const unreadMessages = messages.filter(
      (msg) =>
        msg.receiver === currentUser._id &&
        msg.sender === id &&
        msg.status !== 'read'
    );

    // Only process if there are new unread messages
    if (unreadMessages.length > 0) {
      const latestUnreadId = unreadMessages[unreadMessages.length - 1]._id;
      
      // Avoid marking the same message multiple times
      if (latestUnreadId !== lastMessageReadRef.current) {
        console.log(`Marking ${unreadMessages.length} messages as read`);
        unreadMessages.forEach((msg) => markAsRead(msg._id, msg.sender));
        lastMessageReadRef.current = latestUnreadId;
      }
    }
  }, [messages, currentUser?._id, id]);

  // FIXED: Handle send message with proper loading state
  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isSending) return;

    try {
      setIsSending(true);
      const inputToSend = input; // Store input before clearing
      setInput(""); // Clear input immediately
      
      await sendMessage(inputToSend);
    } catch (err) {
      console.error("Send message error:", err);
      Alert.alert("Error", "Failed to send message. Please try again.");
      setInput(input); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  // Rest of your component remains the same...
  const handleProfileNavigation = () => {
    router.push({
      pathname: "/ProfileScreen",
      params: {
        id: id as string,
        name: name as string,
        avatar: avatar as string,
        time: new Date().toLocaleTimeString()
      }
    });
  };

  const isOnline = onlineUsers?.includes(id?.toString());

  return (
    <View style={styles.container}>
      {/* Header remains the same */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/Chats")}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleProfileNavigation}>
          <Image
            source={{
              uri: avatar
                ? avatar.toString()
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(name as string)}&background=random&length=1`,
            }}
            style={[styles.avatar, isOnline && styles.avatarOnline]}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={[styles.time, isOnline && styles.onlineText]}>
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => console.log("Video Call Pressed")}>
            <Ionicons name="videocam" size={22} color="black" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Audio Call Pressed")}>
            <Ionicons name="call" size={22} color="black" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {loadingMessages ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={50}
        >
          {messages?.length === 0 ? (
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === currentUser?._id ? styles.myMessage : styles.theirMessage,
                  ]}
                >
                  {item.text && <Text style={styles.messageText}>{item.text}</Text>}
                
                    {/* <Image
                          source={{ uri:"https://images.pexels.com/photos/31416570/pexels-photo-31416570/free-photo-of-close-up-of-vibrant-red-ranunculus-flower.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" }}
                          crossOrigin="anonymous"
                          style={styles.filePreview}
                          resizeMode="cover"
                          
                        /> */}
                 
                  {item.fileUrl && (
                    <View>
                      {item.fileType ? (
                        <Image
                          source={{ uri:item.fileUrl }}
                          // crossOrigin="anonymous"
                          style={styles.filePreview}
                          resizeMode="cover"
                        />
                      ) : (
                        <TouchableOpacity
                          style={styles.fileBox}
                          onPress={() => Linking.openURL(item.fileUrl)}
                        >
                          <Ionicons name="document-outline" size={24} color="#2196F3" />
                          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                            {item.fileName || "File attachment"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* FIXED: Message status display */}
                  <Text style={styles.messageStatus}>
                    {item.timestamp 
                  ? new Date(item.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  : new Date().toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                }
                    {/* Only show status for sent messages */}
                     {item.sender === currentUser?._id && (
                <View style={styles.statusTicks}>
                  {item.status === 'sent' && (
                    <Text style={[styles.tick, styles.singleTick]}>✓</Text>
                  )}
                  {item.status === 'delivered' && (
                    <Text style={[styles.tick, styles.doubleTick]}>✓✓</Text>
                  )}
                  {item.status === 'read' && (
                    <Text style={[styles.tick, styles.readTick]}>✓✓</Text>
                  )}
                </View>
              )}
                  </Text>
                </View>
              )}
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}

          <ChatBox
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            isSending={isSending}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            // showEmojiPicker={false}
            setDocumentUrl={setDocumentUrl}
            // setShowEmojiPicker={() => {}}
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChatText: {
    color: '#888',
    fontSize: 16,
  },
  icon: {
    marginHorizontal: 10,
  },
filePreview: {
  width: 300,
  height: 300,
  borderRadius: 12,
  marginTop: 10,
  borderWidth: 1,
  borderColor: '#ccc',
  resizeMode: 'cover',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
  alignSelf: 'center',
  backgroundColor: '#f9f9f9',
}
,
 
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
    marginTop: Platform.OS === 'ios' ? 45 : 10,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginLeft: "auto",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  avatarOnline: {
    borderColor: "green",
    borderWidth: 2,
  },
  headerText: {
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold"
  },
  time: {
    fontSize: 14,
    color: "gray"
  },
  onlineText: {
    color: "green",
  },
  messagesContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  theirMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16
  },
  // inputContainer: {
  //   flexDirection: "row",
  //   padding: 10,
  //   borderTopWidth: 1,
  //   borderTopColor: "#eee",
  //   backgroundColor: "#fff",
  //   alignItems: "center",
  // },
  input: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  attachButton: {
    paddingHorizontal: 8,
    marginRight: 5,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#b3d9ff",
  },
  backIcon: {
    marginRight: 10,
  },
  emojiScrollView: {
    maxHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  emojiScrollContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    padding: 10,
  },
  emojiItem: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  emojiText: {
    fontSize: 18,
  },
  fileBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 5,
  },
  fileName: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 5,
    textAlign: "center",
  },
  messageStatus: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  
  statusTicks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  tick: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  singleTick: {
    color: '#999', // Gray for sent
  },
  
  doubleTick: {
    color: '#999', // Gray for delivered
  },
  
  readTick: {
    color: '#4CAF50', // Green/blue for read
  },
});

