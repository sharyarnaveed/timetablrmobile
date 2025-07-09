import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as yup from 'yup';

// Add validation schemas
const usernameSchema = yup.object().shape({
  newUsername: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().required('New password is required').min(6, 'Password must be at least 6 characters'),
});

export default function Settings() {
  const [activeForm, setActiveForm] = useState(null);

  // Add form controls
  const {
    control: usernameControl,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
    reset: resetUsername,
  } = useForm({
    resolver: yupResolver(usernameSchema),
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onUsernameSubmit = async (data) => {
    console.log('Username update:', data);
    // Handle username update logic here
    setActiveForm(null);
    resetUsername();
  };

  const onPasswordSubmit = async (data) => {
    console.log('Password update:', data);
    // Handle password update logic here
    setActiveForm(null);
    resetPassword();
  };

  const toggleForm = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null);
      resetUsername();
      resetPassword();
    } else {
      setActiveForm(formType);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16">
        {/* Header with Back Button */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.push('/(dashboard)/home')}
              className="mr-4 p-2 rounded-full bg-gray-100"
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-black">Settings</Text>
          </View>
          <Text className="text-gray-500 mt-2">Manage your account preferences</Text>
        </View>

        {/* Settings Options */}
        <View className="space-y-4">
          {/* Update Username Section */}
          <View className="bg-gray-50 rounded-2xl p-1">
            <TouchableOpacity
              className="flex-row items-center justify-between p-5"
              onPress={() => toggleForm('username')}
            >
              <View>
                <Text className="text-lg font-semibold text-black">Update Username</Text>
                <Text className="text-gray-500 text-sm mt-1">Change your display name</Text>
              </View>
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                activeForm === 'username' ? 'bg-black' : 'bg-gray-300'
              }`}>
                <Text className={`font-bold ${
                  activeForm === 'username' ? 'text-white' : 'text-gray-600'
                }`}>
                  {activeForm === 'username' ? '−' : '+'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Username Form */}
            {activeForm === 'username' && (
              <View className="px-5 pb-5">
                <View className="bg-white rounded-xl p-4 border border-gray-200">
                  <Text className="text-sm font-medium text-gray-700 mb-3">Write new username</Text>
                  
                  <Controller
                    control={usernameControl}
                    name="newUsername"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-gray-50 rounded-lg px-4 py-3 text-base text-black mb-3"
                        placeholder="Enter new username"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                      />
                    )}
                  />
                  
                  {usernameErrors.newUsername && (
                    <Text className="text-red-500 text-sm mb-3">{usernameErrors.newUsername.message}</Text>
                  )}

                  <TouchableOpacity
                    className="bg-black rounded-lg py-3 items-center"
                    onPress={handleUsernameSubmit(onUsernameSubmit)}
                  >
                    <Text className="text-white font-semibold text-base">Update Username</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Change Password Section */}
          <View className="bg-gray-50 rounded-2xl p-1">
            <TouchableOpacity
              className="flex-row items-center justify-between p-5"
              onPress={() => toggleForm('password')}
            >
              <View>
                <Text className="text-lg font-semibold text-black">Change Password</Text>
                <Text className="text-gray-500 text-sm mt-1">Update your security credentials</Text>
              </View>
              <View className={`w-8 h-8 rounded-full items-center justify-center ${
                activeForm === 'password' ? 'bg-black' : 'bg-gray-300'
              }`}>
                <Text className={`font-bold ${
                  activeForm === 'password' ? 'text-white' : 'text-gray-600'
                }`}>
                  {activeForm === 'password' ? '−' : '+'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Password Form */}
            {activeForm === 'password' && (
              <View className="px-5 pb-5">
                <View className="bg-white rounded-xl p-4 border border-gray-200">
                  <Text className="text-sm font-medium text-gray-700 mb-3">Change your password</Text>
                  
                  <Controller
                    control={passwordControl}
                    name="currentPassword"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-gray-50 rounded-lg px-4 py-3 text-base text-black mb-3"
                        placeholder="Current password"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry
                      />
                    )}
                  />
                  
                  {passwordErrors.currentPassword && (
                    <Text className="text-red-500 text-sm mb-3">{passwordErrors.currentPassword.message}</Text>
                  )}

                  <Controller
                    control={passwordControl}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        className="bg-gray-50 rounded-lg px-4 py-3 text-base text-black mb-3"
                        placeholder="New password"
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        secureTextEntry
                      />
                    )}
                  />
                  
                  {passwordErrors.newPassword && (
                    <Text className="text-red-500 text-sm mb-3">{passwordErrors.newPassword.message}</Text>
                  )}

                  <TouchableOpacity
                    className="bg-black rounded-lg py-3 items-center"
                    onPress={handlePasswordSubmit(onPasswordSubmit)}
                  >
                    <Text className="text-white font-semibold text-base">Change Password</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}