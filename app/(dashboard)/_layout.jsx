import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Alert, Platform, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../utils/supabase";

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
  const authCheckDone = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (authCheckDone.current) return;
    authCheckDone.current = true;

    const checkTokenAndRegister = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const role = await SecureStore.getItemAsync("role");

      if (token) {
        registerForPushNotificationsAsync(role);
        const subscription = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log("Notification received in foreground:", notification);
          }
        );
        return () => subscription.remove();
      } else {
        router.replace("/signin");
        return;
      }
    };

    const checktoken = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const role = await SecureStore.getItemAsync("role");

      if (!token) {
        router.replace("/signin");
        return;
      }

      // Check last auth check time to prevent rate limiting
      const lastAuthCheck = await SecureStore.getItemAsync("lastAuthCheck");
      const now = Date.now();

      if (lastAuthCheck && now - parseInt(lastAuthCheck) < 60000) {
        // Skip check if done within last 60 seconds
        console.log("Skipping auth check - recently validated");
        return;
      }

      // For teachers, use Supabase session validation
      if (role === "teacher") {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          // Store last check time
          await SecureStore.setItemAsync("lastAuthCheck", now.toString());

          if (error || !session) {
            console.error("Teacher session validation failed:", error);
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("role");
            await SecureStore.deleteItemAsync("lastAuthCheck");
            router.replace("/signin");
            return;
          }

          console.log("Teacher session valid");
        } catch (error) {
          console.error("Teacher auth check error:", error);
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("role");
          await SecureStore.deleteItemAsync("lastAuthCheck");
          router.replace("/signin");
        }
        return;
      }

      // For students, use custom API check
      try {
        const responce = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/user/checkauth`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 5000, // Add timeout
          }
        );

        // Store last check time
        await SecureStore.setItemAsync("lastAuthCheck", now.toString());

        if (responce.data.valid == false) {
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("username");
          await SecureStore.deleteItemAsync("email");
          await SecureStore.deleteItemAsync("lastAuthCheck");
          router.replace("/signin");
        }
      } catch (error) {
        console.error("Auth check error:", error);

        // Handle rate limiting
        if (error.response?.status === 429) {
          console.log("Rate limited - skipping auth check");
          // Store check time to prevent immediate retry
          await SecureStore.setItemAsync("lastAuthCheck", now.toString());
          return;
        }

        // Only redirect if it's an auth error
        if (error.response?.status === 401 || error.response?.status === 403) {
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("username");
          await SecureStore.deleteItemAsync("email");
          await SecureStore.deleteItemAsync("lastAuthCheck");
          router.replace("/signin");
        }
      }
    };

    checktoken();

    checkTokenAndRegister();
  }, []);

  // Request permissions and register for push token
  async function registerForPushNotificationsAsync(role) {
    try {
      if (!Device.isDevice) {
        console.warn("Push notifications require a physical device.");
        return;
      }

      // Check if already registered
      const notificationRegistered = await SecureStore.getItemAsync("notification");
      if (notificationRegistered === "true") {
        console.log("Notifications already registered, skipping...");
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

      // Check network status before calling API
      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        console.log("Offline: Notification registration will be attempted later");
        return;
      }

      // Only call API if online and not already registered
      try {
        if (role === "teacher") {
          // For teachers, store in Supabase notifyteacher table
          const { data: { session } } = await supabase.auth.getSession();

          if (!session?.user?.id) {
            console.error("No teacher session found for notification registration");
            return;
          }

          const { data, error } = await supabase
            .from('notifyteacher')
            .insert([
              {
                notifyid: tokenData.data,
                teacherid: session.user.id
              }
            ]);

          if (error) {
            console.error("Error storing teacher notification token:", error);
            return;
          }

          console.log("Teacher notification token stored successfully");
          await SecureStore.setItemAsync("notification", "true");
        } else {
          // For students, use custom API
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
        }
      } catch (error) {
        console.log("Error saving notification token:", error);
        // Don't show alert, just log the error
      }

      // console.log("✅ Expo Push Token:", tokenData.data);
    } catch (err) {
      console.error("❌ Error getting push token:", err);
      // Only show alert if online and it's a real error (not network related)
      const netState = await NetInfo.fetch();
      if (netState.isConnected && (Platform.OS === "android" || Platform.OS === "ios")) {
        Alert.alert(
          "Notification Error",
          "Unable to register for notifications."
        );
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000000" : "#fafafa" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            borderTopWidth: 0,
            elevation: 0,
            shadowColor: isDark ? "#000" : "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 16,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            marginHorizontal: 0,
            marginBottom: 0,
            paddingBottom: Platform.OS === "ios" ? 28 : 12,
            paddingTop: 12,
            height: Platform.OS === "ios" ? 88 : 72,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: isDark ? 0.5 : 0,
            borderBottomWidth: 0,
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "transparent",
          },
          tabBarActiveTintColor: isDark ? "#ffffff" : "#000000",
          tabBarInactiveTintColor: isDark ? "#4a4a4a" : "#b0b0b0",
          tabBarShowLabel: false,
          tabBarIconStyle: {
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: focused
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "home" : "home-outline"}
                    size={22}
                    color={
                      focused
                        ? isDark
                          ? "#000000"
                          : "#ffffff"
                        : isDark
                          ? "#666666"
                          : "#999999"
                    }
                  />
                </View>
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      marginTop: 6,
                    }}
                  />
                )}
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
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: focused
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "add" : "add-outline"}
                    size={26}
                    color={
                      focused
                        ? isDark
                          ? "#000000"
                          : "#ffffff"
                        : isDark
                          ? "#666666"
                          : "#999999"
                    }
                  />
                </View>
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      marginTop: 6,
                    }}
                  />
                )}
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
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: focused
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <Feather
                    name="settings"
                    size={20}
                    color={
                      focused
                        ? isDark
                          ? "#000000"
                          : "#ffffff"
                        : isDark
                          ? "#666666"
                          : "#999999"
                    }
                  />
                </View>
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      marginTop: 6,
                    }}
                  />
                )}
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
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: focused
                      ? isDark
                        ? "#ffffff"
                        : "#000000"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={focused ? "notifications" : "notifications-outline"}
                    size={22}
                    color={
                      focused
                        ? isDark
                          ? "#000000"
                          : "#ffffff"
                        : isDark
                          ? "#666666"
                          : "#999999"
                    }
                  />
                </View>
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      marginTop: 6,
                    }}
                  />
                )}
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
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: focused
                      ? isDark
                        ? "rgba(255, 255, 255, 0.15)"
                        : "rgba(0, 0, 0, 0.08)"
                      : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: focused ? 1 : 0,
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={22}
                    color={isDark ? "#888888" : "#666666"}
                  />
                </View>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();

              Alert.alert("Logout", "Are you sure you want to logout?", [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const role = await SecureStore.getItemAsync("role");

                      // If teacher, sign out from Supabase
                      if (role === "teacher") {
                        await supabase.auth.signOut();
                      }

                      await SecureStore.deleteItemAsync("accessToken");
                      await SecureStore.deleteItemAsync("username");
                      await SecureStore.deleteItemAsync("email");
                      await SecureStore.deleteItemAsync("timetable");
                      await SecureStore.deleteItemAsync("day");
                      await SecureStore.deleteItemAsync("notification");
                      await SecureStore.deleteItemAsync("role");
                      await SecureStore.deleteItemAsync("lastAuthCheck");

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
