import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

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

const schema = yup.object().shape({
  program: yup.string().required("Program is required"),
  course: yup.string().required("Course Name is required"),
});

const addcourse = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("addCourse");
  const [Programs, SetPrograms] = useState([]);
  const [isProgramPickerVisible, setIsProgramPickerVisible] = useState(false);
  const [isCoursePickerVisible, setIsCoursePickerVisible] = useState(false);
  const [programSearchText, setProgramSearchText] = useState("");
  const [courseSearchText, setCourseSearchText] = useState("");
  const [Courses, SetCourses] = useState([]);
  const [RePeatCourse, SetrepeatingCourse] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // -- Unified theme tokens (matching home page) --
  const bg = isDark ? "#000000" : "#f5f5f7";
  const card = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#1e1e1e" : "#eee";
  const textPrimary = isDark ? "#ffffff" : "#000000";
  const textSecondary = isDark ? "#777777" : "#888888";
  const textTertiary = isDark ? "#444444" : "#bbbbbb";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
  const modalBg = isDark ? "#0a0a0a" : "#fafafa";

  const onSubmit = async (data) => {
    const token = await SecureStore.getItemAsync("accessToken");
    try {
      const responce = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/addcourse`,
        {
          program_id: selectedProgramId,
          course: data.course,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (responce.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: responce.data.message,
        });
        reset();
        await getrepeatcourses();
      } else {
        Toast.show({
          type: "error",
          text1: "Error in uploading timetable",
        });
      }
    } catch (error) {
      console.log("error in adding course", error);
      Toast.show({
        type: "error",
        text1: "Error in uploading timetable",
      });
    }
  };

  const getprograms = async () => {
    try {
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/getprogramfromdb`,
      );
      SetPrograms(responce.data);
    } catch (error) {
      console.log("error in getting programs", error);
    }
  };

  const getcourse = async (id) => {
    const token = await SecureStore.getItemAsync("accessToken");
    try {
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/getcoursesfromdb/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      SetCourses(responce.data);
    } catch (error) {
      console.log("error on getting courses", error);
    }
  };

  const getrepeatcourses = async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/viewcourses/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      SetrepeatingCourse(responce.data.repeatcourses);
    } catch (error) {
      console.log("Error in getting repeat courses", error);
    }
  };

  const deletecourse = async (id) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const token = await SecureStore.getItemAsync("accessToken");
      const responce = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/deletecourse/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (responce.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: responce.data.message,
        });
        await getrepeatcourses();
      }
    } catch (error) {
      console.log("error in deleting course", error);
    }
  };

  useEffect(() => {
    getprograms();
    getrepeatcourses();
  }, []);

  // ── Shared picker modal ──
  const PickerModal = ({
    visible,
    onClose,
    title,
    searchText,
    onSearchChange,
    data,
    keyExtractor,
    onSelect,
    emptyIcon,
    emptyText,
    iconName,
    itemColor,
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: modalBg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "70%",
            paddingBottom: 34,
          }}
        >
          {/* Handle */}
          <View
            style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: cardBorder,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: cardBorder,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: textPrimary,
                }}
              >
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={20} color={textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: inputBg,
                borderRadius: 14,
                paddingHorizontal: 14,
                height: 50,
                borderWidth: 1,
                borderColor: cardBorder,
              }}
            >
              <Ionicons name="search" size={20} color="#54a0ff" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 16,
                  color: textPrimary,
                }}
                placeholder={`Search ${title.toLowerCase()}...`}
                placeholderTextColor={textTertiary}
                value={searchText}
                onChangeText={onSearchChange}
                autoFocus={true}
              />
            </View>
          </View>

          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item, index }) => {
              const color =
                itemColor?.(item) ||
                SUBJECT_COLORS[index % SUBJECT_COLORS.length];
              return (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: cardBorder,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: hexToRgba(color, 0.12),
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Ionicons name={iconName} size={18} color={color} />
                  </View>
                  <Text
                    style={{
                      fontSize: 15,
                      color: textPrimary,
                      fontWeight: "500",
                      flex: 1,
                    }}
                  >
                    {item.program_name || item.course_name}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={textTertiary}
                  />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={{ padding: 40, alignItems: "center" }}>
                <Ionicons
                  name={emptyIcon}
                  size={48}
                  color={textTertiary}
                />
                <Text
                  style={{
                    color: textSecondary,
                    textAlign: "center",
                    marginTop: 12,
                    fontSize: 15,
                  }}
                >
                  {emptyText}
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: hexToRgba("#54a0ff", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="book" size={24} color="#54a0ff" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#54a0ff",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Course Management
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: textPrimary,
                  letterSpacing: -0.5,
                }}
              >
                Repeat Courses
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              lineHeight: 20,
              fontWeight: "500",
            }}
          >
            Add and manage your repeat courses seamlessly
          </Text>
        </View>

        {/* ── Tab Switcher ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: card,
              borderRadius: 15,
              padding: 4,
              borderWidth: 1,
              borderColor: cardBorder,
            }}
          >
            {[
              { key: "addCourse", label: "Add Course", icon: "add-circle", color: "#10ac84" },
              { key: "viewCourse", label: "My Courses", icon: "library", color: "#54a0ff" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    borderRadius: 12,
                    backgroundColor: isActive ? tab.color : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(tab.key);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isActive ? "#ffffff" : textTertiary}
                  />
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      color: isActive ? "#ffffff" : textTertiary,
                      letterSpacing: 0.2,
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Tab Content ── */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === "addCourse" ? (
            <View>
              {/* ── Add Course Form ── */}
              <View
                style={{
                  backgroundColor: card,
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: textPrimary,
                    marginBottom: 4,
                    letterSpacing: -0.3,
                  }}
                >
                  Add New Course
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: textSecondary,
                    marginBottom: 28,
                    fontWeight: "500",
                  }}
                >
                  Fill in the details below
                </Text>

                {/* Form Fields */}
                <View style={{ gap: 24 }}>
                  {/* ── Step 1: Program ── */}
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: hexToRgba("#ff9f43", 0.12),
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: "#ff9f43",
                          }}
                        >
                          01
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: textSecondary,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        Select Program
                      </Text>
                    </View>

                    <Controller
                      name="program"
                      control={control}
                      render={({ field: { onChange, value } }) => {
                        const filteredPrograms = Programs.filter((program) =>
                          program.program_name
                            ?.toLowerCase()
                            .includes(programSearchText.toLowerCase()),
                        );
                        const selectedProgram = Programs.find(
                          (program) => program.program_name === value,
                        );

                        return (
                          <View>
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                backgroundColor: inputBg,
                                borderRadius: 16,
                                borderWidth: 1.5,
                                borderColor: errors.program
                                  ? "#ff6b6b"
                                  : cardBorder,
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                flexDirection: "row",
                              }}
                              onPress={() => setIsProgramPickerVisible(true)}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  flex: 1,
                                  gap: 10,
                                }}
                              >
                                <Ionicons
                                  name="school"
                                  size={18}
                                  color={
                                    selectedProgram
                                      ? "#ff9f43"
                                      : textTertiary
                                  }
                                />
                                <Text
                                  style={{
                                    fontSize: 15,
                                    color: selectedProgram
                                      ? textPrimary
                                      : textTertiary,
                                    flex: 1,
                                    fontWeight: selectedProgram
                                      ? "500"
                                      : "400",
                                  }}
                                  numberOfLines={1}
                                >
                                  {selectedProgram
                                    ? selectedProgram.program_name
                                    : "Choose a program..."}
                                </Text>
                              </View>
                              <Ionicons
                                name="chevron-down"
                                size={18}
                                color={textTertiary}
                              />
                            </TouchableOpacity>

                            <PickerModal
                              visible={isProgramPickerVisible}
                              onClose={() => {
                                setIsProgramPickerVisible(false);
                                setProgramSearchText("");
                              }}
                              title="Select Program"
                              searchText={programSearchText}
                              onSearchChange={setProgramSearchText}
                              data={filteredPrograms}
                              keyExtractor={(item) =>
                                item.program_id.toString()
                              }
                              onSelect={(item) => {
                                onChange(item.program_name);
                                setSelectedProgramId(item.program_id);
                                setIsProgramPickerVisible(false);
                                setProgramSearchText("");
                                getcourse(item.program_id);
                              }}
                              emptyIcon="search-outline"
                              emptyText="No programs found"
                              iconName="school"
                            />

                            {errors.program && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 8,
                                  gap: 6,
                                }}
                              >
                                <Ionicons
                                  name="alert-circle"
                                  size={14}
                                  color="#ff6b6b"
                                />
                                <Text
                                  style={{
                                    color: "#ff6b6b",
                                    fontSize: 13,
                                    fontWeight: "500",
                                  }}
                                >
                                  {errors.program.message}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  </View>

                  {/* ── Step 2: Course ── */}
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: hexToRgba("#48dbfb", 0.12),
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: "#48dbfb",
                          }}
                        >
                          02
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: textSecondary,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                        }}
                      >
                        Select Course
                      </Text>
                    </View>

                    <Controller
                      name="course"
                      control={control}
                      render={({ field: { onChange, value } }) => {
                        const filteredCourses = Courses.filter((course) =>
                          course.course_name
                            ?.toLowerCase()
                            .includes(courseSearchText.toLowerCase()),
                        );
                        const selectedCourse = Courses.find(
                          (course) => course.course_name === value,
                        );

                        return (
                          <View>
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                backgroundColor: inputBg,
                                borderRadius: 16,
                                borderWidth: 1.5,
                                borderColor: errors.course
                                  ? "#ff6b6b"
                                  : cardBorder,
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                flexDirection: "row",
                              }}
                              onPress={() => setIsCoursePickerVisible(true)}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  flex: 1,
                                  gap: 10,
                                }}
                              >
                                <Ionicons
                                  name="document-text"
                                  size={18}
                                  color={
                                    selectedCourse
                                      ? "#48dbfb"
                                      : textTertiary
                                  }
                                />
                                <Text
                                  style={{
                                    fontSize: 15,
                                    color: selectedCourse
                                      ? textPrimary
                                      : textTertiary,
                                    flex: 1,
                                    fontWeight: selectedCourse
                                      ? "500"
                                      : "400",
                                  }}
                                  numberOfLines={1}
                                >
                                  {selectedCourse
                                    ? selectedCourse.course_name
                                    : "Choose a course..."}
                                </Text>
                              </View>
                              <Ionicons
                                name="chevron-down"
                                size={18}
                                color={textTertiary}
                              />
                            </TouchableOpacity>

                            <PickerModal
                              visible={isCoursePickerVisible}
                              onClose={() => {
                                setIsCoursePickerVisible(false);
                                setCourseSearchText("");
                              }}
                              title="Select Course"
                              searchText={courseSearchText}
                              onSearchChange={setCourseSearchText}
                              data={filteredCourses}
                              keyExtractor={(item, index) => index.toString()}
                              onSelect={(item) => {
                                onChange(item.course_name);
                                setIsCoursePickerVisible(false);
                                setCourseSearchText("");
                              }}
                              emptyIcon="document-outline"
                              emptyText={
                                selectedProgramId
                                  ? "No courses found"
                                  : "Select a program first"
                              }
                              iconName="document-text"
                              itemColor={(item) =>
                                getSubjectColor(item.course_name)
                              }
                            />

                            {errors.course && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  marginTop: 8,
                                  gap: 6,
                                }}
                              >
                                <Ionicons
                                  name="alert-circle"
                                  size={14}
                                  color="#ff6b6b"
                                />
                                <Text
                                  style={{
                                    color: "#ff6b6b",
                                    fontSize: 13,
                                    fontWeight: "500",
                                  }}
                                >
                                  {errors.course.message}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>

                {/* ── Submit Button ── */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#10ac84",
                    paddingVertical: 17,
                    alignItems: "center",
                    borderRadius: 16,
                    marginTop: 32,
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="add-circle"
                    size={20}
                    color="#ffffff"
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 16,
                      fontWeight: "700",
                      letterSpacing: 0.3,
                    }}
                  >
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              {/* ── Stats Row ── */}
              <View
                style={{
                  backgroundColor: card,
                  borderRadius: 24,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  marginBottom: 20,
                }}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {[
                    {
                      label: "Total",
                      value: RePeatCourse.length,
                      color: "#54a0ff",
                      icon: "library",
                    },
                    {
                      label: "Active",
                      value: RePeatCourse.length,
                      color: "#10ac84",
                      icon: "checkmark-circle",
                    },
                  ].map((stat) => (
                    <View
                      key={stat.label}
                      style={{
                        flex: 1,
                        backgroundColor: hexToRgba(stat.color, isDark ? 0.1 : 0.06),
                        borderRadius: 16,
                        paddingVertical: 18,
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: hexToRgba(stat.color, 0.15),
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Ionicons
                          name={stat.icon}
                          size={20}
                          color={stat.color}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 28,
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
              </View>

              {/* ── Courses List ── */}
              <View
                style={{
                  backgroundColor: card,
                  borderRadius: 24,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 18,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: hexToRgba("#ff9ff3", 0.12),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="list" size={18} color="#ff9ff3" />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: textPrimary,
                    }}
                  >
                    Your Courses
                  </Text>
                </View>

                {RePeatCourse.length > 0 ? (
                  <View style={{ gap: 10 }}>
                    {RePeatCourse.map((repeat, index) => {
                      const color = getSubjectColor(repeat.course_name);
                      return (
                        <View
                          key={repeat.repeat_id}
                          style={{
                            backgroundColor: hexToRgba(color, isDark ? 0.08 : 0.04),
                            padding: 16,
                            borderRadius: 18,
                            flexDirection: "row",
                            alignItems: "center",
                            borderLeftWidth: 4,
                            borderLeftColor: color,
                          }}
                        >
                          {/* Colored index badge */}
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              backgroundColor: hexToRgba(color, 0.15),
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 14,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "800",
                                color: color,
                              }}
                            >
                              {(index + 1).toString().padStart(2, "0")}
                            </Text>
                          </View>

                          {/* Course name */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontWeight: "600",
                                color: textPrimary,
                                fontSize: 15,
                                lineHeight: 20,
                              }}
                            >
                              {repeat.course_name}
                            </Text>
                          </View>

                          {/* Delete button */}
                          <TouchableOpacity
                            onPress={() => deletecourse(repeat.repeat_id)}
                            style={{
                              backgroundColor: hexToRgba("#ff6b6b", 0.12),
                              width: 38,
                              height: 38,
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={17}
                              color="#ff6b6b"
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 40 }}>
                    <View
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: hexToRgba("#feca57", 0.12),
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons
                        name="folder-open-outline"
                        size={34}
                        color="#feca57"
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: textPrimary,
                        marginBottom: 6,
                      }}
                    >
                      No courses yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: textSecondary,
                        textAlign: "center",
                        fontWeight: "500",
                      }}
                    >
                      Add your first repeat course to get started
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default addcourse;
