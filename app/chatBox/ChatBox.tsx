import { Ionicons } from "@expo/vector-icons";
import emoji from "emoji-dictionary";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// import * as Contacts from "expo-contacts";
import * as Camera from "expo-camera";
import * as FileSystem from 'expo-file-system';
// import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AttachmentModal from "../attachement/Attachement";

interface Props {
  input: string;
  setInput: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
}

const emojiList: string[] = emoji.names.map((name: string) => emoji.getUnicode(name));

export default function ChatBox({
  input,
  setInput,
  onSend,
  isSending,
  showEmojiPicker,
  setShowEmojiPicker,

}: Props) {

  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const API_BASE_URL = Platform.select({
    android: 'http://192.168.29.187:3000',
    ios: 'http://localhost:3000',
    default: 'http://localhost:3000' // For web/other platforms
  });


  // Improved file size validation function with type-safe handling
  const validateFileSize = async (file: DocumentPicker.DocumentPickerAsset): Promise<{ isValid: boolean, actualSize: number }> => {
    let fileSize = 0;

    try {
      if (Platform.OS !== 'web') {
        // Mobile platforms (iOS/Android)
        try {
          const fileInfo = await FileSystem.getInfoAsync(file.uri, { size: true });

          // Type-safe size extraction
          if (fileInfo.exists) {
            // Use optional chaining and nullish coalescing for type safety
            fileSize = fileInfo.size ?? 0;
          } else {
            console.warn('File does not exist:', file.uri);

            Alert.alert(
              "File Access Error",
              "Unable to access the selected file. Please try again."
            );

            return {
              isValid: false,
              actualSize: 0
            };
          }
        } catch (fsError) {
          console.error('FileSystem error:', fsError);

          // Fallback method
          const uriSize = await getFileSizeFromUri(file.uri);
          fileSize = uriSize;
        }
      } else {
        // Web platform
        fileSize = file.size || 0;
      }

      // Convert to kilobytes for logging
      const fileSizeKB = fileSize / 1024;
      const fileSizeMB = fileSize / (1024 * 1024);

      console.log(`File Details:
    - Name: ${file.name}
    - URI: ${file.uri}
    - MIME Type: ${file.mimeType}
    - Size (bytes): ${fileSize}
    - Size (KB): ${fileSizeKB.toFixed(2)}
    - Size (MB): ${fileSizeMB.toFixed(2)}`);

      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      const isValid = fileSize <= MAX_FILE_SIZE;

      return {
        isValid,
        actualSize: fileSize
      };
    } catch (error) {
      console.error('File size validation error:', error);

      // Fallback validation if size cannot be determined
      Alert.alert(
        "File Size Check Error",
        "Unable to verify file size. Please check the file manually."
      );

      return {
        isValid: false,
        actualSize: 0
      };
    }
  };

  // Fallback method to get file size from URI
  const getFileSizeFromUri = async (uri: string): Promise<number> => {
    try {
      // Attempt to fetch the file to get its size
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    } catch (error) {
      console.error('Fallback file size retrieval error:', error);
      return 0;
    }
  };



  const handleAttachmentSelect = async (type: string) => {
    setShowModal(false);

    try {
      switch (type) {
        case 'gallery':
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!galleryResult.canceled) {
            console.log('Gallery Image:', galleryResult.assets[0].uri);
          }
          break;

        case 'camera':
          const [cameraPerm, requestPermission] = Camera.useCameraPermissions();
          if (!cameraPerm?.granted) {
            const permissionResponse = await requestPermission();
            if (!permissionResponse.granted) {
              return Alert.alert('Permission denied', 'Camera access is required.');
            }
          }
          const camResult = await ImagePicker.launchCameraAsync({ quality: 1 });
          if (!camResult.canceled) {
            console.log('Camera Image:', camResult.assets[0].uri);
          }
          break;

        case 'location':
          const locPerm = await Location.requestForegroundPermissionsAsync();
          if (!locPerm.granted) return Alert.alert('Permission denied', 'Location access is required.');
          const loc = await Location.getCurrentPositionAsync({});
          console.log('Location:', loc.coords.latitude, loc.coords.longitude);
          break;

        case 'document':
          try {
            const docResult = await DocumentPicker.getDocumentAsync({
              type: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ],
              copyToCacheDirectory: true
            });

            if (!docResult.canceled && docResult.assets?.[0]) {
              const file = docResult.assets[0];

              // Validate file type
              const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];

              if (!allowedTypes.includes(file.mimeType || '')) {
                Alert.alert(
                  "Invalid File Type",
                  "Only images (JPEG, PNG, GIF), PDFs, and Word documents are allowed."
                );
                return;
              }

              // Comprehensive file size validation
              const { isValid, actualSize } = await validateFileSize(file);

              if (!isValid) {
                Alert.alert(
                  "File Too Large",
                  `File must be less than 10MB. Current file size is ${(actualSize / (1024 * 1024)).toFixed(2)} MB.`
                );
                return;
              }

              // Proceed with file upload...
              const formData = new FormData();
              formData.append('file', {
                uri: file.uri,
                type: file.mimeType || 'application/octet-stream',
                name: file.name || `document-${Date.now()}`
              } as any);

              // Rest of the upload logic...
            }
          } catch (err) {
            console.error('Document selection error:', err);
            Alert.alert(
              "Error",
              "Failed to select or process the document."
            );
          }
          break;

        case 'audio':
          const audioResult = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
          });

          if (!audioResult.canceled && audioResult.assets && audioResult.assets.length > 0) {
            const audio = audioResult.assets[0];
            console.log('Audio File:', audio.uri);
          }

          break;
      }
    } catch (err) {
      console.error('Attachment error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <>
      {showEmojiPicker && (
        <ScrollView
          style={styles.emojiScrollView}
          contentContainerStyle={styles.emojiScrollContent}
        >
          {emojiList.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setInput(input + emoji)}
              style={styles.emojiItem}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.attachButton}>
          <Text style={{ fontSize: 24 }}>😊</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          multiline
        />

        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.icon}>
          <Ionicons name="attach" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSend}
          style={[styles.sendButton, (input.trim() === "" || isSending) && styles.sendButtonDisabled]}
          disabled={input.trim() === "" || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
      <AttachmentModal visible={showModal} onClose={() => setShowModal(false)} onSelect={handleAttachmentSelect} />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
    alignItems: "center",
  },
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
  icon: {
    padding: 8,
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
});
