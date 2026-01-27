import { yupResolver } from '@hookform/resolvers/yup';
import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as Haptics from "expo-haptics";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import TeacherSigninForm from '../../components/TeacherSigninForm';

const scheme = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

export default function signin() {
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'teacher'

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheme),
  });
  const [laoding, SetLoading] = useState(false)
  const onsubmit = async (data) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await SecureStore.setItemAsync('username', data.username);
    SetLoading(true)
    try {
      const responce = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/user/signin`, data);
      if (responce.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: responce.data.message
        });

        await SecureStore.setItemAsync('accessToken', responce.data.accesstoken);
        await SecureStore.setItemAsync('role', "student");
        router.push("/(dashboard)/");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: "error",
          text1: "Sign in failed",
          text2: responce.data.message || "Please check your credentials"
        });
        SetLoading(false)
      }
    } catch (error) {
      console.log(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error.response?.data?.message || 
                          (error.message?.includes('Network') ? "Network error. Please check your connection." : 
                          "Unable to sign in. Please try again.");
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: errorMessage
      });
    } finally {
      SetLoading(false)
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
          paddingHorizontal: 10,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white justify-center px-8">
          {/* Header */}
          <View className="mb-12 items-center">
            <Text className="text-3xl font-bold text-black mb-2">Sign in</Text>
            <Text className="text-base text-gray-600">Join us to get started</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row mb-8 bg-gray-100 rounded-full p-1">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full ${activeTab === 'student' ? 'bg-black' : 'bg-transparent'}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('student');
              }}
              accessibilityLabel="Student sign in"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'student' }}
            >
              <Text className={`text-center font-semibold ${activeTab === 'student' ? 'text-white' : 'text-gray-600'}`}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full ${activeTab === 'teacher' ? 'bg-black' : 'bg-transparent'}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab('teacher');
              }}
              accessibilityLabel="Teacher sign in"
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === 'teacher' }}
            >
              <Text className={`text-center font-semibold ${activeTab === 'teacher' ? 'text-white' : 'text-gray-600'}`}>
                Teacher
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Container */}
          {activeTab === 'student' ? (
            <View className="space-y-4">


              <Controller
                name='username'
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
                    {errors.username && <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>}
                  </View>
                )}
              />

              <Controller
                name='password'
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
                    {errors.password && <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>}
                  </View>
                )}
              />
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-gray-600 text-base">Dont Remember passowrd? </Text>
                <TouchableOpacity>
                  <Link href={"/forgotpassword"} className="text-black font-semibold text-base" >Forgot Password</Link>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="bg-black h-14 rounded-full justify-center items-center mt-6 shadow-sm"
                onPress={handleSubmit(onsubmit)}
                disabled={laoding}
                accessibilityLabel="Sign in button"
                accessibilityHint="Signs in with your username and password"
                style={{ opacity: laoding ? 0.6 : 1 }}
              >
                {laoding ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-lg font-semibold">Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <View className="flex-row justify-center items-center mt-8">
                <Text className="text-gray-600 text-base">Don't have an account? </Text>
                <TouchableOpacity>
                  <Link href={"/signup"} className="text-black font-semibold text-base" >Sign up</Link>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TeacherSigninForm />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
