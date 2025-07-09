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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
const schema = yup.object().shape({
  program: yup.string().required("Program is required"),
  course: yup.string().required("Course Name is required"),
});

const addcourse = () => {
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
    console.log("Form submitted:", data);
    console.log("Selected Program ID:", selectedProgramId);
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

      console.log(responce.data);
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
    console.log(token);

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
      console.log(responce.data);
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-6 pt-16 pb-8">
          <View className="bg-black rounded-3xl p-6 shadow-lg">
            <View className="items-center">
              <Text className="text-lg font-light text-gray-300">
                Repeat Course Management
              </Text>
              <Text className="text-2xl font-bold text-white mt-1">
                Add & View Repeat Courses
              </Text>
              <Text className="text-sm text-gray-400 mt-2">
                Manage your academic schedule
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row justify-center space-x-2">
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === "addCourse" ? "bg-black" : "bg-gray-100"
              }`}
              onPress={() => setActiveTab("addCourse")}
            >
              <Text
                className={`font-medium ${
                  activeTab === "addCourse" ? "text-white" : "text-gray-600"
                }`}
              >
                Add Repeat Course
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === "viewCourse" ? "bg-black" : "bg-gray-100"
              }`}
              onPress={() => setActiveTab("viewCourse")}
            >
              <Text
                className={`font-medium ${
                  activeTab === "viewCourse" ? "text-white" : "text-gray-600"
                }`}
              >
                View Repeat Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 mb-8">
          {activeTab === "addCourse" ? (
            <View className="pt-8">
              <View className="items-center mb-16">
                <Text className="text-4xl font-thin text-black mb-4 tracking-wider">
                  Add Course
                </Text>
                <View className="w-8 h-px bg-black opacity-40" />
              </View>

              {/* Ultra Clean Form */}
              <View className="space-y-12">
                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
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
                              className="h-14 w-full border-b-2 border-gray-200 bg-transparent justify-center px-2"
                              onPress={() => setIsProgramPickerVisible(true)}
                            >
                              <Text
                                className={`text-base ${
                                  selectedProgram
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
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
                                <View className="bg-white mx-4 rounded-lg max-h-96">
                                  <View className="p-4 border-b border-gray-200">
                                    <View className="flex-row justify-between items-center mb-3">
                                      <Text className="text-lg font-semibold">
                                        Select Program
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                        }}
                                      >
                                        <Text className="text-black text-lg font-bold">
                                          ✕
                                        </Text>
                                      </TouchableOpacity>
                                    </View>

                                    <TextInput
                                      className="h-16 border border-gray-300 rounded-lg px-3 text-base"
                                      placeholder="Search programs..."
                                      placeholderTextColor="#9CA3AF"
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
                                        className="p-4 border-b border-gray-100"
                                        onPress={() => {
                                          onChange(item.program_name);
                                          setSelectedProgramId(item.program_id);
                                          setIsProgramPickerVisible(false);
                                          setProgramSearchText("");
                                          getcourse(item.program_id);
                                        }}
                                      >
                                        <Text className="text-base text-black">
                                          {item.program_name}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View className="p-4">
                                        <Text className="text-gray-500 text-center">
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
                      <View className="w-1 h-6 bg-black" />
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
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
                              className="h-14 w-full border-b-2 border-gray-200 bg-transparent justify-center px-2"
                              onPress={() => setIsCoursePickerVisible(true)}
                            >
                              <Text
                                className={`text-base ${
                                  selectedCourse
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
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
                                <View className="bg-white mx-4 rounded-lg max-h-96">
                                  <View className="p-4 border-b border-gray-200">
                                    <View className="flex-row justify-between items-center mb-3">
                                      <Text className="text-lg font-semibold">
                                        Select Course
                                      </Text>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                      >
                                        <Text className="text-black text-lg font-bold">
                                          ✕
                                        </Text>
                                      </TouchableOpacity>
                                    </View>

                                    <TextInput
                                      className="h-16 border border-gray-300 rounded-lg px-3 text-base"
                                      placeholder="Search courses..."
                                      placeholderTextColor="#9CA3AF"
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
                                        className="p-4 border-b border-gray-100"
                                        onPress={() => {
                                          onChange(item.course_name);
                                          setIsCoursePickerVisible(false);
                                          setCourseSearchText("");
                                        }}
                                      >
                                        <Text className="text-base text-black">
                                          {item.course_name}
                                        </Text>
                                      </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                      <View className="p-4">
                                        <Text className="text-gray-500 text-center">
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
                      <View className="w-1 h-6 bg-black" />
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-20">
                <TouchableOpacity
                  className="bg-black py-6 items-center rounded-lg"
                  onPress={handleSubmit(onSubmit)}
                >
                  <Text className="text-white text-sm uppercase tracking-widest font-medium">
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row justify-between space-x-4 mb-6">
                <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-black mb-2">
                    {RePeatCourse.length}
                  </Text>
                  <Text className="text-sm text-gray-600 font-medium">
                    Total Repeat Courses
                  </Text>
                </View>

                <View className="flex-1 bg-black p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-white mb-2">
                    {RePeatCourse.length}
                  </Text>
                  <Text className="text-sm text-gray-300 font-medium">
                    Active
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Your Courses
                </Text>

                <View className="space-y-3">
                  {RePeatCourse.map((repeat, index) => (
                    <View
                      key={repeat.repeat_id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                    >
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-800">
                            {repeat.course_name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => deletecourse(repeat.repeat_id)}
                          className="bg-gray-100 px-2 py-1 rounded"
                        >
                          <AntDesign name="delete" size={24} color="black" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default addcourse;
