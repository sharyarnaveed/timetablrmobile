import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [activeForm, setActiveForm] = useState(null);
  const [username, setUsername] = useState("");
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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUsername = await SecureStore.getItemAsync("username");
      const storedEmail = await SecureStore.getItemAsync("email");
      const notificationStatus = await SecureStore.getItemAsync("notification");

      if (storedUsername) setUsername(storedUsername);
      if (storedEmail) setEmail(storedEmail);
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
    } else {
      setActiveForm(formType);
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
        backgroundColor: isDark ? "#000" : "#fff",
      }}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View style={{ flex: 1, padding: 16, paddingTop: 60 }}>
        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isDark ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            Settings
          </Text>
        </View>

        {/* Profile Section */}
        <View
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
            padding: 24,
            borderRadius: 16,
            marginBottom: 24,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: isDark ? "#374151" : "#e5e7eb",
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: isDark ? "#fff" : "#374151",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: isDark ? "#fff" : "#374151",
              marginBottom: 4,
            }}
          >
            {username}
          </Text>
          {email && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
              }}
            >
              {email}
            </Text>
          )}
        </View>

        {/* Settings Options */}
        <View style={{ marginBottom: 24 }}>
          {/* Theme Setting */}
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={toggleTheme}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: isDark ? "#374151" : "#e5e7eb",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Ionicons
                  name={isDark ? "moon" : "sunny"}
                  size={20}
                  color={isDark ? "#fff" : "#374151"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color: isDark ? "#fff" : "#374151",
                    marginBottom: 2,
                  }}
                >
                  Theme
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
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
                  true: isDark ? "#fff" : "#000",
                }}
                thumbColor={isDark ? (isDark ? "#000" : "#fff") : "#f4f3f4"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Management */}
        <View style={{ marginBottom: 24 }}>
          {/* Update Username Section */}
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
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
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  Update Username
                </Text>
                <Text
                  style={{
                    color: isDark ? "#9ca3af" : "#6b7280",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  Change your display name
                </Text>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    activeForm === "username"
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                      ? "#374151"
                      : "#d1d5db",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color:
                      activeForm === "username"
                        ? isDark
                          ? "#000"
                          : "#fff"
                        : isDark
                        ? "#9ca3af"
                        : "#6b7280",
                  }}
                >
                  {activeForm === "username" ? "−" : "+"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Username Form */}
            {activeForm === "username" && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: isDark ? "#374151" : "#fff",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isDark ? "#d1d5db" : "#374151",
                      marginBottom: 12,
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
                          backgroundColor: isDark ? "#4b5563" : "#f9fafb",
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: 16,
                          color: isDark ? "#fff" : "#000",
                          marginBottom: 12,
                        }}
                        placeholder="Enter new username"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
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
                        fontSize: 14,
                        marginBottom: 12,
                      }}
                    >
                      {usernameErrors.newUsername.message}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: isDark ? "#fff" : "#000",
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                    onPress={handleUsernameSubmit(onUsernameSubmit)}
                  >
                    <Text
                      style={{
                        color: isDark ? "#000" : "#fff",
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

          {/* Change Password Section */}
          <View
            style={{
              backgroundColor: isDark ? "#1a1a1a" : "#f9fafb",
              borderRadius: 16,
              marginBottom: 16,
              overflow: "hidden",
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
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: isDark ? "#fff" : "#000",
                  }}
                >
                  Change Password
                </Text>
                <Text
                  style={{
                    color: isDark ? "#9ca3af" : "#6b7280",
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  Update your security credentials
                </Text>
              </View>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    activeForm === "password"
                      ? isDark
                        ? "#fff"
                        : "#000"
                      : isDark
                      ? "#374151"
                      : "#d1d5db",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color:
                      activeForm === "password"
                        ? isDark
                          ? "#000"
                          : "#fff"
                        : isDark
                        ? "#9ca3af"
                        : "#6b7280",
                  }}
                >
                  {activeForm === "password" ? "−" : "+"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Password Form */}
            {activeForm === "password" && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <View
                  style={{
                    backgroundColor: isDark ? "#374151" : "#fff",
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: isDark ? "#4b5563" : "#e5e7eb",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: isDark ? "#d1d5db" : "#374151",
                      marginBottom: 12,
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
                          backgroundColor: isDark ? "#4b5563" : "#f9fafb",
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: 16,
                          color: isDark ? "#fff" : "#000",
                          marginBottom: 12,
                        }}
                        placeholder="Current password"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
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
                        fontSize: 14,
                        marginBottom: 12,
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
                          backgroundColor: isDark ? "#4b5563" : "#f9fafb",
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          fontSize: 16,
                          color: isDark ? "#fff" : "#000",
                          marginBottom: 12,
                        }}
                        placeholder="New password"
                        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
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
                        fontSize: 14,
                        marginBottom: 12,
                      }}
                    >
                      {passwordErrors.newPassword.message}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: isDark ? "#fff" : "#000",
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                    onPress={handlePasswordSubmit(onPasswordSubmit)}
                  >
                    <Text
                      style={{
                        color: isDark ? "#000" : "#fff",
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
        </View>

        {/* Logout and Delete Account Buttons */}
        <View>
          {/* Logout Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#991b1b" : "#fecaca",
              marginBottom: 16, // Add some space before logout
            }}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={isDark ? "#f87171" : "#dc2626"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: isDark ? "#f87171" : "#dc2626",
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
              backgroundColor: isDark ? "#991b1b" : "#fee2e2",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "#991b1b" : "#fecaca",
              marginBottom: 16, // Add some space before logout
            }}
            onPress={handleDeleteAccount}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isDark ? "#f87171" : "#dc2626"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: isDark ? "#f87171" : "#dc2626",
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
