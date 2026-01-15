import { yupResolver } from '@hookform/resolvers/yup';
import axios from "axios";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    await SecureStore.setItemAsync('username', data.username);
    SetLoading(true)
    try {
      const responce = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/user/signin`, data);
      if (responce.data.success) {
        Toast.show({
          type: "success",
          text1: responce.data.message
        });


        await SecureStore.setItemAsync('accessToken', responce.data.accesstoken);
        await SecureStore.setItemAsync('role', "student");
        router.push("/(dashboard)/");
      } else {
        Toast.show({
          type: "error",
          text1: responce.data.message
        });
        SetLoading(false)

      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error in Sign In"
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
              onPress={() => setActiveTab('student')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'student' ? 'text-white' : 'text-gray-600'}`}>
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-full ${activeTab === 'teacher' ? 'bg-black' : 'bg-transparent'}`}
              onPress={() => setActiveTab('teacher')}
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
              >
                <Text className="text-white text-lg font-semibold">Sign In</Text>
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
