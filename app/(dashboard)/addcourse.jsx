import AntDesign from "@expo/vector-icons/AntDesign";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { useTheme } from "../../context/ThemeContext";

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-20 pb-8">
          <View
            style={{
              backgroundColor: isDark ? "#111111" : "#ffffff",
              borderRadius: 32,
              padding: 32,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.12,
              shadowRadius: 20,
              elevation: 12,
              alignItems: "center",
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#1f1f1f" : "transparent",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Decorative elements */}
            <View
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.03)"
                  : "rgba(0, 0, 0, 0.02)",
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isDark ? "#ffffff" : "#111827",
                  marginRight: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? "#6b7280" : "#9ca3af",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Repeat Course Management
              </Text>
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: isDark ? "#ffffff" : "#111827",
                textAlign: "center",
                letterSpacing: -1,
                lineHeight: 38,
              }}
            >
              Add & View Repeat Courses
            </Text>
          </View>
        </View>

        <View className="px-5 py-6">
          <View 
            style={{
              flexDirection: "row",
              backgroundColor: isDark
                ? "rgba(17, 17, 17, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              borderRadius: 24,
              padding: 6,
              borderWidth: isDark ? 1.5 : 1,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor:
                  activeTab === "addCourse"
                    ? isDark
                      ? "#ffffff"
                      : "#111827"
                    : "transparent",
                alignItems: "center",
              }}
              onPress={() => setActiveTab("addCourse")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 15,
                  color:
                    activeTab === "addCourse"
                      ? isDark
                        ? "#000000"
                        : "#ffffff"
                      : isDark
                      ? "#9ca3af"
                      : "#6b7280",
                }}
              >
                Add Course
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor:
                  activeTab === "viewCourse"
                    ? isDark
                      ? "#ffffff"
                      : "#111827"
                    : "transparent",
                alignItems: "center",
              }}
              onPress={() => setActiveTab("viewCourse")}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 15,
                  color:
                    activeTab === "viewCourse"
                      ? isDark
                        ? "#000000"
                        : "#ffffff"
                      : isDark
                      ? "#9ca3af"
                      : "#6b7280",
                }}
              >
                View Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-5">
          {activeTab === "addCourse" ? (
            <View className="pt-6">
              <View className="items-center mb-12">
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "700",
                    color: isDark ? "#ffffff" : "#111827",
                    marginBottom: 12,
                    letterSpacing: -0.5,
                    textAlign: "center",
                  }}
                >
                  Add Course
                </Text>
                <View
                  style={{
                    width: 40,
                    height: 2,
                    backgroundColor: isDark ? "#ffffff" : "#111827",
                    opacity: 0.2,
                    borderRadius: 1,
                  }}
                />
              </View>

              {/* Ultra Clean Form */}
              <View className="space-y-12">
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      marginBottom: 24,
                      fontWeight: "500",
                    }}
                  >
                    01 — Program
                  </Text>
                  <View className="relative">
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
                          <View className="mb-4">
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                borderBottomWidth: 2,
                                borderBottomColor: isDark
                                  ? "#374151"
                                  : "#d1d5db",
                                backgroundColor: "transparent",
                                justifyContent: "center",
                                paddingHorizontal: 8,
                              }}
                              onPress={() => setIsProgramPickerVisible(true)}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: selectedProgram
                                    ? isDark
                                      ? "#fff"
                                      : "#000"
                                    : isDark
                                    ? "#9ca3af"
                                    : "#6b7280",
                                }}
                              >
                                {selectedProgram
                                  ? selectedProgram.program_name
                                  : "Select Program"}
                              </Text>
                            </TouchableOpacity>

                            <Modal
                              visible={isProgramPickerVisible}
                              animationType="slide"
                              transparent={true}
                              onRequestClose={() =>
                                setIsProgramPickerVisible(false)
                              }
                            >
                              <View className="flex-1 bg-black bg-opacity-50 justify-center">
                                <View
                                  style={{
                                    backgroundColor: isDark
                                      ? "#1a1a1a"
                                      : "#fff",
                                    marginHorizontal: 16,
                                    borderRadius: 12,
                                    maxHeight: 384,
                                  }}
                                >
                                  <View
                                    style={{
                                      padding: 16,
                                      borderBottomWidth: 1,
                                      borderBottomColor: isDark
                                        ? "#374151"
                                        : "#e5e7eb",
                                    }}
                                  >
                                    <View className="flex-row justify-between items-center mb-3">
                                      <Text
                                        style={{
                                          fontSize: 18,
                                          fontWeight: "600",
                                          color: isDark ? "#fff" : "#000",
                                        }}
                                      >
                                        Select Program
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: isDark ? "#fff" : "#000",
                                            fontSize: 18,
                                            fontWeight: "bold",
                                          }}
                                        >
                                          ✕
                                        </Text>
                                      </TouchableOpacity>
                                    </View>

                                    <TextInput
                                      style={{
                                        height: 64,
                                        borderWidth: 1,
                                        borderColor: isDark
                                          ? "#4b5563"
                                          : "#d1d5db",
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                        fontSize: 16,
                                        backgroundColor: isDark
                                          ? "#374151"
                                          : "#fff",
                                        color: isDark ? "#fff" : "#000",
                                      }}
                                      placeholder="Search programs..."
                                      placeholderTextColor={
                                        isDark ? "#9ca3af" : "#6b7280"
                                      }
                                      value={programSearchText}
                                      onChangeText={setProgramSearchText}
                                      autoFocus={true}
                                    />
                                  </View>
                                  <FlatList
                                    data={filteredPrograms}
                                    keyExtractor={(item) =>
                                      item.program_id.toString()
                                    }
                                    renderItem={({ item }) => (
                                      <TouchableOpacity
                                        style={{
                                          padding: 16,
                                          borderBottomWidth: 1,
                                          borderBottomColor: isDark
                                            ? "#374151"
                                            : "#f3f4f6",
                                        }}
                                        onPress={() => {
                                          onChange(item.program_name);
                                          setSelectedProgramId(item.program_id);
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                          getcourse(item.program_id);
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            color: isDark ? "#fff" : "#000",
                                          }}
                                        >
                                          {item.program_name}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View className="p-4">
                                        <Text
                                          style={{
                                            color: isDark
                                              ? "#9ca3af"
                                              : "#6b7280",
                                            textAlign: "center",
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
                              <Text className="text-red-500 text-sm mt-1">
                                {errors.program.message}
                              </Text>
                            )}
                          </View>
                        );
                      }}
                    />
                    <View className="absolute right-0 top-0">
                      <View
                        style={{
                          width: 4,
                          height: 24,
                          backgroundColor: isDark ? "#fff" : "#000",
                        }}
                      />
                    </View>
                  </View>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      marginBottom: 24,
                      fontWeight: "500",
                    }}
                  >
                    02 — Course
                  </Text>
                  <View className="relative">
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
                          <View className="mb-4">
                            <TouchableOpacity
                              style={{
                                height: 56,
                                width: "100%",
                                borderBottomWidth: 2,
                                borderBottomColor: isDark
                                  ? "#374151"
                                  : "#d1d5db",
                                backgroundColor: "transparent",
                                justifyContent: "center",
                                paddingHorizontal: 8,
                              }}
                              onPress={() => setIsCoursePickerVisible(true)}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: selectedCourse
                                    ? isDark
                                      ? "#fff"
                                      : "#000"
                                    : isDark
                                    ? "#9ca3af"
                                    : "#6b7280",
                                }}
                              >
                                {selectedCourse
                                  ? selectedCourse.course_name
                                  : "Select Course"}
                              </Text>
                            </TouchableOpacity>

                            <Modal
                              visible={isCoursePickerVisible}
                              animationType="slide"
                              transparent={true}
                              onRequestClose={() =>
                                setIsCoursePickerVisible(false)
                              }
                            >
                              <View className="flex-1 bg-black bg-opacity-50 justify-center">
                                <View
                                  style={{
                                    backgroundColor: isDark
                                      ? "#1a1a1a"
                                      : "#fff",
                                    marginHorizontal: 16,
                                    borderRadius: 12,
                                    maxHeight: 384,
                                  }}
                                >
                                  <View
                                    style={{
                                      padding: 16,
                                      borderBottomWidth: 1,
                                      borderBottomColor: isDark
                                        ? "#374151"
                                        : "#e5e7eb",
                                    }}
                                  >
                                    <View className="flex-row justify-between items-center mb-3">
                                      <Text
                                        style={{
                                          fontSize: 18,
                                          fontWeight: "600",
                                          color: isDark ? "#fff" : "#000",
                                        }}
                                      >
                                        Select Course
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: isDark ? "#fff" : "#000",
                                            fontSize: 18,
                                            fontWeight: "bold",
                                          }}
                                        >
                                          ✕
                                        </Text>
                                      </TouchableOpacity>
                                    </View>

                                    <TextInput
                                      style={{
                                        height: 64,
                                        borderWidth: 1,
                                        borderColor: isDark
                                          ? "#4b5563"
                                          : "#d1d5db",
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                        fontSize: 16,
                                        backgroundColor: isDark
                                          ? "#374151"
                                          : "#fff",
                                        color: isDark ? "#fff" : "#000",
                                      }}
                                      placeholder="Search courses..."
                                      placeholderTextColor={
                                        isDark ? "#9ca3af" : "#6b7280"
                                      }
                                      value={courseSearchText}
                                      onChangeText={setCourseSearchText}
                                      autoFocus={true}
                                    />
                                  </View>
                                  <FlatList
                                    data={filteredCourses}
                                    keyExtractor={(item, index) => index}
                                    renderItem={({ item }) => (
                                      <TouchableOpacity
                                        style={{
                                          padding: 16,
                                          borderBottomWidth: 1,
                                          borderBottomColor: isDark
                                            ? "#374151"
                                            : "#f3f4f6",
                                        }}
                                        onPress={() => {
                                          onChange(item.course_name);
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                      >
                                        <Text
                                          style={{
                                            fontSize: 16,
                                            color: isDark ? "#fff" : "#000",
                                          }}
                                        >
                                          {item.course_name}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View className="p-4">
                                        <Text
                                          style={{
                                            color: isDark
                                              ? "#9ca3af"
                                              : "#6b7280",
                                            textAlign: "center",
                                          }}
                                        >
                                          No courses found
                                        </Text>
                                      </View>
                                    }
                                  />
                                </View>
                              </View>
                            </Modal>

                            {errors.course && (
                              <Text className="text-red-500 text-sm mt-1">
                                {errors.course.message}
                              </Text>
                            )}
                          </View>
                        );
                      }}
                    />
                    <View className="absolute right-0 top-0">
                      <View
                        style={{
                          width: 4,
                          height: 24,
                          backgroundColor: isDark ? "#fff" : "#000",
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Modern Add Course Button */}
              <View style={{ marginTop: 32, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? "#ffffff" : "#111827",
                    paddingVertical: 18,
                    alignItems: "center",
                    borderRadius: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                  onPress={handleSubmit(onSubmit)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: isDark ? "#000000" : "#ffffff",
                      fontSize: 16,
                      fontWeight: "600",
                      letterSpacing: 0.5,
                    }}
                  >
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row justify-between space-x-3 mb-8">
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? "#111111" : "#ffffff",
                    padding: 24,
                    borderRadius: 20,
                    alignItems: "center",
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? "#1f1f1f" : "transparent",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.2 : 0.05,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 36,
                      fontWeight: "700",
                      color: isDark ? "#ffffff" : "#111827",
                      marginBottom: 8,
                    }}
                  >
                    {RePeatCourse.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#6b7280" : "#9ca3af",
                      fontWeight: "500",
                    }}
                  >
                    Total Courses
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? "#ffffff" : "#111827",
                    padding: 24,
                    borderRadius: 20,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 36,
                      fontWeight: "700",
                      color: isDark ? "#000000" : "#ffffff",
                      marginBottom: 8,
                    }}
                  >
                    {RePeatCourse.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#6b7280" : "#d1d5db",
                      fontWeight: "500",
                    }}
                  >
                    Active
                  </Text>
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: isDark ? "#ffffff" : "#111827",
                    marginBottom: 20,
                    letterSpacing: -0.3,
                  }}
                >
                  Your Courses
                </Text>

                <View className="space-y-3">
                  {RePeatCourse.map((repeat, index) => (
                    <View
                      key={repeat.repeat_id}
                      style={{
                        backgroundColor: isDark ? "#111111" : "#ffffff",
                        padding: 20,
                        borderRadius: 18,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.2 : 0.05,
                        shadowRadius: 8,
                        elevation: 3,
                        borderWidth: isDark ? 1 : 0,
                        borderColor: isDark ? "#1f1f1f" : "transparent",
                      }}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-4">
                          <Text
                            style={{
                              fontWeight: "600",
                              color: isDark ? "#ffffff" : "#111827",
                              fontSize: 17,
                            }}
                          >
                            {repeat.course_name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => deletecourse(repeat.repeat_id)}
                          style={{
                            backgroundColor: isDark ? "#1f1f1f" : "#fee2e2",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: isDark ? "#7f1d1d" : "#fecaca",
                          }}
                          activeOpacity={0.7}
                        >
                          <AntDesign
                            name="delete"
                            size={18}
                            color={isDark ? "#ef4444" : "#dc2626"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default addcourse;
