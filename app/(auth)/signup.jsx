import { yupResolver } from "@hookform/resolvers/yup";
// Remove the Picker import
// import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
const scheme = yup.object().shape({
  fullname: yup
    .string()
    .required("Name is Required")
    .matches(/^[a-zA-Z ]+$/, "Only letters are allowed"),
  username: yup
    .string()
    .required("Username is required")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores are allowed"
    ),
  department: yup
    .string()
    .required("Department is required")
    .matches(
      /^[a-zA-Z]+$/,
      "Only letters, numbers, and underscores are allowed"
    ),
  program: yup.string().required("Program is required"),
  password: yup.string().required("Password is required"),
  repassword: yup.string().required("Re-Password is required"),
});

const signup = () => {
  const [Programs, SetPrograms] = useState([]);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

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

  useEffect(() => {
    getprograms();
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheme),
    defaultValues: {
      agree: false,
    },
  });

  const isAgreed = watch("agree");

  const onsubmit = async (data) => {
    try {
      const responce = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/signup`,
        data
      );

      if (responce.data.success) {
        Toast.show({
          type: "success",
          text1: responce.data.message,
        });
        router.push("/signin");
      } else {
        Toast.show({
          type: "error",
          text1: responce.data.message,
        });
      }

      // SetPrograms(responce.data)
    } catch (error) {
      console.log("error in getting programs", error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-12 items-center">
          <Text className="text-3xl font-bold text-black mb-2">
            Create Account
          </Text>
          <Text className="text-base text-gray-600">
            Join us to get started
          </Text>
        </View>

        {/* Form Container */}
        <View className="space-y-4">
          <Controller
            name="fullname"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <TextInput
                  className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.fullname && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.fullname.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            name="username"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <TextInput
                  className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.username && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            name="department"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <TextInput
                  className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                  placeholder="Department"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  onChangeText={onChange}
                  value={value}
                />
                {errors.department && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.department.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            name="program"
            control={control}
            render={({ field: { onChange, value } }) => {
              const filteredPrograms = Programs.filter((program) =>
                program.program_name
                  ?.toLowerCase()
                  .includes(searchText.toLowerCase())
              );

              const selectedProgram = Programs.find(
                (program) => program.program_name === value
              );

              return (
                <View className="mb-4">
                  <TouchableOpacity
                    className="h-14 w-full border-b-2 border-gray-200 bg-transparent justify-center px-2"
                    onPress={() => setIsPickerVisible(true)}
                  >
                    <Text
                      className={`text-base ${
                        selectedProgram ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {selectedProgram
                        ? selectedProgram.program_name
                        : "Select Program"}
                    </Text>
                  </TouchableOpacity>

                  <Modal
                    visible={isPickerVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsPickerVisible(false)}
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
                                setIsPickerVisible(false);
                                setSearchText("");
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
                            value={searchText}
                            onChangeText={setSearchText}
                            autoFocus={true}
                          />
                        </View>
                        <FlatList
                          data={filteredPrograms}
                          keyExtractor={(item) => item.program_id.toString()}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              className="p-4 border-b border-gray-100"
                              onPress={() => {
                                onChange(item.program_name);
                                setIsPickerVisible(false);
                                setSearchText("");
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

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <TextInput
                  className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  secureTextEntry
                  value={value}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            name="repassword"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="mb-6">
                <TextInput
                  className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                  placeholder="Confirm Password"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  secureTextEntry
                  value={value}
                />
                {errors.repassword && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.repassword.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Custom Checkbox Component */}
          <Controller
            name="agree"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View className="flex-row items-center mb-4">
                <CustomCheckbox
                  checked={value}
                  onPress={() => onChange(!value)}
                />
                <Text className="text-base text-gray-700">
                  I agree to the{" "}
                  <Link
                    href={"https://timetablrtermspolicy.vercel.app"}
                    className="text-black font-semibold"
                  >
                    Terms and Conditions
                  </Link>
                </Text>
              </View>
            )}
          />

          {/* Sign Up Button */}
          <TouchableOpacity
            className={`h-14 rounded-full justify-center items-center mt-6 shadow-sm ${
              isAgreed ? "bg-black" : "bg-gray-300 opacity-50"
            }`}
            onPress={handleSubmit(onsubmit)}
            disabled={!isAgreed}
          >
            <Text
              className={`text-lg font-semibold ${
                isAgreed ? "text-white" : "text-gray-500"
              }`}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-gray-600 text-base">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity>
              <Link
                href={"/signin"}
                className="text-black font-semibold text-base"
              >
                Sign In
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default signup;

// Remove this import if react-native-paper is causing issues
// import { Checkbox } from 'react-native-paper';

// Add this custom checkbox component
const CustomCheckbox = ({ checked, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${
      checked ? "bg-black border-black" : "border-gray-400"
    }`}
  >
    {checked && <Text className="text-white text-sm">✓</Text>}
  </TouchableOpacity>
);
