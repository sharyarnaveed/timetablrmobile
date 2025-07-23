import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Week from "../../components/More";
import Today from "../../components/Today";
import useCurrentClass from "../../hooks/CurrentClass";
import useupcomingClasses from "../../hooks/NotCurrentClass";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flex: 1 },
  container: { flex: 1 },
  headerWrapper: { paddingHorizontal: width * 0.04, paddingTop: height * 0.04, paddingBottom: height * 0.02 },
  headerCard: { backgroundColor: "#000", borderRadius: width * 0.06, padding: width * 0.04, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: width * 0.02 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeText: { fontSize: width * 0.045, fontWeight: "300", color: "#d1d5db" },
  usernameText: { fontSize: width * 0.06, fontWeight: "bold", color: "#fff", marginTop: 4 },
  dayText: { fontSize: width * 0.035, color: "#9ca3af", marginTop: 8 },
  avatarWrapper: { width: width * 0.16, height: width * 0.16, backgroundColor: "#fff", borderRadius: width * 0.08, alignItems: "center", justifyContent: "center" },
  avatarLink: { width: width * 0.12, height: width * 0.12, borderRadius: width * 0.06, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#000", fontWeight: "bold", fontSize: width * 0.08, textAlign: "center" },
  tabWrapper: { paddingHorizontal: width * 0.04, paddingVertical: height * 0.02 },
  tabRow: { flexDirection: "row", justifyContent: "center" },
  tabButton: { paddingHorizontal: width * 0.06, paddingVertical: height * 0.015, borderRadius: 999, backgroundColor: "#f3f4f6", marginHorizontal: 4 },
  tabButtonActive: { backgroundColor: "#000" },
  tabText: { fontWeight: "500", color: "#4b5563", fontSize: width * 0.04 },
  tabTextActive: { color: "#fff" },
});

const index = () => {
  const [selectedTab, setSelectedTab] = useState("Today");
  const [TheUsername, SetTehusername] = useState("");
  const [theday, setday] = useState("");
  const [firstchar, Setchar] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  
  // Call the hook at the top level
  const currentClass = useCurrentClass(timetableData);
  const upcomingclasses = useupcomingClasses(timetableData);
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
      // Set the timetable data to trigger the hook
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
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-4 pt-12 pb-6 sm:px-8 sm:pt-16 sm:pb-8">
          <View className="bg-black rounded-3xl p-4 shadow-lg sm:p-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-base font-light text-gray-300 sm:text-lg">
                  Welcome
                </Text>
                <Text className="text-xl font-bold text-white mt-1 sm:text-2xl">
                  {TheUsername}
                </Text>
                <Text className="text-xs text-gray-400 mt-2 sm:text-sm">{theday}</Text>
              </View>
              <View className="w-14 h-14 bg-white rounded-full flex items-center justify-center sm:w-16 sm:h-16">
                <Link
                  className="w-10 h-10 rounded-full flex justify-center items-center text-center sm:w-12 sm:h-12"
                  href="/settings"
                >
                  <Text className="text-black font-semibold text-3xl flex justify-center items-center sm:text-[2rem]">
                    {firstchar.toUpperCase()}
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 py-3 sm:px-6 sm:py-4">
          <View className="flex-row justify-center space-x-2">
            {["Today", "Week"].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`px-4 py-2 rounded-full ${
                  selectedTab === tab ? "bg-black" : "bg-gray-100"
                } sm:px-6 sm:py-3`}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  className={`font-medium ${
                    selectedTab === tab ? "text-white" : "text-gray-600"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {selectedTab == "Today" && (
          <>
 
            <Today thecurent={currentClass} Notcurrentclass={upcomingclasses} />
         
          </>
        )}

        {selectedTab == "Week" && <Week />}
      </View>
    </ScrollView>
  );
};

export default index;
