// // // import React, { useEffect, useState } from 'react';
// // // import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
// // // import AsyncStorage from '@react-native-async-storage/async-storage';
// // // import axios from 'axios';
// // // import { useLocalSearchParams } from 'expo-router';

// // // export default function ProfileScreen() {
// // //   const [userData, setUserData] = useState<any>(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const { id, name, avatar, time } = useLocalSearchParams();



// // //   useEffect(()=>{
// // //     setUserData({id, name, avatar, time})
// // //   })

// // //   useEffect(() => {
// // //     const loadUserData = async () => {
// // //       try {
// // //         const userString = await AsyncStorage.getItem('user');
// // //         if (userString) {
// // //           const user = JSON.parse(userString);
// // //           setUserData(user);
// // //         }
// // //       } catch (error) {
// // //         console.error('Failed to load user data:', error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     loadUserData();
// // //   }, []);



// // //   if (loading) {
// // //     return (
// // //       <View style={styles.centered}>
// // //         <Text>Loading Profile...</Text>
// // //       </View>
// // //     );
// // //   }

// // //   if (!userData) {
// // //     return (
// // //       <View style={styles.centered}>
// // //         <Text>No user data found</Text>
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <ScrollView contentContainerStyle={styles.container}>
// // //       <View style={styles.profileContainer}>
// // //         <Image
// // //           source={userData.profileImage ? { uri: userData.profileImage } : require('../assets/g1.jpg')}
// // //           style={styles.profileImage}
// // //         />
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Name</Text>
// // //         <Text style={styles.value}>{userData.name}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Nickname</Text>
// // //         <Text style={styles.value}>{userData.nickname || '-'}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>About</Text>
// // //         <Text style={styles.value}>{userData.bio || '-'}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Email</Text>
// // //         <Text style={styles.value}>{userData.email}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Phone</Text>
// // //         <Text style={styles.value}>{userData.phone || '-'}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Gender</Text>
// // //         <Text style={styles.value}>{userData.gender || '-'}</Text>
// // //       </View>

// // //       <View style={styles.infoCard}>
// // //         <Text style={styles.label}>Status</Text>
// // //         <Text style={styles.value}>
// // //           {userData.online ? 'Online 🟢' : 'Offline ⚪️'}
// // //         </Text>
// // //       </View>
// // //     </ScrollView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     padding: 20,
// // //     backgroundColor: '#fff',
// // //     alignItems: 'stretch',
// // //   },
// // //   centered: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   profileContainer: {
// // //     alignItems: 'center',
// // //     marginBottom: 30,
// // //   },
// // //   profileImage: {
// // //     width: 120,
// // //     height: 120,
// // //     borderRadius: 60,
// // //     borderWidth: 2,
// // //     borderColor: '#C2185B',
// // //   },
// // //   infoCard: {
// // //     paddingVertical: 15,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#eee',
// // //   },
// // //   label: {
// // //     fontSize: 13,
// // //     color: 'gray',
// // //     marginBottom: 3,
// // //   },
// // //   value: {
// // //     fontSize: 16,
// // //     fontWeight: '500',
// // //   },
// // // });

// // import React, { useEffect, useState } from 'react';
// // import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { useLocalSearchParams } from 'expo-router';
// // import axios from 'axios';
// // import * as ImagePicker from 'expo-image-picker';
// // import { MaterialIcons } from '@expo/vector-icons';

// // export default function ProfileScreen() {
// //   const [userData, setUserData] = useState<any>(null);
// //   const [loading, setLoading] = useState(true);

// //   const { id, name, avatar, time, gender } = useLocalSearchParams();




// //   useEffect(() => {
// //     const fetchUserDetails = async () => {
// //       try {
// //         const token = await AsyncStorage.getItem("token");
// //         const res = await axios.get(`http://localhost:3000/users`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });

// //         console.log("response", res.data)

// //         const matchedUser = res.data.find((user: any) => user._id === id);
// //         setUserData(matchedUser);
// //       } catch (error) {
// //         console.error("Error fetching user:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (id) fetchUserDetails();
// //   }, [id]);


// //   useEffect(() => {

