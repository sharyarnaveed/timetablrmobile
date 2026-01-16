import { yupResolver } from "@hookform/resolvers/yup";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { supabase } from "../utils/supabase";

const teacherScheme = yup.object().shape({
    email: yup
        .string()
        .required("Email is required")
        .email("Please enter a valid email"),
    password: yup
        .string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    repassword: yup
        .string()
        .required("Confirm Password is required")
        .oneOf([yup.ref("password")], "Passwords must match"),
    teacher: yup.string().required("Please select a teacher"),
});

const TeacherSignupForm = () => {
    const [teachers, setTeachers] = useState([]);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    const getAvailableTeachers = async () => {
        try {
            const { data, error } = await supabase
                .from("unique_teachers")
                .select("*");


            if (error) {
                console.log("Error fetching teachers:", error);
                return;
            }
            setTeachers(data || []);
        } catch (error) {
            console.log("Error in getting teachers", error);
        }
    };

    useEffect(() => {
        getAvailableTeachers();
    }, []);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(teacherScheme),
        defaultValues: {
            agree: false,
        },
    });

    const isAgreed = watch("agree");

    const onsubmit = async (data) => {
        try {
            setLoading(true);

            // Create Supabase auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        role: "teacher",
                        teacher_name: data.teacher,
                    },
                },
            });

            if (authError) {
                Toast.show({
                    type: "error",
                    text1: authError.message,
                });
                setLoading(false);
                return;
            }

            // Update teachersdata table to mark account as created for all rows with this teacher name
            const { error: updateError } = await supabase
                .from("teachersdata")
                .update({ isaccountcreated: true })
                .eq("teacher_name", data.teacher);

            if (updateError) {
                console.log("Error updating teacher status:", updateError);
            }

            Toast.show({
                type: "success",
                text1: "Account created successfully!",
                text2: "Enjoy TimeTablr",
            });
            setLoading(false);
            router.push("/signin");
        } catch (error) {
            console.log("Error in teacher signup:", error);
            Toast.show({
                type: "error",
                text1: "Error creating account",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="space-y-4">
            {/* Teacher Select */}
            <Controller
                name="teacher"
                control={control}
                render={({ field: { onChange, value } }) => {
                    const filteredTeachers = teachers.filter((teacher) =>
                        teacher.teacher_name
                            ?.toLowerCase()
                            .includes(searchText.toLowerCase())
                    );

                    const selectedTeacher = teachers.find(
                        (teacher) => teacher.teacher_name === value
                    );

                    return (
                        <View className="mb-4">
                            <TouchableOpacity
                                className="h-14 w-full border-b-2 border-gray-200 bg-transparent justify-center px-2"
                                onPress={() => setIsPickerVisible(true)}
                            >
                                <Text
                                    className={`text-base ${selectedTeacher ? "text-black" : "text-gray-400"
                                        }`}
                                >
                                    {selectedTeacher
                                        ? selectedTeacher.teacher_name
                                        : "Select Your Name"}
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
                                                    Select Teacher
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
                                                placeholder="Search teachers..."
                                                placeholderTextColor="#9CA3AF"
                                                value={searchText}
                                                onChangeText={setSearchText}
                                                autoFocus={true}
                                            />
                                        </View>
                                        <FlatList
                                            data={filteredTeachers}
                                            keyExtractor={(item, index) => `${index}-${item.teacher_name}`}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity
                                                    className="p-4 border-b border-gray-100"
                                                    onPress={() => {
                                                        onChange(item.teacher_name);
                                                        setIsPickerVisible(false);
                                                        setSearchText("");
                                                    }}
                                                >
                                                    <Text className="text-base text-black">
                                                        {item.teacher_name}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            ListEmptyComponent={
                                                <View className="p-4">
                                                    <Text className="text-gray-500 text-center">
                                                        No teachers found
                                                    </Text>
                                                </View>
                                            }
                                        />
                                    </View>
                                </View>
                            </Modal>

                            {errors.teacher && (
                                <Text className="text-red-500 text-sm mt-1">
                                    {errors.teacher.message}
                                </Text>
                            )}
                        </View>
                    );
                }}
            />

            {/* Email */}
            <Controller
                name="email"
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
                        {errors.email && (
                            <Text className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </Text>
                        )}
                    </View>
                )}
            />

            {/* Password */}
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

            {/* Confirm Password */}
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
                        <TouchableOpacity
                            onPress={() => onChange(!value)}
                            className={`w-6 h-6 border-2 rounded mr-3 items-center justify-center ${value ? "bg-black border-black" : "border-gray-400"
                                }`}
                        >
                            {value && <Text className="text-white text-sm">✓</Text>}
                        </TouchableOpacity>
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
                className={`h-14 rounded-full justify-center items-center mt-6 shadow-sm ${isAgreed ? "bg-black" : "bg-gray-300 opacity-50"
                    } ${loading ? "opacity-50" : ""}`}
                onPress={handleSubmit(onsubmit)}
                disabled={!isAgreed || loading}
            >
                <Text
                    className={`text-lg font-semibold ${isAgreed ? "text-white" : "text-gray-500"
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
                    <Link href={"/signin"} className="text-black font-semibold text-base">
                        Sign In
                    </Link>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default TeacherSignupForm;
