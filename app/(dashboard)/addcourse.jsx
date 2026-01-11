import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
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

  // Theme colors - Monochrome Black & White
  const colors = {
    background: isDark ? "#000000" : "#ffffff",
    card: isDark ? "rgba(20, 20, 20, 0.9)" : "rgba(250, 250, 250, 0.9)",
    cardSolid: isDark ? "#0a0a0a" : "#fafafa",
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#b3b3b3" : "#4d4d4d",
    textMuted: isDark ? "#808080" : "#666666",
    border: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
    accent: isDark ? "#ffffff" : "#000000",
    accentLight: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)",
    success: isDark ? "#ffffff" : "#000000",
    danger: isDark ? "#e6e6e6" : "#1a1a1a",
    dangerBg: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  };

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
        }
      );

      if (responce.data.success) {
        Toast.show({
          type: "success",
          text1: responce.data.message,
        });
        reset();
        await getrepeatcourses();
      } else {
        Toast.show({
          type: "error",
          text1: "error in uploading timetable",
        });
      }
    } catch (error) {
      console.log("error in adding course", error);
      Toast.show({
        type: "error",
        text1: "error in uploading timetable",
      });
    }
  };

  const getprograms = async () => {
    try {
      const responce = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/getprogramfromdb`
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
        }
      );

      SetCourses(responce.data);
    } catch (error) {
      console.log("erroron getting courses", error);
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
        }
      );

      SetrepeatingCourse(responce.data.repeatcourses);
    } catch (error) {
      console.log("Error in getting reapeat courses", error);
    }
  };

  const deletecourse = async (id) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const responce = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/deletecourse/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (responce.data.success) {
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

  // Glassmorphism card style
  const glassCard = {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24 }}>
          <View style={{ ...glassCard, padding: 28, overflow: "hidden" }}>
            {/* Decorative accent */}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: colors.accent,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}
            />
            
            {/* Floating shapes */}
            <View
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: colors.accentLight,
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -20,
                left: 40,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.accentLight,
                opacity: 0.5,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: colors.accentLight,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="book" size={22} color={colors.accent} />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.accent,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Course Management
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: colors.text,
                letterSpacing: -0.5,
                lineHeight: 34,
              }}
            >
              Repeat Courses
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                marginTop: 8,
                lineHeight: 22,
              }}
            >
              Add and manage your repeat courses seamlessly
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              ...glassCard,
              flexDirection: "row",
              padding: 6,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 18,
                backgroundColor: activeTab === "addCourse" ? colors.accent : "transparent",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setActiveTab("addCourse")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add-circle"
                size={18}
                color={activeTab === "addCourse" ? (isDark ? "#000000" : "#ffffff") : colors.textMuted}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: activeTab === "addCourse" ? (isDark ? "#000000" : "#ffffff") : colors.textMuted,
                }}
              >
                Add Course
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 18,
                backgroundColor: activeTab === "viewCourse" ? colors.accent : "transparent",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => setActiveTab("viewCourse")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="list"
                size={18}
                color={activeTab === "viewCourse" ? (isDark ? "#000000" : "#ffffff") : colors.textMuted}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 14,
                  color: activeTab === "viewCourse" ? (isDark ? "#000000" : "#ffffff") : colors.textMuted,
                }}
              >
                View Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === "addCourse" ? (
            <View>
              {/* Form Card */}
              <View style={{ ...glassCard, padding: 24, marginBottom: 20 }}>
                <View style={{ marginBottom: 32 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "700",
                      color: colors.text,
                      marginBottom: 6,
                    }}
                  >
                    Add New Course
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                    }}
                  >
                    Fill in the details below to add a repeat course
                  </Text>
                </View>

                {/* Form Fields */}
                <View style={{ gap: 28 }}>
                  {/* Program Field */}
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: colors.accentLight,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.accent }}>01</Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: colors.textSecondary,
                          letterSpacing: 0.5,
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
                            .includes(programSearchText.toLowerCase())
                        );

                        const selectedProgram = Programs.find(
                          (program) => program.program_name === value
                        );

                        return (
                          <View>
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                borderRadius: 16,
                                borderWidth: 1.5,
                                borderColor: errors.program ? colors.danger : colors.border,
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                flexDirection: "row",
                              }}
                              onPress={() => setIsProgramPickerVisible(true)}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: selectedProgram ? colors.text : colors.textMuted,
                                  flex: 1,
                                }}
                                numberOfLines={1}
                              >
                                {selectedProgram ? selectedProgram.program_name : "Choose a program..."}
                              </Text>
                              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>

                            {/* Program Modal */}
                            <Modal
                              visible={isProgramPickerVisible}
                              animationType="slide"
                              transparent={true}
                              onRequestClose={() => setIsProgramPickerVisible(false)}
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
                                    backgroundColor: colors.cardSolid,
                                    borderTopLeftRadius: 28,
                                    borderTopRightRadius: 28,
                                    maxHeight: "70%",
                                    paddingBottom: 34,
                                  }}
                                >
                                  {/* Modal Handle */}
                                  <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
                                    <View
                                      style={{
                                        width: 40,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: colors.border,
                                      }}
                                    />
                                  </View>

                                  {/* Modal Header */}
                                  <View
                                    style={{
                                      padding: 20,
                                      borderBottomWidth: 1,
                                      borderBottomColor: colors.border,
                                    }}
                                  >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                      <Text
                                        style={{
                                          fontSize: 20,
                                          fontWeight: "700",
                                          color: colors.text,
                                        }}
                                      >
                                        Select Program
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                        }}
                                        style={{
                                          width: 36,
                                          height: 36,
                                          borderRadius: 18,
                                          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Ionicons name="close" size={20} color={colors.text} />
                                      </TouchableOpacity>
                                    </View>

                                    {/* Search Input */}
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                                        borderRadius: 14,
                                        paddingHorizontal: 14,
                                        height: 50,
                                      }}
                                    >
                                      <Ionicons name="search" size={20} color={colors.textMuted} />
                                      <TextInput
                                        style={{
                                          flex: 1,
                                          marginLeft: 10,
                                          fontSize: 16,
                                          color: colors.text,
                                        }}
                                        placeholder="Search programs..."
                                        placeholderTextColor={colors.textMuted}
                                        value={programSearchText}
                                        onChangeText={setProgramSearchText}
                                        autoFocus={true}
                                      />
                                    </View>
                                  </View>

                                  <FlatList
                                    data={filteredPrograms}
                                    keyExtractor={(item) => item.program_id.toString()}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity
                                        style={{
                                          paddingVertical: 16,
                                          paddingHorizontal: 20,
                                          borderBottomWidth: 1,
                                          borderBottomColor: colors.border,
                                          flexDirection: "row",
                                          alignItems: "center",
                                        }}
                                        onPress={() => {
                                          onChange(item.program_name);
                                          setSelectedProgramId(item.program_id);
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                          getcourse(item.program_id);
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            backgroundColor: colors.accentLight,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 14,
                                          }}
                                        >
                                          <Ionicons name="school" size={18} color={colors.accent} />
                                        </View>
                                        <Text
                                          style={{
                                            fontSize: 15,
                                            color: colors.text,
                                            fontWeight: "500",
                                            flex: 1,
                                          }}
                                        >
                                          {item.program_name}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View style={{ padding: 40, alignItems: "center" }}>
                                        <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                                        <Text
                                          style={{
                                            color: colors.textSecondary,
                                            textAlign: "center",
                                            marginTop: 12,
                                            fontSize: 15,
                                          }}
                                        >
                                          No programs found
                                        </Text>
                                      </View>
                                    }
                                  />
                                </View>
                              </View>
                            </Modal>

                            {errors.program && (
                              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                                <Ionicons name="alert-circle" size={14} color={colors.danger} />
                                <Text style={{ color: colors.danger, fontSize: 13, marginLeft: 6 }}>
                                  {errors.program.message}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  </View>

                  {/* Course Field */}
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          backgroundColor: colors.accentLight,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.accent }}>02</Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: colors.textSecondary,
                          letterSpacing: 0.5,
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
                            .includes(courseSearchText.toLowerCase())
                        );

                        const selectedCourse = Courses.find(
                          (course) => course.course_name === value
                        );

                        return (
                          <View>
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                                borderRadius: 16,
                                borderWidth: 1.5,
                                borderColor: errors.course ? colors.danger : colors.border,
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                flexDirection: "row",
                              }}
                              onPress={() => setIsCoursePickerVisible(true)}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: selectedCourse ? colors.text : colors.textMuted,
                                  flex: 1,
                                }}
                                numberOfLines={1}
                              >
                                {selectedCourse ? selectedCourse.course_name : "Choose a course..."}
                              </Text>
                              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                            </TouchableOpacity>

                            {/* Course Modal */}
                            <Modal
                              visible={isCoursePickerVisible}
                              animationType="slide"
                              transparent={true}
                              onRequestClose={() => setIsCoursePickerVisible(false)}
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
                                    backgroundColor: colors.cardSolid,
                                    borderTopLeftRadius: 28,
                                    borderTopRightRadius: 28,
                                    maxHeight: "70%",
                                    paddingBottom: 34,
                                  }}
                                >
                                  {/* Modal Handle */}
                                  <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
                                    <View
                                      style={{
                                        width: 40,
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: colors.border,
                                      }}
                                    />
                                  </View>

                                  {/* Modal Header */}
                                  <View
                                    style={{
                                      padding: 20,
                                      borderBottomWidth: 1,
                                      borderBottomColor: colors.border,
                                    }}
                                  >
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                      <Text
                                        style={{
                                          fontSize: 20,
                                          fontWeight: "700",
                                          color: colors.text,
                                        }}
                                      >
                                        Select Course
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                        style={{
                                          width: 36,
                                          height: 36,
                                          borderRadius: 18,
                                          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Ionicons name="close" size={20} color={colors.text} />
                                      </TouchableOpacity>
                                    </View>

                                    {/* Search Input */}
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                                        borderRadius: 14,
                                        paddingHorizontal: 14,
                                        height: 50,
                                      }}
                                    >
                                      <Ionicons name="search" size={20} color={colors.textMuted} />
                                      <TextInput
                                        style={{
                                          flex: 1,
                                          marginLeft: 10,
                                          fontSize: 16,
                                          color: colors.text,
                                        }}
                                        placeholder="Search courses..."
                                        placeholderTextColor={colors.textMuted}
                                        value={courseSearchText}
                                        onChangeText={setCourseSearchText}
                                        autoFocus={true}
                                      />
                                    </View>
                                  </View>

                                  <FlatList
                                    data={filteredCourses}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity
                                        style={{
                                          paddingVertical: 16,
                                          paddingHorizontal: 20,
                                          borderBottomWidth: 1,
                                          borderBottomColor: colors.border,
                                          flexDirection: "row",
                                          alignItems: "center",
                                        }}
                                        onPress={() => {
                                          onChange(item.course_name);
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                      >
                                        <View
                                          style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            backgroundColor: colors.accentLight,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 14,
                                          }}
                                        >
                                          <Ionicons name="document-text" size={18} color={colors.accent} />
                                        </View>
                                        <Text
                                          style={{
                                            fontSize: 15,
                                            color: colors.text,
                                            fontWeight: "500",
                                            flex: 1,
                                          }}
                                        >
                                          {item.course_name}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View style={{ padding: 40, alignItems: "center" }}>
                                        <Ionicons name="document-outline" size={48} color={colors.textMuted} />
                                        <Text
                                          style={{
                                            color: colors.textSecondary,
                                            textAlign: "center",
                                            marginTop: 12,
                                            fontSize: 15,
                                          }}
                                        >
                                          {selectedProgramId ? "No courses found" : "Select a program first"}
                                        </Text>
                                      </View>
                                    }
                                  />
                                </View>
                              </View>
                            </Modal>

                            {errors.course && (
                              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                                <Ionicons name="alert-circle" size={14} color={colors.danger} />
                                <Text style={{ color: colors.danger, fontSize: 13, marginLeft: 6 }}>
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

                {/* Submit Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.accent,
                    paddingVertical: 18,
                    alignItems: "center",
                    borderRadius: 16,
                    marginTop: 32,
                    flexDirection: "row",
                    justifyContent: "center",
                    ...Platform.select({
                      ios: {
                        shadowColor: colors.accent,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 12,
                      },
                      android: {
                        elevation: 8,
                      },
                    }),
                  }}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={20} color={isDark ? "#000000" : "#ffffff"} style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      color: isDark ? "#000000" : "#ffffff",
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
              {/* Stats Cards */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                <View
                  style={{
                    flex: 1,
                    ...glassCard,
                    padding: 20,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: colors.accentLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="library" size={22} color={colors.accent} />
                  </View>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "800",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {RePeatCourse.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      fontWeight: "500",
                    }}
                  >
                    Total Courses
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: colors.accent,
                    borderRadius: 24,
                    padding: 20,
                    alignItems: "center",
                    ...Platform.select({
                      ios: {
                        shadowColor: colors.accent,
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.35,
                        shadowRadius: 12,
                      },
                      android: {
                        elevation: 8,
                      },
                    }),
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={22} color={isDark ? "#000000" : "#ffffff"} />
                  </View>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "800",
                      color: isDark ? "#000000" : "#ffffff",
                      marginBottom: 4,
                    }}
                  >
                    {RePeatCourse.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
                      fontWeight: "500",
                    }}
                  >
                    Active
                  </Text>
                </View>
              </View>

              {/* Courses List */}
              <View style={{ ...glassCard, padding: 20, marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: colors.accentLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="list" size={18} color={colors.accent} />
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Your Courses
                  </Text>
                </View>

                {RePeatCourse.length > 0 ? (
                  <View style={{ gap: 12 }}>
                    {RePeatCourse.map((repeat, index) => (
                      <View
                        key={repeat.repeat_id}
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                          padding: 16,
                          borderRadius: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: colors.accentLight,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 14,
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.accent }}>
                            {(index + 1).toString().padStart(2, "0")}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontWeight: "600",
                              color: colors.text,
                              fontSize: 15,
                              lineHeight: 20,
                            }}
                          >
                            {repeat.course_name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => deletecourse(repeat.repeat_id)}
                          style={{
                            backgroundColor: colors.dangerBg,
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 40 }}>
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: colors.accentLight,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Ionicons name="folder-open-outline" size={36} color={colors.accent} />
                    </View>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "600",
                        color: colors.text,
                        marginBottom: 6,
                      }}
                    >
                      No courses yet
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        textAlign: "center",
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
