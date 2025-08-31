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
            backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
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
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? "#333" : "transparent",
          },
          tabBarActiveTintColor: isDark ? "#fff" : "#000",
          tabBarInactiveTintColor: isDark ? "#888" : "#666",
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
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={
                  focused
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : isDark
                    ? "#888"
                    : "#666"
                }
              />
            ),
          }}
        />

        <Tabs.Screen
          name="addcourse"
          options={{
            tabBarIcon: ({ focused }) => (
              <AntDesign
                name="pluscircle"
                size={24}
                color={
                  focused
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : isDark
                    ? "#888"
                    : "#666"
                }
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: "center" }}>
                <Feather
                  name="settings"
                  size={24}
                  color={
                    focused
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                      ? "#888"
                      : "#666"
                  }
                />
                {/* Theme Toggle Indicator */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: isDark ? "#FFA500" : "#4B5563",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={isDark ? "sunny" : "moon"}
                    size={10}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="logout"
          options={{
            tabBarIcon: () => (
              <MaterialCommunityIcons
                name="logout"
                size={24}
                color={isDark ? "#ff6b6b" : "#dc2626"}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
};

export default _layout;
