import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const Today = ({ thecurent, Notcurrentclass }) => {
  const { isDark } = useTheme();
  const [totalength, setlength] = useState(0);
  const [leftlength, setLeftLength] = useState(0);
  const [progress, SetProgress] = useState(0);

  const gettimetabewhoeldata = async () => {
    try {
      const timedata = await SecureStore.getItemAsync("timetable");
      if (timedata) {
        const parsing = JSON.parse(timedata);
        setLeftLength(Notcurrentclass.length);
        setlength(parsing.length);

        const completedClasses = parsing.length - Notcurrentclass.length;
        const progressPercentage =
          parsing.length > 0 ? (completedClasses / parsing.length) * 100 : 0;
        SetProgress(progressPercentage);
        console.log(`Progress: ${progressPercentage.toFixed(2)}%`);
      }
    } catch (error) {
      console.error("Error getting timetable data:", error);
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
    gettimetabewhoeldata();
  }, [thecurent, Notcurrentclass]);

  const multipleCurrent = thecurent.length > 1;
  const singleCurrent = thecurent.length === 1;

  return (
    <View style={{ backgroundColor: isDark ? "#000" : "#fff" }}>
      {/* Progress and Stats */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between space-x-2">
          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              padding: 12,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <View className="items-center mb-4">
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: isDark ? "#fff" : "#000",
                  marginBottom: 8,
                }}
              >
                {Math.round(progress)}%
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontWeight: "500",
                }}
              >
                Complete
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: isDark ? "#374151" : "#e5e7eb",
                borderRadius: 6,
                height: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: isDark ? "#fff" : "#000",
                  height: 12,
                  borderRadius: 6,
                  width: `${progress}%`,
                }}
              />
            </View>
            <View className="flex-row justify-between w-full mt-2">
              {[0, 25, 50, 75, 100].map((threshold) => (
                <View
                  key={threshold}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      progress >= threshold
                        ? isDark
                          ? "#fff"
                          : "#000"
                        : isDark
                        ? "#374151"
                        : "#d1d5db",
                  }}
                />
              ))}
            </View>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? "#fff" : "#000",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: isDark ? "#000" : "#fff",
                marginBottom: 8,
              }}
            >
              {totalength}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#6b7280" : "#d1d5db",
                fontWeight: "500",
              }}
            >
              Classes
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              padding: 24,
              borderRadius: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: isDark ? "#fff" : "#000",
                marginBottom: 8,
              }}
            >
              {leftlength}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                fontWeight: "500",
              }}
            >
              Left
            </Text>
          </View>
        </View>
      </View>

      {(thecurent && thecurent.length > 0) ||
      (Notcurrentclass && Notcurrentclass.length > 0) ? (
        <>
          {thecurent.length > 0 && (
            <View className="mx-6 mb-6">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isDark ? "#fff" : "#374151",
                  marginBottom: 16,
                }}
              >
                {multipleCurrent ? "Current Classes" : "Current Class"}
              </Text>

              <View className="space-y-4">
                {thecurent.map((cls, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDark ? "#1a1a1a" : "#000",
                      padding: 24,
                      borderRadius: 16,
                      shadowColor: "#000",
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1">
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 20,
                            fontWeight: "bold",
                            marginBottom: 8,
                          }}
                        >
                          {cls.course_name}
                        </Text>
                        <Text
                          style={{
                            color: "#d1d5db",
                            fontSize: 14,
                            marginBottom: 4,
                          }}
                        >
                          📍 {cls.venue}
                        </Text>
                        <Text
                          style={{
                            color: "#d1d5db",
                            fontSize: 14,
                          }}
                        >
                          {covertionoftime(cls.start_time)} -{" "}
                          {covertionoftime(cls.end_time)}
                        </Text>
                        <Text
                          style={{
                            color: "#d1d5db",
                            fontSize: 14,
                          }}
                        >
                          👨‍🏫 {cls.teacher_name}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: "#fff",
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: "#000",
                            fontSize: 12,
                            fontWeight: "bold",
                          }}
                        >
                          LIVE
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {Notcurrentclass.length > 0 ? (
            <View className="mx-6 mb-36">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isDark ? "#fff" : "#374151",
                  marginBottom: 16,
                }}
              >
                Upcoming Classes
              </Text>

              <View className="space-y-3">
                {Notcurrentclass.map((classItem, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDark ? "#1a1a1a" : "#fff",
                      padding: 16,
                      borderRadius: 12,
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: isDark ? "#374151" : "#e5e7eb",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View className="flex-1">
                      <Text
                        style={{
                          fontWeight: "600",
                          color: isDark ? "#fff" : "#374151",
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
                        {classItem.venue} • {classItem.teacher_name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDark ? "#9ca3af" : "#6b7280",
                        }}
                      >
                        {covertionoftime(classItem.start_time)} -{" "}
                        {covertionoftime(classItem.end_time)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : thecurent.length > 0 ? (
            <View
              style={{
                marginHorizontal: 24,
                marginBottom: 144,
                backgroundColor: isDark ? "#1a1a1a" : "#eff6ff",
                padding: 32,
                borderRadius: 16,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#374151" : "#dbeafe",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: isDark ? "#374151" : "#dbeafe",
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 32 }}>📚</Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: isDark ? "#fff" : "#374151",
                  marginBottom: 8,
                }}
              >
                No More Classes Today
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                Enjoy your time!
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <View
          style={{
            marginHorizontal: 24,
            marginBottom: 144,
            backgroundColor: isDark ? "#1a1a1a" : "#eff6ff",
            padding: 32,
            borderRadius: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#dbeafe",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: isDark ? "#374151" : "#dbeafe",
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 32 }}>📚</Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: isDark ? "#fff" : "#374151",
              marginBottom: 8,
            }}
          >
            No Classes Today
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#6b7280",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Enjoy your free day!
          </Text>
        </View>
      )}
    </View>
  );
};

export default Today;
