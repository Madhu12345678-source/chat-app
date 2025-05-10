import React, {useState} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { Ionicons, Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import emoji from "emoji-dictionary";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
// import * as Contacts from "expo-contacts";
import * as Camera from "expo-camera";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
// import { Audio } from "expo-av";
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
            const docResult = await DocumentPicker.getDocumentAsync({
              type: '*/*',
              copyToCacheDirectory: true 
            });
            
            if (!docResult.canceled && docResult.assets?.[0]) {
              const file = docResult.assets[0];
              
              // Convert to Blob first
              const response = await fetch(file.uri);
              const blob = await response.blob();
              
              const formData = new FormData();
              formData.append("file", blob, file.name || "document");
              
              const uploadResponse = await fetch("http://localhost:3000/upload/file", {
                method: "POST",
                body: formData,
                // headers: {
                //   "Content-Type": "multipart/form-data",
                // },
              });
    
              if (!uploadResponse.ok) throw new Error("Upload failed");
              
              const result = await uploadResponse.json();
              console.log("Upload success:", result);
              Alert.alert("Success", "Document uploaded!");
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
