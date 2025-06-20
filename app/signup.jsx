import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from "expo-router";
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import * as yup from 'yup';
import "./global.css";

const scheme=yup.object().shape({
  fullname:yup.string().required('Name is Required'),
  username:yup.string().required("Username is required"),
  department:yup.string().required("Department is required"),
  program:yup.string().required("Program is required"),
  password:yup.string().required("Password is required"),
repassword:yup.string().required("Re-Password is required")
})

const signup = () => {

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(scheme),
  });

const onsubmit=async(data)=>
{
console.log(data);
}

  return (
    <View className="flex-1 bg-white justify-center px-8">
      {/* Header */}
      <View className="mb-12 items-center">
        <Text className="text-3xl font-bold text-black mb-2">Create Account</Text>
        <Text className="text-base text-gray-600">Join us to get started</Text>
      </View>

      {/* Form Container */}
      <View className="space-y-4">
        <Controller
          name='fullname'
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
              {errors.fullname && <Text className="text-red-500 text-sm mt-1">{errors.fullname.message}</Text>}
            </View>
          )}
        />

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
          name='department'
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
              {errors.department && <Text className="text-red-500 text-sm mt-1">{errors.department.message}</Text>}
            </View>
          )}
        />

        <Controller
          name='program'
          control={control}
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <TextInput
                className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                placeholder="Program" 
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                onChangeText={onChange}
                value={value}
              />
              {errors.program && <Text className="text-red-500 text-sm mt-1">{errors.program.message}</Text>}
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

        <Controller
          name='repassword'
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
              {errors.repassword && <Text className="text-red-500 text-sm mt-1">{errors.repassword.message}</Text>}
            </View>
          )}
        />

        {/* Sign Up Button */}
        <TouchableOpacity 
          className="bg-black h-14 rounded-full justify-center items-center mt-6 shadow-sm"
          onPress={handleSubmit(onsubmit)}
          
        >
          <Text className="text-white text-lg font-semibold">Create Account</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center mt-8">
          <Text className="text-gray-600 text-base">Already have an account? </Text>
          <TouchableOpacity>
            <Link  href={"/signin"} className="text-black font-semibold text-base" >Sign In</Link>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default signup;
