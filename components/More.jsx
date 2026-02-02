import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getTeacherMetadata, getTeacherWeekTimetable } from "../utils/supabase";

// Accent colors for timetable cards (work in light & dark)
const CARD_ACCENTS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"];

const More = () => {
  const { isDark } = useTheme();
  const [selectedDay, setSelectedDay] = useState("Monday");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const fullDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const [scheduleData, SetScheduledata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getalltimetable = async () => {
    setIsLoading(true);
    const role = await SecureStore.getItemAsync("role");

    // Check if user is a teacher
    if (role === "teacher") {
      console.log("[More] Fetching teacher weekly timetable from Supabase...");
      try {
        const teacherName = await getTeacherMetadata();
        if (!teacherName) {
          console.error("Could not get teacher name");
          return;
        }

        const timetable = await getTeacherWeekTimetable(teacherName);
        // console.log("[More] Teacher timetable:", timetable);

        // Map abbreviated day names to full day names
        const dayMap = {
          "Mo": "Monday",
          "Tu": "Tuesday",
          "We": "Wednesday",
          "Th": "Thursday",
          "Fr": "Friday",
          "Monday": "Monday",
          "Tuesday": "Tuesday",
          "Wednesday": "Wednesday",
          "Thursday": "Thursday",
          "Friday": "Friday",
        };

        // Transform teacher data to match student format
        const transformedData = timetable.map(item => ({
          day: dayMap[item.Day] || item.Day,
          course_name: item.Subject,
          venue: item.Location,
          start_time: item.Time?.split('-')[0]?.trim() || "",
          end_time: item.Time?.split('-')[1]?.trim() || "",
        }));

        SetScheduledata(transformedData);
      } catch (error) {
        console.log("Error fetching teacher timetable:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Student flow
      console.log("[More] Fetching student timetable from API...");
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  const covertionoftime = (time24) => {
    if (!time24 || typeof time24 !== "string") return "";
    const parts = time24.split(":");
    const hourStr = parts[0];
    const minute = parts[1] || "00";
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return "";
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
      {/* Header with day tabs */}
      <View
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#fff",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 20,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Day Tabs — pill container */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4 }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              backgroundColor: isDark ? "#2d2d2d" : "#e5e7eb",
              borderRadius: 14,
              padding: 5,
              alignSelf: "flex-start",
            }}
          >
            {days.map((day, index) => {
              const isSelected = selectedDay === fullDays[index];
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDay(fullDays[index]);
                  }}
                  accessibilityLabel={`${fullDays[index]} schedule`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: isSelected
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : "transparent",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isSelected ? (isDark ? 0.2 : 0.15) : 0,
                    shadowRadius: 4,
                    elevation: isSelected ? 3 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? "700" : "600",
                      color: isSelected
                        ? isDark
                          ? "#000"
                          : "#fff"
                        : isDark
                          ? "#9ca3af"
                          : "#6b7280",
                      letterSpacing: 0.3,
                    }}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Timetable section */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {!isLoading && filterredschedule.length > 0 && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark ? "#9ca3af" : "#6b7280",
              marginBottom: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Timetable — {selectedDay}
          </Text>
        )}
        {isLoading ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#000000"} />
            <Text
              style={{
                marginTop: 16,
                color: isDark ? "#9ca3af" : "#6b7280",
                fontSize: 14,
              }}
            >
              Loading schedule...
            </Text>
          </View>
        ) : (
          <View style={{ gap: 20, paddingBottom: 24 }}>
            {filterredschedule.length > 0 ? (
            filterredschedule.map((classItem, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const startTime = classItem.start_time ? covertionoftime(classItem.start_time) : "";
              const endTime = classItem.end_time ? covertionoftime(classItem.end_time) : "";
              return (
              <View
                key={index}
                style={{
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  borderRadius: 20,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: isDark ? 0.4 : 0.08,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: isDark ? "#2d2d2d" : "rgba(0,0,0,0.06)",
                }}
              >
                {/* Colored accent bar */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    backgroundColor: accent,
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  }}
                />
                <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 18, paddingBottom: 18 }}>
                  {/* Time badge — timetable slot */}
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: isDark ? "rgba(99, 102, 241, 0.2)" : `${accent}18`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      marginBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: accent,
                        letterSpacing: 0.3,
                      }}
                    >
                      {startTime && endTime ? `${startTime} – ${endTime}` : "Timetable"}
                    </Text>
                  </View>
                  {/* Course name */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: isDark ? "#fff" : "#111827",
                      marginBottom: 8,
                      letterSpacing: -0.3,
                    }}
                  >
                    {classItem.course_name}
                  </Text>
                  {/* Venue with icon */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? "#9ca3af" : "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      {classItem.venue || "—"}
                    </Text>
                  </View>
                </View>
              </View>
              );
            })
          ) : (
            <View
              style={{
                backgroundColor: isDark ? "#1a1a1a" : "#fff",
                borderRadius: 20,
                padding: 40,
                shadowColor: "#000",
                shadowOpacity: isDark ? 0.3 : 0.06,
                shadowRadius: 12,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDark ? "#2d2d2d" : "rgba(0,0,0,0.06)",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: isDark ? "#2d2d2d" : "#f3f4f6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
              </View>
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#374151",
                  textAlign: "center",
                  fontSize: 17,
                  fontWeight: "600",
                  marginBottom: 6,
                }}
              >
                No classes scheduled
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#6b7280" : "#9ca3af",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {selectedDay === "Monday" && "Start your week fresh! 🌟"}
                {selectedDay === "Tuesday" && "Enjoy your free day! 🎉"}
                {selectedDay === "Wednesday" && "Midweek break! ☕"}
                {selectedDay === "Thursday" && "Almost there! 💪"}
                {selectedDay === "Friday" && "Weekend is near! 🎊"}
                {!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(selectedDay) && "Enjoy your free day! 🎉"}
              </Text>
            </View>
          )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default More;
