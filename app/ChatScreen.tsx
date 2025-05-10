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

  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Set current chat when screen loads
  useEffect(() => {
    console.log("Setting up chat with:", { id, name });

    if (!id) {
      Alert.alert("Error", "Invalid chat ID");
      router.replace("/Chats");
      return;
    }

    // Setup current chat user
    setCurrentChat({
      _id: id as string,
      name: name as string,
      email: '',
      profilePicture: avatar as string,
    });

    // Fetch messages
    fetchMessages(id as string);

    // Join socket room if needed
    if (socket) {
      socket.emit('join_chat', id);
    }

    return () => {
      // Leave chat room on unmount if needed
      if (socket) {
        socket.emit('leave_chat', id);
      }
    };
  }, [id, socket]);

  // Monitor errors
  useEffect(() => {
    if (error) {
      Alert.alert("Chat Error", error);
    }
  }, [error]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages?.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Mark messages as read when they appear on screen
  useEffect(() => {
    if (!currentUser?._id) return;

    const unreadMessages = messages.filter(
      (msg) =>
        msg.receiver === currentUser._id &&
        msg.sender === id &&
        msg.status !== 'read'
    );

    if (unreadMessages?.length > 0) {
      console.log(`Marking ${unreadMessages?.length} messages as read`);
      unreadMessages.forEach((msg) => markAsRead(msg._id, msg.sender));
    }
  }, [messages, currentUser?._id, id]);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(input);
      setInput("");
      setShowEmojiPicker(false);
    } catch (err) {
      Alert.alert("Error", "Failed to send message. Please try again.");
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const isOnline = onlineUsers.includes(id as string);

  // Debug socket connection
  const debugConnection = () => {
    console.log("Socket connected:", !!socket?.connected);
    console.log("Current user:", currentUser?._id);
    console.log("Chat with:", id);
    console.log("Online users:", onlineUsers);
    console.log("Message count:", messages?.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/Chats")}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backIcon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={debugConnection}>
          <Image
            source={{
              uri: avatar
                ? avatar.toString()
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(name as string)}&background=random&length=1`,
            }}
            style={[
              styles.avatar,
              isOnline && styles.avatarOnline
            ]}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={[
            styles.time,
            isOnline && styles.onlineText
          ]}>
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
          keyboardVerticalOffset={90}
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
                {/* Show text if present */}
                {item.text && <Text style={styles.messageText}>{item.text}</Text>}
                
                {/* Handle file attachments */}
                {item.fileUrl && (
                  <View style={styles.container}>
                    {/* For images, show preview */}
                    {item.fileType && item.fileType.startsWith('image/') ? (
                      <Image
                        source={{ uri: item.fileUrl }}
                        style={styles.filePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      /* For other files, show an icon and filename */
                      <TouchableOpacity 
                        style={styles.fileBox}
                        onPress={() => Linking.openURL(item.fileUrl)}
                      >
                        <Ionicons 
                          name="document-outline" 
                          size={24} 
                          color="#2196F3" 
                        />
                        <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                          {item.fileName || "File attachment"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                
                {/* Message metadata */}
                <Text style={styles.messageStatus}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {item.status === 'read' && ' ✓✓'}
                  {item.status === 'delivered' && ' ✓'}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messagesContainer}
          />
          )}

          <ChatBox
            input={input}
            setInput={setInput}
            onSend={handleSendMessage}
            isSending={isSending}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
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
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  messageStatus: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
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
});