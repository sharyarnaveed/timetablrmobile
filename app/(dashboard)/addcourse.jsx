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
    console.log("the id is", id);
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
        <View className="px-6 pt-16 pb-8 sm:px-12 sm:pt-24 sm:pb-12 md:px-24 md:pt-32 md:pb-16">
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#000",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "300",
                color: "#d1d5db",
                textAlign: "center",
              }}
            >
              Repeat Course Management
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Add & View Repeat Courses
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9ca3af",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Manage your academic schedule
            </Text>
          </View>
        </View>

        <View className="px-6 py-4 sm:px-12 sm:py-6 md:px-24 md:py-8">
          <View className="flex-row justify-center space-x-2">
            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor:
                  activeTab === "addCourse"
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : isDark
                    ? "#333"
                    : "#f3f4f6",
              }}
              onPress={() => setActiveTab("addCourse")}
            >
              <Text
                style={{
                  fontWeight: "500",
                  color:
                    activeTab === "addCourse"
                      ? isDark
                        ? "#000"
                        : "#fff"
                      : isDark
                      ? "#fff"
                      : "#4b5563",
                }}
              >
                Add Repeat Course
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 20,
                backgroundColor:
                  activeTab === "viewCourse"
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : isDark
                    ? "#333"
                    : "#f3f4f6",
              }}
              onPress={() => setActiveTab("viewCourse")}
            >
              <Text
                style={{
                  fontWeight: "500",
                  color:
                    activeTab === "viewCourse"
                      ? isDark
                        ? "#000"
                        : "#fff"
                      : isDark
                      ? "#fff"
                      : "#4b5563",
                }}
              >
                View Repeat Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 sm:px-12 md:px-24">
          {activeTab === "addCourse" ? (
            <View className="pt-8 sm:pt-12">
              <View className="items-center mb-16">
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: "100",
                    color: isDark ? "#fff" : "#000",
                    marginBottom: 16,
                    letterSpacing: 2,
                    textAlign: "center",
                  }}
                >
                  Add Course
                </Text>
                <View
                  style={{
                    width: 32,
                    height: 1,
                    backgroundColor: isDark ? "#fff" : "#000",
                    opacity: 0.4,
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
                                borderBottomColor: isDark ? "#374151" : "#d1d5db",
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
                                    backgroundColor: isDark ? "#1a1a1a" : "#fff",
                                    marginHorizontal: 16,
                                    borderRadius: 12,
                                    maxHeight: 384,
                                  }}
                                >
                                  <View
                                    style={{
                                      padding: 16,
                                      borderBottomWidth: 1,
                                      borderBottomColor: isDark ? "#374151" : "#e5e7eb",
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
                                        borderColor: isDark ? "#4b5563" : "#d1d5db",
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                        fontSize: 16,
                                        backgroundColor: isDark ? "#374151" : "#fff",
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
                                          borderBottomColor: isDark ? "#374151" : "#f3f4f6",
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
                                            color: isDark ? "#9ca3af" : "#6b7280",
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
                                borderBottomColor: isDark ? "#374151" : "#d1d5db",
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
                                    backgroundColor: isDark ? "#1a1a1a" : "#fff",
                                    marginHorizontal: 16,
                                    borderRadius: 12,
                                    maxHeight: 384,
                                  }}
                                >
                                  <View
                                    style={{
                                      padding: 16,
                                      borderBottomWidth: 1,
                                      borderBottomColor: isDark ? "#374151" : "#e5e7eb",
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
                                        borderColor: isDark ? "#4b5563" : "#d1d5db",
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                        fontSize: 16,
                                        backgroundColor: isDark ? "#374151" : "#fff",
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
                                          borderBottomColor: isDark ? "#374151" : "#f3f4f6",
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
                                            color: isDark ? "#9ca3af" : "#6b7280",
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

              {/* Add Course Button with proper spacing */}
              <View style={{ marginTop: 40, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? "#fff" : "#000",
                    paddingVertical: 24,
                    alignItems: "center",
                    borderRadius: 12,
                  }}
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text
                    style={{
                      color: isDark ? "#000" : "#fff",
                      fontSize: 14,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontWeight: "500",
                    }}
                  >
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row justify-between space-x-4 mb-6">
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
                      fontSize: 32,
                      fontWeight: "bold",
                      color: isDark ? "#fff" : "#000",
                      marginBottom: 8,
                    }}
                  >
                    {RePeatCourse.length}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      fontWeight: "500",
                    }}
                  >
                    Total Repeat Courses
                  </Text>
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
                      fontSize: 32,
                      fontWeight: "bold",
                      color: isDark ? "#000" : "#fff",
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
                    fontSize: 18,
                    fontWeight: "600",
                    color: isDark ? "#fff" : "#374151",
                    marginBottom: 16,
                  }}
                >
                  Your Courses
                </Text>

                <View className="space-y-3">
                  {RePeatCourse.map((repeat, index) => (
                    <View
                      key={repeat.repeat_id}
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
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text
                            style={{
                              fontWeight: "600",
                              color: isDark ? "#fff" : "#374151",
                              fontSize: 16,
                            }}
                          >
                            {repeat.course_name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => deletecourse(repeat.repeat_id)}
                          style={{
                            backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 8,
                          }}
                        >
                          <AntDesign
                            name="delete"
                            size={20}
                            color={isDark ? "#f87171" : "#dc2626"}
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
