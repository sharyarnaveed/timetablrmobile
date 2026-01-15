import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Week from "../../components/More";
import Today from "../../components/Today";
import { useTheme } from "../../context/ThemeContext";
import useCurrentClass from "../../hooks/CurrentClass";
import useupcomingClasses from "../../hooks/NotCurrentClass";
import useTeacherCurrentClass from "../../hooks/useTeacherCurrentClass";
import useTeacherUpcomingClasses from "../../hooks/useTeacherUpcomingClasses";
import { getTeacherMetadata, getTeacherTimetable } from "../../utils/supabase";

const index = () => {
  const { isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState("Today");
  const [TheUsername, SetTehusername] = useState("");
  const [theday, setday] = useState("");
  const [firstchar, Setchar] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const GOOGLE_FORM_URL = "https://forms.gle/6nN8mEKFfn4d8p8v5";

  // Use appropriate hooks based on user role
  const currentClass = userRole === "teacher"
    ? useTeacherCurrentClass(timetableData)
    : useCurrentClass(timetableData);
  const upcomingclasses = userRole === "teacher"
    ? useTeacherUpcomingClasses(timetableData)
    : useupcomingClasses(timetableData);

  const handleMessagePress = async () => {
    try {
      await Linking.openURL(GOOGLE_FORM_URL);
    } catch (error) {
      console.error("Error opening Google Form:", error);
    }
  };

  const getTeacherData = async (day) => {
    try {
      console.log("[DASHBOARD] getTeacherData called with day:", day);
      const teacherName = await getTeacherMetadata();
      console.log("[DASHBOARD] Teacher name from metadata:", teacherName);

      if (!teacherName) {
        console.error("Could not get teacher name from metadata");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not load teacher data",
        });
        return;
      }

      console.log("[DASHBOARD] Calling getTeacherTimetable with:", teacherName, day);
      const timetable = await getTeacherTimetable(teacherName, day);
      console.log("[DASHBOARD] Timetable response:", timetable);

      await SecureStore.setItemAsync(
        "timetable",
        JSON.stringify(timetable)
      );
      await SecureStore.setItemAsync("lastFetchTime", new Date().toISOString());
      await SecureStore.setItemAsync("teacherName", teacherName);

      setTimetableData(JSON.stringify(timetable));
    } catch (error) {
      console.log("Teacher API Error:", error.message);
      // Load from local storage if API fails
      const LocalTimetable = await SecureStore.getItemAsync("timetable");
      if (LocalTimetable) {
        setTimetableData(LocalTimetable);
        Toast.show({
          type: "info",
          text1: "Using Offline Data",
          text2: "Showing cached timetable",
        });
      }
    }
  };

  const getdata = async (day, MakeupDate) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/home`,
        { day, MakeupDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      await SecureStore.setItemAsync(
        "timetable",
        JSON.stringify(response.data.timetable)
      );
      await SecureStore.setItemAsync("lastFetchTime", new Date().toISOString());

      setTimetableData(JSON.stringify(response.data.timetable));
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);

      // If 401 error, token is invalid - redirect to signin
      if (error.response?.status === 401) {
        console.log("Authentication failed - redirecting to signin");
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("username");
        await SecureStore.deleteItemAsync("email");
        await SecureStore.deleteItemAsync("role");
        router.push("/signin");
        return;
      }
      // Load from local storage if API fails
      const LocalTimetable = await SecureStore.getItemAsync("timetable");
      if (LocalTimetable) {
        setTimetableData(LocalTimetable);
        Toast.show({
          type: "info",
          text1: "Using Offline Data",
          text2: "Showing cached timetable",
        });
      }
    }
  };

  const userdetails = async () => {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      console.log("No token found");
      router.push("/signin");
      return;
    }

    // Get user role
    const role = await SecureStore.getItemAsync("role");
    setUserRole(role);

    // For teachers, get name from metadata
    if (role === "teacher") {
      const teacherName = await getTeacherMetadata();
      if (teacherName) {
        SetTehusername(teacherName);
        Setchar(teacherName.charAt(0));
      } else {
        console.log("No teacher name found");
        router.push("/signin");
        return;
      }
    } else {
      // For students, get username from SecureStore
      const username = await SecureStore.getItemAsync("username");

      if (!username) {
        console.log("No username found");
        router.push("/signin");
        return;
      }

      SetTehusername(username);
      Setchar(username.charAt(0));
    }
  };

  useEffect(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const Makeday = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const options = { weekday: "long", month: "long", day: "numeric" };
    const formatted = today.toLocaleDateString("en-US", options);

    const init = async () => {
      await userdetails();
      setday(formatted);

      const StoredDay = await SecureStore.getItemAsync("day");
      const LocalTimetable = await SecureStore.getItemAsync("timetable");
      const role = await SecureStore.getItemAsync("role");

      console.log("[DASHBOARD] User role:", role);
      console.log("[DASHBOARD] Stored day:", StoredDay, "Current day:", dayName);

      // Check network status
      const netState = await NetInfo.fetch();
      setIsOnline(netState.isConnected);

      if (
        StoredDay !== dayName ||
        !LocalTimetable ||
        LocalTimetable.length === 0
      ) {
        await SecureStore.setItemAsync("day", dayName);
        if (netState.isConnected) {
          // Use appropriate data fetching based on role
          console.log("[DASHBOARD] Fetching data for role:", role);
          if (role === "teacher") {
            console.log("[DASHBOARD] Calling getTeacherData...");
            await getTeacherData(dayName);
          } else {
            console.log("[DASHBOARD] Calling getdata (student API)...");
            await getdata(dayName, Makeday);
          }
        } else {
          // Use local storage when offline
          if (LocalTimetable) {
            setTimetableData(LocalTimetable);
            Toast.show({
              type: "info",
              text1: "Offline Mode",
              text2: "Showing cached timetable",
            });
          }
        }
      } else {
        setTimetableData(LocalTimetable);
      }
    };

    init();

    // Listen for network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      setIsOnline(state.isConnected);

      // Auto-reload when coming back online
      if (wasOffline && state.isConnected) {
        Toast.show({
          type: "success",
          text1: "Back Online",
          text2: "Refreshing timetable...",
        });
        setTimeout(async () => {
          const role = await SecureStore.getItemAsync("role");
          await SecureStore.setItemAsync("day", dayName);
          if (role === "teacher") {
            await getTeacherData(dayName);
          } else {
            await getdata(dayName, Makeday);
          }
        }, 500);
      } else if (!state.isConnected) {
        Toast.show({
          type: "info",
          text1: "Offline Mode",
          text2: "Using cached data",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handlereload = async () => {
    if (!isOnline) {
      Toast.show({
        type: "error",
        text1: "No Internet Connection",
        text2: "Cannot refresh while offline",
      });
      return;
    }

    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

    const Makeday = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const role = await SecureStore.getItemAsync("role");

    // Use appropriate data fetching based on role
    if (role === "teacher") {
      await getTeacherData(dayName);
    } else {
      await getdata(dayName, Makeday);
    }

    const newTimetable = await SecureStore.getItemAsync("timetable");

    setTimetableData(newTimetable);
    Toast.show({
      type: "success",
      text1: "Data Reloaded",
    });
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000000" : "#fafafa",
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 }}>
          {/* Top Bar */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            {/* Date Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#111111" : "#ffffff",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                borderWidth: 1,
                borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isOnline ? (isDark ? "#ffffff" : "#000000") : "#ff6b6b",
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isDark ? "#888888" : "#666666",
                  letterSpacing: 0.3,
                }}
              >
                {isOnline ? theday : `${theday} • Offline`}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity
                onPress={handleMessagePress}
                activeOpacity={0.7}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDark ? "#111111" : "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
                }}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={isDark ? "#ffffff" : "#000000"}
                />
              </TouchableOpacity>

              <Link href="/settings" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? "#ffffff" : "#000000",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: isDark ? "#000000" : "#ffffff",
                      }}
                    >
                      {firstchar.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Welcome Section */}
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: isDark ? "#555555" : "#999999",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontSize: 42,
                fontWeight: "800",
                color: isDark ? "#ffffff" : "#000000",
                letterSpacing: -1.5,
                lineHeight: 48,
              }}
            >
              {TheUsername}
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
              borderRadius: 20,
              padding: 6,
              borderWidth: 1,
              borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
            }}
          >
            {/* Refresh Button */}
            <TouchableOpacity
              onPress={handlereload}
              activeOpacity={0.7}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: isDark ? "#151515" : "#f5f5f5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={isDark ? "#888888" : "#666666"}
              />
            </TouchableOpacity>

            {/* Tab Pills */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginLeft: 8,
                backgroundColor: isDark ? "#151515" : "#f5f5f5",
                borderRadius: 14,
                padding: 4,
              }}
            >
              {["Today", "Week"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor:
                      selectedTab === tab
                        ? isDark
                          ? "#ffffff"
                          : "#000000"
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: selectedTab === tab ? "700" : "500",
                      color:
                        selectedTab === tab
                          ? isDark
                            ? "#000000"
                            : "#ffffff"
                          : isDark
                            ? "#666666"
                            : "#999999",
                      letterSpacing: 0.5,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        {selectedTab === "Today" && (
          <Today thecurent={currentClass} Notcurrentclass={upcomingclasses} />
        )}

        {selectedTab === "Week" && <Week />}
      </View>
    </ScrollView>
  );
};

export default index;
