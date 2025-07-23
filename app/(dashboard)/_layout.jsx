import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
// Handle notifications when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const _layout = () => {
  useEffect(() => {
    const checkTokenAndRegister = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        registerForPushNotificationsAsync();
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received in foreground:', notification);
        });
        return () => subscription.remove();
      }
    };
    checkTokenAndRegister();
  }, []);

  // Request permissions and register for push token
  async function registerForPushNotificationsAsync() {
    try {
      if (!Device.isDevice) {
        console.warn('Push notifications require a physical device.');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted:', finalStatus);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      const notificationsaved=await SecureStore.getItemAsync("notification")
      if(notificationsaved!="true")
      {
try{
   const token = await SecureStore.getItemAsync("accessToken");
const responce= await axios.post(`https://timetablr.burjalsama.site/api/user/storetoken`,
        { token:tokenData.data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        await SecureStore.setItemAsync("notification", "true")
        console.log(responce.data);
}
catch(error){
console.log(error)
}
      }

      console.log('✅ Expo Push Token:', tokenData.data);

    } catch (err) {
      console.error('❌ Error getting push token:', err);
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        Alert.alert('Notification Error', 'Unable to register for notifications.');
      }
    }
  }

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1b1b1d",
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          shadowColor: "#000",
          borderRadius: 30,
          marginHorizontal: 16,
          marginBottom: 20,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 30,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 8,
          marginVertical: 8,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={focused ? "#fff" : "#666"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="addcourse"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <AntDesign
              name={focused ? "pluscircle" : "pluscircle"}
              size={24}
              color={focused ? "#fff" : "#666"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Feather
              name={focused ? "settings" : "settings"}
              size={24}
              color={focused ? "#fff" : "#666"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name={focused ? "logout" : "logout"}
              size={24}
              color="#8B0000"
            />
          ),
        }}
      />
    </Tabs>
    </>
  );
};

export default _layout;
