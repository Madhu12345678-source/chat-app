// screens/PreviewScreen.tsx
import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PreviewScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { photoUri } = route.params;

  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any); // `as any` fixes TS complaint about FormData type in React Native

      const response = await fetch('http://YOUR_SERVER_IP:3000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const result = await response.json();
      setUploading(false);
      Alert.alert('Upload Success', JSON.stringify(result));
    } catch (error) {
      console.error(error);
      setUploading(false);
      Alert.alert('Upload Failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.image} />
      {uploading && <ActivityIndicator size="large" color="#00f" />}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.button}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={uploadImage}>
          <Text style={styles.button}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, resizeMode: 'contain' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    color: 'white',
    fontSize: 18,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 10,
  },
});
