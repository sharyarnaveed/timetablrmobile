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
  View
} from "react-native";
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

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >
      <View className="flex-1">
        <View className="px-4 pt-12 pb-6 sm:px-8 sm:pt-16 sm:pb-8">
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#000",
              borderRadius: 24,
              padding: 16,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "300",
                    color: isDark ? "#d1d5db" : "#d1d5db",
                  }}
                >
                  Welcome
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#fff",
                    marginTop: 4,
                  }}
                >
                  {TheUsername}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9ca3af" : "#9ca3af",
                    marginTop: 8,
                  }}
                >
                  {theday}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                {/* Message Icon */}
                <TouchableOpacity
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleMessagePress}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Avatar */}
                <View
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: "#fff",
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Link
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    href="/settings"
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: 30,
                        textAlign: "center",
                      }}
                    >
                      {firstchar.toUpperCase()}
                    </Text>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 py-3 sm:px-6 sm:py-4">
          <View className="flex-row justify-center space-x-2">
            {["Today", "Week"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 20,
                  backgroundColor:
                    selectedTab === tab
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                      ? "#333"
                      : "#f3f4f6",
                }}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    color:
                      selectedTab === tab
                        ? isDark
                          ? "#000"
                          : "#fff"
                        : isDark
                        ? "#fff"
                        : "#4b5563",
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {selectedTab == "Today" && (
          <Today thecurent={currentClass} Notcurrentclass={upcomingclasses} />
        )}

        {selectedTab == "Week" && <Week />}
      </View>
    </ScrollView>
  );
};

export default index;