// //     const loadUserData = async () => {
// //       try {
// //         // If 'id' exists in route params, use it for viewing other user's profile
// //         if (id && name && avatar) {
// //           setUserData({
// //             id,
// //             name,
// //             profileImage: avatar,
// //             bio: `Last seen at ${time}`,
// //             email:'-',
// //             phone: '-',
// //             gender: gender,
// //             nickname: '-',
// //             online: false,
// //           });
// //         } else {
// //           // Else, load logged-in user data
// //           const userString = await AsyncStorage.getItem('user');
// //           if (userString) {
// //             const user = JSON.parse(userString);
// //             setUserData(user);
// //           }
// //         }
// //       } catch (error) {
// //         console.error('Failed to load user data:', error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadUserData();
// //   }, [id, name, avatar, time, gender]);
// //   const pickImage = async () => {
// //     // Request permissions
// //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
// //     if (status !== 'granted') {
// //       Alert.alert('Permission required', 'We need camera roll permissions to upload images');
// //       return;
// //     }

// //     // Launch image picker
// //     let result = await ImagePicker.launchImageLibraryAsync({
// //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //       allowsEditing: true,
// //       aspect: [1, 1],
// //       quality: 1,
// //     });

// //     if (!result.canceled) {
// //       // Update the user data with new image
// //       const updatedUser = { ...userData, profileImage: result.assets[0].uri };
// //       setUserData(updatedUser);
// //         // Here you would typically upload the image to your server
// //       // and update the user's profile in your database
// //       console.log('New image selected:', result.assets[0].uri);
// //     }
// //   };
// //   if (loading) {
// //     return (
// //       <View style={styles.centered}>
// //         <Text>Loading Profile...</Text>
// //       </View>
// //     );
// //   }

// //   if (!userData) {
// //     return (
// //       <View style={styles.centered}>
// //         <Text>No user data found</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <ScrollView contentContainerStyle={styles.container}>
// //       <View style={styles.profileContainer}>
// //         {/* <Image
// //           source={userData.profileImage ? { uri: userData.profileImage } : require('../assets/g1.jpg')}
// //           style={styles.profileImage}
// //         /> */}
// //         <TouchableOpacity>
// //         <Image
// //   source={{
// //     uri: userData.profileImage
// //       ? userData.profileImage
// //       : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&length=1`,
// //   }}
// //   style={styles.profileImage}
// // />
// // </TouchableOpacity>

// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Name</Text>
// //         <Text style={styles.value}>{userData.name}</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Nickname</Text>
// //         <Text style={styles.value}>{userData.nickname }</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>About</Text>
// //         <Text style={styles.value}>{userData.bio || '-'}</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Email</Text>
// //         <Text style={styles.value}>{userData.email || '-'}</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Phone</Text>
// //         <Text style={styles.value}>{userData.phone || '-'}</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Gender</Text>
// //         <Text style={styles.value}>{userData.gender || '-'}</Text>
// //       </View>

// //       <View style={styles.infoCard}>
// //         <Text style={styles.label}>Status</Text>
// //         <Text style={styles.value}>
// //           {userData.online ? 'Online 🟢' : 'Offline ⚪️'}
// //         </Text>
// //       </View>
// //     </ScrollView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     padding: 20,
// //     backgroundColor: '#fff',
// //     alignItems: 'stretch',
// //   },
// //   centered: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   profileContainer: {
// //     alignItems: 'center',
// //     marginBottom: 30,
// //   },
// //   profileImage: {
// //     width: 120,
// //     height: 120,
// //     borderRadius: 60,
// //     borderWidth: 2,
// //     borderColor: '#C2185B',
// //   },
// //   infoCard: {
// //     paddingVertical: 15,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#eee',
// //   },
// //   label: {
// //     fontSize: 13,
// //     color: 'gray',
// //     marginBottom: 3,
// //   },
// //   value: {
// //     fontSize: 16,
// //     fontWeight: '500',
// //   },
// // });
// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useLocalSearchParams } from 'expo-router';
// import axios from 'axios';
// import * as ImagePicker from 'expo-image-picker';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function ProfileScreen() {
//   interface UserData {
//     id?: string;
//     name?: string;
//     profileImage?: string;
//     bio?: string;
//     email?: string;
//     phone?: string;
//     gender?: string;
//     nickname?: string;
//     online?: boolean;
//   }

