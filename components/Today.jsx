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

  return (
    <View style={{ backgroundColor: isDark ? "#000000" : "#fafafa" }}>
      {/* Stats Cards */}
      <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Progress Card */}
          <View
            style={{
              flex: 1.5,
              backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
              padding: 20,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isDark ? "#555555" : "#999999",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Progress
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "800",
                color: isDark ? "#ffffff" : "#000000",
                marginBottom: 16,
              }}
            >
              {Math.round(progress)}%
            </Text>
            <View
              style={{
                width: "100%",
                backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                borderRadius: 4,
                height: 6,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: isDark ? "#ffffff" : "#000000",
                  height: 6,
                  borderRadius: 4,
                  width: `${progress}%`,
                }}
              />
            </View>
          </View>

          {/* Stats Column */}
          <View style={{ flex: 1, gap: 12 }}>
            {/* Total Classes */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#ffffff" : "#000000",
                padding: 16,
                borderRadius: 20,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: isDark ? "#000000" : "#ffffff",
                }}
              >
                {totalength}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: isDark ? "#666666" : "#888888",
                  letterSpacing: 0.5,
                }}
              >
                Total
              </Text>
            </View>

            {/* Remaining */}
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
                padding: 16,
                borderRadius: 20,
                justifyContent: "center",
                borderWidth: 1,
                borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: isDark ? "#ffffff" : "#000000",
                }}
              >
                {leftlength}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "500",
                  color: isDark ? "#555555" : "#999999",
                  letterSpacing: 0.5,
                }}
              >
                Left
              </Text>
            </View>
          </View>
        </View>
      </View>

      {(thecurent && thecurent.length > 0) ||
      (Notcurrentclass && Notcurrentclass.length > 0) ? (
        <>
          {/* Current Class Section */}
          {thecurent.length > 0 && (
            <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDark ? "#ffffff" : "#000000",
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isDark ? "#888888" : "#666666",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {multipleCurrent ? "Happening Now" : "Happening Now"}
                </Text>
              </View>

              {thecurent.map((cls, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: isDark ? "#ffffff" : "#000000",
                    padding: 24,
                    borderRadius: 24,
                    marginBottom: index < thecurent.length - 1 ? 12 : 0,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: isDark ? "#000000" : "#ffffff",
                          marginBottom: 12,
                          letterSpacing: -0.3,
                        }}
                      >
                        {cls.course_name}
                      </Text>
                      <View style={{ gap: 6 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: isDark ? "#666666" : "#999999",
                            fontWeight: "500",
                          }}
                        >
                          {cls.venue}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: isDark ? "#666666" : "#999999",
                            fontWeight: "500",
                          }}
                        >
                          {covertionoftime(cls.start_time)} — {covertionoftime(cls.end_time)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            color: isDark ? "#666666" : "#999999",
                            fontWeight: "500",
                          }}
                        >
                          {cls.teacher_name}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: isDark ? "#000000" : "#ffffff",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 100,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: isDark ? "#ffffff" : "#000000",
                          letterSpacing: 1,
                        }}
                      >
                        LIVE
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Upcoming Classes Section */}
          {Notcurrentclass.length > 0 ? (
            <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isDark ? "#333333" : "#cccccc",
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: isDark ? "#555555" : "#999999",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Up Next
                </Text>
              </View>

              {Notcurrentclass.map((classItem, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
                    padding: 20,
                    borderRadius: 20,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Time Indicator */}
                  <View
                    style={{
                      width: 56,
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: isDark ? "#ffffff" : "#000000",
                      }}
                    >
                      {covertionoftime(classItem.start_time).split(" ")[0]}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "500",
                        color: isDark ? "#555555" : "#999999",
                      }}
                    >
                      {covertionoftime(classItem.start_time).split(" ")[1]}
                    </Text>
                  </View>

                  {/* Divider */}
                  <View
                    style={{
                      width: 1,
                      height: 40,
                      backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
                      marginRight: 16,
                    }}
                  />

                  {/* Class Details */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#000000",
                        marginBottom: 4,
                        letterSpacing: -0.2,
                      }}
                    >
                      {classItem.course_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: isDark ? "#555555" : "#999999",
                        fontWeight: "500",
                      }}
                    >
                      {classItem.venue} · {classItem.teacher_name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : thecurent.length > 0 ? (
            <View
              style={{
                marginHorizontal: 24,
                marginBottom: 40,
                backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
                padding: 40,
                borderRadius: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
                  borderRadius: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 28 }}>✓</Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#000000",
                  marginBottom: 8,
                  letterSpacing: -0.3,
                }}
              >
                All Done for Today
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#555555" : "#999999",
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                No more classes remaining
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        <View
          style={{
            marginHorizontal: 24,
            marginBottom: 40,
            backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
            padding: 40,
            borderRadius: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
              borderRadius: 32,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 28 }}>☀️</Text>
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#000000",
              marginBottom: 8,
              letterSpacing: -0.3,
            }}
          >
            Free Day
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#555555" : "#999999",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            No classes scheduled today
          </Text>
        </View>
      )}
    </View>
  );
};

export default Today;
