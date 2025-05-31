// app/_layout.tsx
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from 'styled-components/native';
import React from 'react';
import { ChatProvider } from './context/ChatContext';
// import { darkTheme, lightTheme } from './themes/Theme';
// import { ThemeProvider } from './context/ThemeContext'; 
// import { darkTheme, lightTheme } from './themes/Theme'; // Make sure this file exists
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PreviewScreen from '../app/CameraScreen/PreviewScreen';
import { GroupProvider } from './context/GroupContext';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const isDark = colorScheme === 'dark';
  // const theme = isDark ? darkTheme : lightTheme;

  return (
     <SafeAreaView style={{ flex: 1 }}>
    <KeyboardAvoidingView></KeyboardAvoidingView>
  
    <AuthProvider>
       
      <ChatProvider>
      <GroupProvider>

        
          <Stack
            // screenOptions={{
            //   headerStyle: {
            //     backgroundColor: theme.background,
            //   },
            //   headerTintColor: theme.text,
            //    contentStyle: {
              //     backgroundColor: theme.background,
              //   },

            // }}
            >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
            <Stack.Screen name="Chats" />
            <Stack.Screen name="ProfileScreen" options={{ headerShown: false }} />
            <Stack.Screen name="CameraScreen" />
            <Stack.Screen name="Preview" />
            <Stack.Screen name="ChatScreen" options={{ headerShown: false }} />
          </Stack>
        
   
       
            </GroupProvider>
      </ChatProvider>
      
    </AuthProvider>
   
   
    </SafeAreaView>
   
  );
}
