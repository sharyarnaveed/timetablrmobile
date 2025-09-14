import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (data) => {
    setIsLoading(true)
 try {
      const responce = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/user/forgotpassword`, data);
      if (responce.data.success) {
        Toast.show({
          type: "success",
          text1: responce.data.message
        });

        router.push("/(auth)/signin");
      } else {
        Toast.show({
          type: "error",
          text1: responce.data.message
        });
    setIsLoading(false)

      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Error in Submission of request"
      });
    }finally{
    setIsLoading(false)

    }
  };

  const handleGoBack = () => {
    router.push("/signin")
  };

  return (
    <View
      style={styles.container}
      behavior={Platform.OS === "android" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 20}
    >
      {/* Title */}
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.description}>
        Don't worry! Enter your username and email address below to receive a
        password reset link.
      </Text>

      {/* Username Input */}
      <Controller
        name="username"
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <TextInput
              className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-white bg-transparent focus:border-white"
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

      {/* Email Input */}
      <Controller
        name="email"
        control={control}
        render={({ field: { onChange, value } }) => (
          <View className="mb-4">
            <TextInput
              className="h-14 w-full border-b-2 border-gray-200 px-2 text-base text-white bg-transparent focus:border-white"
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

      {/* Reset Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit(handleResetPassword)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Remember your password? </Text>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.footerLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#444",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
    color: "#ccc",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
});
