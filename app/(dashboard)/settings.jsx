import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../utils/supabase";

// Add validation schemas
const usernameSchema = yup.object().shape({
  newUsername: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters"),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^[A-Za-z0-9_@]+$/,
      "Only letters, numbers, and underscores and @ are allowed"
    ),
});

// Teacher-specific validation schemas
const emailSchema = yup.object().shape({
  newEmail: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

const teacherPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [activeForm, setActiveForm] = useState(null);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isTeacherPasswordLoading, setIsTeacherPasswordLoading] = useState(false);
  const [email, setEmail] = useState("");

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

  // Teacher email form
  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm({
    resolver: yupResolver(emailSchema),
  });

  // Teacher password form
  const {
    control: teacherPasswordControl,
    handleSubmit: handleTeacherPasswordSubmit,
    formState: { errors: teacherPasswordErrors },
    reset: resetTeacherPassword,
  } = useForm({
    resolver: yupResolver(teacherPasswordSchema),
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUsername = await SecureStore.getItemAsync("username");
      const storedEmail = await SecureStore.getItemAsync("email");
      const storedRole = await SecureStore.getItemAsync("role");
      const notificationStatus = await SecureStore.getItemAsync("notification");

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
      if (storedRole) setUserRole(storedRole);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const onUsernameSubmit = async (data) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/changeusername`,
        { username: data.newUsername },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        await SecureStore.setItemAsync("username", data.newUsername);
        setUsername(data.newUsername);
        Toast.show({
          type: "success",
          text1: response.data.message,
        });
        setActiveForm(null);
        resetUsername();
      } else {
        Toast.show({
          type: "error",
          text1: response.data.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Can't Change Username",
      });
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/changepassword`,
        { oldpassword: data.currentPassword, newpassword: data.newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: response.data.message,
        });
        setActiveForm(null);
        resetPassword();
      } else {
        Toast.show({
          type: "error",
          text1: response.data.message,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Can't Change Password",
      });
    }
  };

  const toggleForm = (formType) => {
    if (activeForm === formType) {
      setActiveForm(null);
      resetUsername();
      resetPassword();
      resetEmail();
      resetTeacherPassword();
    } else {
      setActiveForm(formType);
    }
  };

  // Teacher email update handler
  const onEmailSubmit = async (data) => {
    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: data.newEmail,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: error.message || "Failed to update email",
        });
        return;
      }

      await SecureStore.setItemAsync("email", data.newEmail);
      setEmail(data.newEmail);
      Toast.show({
        type: "success",
        text1: "Email update initiated",
        text2: "",
      });
      setActiveForm(null);
      resetEmail();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Can't update email",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Teacher password update handler
  const onTeacherPasswordSubmit = async (data) => {
    setIsTeacherPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        Toast.show({
          type: "error",
          text1: error.message || "Failed to update password",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Password updated successfully",
      });
      setActiveForm(null);
      resetTeacherPassword();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Can't update password",
      });
    } finally {
      setIsTeacherPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("username");
            await SecureStore.deleteItemAsync("email");
            await SecureStore.deleteItemAsync("timetable");
            await SecureStore.deleteItemAsync("day");
            await SecureStore.deleteItemAsync("notification");

            router.replace("/signin");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const role = await SecureStore.getItemAsync("role");

              if (role === "teacher") {
                // For teachers, sign out from Supabase and clear local data
                const { error } = await supabase.auth.signOut();

                if (error) {
                  Toast.show({
                    type: "error",
                    text1: error.message || "Failed to delete account.",
                  });
                  return;
                }

                // Clear all local data
                await SecureStore.deleteItemAsync("accessToken");
                await SecureStore.deleteItemAsync("username");
                await SecureStore.deleteItemAsync("email");
                await SecureStore.deleteItemAsync("timetable");
                await SecureStore.deleteItemAsync("day");
                await SecureStore.deleteItemAsync("role");
                await SecureStore.deleteItemAsync("notification");

                Toast.show({
                  type: "success",
                  text1: "Account deleted successfully.",
                });
                router.replace("/signin");
              } else {
                // For students, use the API
                const token = await SecureStore.getItemAsync("accessToken");
                const response = await axios.delete(
                  `${process.env.EXPO_PUBLIC_API_URL}/api/user/deleteaccount`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    withCredentials: true,
                  }
                );
                console.log(response.data);

                if (response.data.success) {
                  await SecureStore.deleteItemAsync("accessToken");
                  await SecureStore.deleteItemAsync("username");
                  await SecureStore.deleteItemAsync("email");
                  await SecureStore.deleteItemAsync("timetable");
                  await SecureStore.deleteItemAsync("day");
                  await SecureStore.deleteItemAsync("role");
                  Toast.show({
                    type: "success",
                    text1: "Account deleted successfully.",
                  });
                  router.replace("/signin");
                } else {
                  Toast.show({
                    type: "error",
                    text1: response.data.message || "Failed to delete account.",
                  });
                }
              }
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Error deleting account.",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#000000" : "#f8f9fa",
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        {/* Modernistic Header with accent */}
        <View style={{ marginBottom: 40 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 6,
                height: 32,
                borderRadius: 3,
                backgroundColor: isDark ? "#ffffff" : "#111827",
                marginRight: 12,
              }}
            />
            <Text
              style={{
                fontSize: 38,
                fontWeight: "800",
                color: isDark ? "#ffffff" : "#111827",
                letterSpacing: -1,
              }}
            >
              Settings
            </Text>
          </View>
          <Text
            style={{
              fontSize: 15,
              color: isDark ? "#6b7280" : "#9ca3af",
              marginLeft: 18,
              fontWeight: "500",
            }}
          >
            Manage your account and preferences
          </Text>
        </View>

        {/* Modernistic Profile Section with asymmetric design */}
        <View
          style={{
            backgroundColor: isDark ? "#111111" : "#ffffff",
            padding: 32,
            borderRadius: 32,
            marginBottom: 28,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.4 : 0.12,
            shadowRadius: 20,
            elevation: 10,
            alignItems: "center",
            borderWidth: isDark ? 1 : 0,
            borderColor: isDark ? "#1f1f1f" : "transparent",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Decorative elements */}
          <View
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(0, 0, 0, 0.02)",
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.02)"
                : "rgba(0, 0, 0, 0.015)",
            }}
          />

          <View
            style={{
              width: 108,
              height: 108,
              backgroundColor: isDark ? "#ffffff" : "#111827",
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
              transform: [{ rotate: "-3deg" }],
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 48,
                fontWeight: "800",
                color: isDark ? "#000000" : "#ffffff",
                letterSpacing: 1.5,
                transform: [{ rotate: "3deg" }],
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#111827",
              marginBottom: 10,
              letterSpacing: -0.8,
              zIndex: 1,
            }}
          >
            {username}
          </Text>
          {email && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.04)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 24,
                zIndex: 1,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={16}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                style={{
                  fontSize: 15,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginLeft: 8,
                  fontWeight: "500",
                }}
              >
                {email}
              </Text>
            </View>
          )}
        </View>

        {/* Modernistic Settings Options */}
        <View style={{ marginBottom: 24 }}>
          {/* Theme Setting with glassmorphism */}
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(17, 17, 17, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              borderRadius: 24,
              marginBottom: 16,
              overflow: "hidden",
              borderWidth: isDark ? 1.5 : 1,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(17, 24, 39, 0.08)",
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 18,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.06)",
                }}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={26}
                  color={isDark ? "#ffffff" : "#111827"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: isDark ? "#ffffff" : "#111827",
                    marginBottom: 6,
                    letterSpacing: -0.3,
                  }}
                >
                  Theme
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#6b7280" : "#9ca3af",
                    fontWeight: "500",
                  }}
                >
                  {isDark ? "Dark mode enabled" : "Light mode enabled"}
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: isDark ? "#374151" : "#d1d5db",
                  true: isDark ? "#ffffff" : "#111827",
                }}
                thumbColor={isDark ? "#000000" : "#ffffff"}
                ios_backgroundColor={isDark ? "#374151" : "#d1d5db"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modern Account Management */}
        <View style={{ marginBottom: 24 }}>
          {/* Teacher-specific settings */}
          {userRole === "teacher" && (
            <>
              {/* Update Email Section for Teachers */}
              <View
                style={{
                  backgroundColor: isDark ? "#111111" : "#ffffff",
                  borderRadius: 20,
                  marginBottom: 16,
                  overflow: "hidden",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#1f1f1f" : "transparent",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                  }}
                  onPress={() => toggleForm("email")}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Update Email
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#6b7280" : "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Change your email address
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        activeForm === "email"
                          ? isDark
                            ? "#ffffff"
                            : "#111827"
                          : isDark
                            ? "#1f1f1f"
                            : "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        color:
                          activeForm === "email"
                            ? isDark
                              ? "#000000"
                              : "#ffffff"
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                      }}
                    >
                      {activeForm === "email" ? "−" : "+"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {activeForm === "email" && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: isDark ? "#d1d5db" : "#374151",
                          marginBottom: 16,
                        }}
                      >
                        Enter new email address
                      </Text>

                      <Controller
                        control={emailControl}
                        name="newEmail"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={{
                              backgroundColor: isDark ? "#111111" : "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              fontSize: 16,
                              color: isDark ? "#ffffff" : "#111827",
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                            }}
                            placeholder="Enter new email"
                            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                            keyboardType="email-address"
                          />
                        )}
                      />

                      {emailErrors.newEmail && (
                        <Text
                          style={{
                            color: "#ef4444",
                            fontSize: 13,
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {emailErrors.newEmail.message}
                        </Text>
                      )}

                      <TouchableOpacity
                        style={{
                          backgroundColor: isDark ? "#ffffff" : "#111827",
                          borderRadius: 12,
                          paddingVertical: 14,
                          alignItems: "center",
                          marginTop: 8,
                          opacity: isEmailLoading ? 0.7 : 1,
                        }}
                        onPress={handleEmailSubmit(onEmailSubmit)}
                        activeOpacity={0.8}
                        disabled={isEmailLoading}
                      >
                        {isEmailLoading ? (
                          <ActivityIndicator
                            color={isDark ? "#000000" : "#ffffff"}
                            size="small"
                          />
                        ) : (
                          <Text
                            style={{
                              color: isDark ? "#000000" : "#ffffff",
                              fontWeight: "600",
                              fontSize: 16,
                            }}
                          >
                            Update Email
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Update Password Section for Teachers */}
              <View
                style={{
                  backgroundColor: isDark ? "#111111" : "#ffffff",
                  borderRadius: 20,
                  marginBottom: 16,
                  overflow: "hidden",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#1f1f1f" : "transparent",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                  }}
                  onPress={() => toggleForm("teacherPassword")}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Change Password
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#6b7280" : "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Update your security credentials
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        activeForm === "teacherPassword"
                          ? isDark
                            ? "#ffffff"
                            : "#111827"
                          : isDark
                            ? "#1f1f1f"
                            : "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        color:
                          activeForm === "teacherPassword"
                            ? isDark
                              ? "#000000"
                              : "#ffffff"
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                      }}
                    >
                      {activeForm === "teacherPassword" ? "−" : "+"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {activeForm === "teacherPassword" && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: isDark ? "#d1d5db" : "#374151",
                          marginBottom: 16,
                        }}
                      >
                        Enter new password
                      </Text>

                      <Controller
                        control={teacherPasswordControl}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={{
                              backgroundColor: isDark ? "#111111" : "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              fontSize: 16,
                              color: isDark ? "#ffffff" : "#111827",
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                            }}
                            placeholder="Enter new password"
                            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry
                          />
                        )}
                      />

                      {teacherPasswordErrors.newPassword && (
                        <Text
                          style={{
                            color: "#ef4444",
                            fontSize: 13,
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {teacherPasswordErrors.newPassword.message}
                        </Text>
                      )}

                      <TouchableOpacity
                        style={{
                          backgroundColor: isDark ? "#ffffff" : "#111827",
                          borderRadius: 12,
                          paddingVertical: 14,
                          alignItems: "center",
                          marginTop: 8,
                          opacity: isTeacherPasswordLoading ? 0.7 : 1,
                        }}
                        onPress={handleTeacherPasswordSubmit(onTeacherPasswordSubmit)}
                        activeOpacity={0.8}
                        disabled={isTeacherPasswordLoading}
                      >
                        {isTeacherPasswordLoading ? (
                          <ActivityIndicator
                            color={isDark ? "#000000" : "#ffffff"}
                            size="small"
                          />
                        ) : (
                          <Text
                            style={{
                              color: isDark ? "#000000" : "#ffffff",
                              fontWeight: "600",
                              fontSize: 16,
                            }}
                          >
                            Change Password
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}

          {/* Student-specific settings */}
          {userRole === "student" && (
            <>
              {/* Update Username Section */}
              <View
                style={{
                  backgroundColor: isDark ? "#111111" : "#ffffff",
                  borderRadius: 20,
                  marginBottom: 16,
                  overflow: "hidden",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#1f1f1f" : "transparent",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                  }}
                  onPress={() => toggleForm("username")}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Update Username
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#6b7280" : "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Change your display name
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        activeForm === "username"
                          ? isDark
                            ? "#ffffff"
                            : "#111827"
                          : isDark
                            ? "#1f1f1f"
                            : "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        color:
                          activeForm === "username"
                            ? isDark
                              ? "#000000"
                              : "#ffffff"
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                      }}
                    >
                      {activeForm === "username" ? "−" : "+"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Modern Username Form */}
                {activeForm === "username" && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: isDark ? "#d1d5db" : "#374151",
                          marginBottom: 16,
                        }}
                      >
                        Enter new username
                      </Text>

                      <Controller
                        control={usernameControl}
                        name="newUsername"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={{
                              backgroundColor: isDark ? "#111111" : "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              fontSize: 16,
                              color: isDark ? "#ffffff" : "#111827",
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                            }}
                            placeholder="Enter new username"
                            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                          />
                        )}
                      />

                      {usernameErrors.newUsername && (
                        <Text
                          style={{
                            color: "#ef4444",
                            fontSize: 13,
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {usernameErrors.newUsername.message}
                        </Text>
                      )}

                      <TouchableOpacity
                        style={{
                          backgroundColor: isDark ? "#ffffff" : "#111827",
                          borderRadius: 12,
                          paddingVertical: 14,
                          alignItems: "center",
                          marginTop: 8,
                        }}
                        onPress={handleUsernameSubmit(onUsernameSubmit)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={{
                            color: isDark ? "#000000" : "#ffffff",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                        >
                          Update Username
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Modern Change Password Section for Students */}
              <View
                style={{
                  backgroundColor: isDark ? "#111111" : "#ffffff",
                  borderRadius: 20,
                  marginBottom: 16,
                  overflow: "hidden",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#1f1f1f" : "transparent",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.05,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 20,
                  }}
                  onPress={() => toggleForm("password")}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#111827",
                        marginBottom: 4,
                      }}
                    >
                      Change Password
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#6b7280" : "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      Update your security credentials
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        activeForm === "password"
                          ? isDark
                            ? "#ffffff"
                            : "#111827"
                          : isDark
                            ? "#1f1f1f"
                            : "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        color:
                          activeForm === "password"
                            ? isDark
                              ? "#000000"
                              : "#ffffff"
                            : isDark
                              ? "#6b7280"
                              : "#9ca3af",
                      }}
                    >
                      {activeForm === "password" ? "−" : "+"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Modern Password Form */}
                {activeForm === "password" && (
                  <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View
                      style={{
                        backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: isDark ? "#d1d5db" : "#374151",
                          marginBottom: 16,
                        }}
                      >
                        Change your password
                      </Text>

                      <Controller
                        control={passwordControl}
                        name="currentPassword"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={{
                              backgroundColor: isDark ? "#111111" : "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              fontSize: 16,
                              color: isDark ? "#ffffff" : "#111827",
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                            }}
                            placeholder="Current password"
                            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry
                          />
                        )}
                      />

                      {passwordErrors.currentPassword && (
                        <Text
                          style={{
                            color: "#ef4444",
                            fontSize: 13,
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {passwordErrors.currentPassword.message}
                        </Text>
                      )}

                      <Controller
                        control={passwordControl}
                        name="newPassword"
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={{
                              backgroundColor: isDark ? "#111111" : "#ffffff",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              fontSize: 16,
                              color: isDark ? "#ffffff" : "#111827",
                              marginBottom: 12,
                              borderWidth: 1,
                              borderColor: isDark ? "#1f1f1f" : "#e5e7eb",
                            }}
                            placeholder="New password"
                            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry
                          />
                        )}
                      />

                      {passwordErrors.newPassword && (
                        <Text
                          style={{
                            color: "#ef4444",
                            fontSize: 13,
                            marginBottom: 12,
                            marginTop: -4,
                          }}
                        >
                          {passwordErrors.newPassword.message}
                        </Text>
                      )}

                      <TouchableOpacity
                        style={{
                          backgroundColor: isDark ? "#ffffff" : "#111827",
                          borderRadius: 12,
                          paddingVertical: 14,
                          alignItems: "center",
                          marginTop: 8,
                        }}
                        onPress={handlePasswordSubmit(onPasswordSubmit)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={{
                            color: isDark ? "#000000" : "#ffffff",
                            fontWeight: "600",
                            fontSize: 16,
                          }}
                        >
                          Change Password
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </>
          )}
        </View>

        {/* Modern Logout and Delete Account Buttons */}
        <View>
          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
              padding: 18,
              borderRadius: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: isDark ? "#7f1d1d" : "#fee2e2",
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={isDark ? "#ef4444" : "#dc2626"}
              style={{ marginRight: 10 }}
            />
            <Text
              style={{
                color: isDark ? "#ef4444" : "#dc2626",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
              padding: 18,
              borderRadius: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1.5,
              borderColor: isDark ? "#991b1b" : "#fee2e2",
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isDark ? "#ef4444" : "#dc2626"}
              style={{ marginRight: 10 }}
            />
            <Text
              style={{
                color: isDark ? "#ef4444" : "#dc2626",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
