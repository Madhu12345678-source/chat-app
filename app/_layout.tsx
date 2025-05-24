// app/_layout.tsx
import { Stack } from 'expo-router';
import { KeyboardAvoidingView, SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import { AuthProvider } from './context/AuthContext';
// import { ThemeProvider } from 'styled-components/native';
import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { darkTheme, lightTheme } from './themes/Theme'; // Make sure this file exists
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PreviewScreen from '../app/CameraScreen/PreviewScreen';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
  
    <AuthProvider>
       
      <ChatProvider>
       
        {/* <ThemeProvider theme={theme}> */}
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.background,
              },
              headerTintColor: theme.text,

            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
            <Stack.Screen name="Chats" />
            <Stack.Screen name="ProfileScreen" />
            <Stack.Screen name="CameraScreen" />
            <Stack.Screen name="Preview" />
            <Stack.Screen name="ChatScreen" options={{ headerShown: false }} />
          </Stack>
        
        {/* </ThemeProvider> */}
       
      </ChatProvider>
      
    </AuthProvider>
   
    
   
  );
}
