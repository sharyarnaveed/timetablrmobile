import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

const EASTER_EGG_TAP_COUNT = 5;
const TAP_RESET_MS = 2000;
const CONFETTI_COLORS = [
  "#ff6b6b",
  "#feca57",
  "#48dbfb",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
  "#00d2d3",
];
const NUM_CONFETTI = 24;

const SUBJECT_COLORS = [
  "#ff6b6b",
  "#48dbfb",
  "#feca57",
  "#ff9ff3",
  "#54a0ff",
  "#5f27cd",
  "#00d2d3",
  "#ff9f43",
  "#10ac84",
  "#ee5a24",
];

const getSubjectColor = (courseName) => {
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
};

const hexToRgba = (hex, alpha) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Today = ({ thecurent, Notcurrentclass }) => {
  const { isDark } = useTheme();
  const [totalength, setlength] = useState(0);
  const [leftlength, setLeftLength] = useState(0);
  const [progress, SetProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [tapCount, setTapCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const tapResetRef = useRef(null);
  const confettiAnims = useRef(
    Array.from({ length: NUM_CONFETTI }, () => ({
      y: new Animated.Value(0),
      x: new Animated.Value(0),
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: Math.random() * 100,
      delay: Math.random() * 400,
    })),
  ).current;

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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [thecurent, Notcurrentclass]);

  // Pulse animation for live indicator
  useEffect(() => {
    if (thecurent.length > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [thecurent]);

  // Easter egg tap reset
  useEffect(() => {
    if (tapCount === 0) return;
    if (tapResetRef.current) clearTimeout(tapResetRef.current);
    tapResetRef.current = setTimeout(() => setTapCount(0), TAP_RESET_MS);
    return () => {
      if (tapResetRef.current) clearTimeout(tapResetRef.current);
    };
  }, [tapCount]);

  // Confetti animation
  useEffect(() => {
    if (showEasterEgg) {
      confettiAnims.forEach(({ y, x, delay }) => {
        y.setValue(0);
        x.setValue(0);
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(y, {
              toValue: 600,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(x, {
              toValue: (Math.random() - 0.5) * 80,
              duration: 2500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      confettiAnims.forEach(({ y, x }) => {
        y.setValue(0);
        x.setValue(0);
      });
    }
  }, [showEasterEgg]);

  const handleProgressCardPress = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= EASTER_EGG_TAP_COUNT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEasterEgg(true);
      setTapCount(0);
    }
  };

  const completedCount = totalength - leftlength;

  // -- Theme helpers --
  const card = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#1e1e1e" : "#eee";
  const bg = isDark ? "#000000" : "#f5f5f7";
  const textPrimary = isDark ? "#ffffff" : "#000000";
  const textSecondary = isDark ? "#777777" : "#888888";
  const textTertiary = isDark ? "#444444" : "#bbbbbb";

  return (
    <Animated.View style={{ backgroundColor: bg, opacity: fadeAnim }}>
      {/* ── Stats Section ── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
        <Pressable
          onPress={handleProgressCardPress}
          style={({ pressed }) => ({
            backgroundColor: card,
            borderRadius: 24,
            padding: 22,
            borderWidth: 1,
            borderColor: cardBorder,
            opacity: pressed ? 0.95 : 1,
          })}
        >
          {/* Progress header row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: textSecondary,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Today's Progress
            </Text>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "900",
                color: textPrimary,
              }}
            >
              {Math.round(progress)}%
            </Text>
          </View>

          {/* Progress bar */}
          <View
            style={{
              width: "100%",
              backgroundColor: isDark ? "#1a1a1a" : "#f0f0f0",
              borderRadius: 8,
              height: 10,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <Animated.View
              style={{
                height: 10,
                borderRadius: 8,
                width: `${Math.max(progress, 2)}%`,
                backgroundColor:
                  progress >= 100
                    ? "#10ac84"
                    : progress >= 50
                      ? "#54a0ff"
                      : "#ff9f43",
              }}
            />
          </View>

          {/* Mini stats row */}
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            {[
              { label: "Total", value: totalength, color: textPrimary },
              { label: "Done", value: completedCount, color: "#10ac84" },
              { label: "Left", value: leftlength, color: "#ff9f43" },
            ].map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: isDark ? "#0a0a0a" : "#f8f8fa",
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: isDark ? "#1a1a1a" : "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "800",
                    color: stat.color,
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: textTertiary,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>
      </View>

      {(thecurent && thecurent.length > 0) ||
      (Notcurrentclass && Notcurrentclass.length > 0) ? (
        <>
          {/* ── Happening Now ── */}
          {thecurent.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <Animated.View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#ff6b6b",
                    marginRight: 10,
                    opacity: pulseAnim,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: textSecondary,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Happening Now
                </Text>
              </View>

              {thecurent.map((cls, index) => {
                const subjectColor = getSubjectColor(cls.course_name);
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isDark
                        ? hexToRgba(subjectColor, 0.08)
                        : hexToRgba(subjectColor, 0.05),
                      borderRadius: 22,
                      marginBottom: index < thecurent.length - 1 ? 12 : 0,
                      borderLeftWidth: 5,
                      borderLeftColor: subjectColor,
                      overflow: "hidden",
                    }}
                  >
                    <View style={{ padding: 22 }}>
                      {/* Top row: name + live badge */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 16,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 19,
                            fontWeight: "800",
                            color: textPrimary,
                            flex: 1,
                            marginRight: 12,
                            letterSpacing: -0.3,
                          }}
                        >
                          {cls.course_name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: hexToRgba("#ff6b6b", 0.15),
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 100,
                            gap: 6,
                          }}
                        >
                          <Animated.View
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 4,
                              backgroundColor: "#ff6b6b",
                              opacity: pulseAnim,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "800",
                              color: "#ff6b6b",
                              letterSpacing: 1,
                            }}
                          >
                            LIVE
                          </Text>
                        </View>
                      </View>

                      {/* Detail rows with icons */}
                      <View style={{ gap: 10 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color={subjectColor}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: textSecondary,
                              fontWeight: "500",
                            }}
                          >
                            {cls.venue}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={subjectColor}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: textSecondary,
                              fontWeight: "500",
                            }}
                          >
                            {covertionoftime(cls.start_time)} —{" "}
                            {covertionoftime(cls.end_time)}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color={subjectColor}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: textSecondary,
                              fontWeight: "500",
                            }}
                          >
                            {cls.teacher_name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* ── Up Next (Timeline) ── */}
          {Notcurrentclass.length > 0 ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
              {/* Section header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: textTertiary,
                    marginRight: 10,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: textSecondary,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                  }}
                >
                  Up Next
                </Text>
              </View>

              {/* Timeline container */}
              <View style={{ paddingLeft: 6 }}>
                {Notcurrentclass.map((classItem, index) => {
                  const subjectColor = getSubjectColor(
                    classItem.course_name,
                  );
                  const isLast = index === Notcurrentclass.length - 1;

                  return (
                    <View
                      key={index}
                      style={{ flexDirection: "row", minHeight: 90 }}
                    >
                      {/* Timeline rail */}
                      <View
                        style={{
                          width: 28,
                          alignItems: "center",
                        }}
                      >
                        {/* Colored dot */}
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: hexToRgba(subjectColor, 0.2),
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 18,
                            zIndex: 2,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: subjectColor,
                            }}
                          />
                        </View>
                        {/* Connecting line */}
                        {!isLast && (
                          <View
                            style={{
                              flex: 1,
                              width: 2,
                              backgroundColor: isDark
                                ? "#1e1e1e"
                                : "#e8e8e8",
                              marginTop: 4,
                            }}
                          />
                        )}
                      </View>

                      {/* Card */}
                      <View
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          marginBottom: isLast ? 0 : 10,
                          backgroundColor: card,
                          borderRadius: 18,
                          padding: 18,
                          borderWidth: 1,
                          borderColor: cardBorder,
                        }}
                      >
                        {/* Time badge */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={13}
                            color={subjectColor}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: subjectColor,
                              letterSpacing: 0.3,
                            }}
                          >
                            {covertionoftime(classItem.start_time)} —{" "}
                            {covertionoftime(classItem.end_time)}
                          </Text>
                        </View>

                        {/* Course name */}
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: textPrimary,
                            marginBottom: 6,
                            letterSpacing: -0.2,
                          }}
                        >
                          {classItem.course_name}
                        </Text>

                        {/* Venue + teacher */}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Ionicons
                            name="location-outline"
                            size={13}
                            color={textTertiary}
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              color: textSecondary,
                              fontWeight: "500",
                            }}
                          >
                            {classItem.venue}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: textTertiary,
                            }}
                          >
                            ·
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: textSecondary,
                              fontWeight: "500",
                            }}
                          >
                            {classItem.teacher_name}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : thecurent.length > 0 ? (
            /* ── All Done ── */
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 40,
                backgroundColor: card,
                padding: 40,
                borderRadius: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: cardBorder,
              }}
            >
              <View
                style={{
                  width: 68,
                  height: 68,
                  backgroundColor: hexToRgba("#10ac84", 0.12),
                  borderRadius: 34,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <Ionicons name="checkmark-circle" size={34} color="#10ac84" />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: textPrimary,
                  marginBottom: 8,
                  letterSpacing: -0.3,
                }}
              >
                All Done for Today
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: textSecondary,
                  textAlign: "center",
                  fontWeight: "500",
                  lineHeight: 20,
                }}
              >
                No more classes remaining
              </Text>
            </View>
          ) : null}
        </>
      ) : (
        /* ── Free Day ── */
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 40,
            backgroundColor: card,
            padding: 40,
            borderRadius: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: cardBorder,
          }}
        >
          <View
            style={{
              width: 68,
              height: 68,
              backgroundColor: hexToRgba("#feca57", 0.12),
              borderRadius: 34,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ionicons name="sunny" size={34} color="#feca57" />
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: textPrimary,
              marginBottom: 8,
              letterSpacing: -0.3,
            }}
          >
            Free Day
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              textAlign: "center",
              fontWeight: "500",
              lineHeight: 20,
            }}
          >
            No classes scheduled today
          </Text>
        </View>
      )}

      {/* ── Easter egg modal ── */}
      <Modal
        visible={showEasterEgg}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEasterEgg(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setShowEasterEgg(false)}
        >
          {confettiAnims.map((item, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                top: -20,
                left: `${item.left}%`,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: item.color,
                transform: [{ translateY: item.y }, { translateX: item.x }],
              }}
            />
          ))}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: card,
              paddingHorizontal: 32,
              paddingVertical: 28,
              borderRadius: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: cardBorder,
              minWidth: 280,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: textPrimary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              You found the secret!
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: textSecondary,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              You're awesome. Keep crushing it!
            </Text>
            <Pressable
              onPress={() => setShowEasterEgg(false)}
              style={{
                backgroundColor: textPrimary,
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isDark ? "#000000" : "#ffffff",
                }}
              >
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
};

export default Today;