//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { id, name, avatar, time, gender } = useLocalSearchParams();

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const res = await axios.get(`http://localhost:3000/users`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         console.log("response", res.data)

//         const matchedUser = res.data.find((user: any) => user._id === id);
//         setUserData(matchedUser);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) fetchUserDetails();
//   }, [id]);

//   useEffect(() => {
//     const loadUserData = async () => {
//       try {
//         if (id && name && avatar) {
//           setUserData({
//             id,
//             name,
//             profileImage: avatar,
//             bio: `Last seen at ${time}`,
//             email: '-',
//             phone: '-',
//             gender: gender,
//             nickname: '-',
//             online: false,
//           });
//         } else {
//           const userString = await AsyncStorage.getItem('user');
//           if (userString) {
//             const user = JSON.parse(userString);
//             setUserData(user);
//           }
//         }
//       } catch (error) {
//         console.error('Failed to load user data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUserData();
//   }, [id, name, avatar, time, gender]);

//   const pickImage = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== 'granted') {
//       Alert.alert('Permission required', 'We need camera roll permissions to upload images');
//       return;
//     }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       const image = result.assets[0];
//       const localUri = image.uri;
//       const filename = localUri.split('/').pop();
//       const match = /\.(\w+)$/.exec(filename ?? '');
//       const type = match ? `image/${match[1]}` : `image`;

//       const formData = new FormData();
//       formData.append('profileImage', {
//         uri: localUri,
//         name: filename,
//         type,
//       });

//       // Add other fields (optional)
//       formData.append('name', userData.name);
//       formData.append('nickname', userData.nickname);
//       formData.append('phone', userData.phone);
//         setUserData((prev: UserData | null) => ({ ...prev, profileImage: localUri }));
//       formData.append('gender', userData.gender);

//       try {
//         const token = await AsyncStorage.getItem("token");
//         await axios.put(`http://localhost:3000/users/update-profile`, formData, {
//           headers: {
//             // 'Content-Type': 'multipart/form-data',
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setUserData(prev => ({ ...prev, profileImage: localUri }));
//         console.log('Profile updated');
//       } catch (error) {
//         console.error("Error uploading image:", (error as any).response?.data || (error as any).message);
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <Text>Loading Profile...</Text>
//       </View>
//     );
//   }

//   if (!userData) {
//     return (
//       <View style={styles.centered}>
//         <Text>No user data found</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.profileContainer}>
//         <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
//           <Image
//             source={{
//               uri: userData.profileImage
//                 ? userData.profileImage
//                 : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&length=1`,
//             }}
//             style={styles.profileImage}
//           />
//           <View style={styles.cameraIconContainer}>
//             <MaterialIcons name="photo-camera" size={24} color="black" />
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Rest of your profile info cards */}
//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Name</Text>
//         <Text style={styles.value}>{userData.name}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Nickname</Text>
//         <Text style={styles.value}>{userData.nickname}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>About</Text>
//         <Text style={styles.value}>{userData.bio || '-'}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Email</Text>
//         <Text style={styles.value}>{userData.email || '-'}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Phone</Text>
//         <Text style={styles.value}>{userData.phone || '-'}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Gender</Text>
//         <Text style={styles.value}>{userData.gender || '-'}</Text>
//       </View>

