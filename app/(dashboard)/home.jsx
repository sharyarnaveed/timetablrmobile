import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Week from "../../components/More";
import Today from "../../components/Today";
import useCurrentClass from "../../hooks/CurrentClass";
import useupcomingClasses from "../../hooks/NotCurrentClass";

const home = () => {
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
        console.log("Fetching fresh timetable...");
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
        <View className="px-6 pt-16 pb-8">
          <View className="bg-black rounded-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-light text-gray-300">
                  Welcome
                </Text>
                <Text className="text-2xl font-bold text-white mt-1">
                  {TheUsername}
                </Text>
                <Text className="text-sm text-gray-400 mt-2">{theday}</Text>
              </View>
              <View className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Link
                  className="w-12 h-12 rounded-full flex justify-center items-center text-center"
                  href="/settings"
                >
                  <Text className="text-black font-semibold text-[2rem] flex justify-center items-center">
                    {firstchar.toUpperCase()}
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row justify-center space-x-2">
            {["Today", "Week"].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`px-6 py-3 rounded-full ${
                  selectedTab === tab ? "bg-black" : "bg-gray-100"
                }`}
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

export default home;
