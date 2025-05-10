import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Provider as PaperProvider } from 'react-native-paper';

const TabRoot = () =>  {
  return (
    <PaperProvider>
    <Tabs
    // screenOptions={{
    //   headerShown: false,
    //   tabBarActiveTintColor: '#25D366', // WhatsApp green
    //   tabBarLabelStyle: { fontSize: 12 },
    //   tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee' },
    // }}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#25D366",
      tabBarInactiveTintColor: "gray",
      tabBarLabelStyle: { fontSize:12,fontWeight: "bold" },
      tabBarStyle: { paddingBottom: 5, height: 60 },
      tabBarIcon: ({ color, size }) => {
        let iconName: any;

        if (route.name === "Chats") iconName = "chatbubble";
        else if (route.name === "Updates") iconName = "sync";
        else if (route.name === "Communities") iconName = "people";
        else if (route.name === "calls") iconName = "call";

        return <Ionicons name={iconName} size={22} color={color} />;
      },
    })}
  >
    <View>
   
      <Tabs>
        {/* <Tabs.Screen name="index" options={{title:"Chat"}}/>
        <Tabs.Screen name="Update" options={{title:"Update"}}/>
        <Tabs.Screen name="Communities" options={{title:"Communities"}}/>
        <Tabs.Screen name="User" options={{title:"Calls"}}/> */}
         <Tabs.Screen name="index" options={{title:"LoginScreen"}}/>
        <Tabs.Screen name="RegisterScreen" options={{title:"RegisterScreen"}}/>
        <Tabs.Screen name="Chats" options={{title:"Chats"}}/>
        <Tabs.Screen name="Updates" options={{title:"Updates"}}/>
        <Tabs.Screen name="Communities" options={{title:"Communities"}}/>
        <Tabs.Screen name="ProfileScreen" options={{title:"ProfileScreen"}}/>

        
      </Tabs>
    </View>
    </Tabs>
    </PaperProvider>
  );
}

export default TabRoot;
