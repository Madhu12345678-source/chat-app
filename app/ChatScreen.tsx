

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "./context/ChatContext";
import { useAuth } from "./context/AuthContext";
import ChatBox from "./chatBox/ChatBox";
import { useGroup } from "./context/GroupContext";

export default function ChatScreen() {
  const { id, name, avatar, isGroup, members, description } = useLocalSearchParams();
  const router = useRouter();

  // Chat context for individual chats
  const {
    messages,
    sendMessage,
    markAsRead,
    onlineUsers,
    loadingMessages,
    setCurrentChat,
    fetchMessages,
    socket,
  } = useChat();

  // Group context for group chats
  const {
    currentGroup,
    setCurrentGroup,
    groupMessages,
    sendGroupMessage,
    markGroupMessageAsRead,
    loadingGroupMessages,
    fetchGroupMessages,
    joinGroup,
    leaveGroup,
  } = useGroup();

  const { user: currentUser } = useAuth();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const isGroupChat = isGroup === "true";

  // Set current chat when screen loads
  useEffect(() => {
    if (!id) {
      Alert.alert("Error", "Invalid chat ID");
      router.replace("/Chats");
      return;
    }

    if (isGroupChat) {
      // For group chats, set current group and fetch group messages
      const groupData = {
        _id: id as string,
        name: name as string,
        description: description as string,
        members: members ? JSON.parse(members as string) : [],
        profilePicture: avatar as string,
        creator: "", // Provide actual creator id if available
        admins: [],  // Provide actual admins array if available
        createdAt: new Date().toISOString(), // Provide actual createdAt if available
      };

      setCurrentGroup(groupData);
      fetchGroupMessages(id as string);
      joinGroup(id as string);
    } else {
      // For individual chats, use existing logic
      const chatData = {
        _id: id as string,
        name: name as string,
        email: "",
        profilePicture: avatar as string,
      };

      setCurrentChat(chatData);
      fetchMessages(id as string);
    }

    return () => {
      if (isGroupChat) {
        leaveGroup(id as string);
        setCurrentGroup(null);
      } else {
        setCurrentChat(null);
      }
    };
  }, [id, isGroupChat]);

  // Handle marking messages as read
  useEffect(() => {
    if (!currentUser?._id) return;

    if (isGroupChat) {
      // Mark group messages as read
      const unreadGroupMessages = groupMessages.filter(msg =>
        !msg.readBy.some(read => read.user === currentUser._id)
      );

      unreadGroupMessages.forEach(msg => {
        markGroupMessageAsRead(msg._id);
      });
    } else {
      // Existing logic for individual chats
      const unreadMessages = messages.filter(msg =>
        msg.status !== 'read' && msg.sender === id
      );

      if (unreadMessages.length > 0) {
        const markAsReadPromises = unreadMessages.map(msg =>
          markAsRead(msg._id, msg.sender)
        );

        Promise.all(markAsReadPromises).catch(error => {
          console.error("Error marking messages as read:", error);
        });
      }
    }
  }, [isGroupChat ? groupMessages : messages, currentUser?._id, id, isGroupChat]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesList = isGroupChat ? groupMessages : messages;
    if (messagesList.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isGroupChat ? groupMessages : messages]);

  const handleSendMessage = async () => {
    const messageText = input.trim();
    if (!messageText || isSending) return;

    try {
      setIsSending(true);
      const inputToSend = input;
      setInput("");

      if (isGroupChat) {
        await sendGroupMessage(inputToSend);
      } else {
        await sendMessage(inputToSend);
      }
    } catch (err) {
      console.error("Send message error:", err);
      Alert.alert("Error", "Failed to send message. Please try again.");
      setInput(input);
    } finally {
      setIsSending(false);
    }
  };

   const handleProfileNavigation = () => {
    if (isGroupChat) {
      router.push({
        pathname: "/GroupChartScreen",
        params: {
          groupId: id as string,
          groupName: name as string,
          avatar: avatar as string,
          members: members as string,
          description: description as string
        }
      });
    } else {
      router.push({
        pathname: "/ProfileScreen",
        params: {
          id: id as string,
          name: name as string,
          avatar: avatar as string,
        }
      });
    }
  };

  // Update the renderMessageItem function
  const renderMessageItem = ({ item }: { item: any }) => {
    const isCurrentUser = isGroupChat
      ? item.sender._id === currentUser?._id
      : item.sender === currentUser?._id;
    const isImage = item.fileType?.startsWith("image/");
    const isDocument = item.fileUrl && !isImage;

    return (
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.myMessage : styles.theirMessage,
        ]}
      >



        {/* Show sender name for group messages (if not current user) */}
        {isGroupChat && !isCurrentUser && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}

        {item.text && <Text style={styles.messageText}>{item.text}</Text>}

        {item.fileUrl && (
          <View style={styles.fileContainer}>
            {isImage ? (
              <Image
                source={{ uri: item.fileUrl }}
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

        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>
            {new Date(isGroupChat ? item.timestamp : item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          {isCurrentUser && !isGroupChat && (
            <View style={styles.statusIndicator}>
              {item.status === 'read' ? (
                <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
              ) : item.status === 'delivered' ? (
                <Ionicons name="checkmark-done" size={16} color="#888" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#888" />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Get the appropriate data based on chat type
  const currentMessages = isGroupChat ? groupMessages : messages;
  const currentLoadingState = isGroupChat ? loadingGroupMessages : loadingMessages;
  const isOnline = !isGroupChat && onlineUsers?.includes(id as string);

  // Update the FlatList data source
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />

      {/* Header remains the same */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/Chats")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleProfileNavigation}
          style={styles.profileButton}
        >
          <Image
            source={{
              uri: avatar?.toString() ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name as string)}&background=random`,
            }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.status}>
              {isGroupChat
                ? `${JSON.parse(members as string)?.length || 0} members`
                : isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.roundIconButton}>
            <Ionicons name="videocam" size={24} color="#3a1140" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundIconButton}>
            <Ionicons name="call" size={24} color="#3a1140" />
          </TouchableOpacity>

        </View>
        </View>

        {currentLoadingState ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#075E54" />
          </View>
        ) : (
          <>
            {currentMessages?.length === 0 ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatText}>
                  {isGroupChat
                    ? "No messages in this group yet. Start the conversation!"
                    : "No messages yet. Say hello!"}
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={currentMessages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessageItem}
                contentContainerStyle={styles.messagesContainer}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
              />
            )}

            <ChatBox
              input={input}
              setInput={setInput}
              onSend={handleSendMessage}
              isSending={isSending}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              setDocumentUrl={() => { }}
              isGroupChat={isGroupChat}
            />
          </>
        )}
      </View>
      );
}

      const styles = StyleSheet.create({
        container: {
        flex: 1,
      backgroundColor: '#e5ddd5',
  },
      senderName: {
        fontSize: 12,
      fontWeight: '600',
      color: '#666',
      marginBottom: 4,
  },
      header: {
        flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 15,
      backgroundColor: '#3a1140',
      elevation: 4,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
      backButton: {
        marginRight: 10,
  },
      profileButton: {
        flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
  },
      avatar: {
        width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
  },
      headerText: {
        flex: 1,
  },
      name: {
        fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
  },
      status: {
        fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
  },
      headerIcons: {
        flexDirection: 'row',
      alignItems: 'center',
  },
      roundIconButton: {
        width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#dcf8c6', // Green shade
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
 },
      iconButton: {
        marginLeft: 20,
  },
      loader: {
        flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e5ddd5',
  },
      emptyChat: {
        flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
      emptyChatText: {
        fontSize: 16,
      color: '#888',
      textAlign: 'center',
  },
      messagesContainer: {
        padding: 10,
      paddingBottom: 20,
  },
      messageBubble: {
        maxWidth: '80%',
      padding: 12,
      marginVertical: 4,
      borderRadius: 8,
  },
      myMessage: {
        backgroundColor: '#DCF8C6',
      alignSelf: 'flex-end',
      borderTopRightRadius: 0,
  },
      theirMessage: {
        backgroundColor: 'white',
      alignSelf: 'flex-start',
      borderTopLeftRadius: 0,
  },
      messageText: {
        fontSize: 16,
      color: '#000',
  },
      fileContainer: {
        marginTop: 8,
  },
      filePreview: {
        width: 250,
      height: 200,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
  },
      fileBox: {
        flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
  },
      fileName: {
        marginLeft: 8,
      fontSize: 14,
      color: '#2196F3',
      maxWidth: 200,
  },
      messageFooter: {
        flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 4,
  },
      messageTime: {
        fontSize: 12,
      color: '#666',
      marginRight: 4,
  },
      statusIndicator: {
        marginLeft: 4,
  },
});