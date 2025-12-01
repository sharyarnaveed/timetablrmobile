import { Ionicons } from "@expo/vector-icons";
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

const index = () => {
  const { isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState("Today");
  const [TheUsername, SetTehusername] = useState("");
  const [theday, setday] = useState("");
  const [firstchar, Setchar] = useState("");
  const [timetableData, setTimetableData] = useState(null);

  const GOOGLE_FORM_URL = "https://forms.gle/6nN8mEKFfn4d8p8v5";

  const currentClass = useCurrentClass(timetableData);
  const upcomingclasses = useupcomingClasses(timetableData);

  const handleMessagePress = async () => {
    try {
      await Linking.openURL(GOOGLE_FORM_URL);
    } catch (error) {
      console.error("Error opening Google Form:", error);
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

      setTimetableData(JSON.stringify(response.data.timetable));
    } catch (error) {
      console.log("API Error:", error.response?.data || error.message);
    }
  };

  const userdetails = async () => {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      console.log("No token found");
      router.push("/signin");
    }

    const username = await SecureStore.getItemAsync("username");
    SetTehusername(username);

    Setchar(username.charAt(0));
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

      if (
        StoredDay !== dayName ||
        !LocalTimetable ||
        LocalTimetable.length === 0
      ) {
        await SecureStore.setItemAsync("day", dayName);
        await getdata(dayName, Makeday);
      } else {
        setTimetableData(LocalTimetable);
      }
    };

    init();
  }, []);

  const handlereload = async () => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

    const Makeday = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    await getdata(dayName, Makeday);
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
        backgroundColor: isDark ? "#000000" : "#f8f9fa",
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1">
        {/* Modernistic Asymmetric Welcome Card */}
        <View className="px-5 pt-20 pb-6">
          {/* Decorative accent line */}
          <View
            style={{
              position: "absolute",
              top: 60,
              left: 5,
              right: 5,
              height: 2,
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
              borderRadius: 1,
            }}
          />
          
          <View
            style={{
              backgroundColor: isDark ? "#111111" : "#ffffff",
              borderRadius: 32,
              padding: 28,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.12,
              shadowRadius: 20,
              elevation: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#1f1f1f" : "transparent",
              overflow: "hidden",
            }}
          >
            {/* Decorative gradient overlay */}
            <View
              style={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.02)",
              }}
            />
            
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-6" style={{ zIndex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? "#ffffff" : "#111827",
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: isDark ? "#6b7280" : "#9ca3af",
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    Welcome back
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "800",
                    color: isDark ? "#ffffff" : "#111827",
                    marginBottom: 12,
                    letterSpacing: -1,
                    lineHeight: 38,
                  }}
                >
                  {TheUsername}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    alignSelf: "flex-start",
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      marginLeft: 6,
                      fontWeight: "500",
                    }}
                  >
                    {theday}
                  </Text>
                </View>
              </View>
              
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  zIndex: 1,
                }}
              >
                {/* Message Icon with glassmorphism */}
                <TouchableOpacity
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.06)",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                    backdropFilter: "blur(10px)",
                  }}
                  onPress={handleMessagePress}
                  activeOpacity={0.6}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={22}
                    color={isDark ? "#ffffff" : "#111827"}
                  />
                </TouchableOpacity>

                {/* Avatar with modern design */}
                <Link href="/settings">
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: isDark ? "#ffffff" : "#111827",
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.2,
                      shadowRadius: 12,
                      elevation: 6,
                      transform: [{ rotate: "-5deg" }],
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? "#000000" : "#ffffff",
                        fontWeight: "800",
                        fontSize: 24,
                        letterSpacing: 0.5,
                        transform: [{ rotate: "5deg" }],
                      }}
                    >
                      {firstchar.toUpperCase()}
                    </Text>
                  </View>
                </Link>
              </View>
            </View>
          </View>
        </View>

        {/* Modernistic Floating Tab Selector */}
        <View className="px-5 pb-8">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: isDark ? "#111111" : "#ffffff",
              borderRadius: 24,
              padding: 6,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#1f1f1f" : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <TouchableOpacity
              onPress={handlereload}
              style={{
                width: 48,
                height: 48,
                borderRadius: 20,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.06)",
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={22}
                color={isDark ? "#ffffff" : "#111827"}
              />
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
                borderRadius: 18,
                padding: 4,
                flex: 1,
                marginHorizontal: 8,
              }}
            >
              {["Today", "Week"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor:
                      selectedTab === tab
                        ? isDark
                          ? "#ffffff"
                          : "#111827"
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor:
                      selectedTab === tab ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: selectedTab === tab ? 0.1 : 0,
                    shadowRadius: 4,
                    elevation: selectedTab === tab ? 2 : 0,
                  }}
                  onPress={() => setSelectedTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontWeight: selectedTab === tab ? "700" : "500",
                      fontSize: 15,
                      color:
                        selectedTab === tab
                          ? isDark
                            ? "#000000"
                            : "#ffffff"
                          : isDark
                          ? "#9ca3af"
                          : "#6b7280",
                      letterSpacing: 0.3,
                    }}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Spacer */}
            <View style={{ width: 48 }} />
          </View>
        </View>

        {/* Content */}
        {selectedTab == "Today" && (
          <Today thecurent={currentClass} Notcurrentclass={upcomingclasses} />
        )}

        {selectedTab == "Week" && <Week />}
      </View>
    </ScrollView>
  );
};

export default index;
