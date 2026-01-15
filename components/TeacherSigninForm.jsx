import { yupResolver } from '@hookform/resolvers/yup';
import { router } from "expo-router";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import * as yup from 'yup';
import { supabase } from "../utils/supabase";

const teacherSigninScheme = yup.object().shape({
    email: yup.string().required("Email is required").email("Please enter a valid email"),
    password: yup.string().required("Password is required"),
});

const TeacherSigninForm = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(teacherSigninScheme),
    });

    const [loading, setLoading] = useState(false);

    const onsubmit = async (data) => {
        setLoading(true);
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) {
                Toast.show({
                    type: "error",
                    text1: authError.message
                });
                setLoading(false);
                return;
            }

            // Check if user has teacher role
            if (authData.user?.user_metadata?.role !== 'teacher') {
                Toast.show({
                    type: "error",
                    text1: "Invalid credentials for teacher login"
                });
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            Toast.show({
                type: "success",
                text1: "Sign in successful!"
            });

            router.push("/(dashboard)/");
        } catch (error) {
            console.log(error);
            Toast.show({
                type: "error",
                text1: "Error in Sign In"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="space-y-4">
            {/* Email */}
            <Controller
                name='email'
                control={control}
                render={({ field: { onChange, value } }) => (
                    <View className="mb-4">
                        <TextInput
                            className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-black bg-transparent focus:border-black"
                            placeholder="Email"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={onChange}
                            value={value}
                        />
                        {errors.email && <Text className="text-red-500 text-sm mt-1">{errors.email.message}</Text>}
                    </View>
                )}
            />

            {/* Password */}
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

            {/* Sign In Button */}
            <TouchableOpacity
                className="bg-black h-14 rounded-full justify-center items-center mt-6 shadow-sm"
                onPress={handleSubmit(onsubmit)}
                disabled={loading}
            >
                <Text className="text-white text-lg font-semibold">Sign In</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TeacherSigninForm;
