import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Button } from 'react-native';
import { Camera, CameraType, FlashMode, CameraCapturedPicture } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function CameraScreen() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<FlashMode>(Camera.FlashMode.off);
  const [zoom, setZoom] = useState<number>(0);
  const [photo, setPhoto] = useState<CameraCapturedPicture | ImagePicker.ImagePickerAsset | null>(null);
  const [showPhoto, setShowPhoto] = useState<boolean>(false);
  const cameraRef = useRef<typeof Camera>(null);

  useEffect(() => {
    (async () => {
      // Request camera permissions
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      // Request media library permissions
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      
      setHasMediaLibraryPermission(mediaStatus.status === 'granted');
    })();
  }, []);

  if (hasCameraPermission === null || hasMediaLibraryPermission === null) {
    return <View style={styles.loadingContainer}><Text>Requesting permissions...</Text></View>;
  }
  if (hasCameraPermission === false || hasMediaLibraryPermission === false) {
    return (
      <View style={styles.permissionDeniedContainer}>
        <Text>No access to camera or media library. Please enable permissions in settings.</Text>
      </View>
    );
  }

  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.7, base64: true, skipProcessing: true };
        const data = await cameraRef.current.takePictureAsync(options);
        setPhoto(data);
        setShowPhoto(true);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const savePhoto = async (): Promise<void> => {
    if (photo) {
      try {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        alert('Photo saved to gallery!');
        setShowPhoto(false);
        setPhoto(null);
      } catch (error) {
        console.error('Error saving photo:', error);
      }
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0]);
        setShowPhoto(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const toggleCameraType = (): void => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const toggleFlash = (): void => {
    setFlashMode(current => 
      current === FlashMode.off 
        ? FlashMode.on 
        : FlashMode.off
    );
  };

  const handleZoomIn = (): void => {
    setZoom(current => Math.min(current + 0.1, 1));
  };

  const handleZoomOut = (): void => {
    setZoom(current => Math.max(current - 0.1, 0));
  };

  const closePreview = (): void => {
    setShowPhoto(false);
    setPhoto(null);
  };

  return (
    <View style={styles.container}>
      {!showPhoto ? (
        <Camera 
          style={styles.camera} 
          type={type} 
          flashMode={flashMode}
          zoom={zoom}
          ref={cameraRef}
        >
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Text style={styles.controlText}>
                {flashMode === FlashMode.on ? '🔦' : '⚡'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
              <Text style={styles.controlText}>🔄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.zoomControls}>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
              <Text style={styles.controlText}>-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Text style={styles.controlText}>📁</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
            
            <View style={styles.emptySpace} />
          </View>
        </Camera>
      ) : (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showPhoto}
          onRequestClose={closePreview}
        >
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: photo.uri }} 
              style={styles.previewImage} 
              resizeMode="contain"
            />
            
            <View style={styles.previewButtons}>
              <Button title="Save to Gallery" onPress={savePhoto} />
              <Button title="Discard" onPress={closePreview} color="red" />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '30%',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  zoomButton: {
    padding: 10,
  },
  galleryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 50,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  emptySpace: {
    width: 50,
  },
  controlText: {
    color: 'white',
    fontSize: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});