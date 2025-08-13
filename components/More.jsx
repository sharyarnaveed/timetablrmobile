import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const More = () => {
  const { isDark } = useTheme();
  const [selectedDay, setSelectedDay] = useState("Monday");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fullDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [scheduleData, SetScheduledata] = useState([]);

  const getalltimetable = async () => {
    const token = await SecureStore.getItemAsync("accessToken");
    try {
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/alltimetable`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      SetScheduledata(responce.data.timetable);
    } catch (error) {
      console.log("error in getiing timetable", error);
    }
  };

  const covertionoftime = (time24) => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  useEffect(() => {

    getalltimetable();
  }, []);
  const filterredschedule = scheduleData.filter(
    (item) => item.day === selectedDay
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000" : "#f9fafb",
        marginBottom: 144,
      }}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        {/* Day Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(fullDays[index])}
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 25,
                  backgroundColor:
                    selectedDay === fullDays[index]
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                      ? "#374151"
                      : "#f3f4f6",
                }}
              >
                <Text
                  style={{
                    fontWeight: "500",
                    color:
                      selectedDay === fullDays[index]
                        ? isDark
                          ? "#000"
                          : "#fff"
                        : isDark
                        ? "#d1d5db"
                        : "#6b7280",
                  }}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Schedule Cards */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 16, paddingBottom: 24 }}>
          {filterredschedule.length > 0 ? (
            filterredschedule.map((classItem, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  borderRadius: 16,
                  padding: 20,
                  shadowColor: "#000",
                  shadowOpacity: isDark ? 0.3 : 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#f3f4f6",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isDark ? "#fff" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      {classItem.course_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? "#9ca3af" : "#6b7280",
                      }}
                    >
                      {classItem.venue}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: isDark ? "#fff" : "#111827",
                      }}
                    >
                      {covertionoftime(classItem.start_time)}
                    </Text>
                  </View>
                </View>

                {/* Optional: Add a subtle indicator bar */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    backgroundColor: isDark ? "#fff" : "#000",
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                  }}
                />
              </View>
            ))
          ) : (
            <View
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
                borderRadius: 16,
                padding: 32,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.3 : 0.05,
                shadowRadius: 4,
                elevation: 2,
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#f3f4f6",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                No classes scheduled for {selectedDay}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#6b7280" : "#9ca3af",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Enjoy your free day! 🎉
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default More;