//       <View style={styles.infoCard}>
//         <Text style={styles.label}>Status</Text>
//         <Text style={styles.value}>
//           {userData.online ? 'Online 🟢' : 'Offline ⚪️'}
//         </Text>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: '#fff',
//     alignItems: 'stretch',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   profileContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 2,
//     borderColor: '#C2185B',
//   },
//   cameraIconContainer: {
//     position: 'absolute',
//     right: 0,
//     bottom: 0,
//     backgroundColor: '#C2185B',
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: 'white',
//   },
//   infoCard: {
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   label: {
//     fontSize: 13,
//     color: 'gray',
//     marginBottom: 3,
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { id, name, avatar, time, gender } = useLocalSearchParams();

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setIsCurrentUser(parsedUser._id === id || parsedUser?._id === id);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };

    checkCurrentUser();
  }, [id]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`http://localhost:3000/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const matchedUser = res.data.find((user: any) => user._id === id);
        setUserData(matchedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserDetails();
  }, [id]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (id && name && avatar) {
          setUserData({
            id,
            name,
            profileImage: avatar,
            bio: `Last seen at ${time}`,
            email: '-',
            phone: '-',
            gender: gender,
            nickname: '-',
            online: false,
          });
        } else {
          const userString = await AsyncStorage.getItem('user');
          if (userString) {
            const user = JSON.parse(userString);
            setUserData(user);
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [id, name, avatar, time, gender]);

  // ProfileScreen.tsx
  const pickImage = async () => {

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to upload images');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    console.log("result", result)
    if (!result.canceled && result.assets[0]) {

      await uploadImage(result.assets[0]);
    }
  };

  // const uploadImage = async (uri: string) => {
  //   setUploading(true);

  //   try {
  //     const filename = uri.split('/').pop() || 'profile.jpg';
  //     const match = /\.(\w+)$/.exec(filename);
  //     const type = match ? `image/${match[1]}` : 'image/jpeg';

  //     const formData = new FormData();
  //     // Create a proper file object
  //     formData.append('profilePicture', {
  //       uri,
  //       name: filename,
  //       type,
  //     } as any); // Still need 'as any' for React Native

  //     const token = await AsyncStorage.getItem("token");
  //     const response = await axios.put(
  //       'http://localhost:3000/users/update-profile',
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           'Authorization': `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     // Use the response data from server instead of local URI
  //     const updatedUser = {
  //       ...userData,
  //       profilePicture: response.data.profilePicture // or whatever field the server returns
  //     };

  //     setUserData(updatedUser);
  //     await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

  //     Alert.alert("Success", "Profile image updated successfully");
  //   } catch (error) {
  //     console.error("Upload error:", error);
  //     Alert.alert("Error", "Failed to update profile image");
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  const uploadImage = async (file: any) => {
    setUploading(true);

    try {
      // Get the image file (similar to document picker approach)
      // const response = await fetch(uri);
      // const blob = await response.blob();

      // // Extract filename from URI
      // const filename = uri.split('/').pop() || 'profile.jpg';
      // const mimeType = blob.type || 'image/jpeg';
      // console.log("Uploading image:", { uri, filename });
      // // Create FormData and append the blob
      // const formData = new FormData();
      // // formData.append('profilePicture', blob,filename);
      // formData.append('file', {
      //   uri,
      //   name: filename,
      //   type: mimeType,
      // } as any);
      const response = await fetch(file.uri);
      const blob = await response.blob();
      console.log("file", file);


      const formData = new FormData();
      formData.append("file", blob, file.name || "profile");

      const token = await AsyncStorage.getItem("token");

      // Use fetch instead of axios for consistency
      const uploadResponse = await fetch(
        'http://192.168.29.187:3000/users/update-profile',
        {
          method: 'PUT',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            // Let the browser set Content-Type with boundary
          },
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();

      // Update user data with server response
      const updatedUser = {
        ...userData,
        profilePicture: result.profilePicture // Adjust according to your API response
      };

      setUserData(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      Alert.alert("Success", "Profile image updated successfully");
    } catch (error) {
      // console.error("Upload error:", error);
      Alert.alert("Error", "Failed to update profile image");
    } finally {
      setUploading(false);
    }
  };
  useEffect(() => {
    const fn = async () => {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        console.log("user profile", JSON.parse(userString));
      } else {
        console.log("user profile: null");
      }
    }
    fn()
  }, [])


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C2185B" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  console.log(userData,"userData")

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>No user data found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.imageContainer}

        >
          <Image
            source={{ uri: userData.profilePicture ? userData.profilePicture : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&length=1` }}
            style={styles.profileImage}
          />

          {/* {item.fileUrl && (
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
                            )} */}

          <View style={styles.cameraIconContainer}>
            <MaterialIcons name="photo-camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{userData.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Nickname</Text>
        <Text style={styles.value}>{userData.nickname || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>About</Text>
        <Text style={styles.value}>{userData.bio || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{userData.phone || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Gender</Text>
        <Text style={styles.value}>{userData.gender || '-'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>
          {userData.online ? 'Online 🟢' : 'Offline ⚪️'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {

    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'stretch',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#C2185B',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#C2185B',
  },
  uploadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: '#C2185B',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  infoCard: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});