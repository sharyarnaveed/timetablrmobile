import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Alert, Platform, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
// Handle notifications when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
  }),
});

const _layout = () => {
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const checkTokenAndRegister = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        registerForPushNotificationsAsync();
        const subscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log("Notification received in foreground:", notification);
          }
        );
        return () => subscription.remove();
      }
      else{
        router.push("/signin")
      }
    };

    const checktoken = async () => {
      const token = SecureStore.getItem("accessToken");
      if (!token) {
        router.push("/signin");
      }
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/checkauth`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (responce.data.valid == false) {
        router.push("/logout");
      }
    };

    checktoken();

    checkTokenAndRegister();
  }, []);

  // Request permissions and register for push token
  async function registerForPushNotificationsAsync() {
    try {
      if (!Device.isDevice) {
        console.warn("Push notifications require a physical device.");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permission not granted:", finalStatus);
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });

      const notificationsaved = await SecureStore.getItemAsync("notification");
      if (notificationsaved != "true"||!notificationsaved) {
        try {
          const token = await SecureStore.getItemAsync("accessToken");
          const responce = await axios.post(
            `https://timetablr.burjalsama.site/api/user/storetoken`,
            { token: tokenData.data },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          console.log(responce.data);
          
          await SecureStore.setItemAsync("notification", "true");
        } catch (error) {
          console.log(error);
        }
      }

      // console.log("✅ Expo Push Token:", tokenData.data);
    } catch (err) {
      console.error("❌ Error getting push token:", err);
      if (Platform.OS === "android" || Platform.OS === "ios") {
        Alert.alert(
          "Notification Error",
          "Unable to register for notifications."
        );
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark
              ? "rgba(17, 17, 17, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 0,
            elevation: 20,
            boxShadow: `0 -8px 20px ${isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'}`,
            borderRadius: 36,
            marginHorizontal: 16,
            marginBottom: 20,
            paddingBottom: 34,
            height: 76,
            paddingTop: 14,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: isDark ? 1.5 : 1,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
            backdropFilter: "blur(20px)",
          },
          tabBarActiveTintColor: isDark ? "#ffffff" : "#111827",
          tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
          tabBarShowLabel: false,
          tabBarIconStyle: {
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarItemStyle: {
            borderRadius: 20,
            marginHorizontal: 6,
            marginVertical: 6,
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.12)"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.15)"
                    : "transparent",
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={focused ? 26 : 24}
                  color={
                    focused
                      ? isDark
                        ? "#ffffff"
                        : "#111827"
                      : isDark
                      ? "#6b7280"
                      : "#9ca3af"
                  }
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="addcourse"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.12)"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.15)"
                    : "transparent",
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                <AntDesign
                  name="pluscircle"
                  size={focused ? 26 : 24}
                  color={
                    focused
                      ? isDark
                        ? "#ffffff"
                        : "#111827"
                      : isDark
                      ? "#6b7280"
                      : "#9ca3af"
                  }
                />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.12)"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.15)"
                    : "transparent",
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                <Feather
                  name="settings"
                  size={focused ? 24 : 22}
                  color={
                    focused
                      ? isDark
                        ? "#ffffff"
                        : "#111827"
                      : isDark
                      ? "#6b7280"
                      : "#9ca3af"
                  }
                />
                {/* Modern Theme Toggle Indicator */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#f59e0b" : "#4b5563",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2.5,
                    borderColor: isDark ? "#111111" : "#ffffff",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={isDark ? "sunny" : "moon"}
                    size={10}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="reminder"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.12)"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused
                    ? isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(17, 24, 39, 0.15)"
                    : "transparent",
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                <Ionicons
                  name={focused ? "notifications" : "notifications-outline"}
                  size={focused ? 26 : 24}
                  color={
                    focused
                      ? isDark
                        ? "#ffffff"
                        : "#111827"
                      : isDark
                      ? "#6b7280"
                      : "#9ca3af"
                  }
                />
              </View>
            ),
          }}
        />
 
        <Tabs.Screen
          name="logout"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: focused
                    ? isDark
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(239, 68, 68, 0.12)"
                    : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: focused ? 1 : 0,
                  borderColor: focused
                    ? isDark
                      ? "rgba(239, 68, 68, 0.3)"
                      : "rgba(239, 68, 68, 0.2)"
                    : "transparent",
                  transform: focused ? [{ scale: 1.1 }] : [{ scale: 1 }],
                }}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={focused ? 24 : 22}
                  color={isDark ? "#ef4444" : "#dc2626"}
                />
              </View>
            ),
          }}
  listeners={{
    tabPress: (e) => {
      // Prevent default behavior
      e.preventDefault();
      
      // Show logout confirmation
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { 
          text: "Cancel", 
          style: "cancel" 
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync("accessToken");
              await SecureStore.deleteItemAsync("username");
              await SecureStore.deleteItemAsync("email");
              await SecureStore.deleteItemAsync("timetable");
              await SecureStore.deleteItemAsync("day");
              await SecureStore.deleteItemAsync("notification");

              router.replace("/signin");
            } catch (error) {
              console.error("Error during logout:", error);
            }
          },
        },
      ]);
    },
  }}
/>
      </Tabs>
    </View>
  );
};

export default _layout;
