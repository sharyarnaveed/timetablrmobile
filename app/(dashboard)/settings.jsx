import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
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
import {
    getTeacherMetadata,
    safeGetSession,
    supabase,
} from "../../utils/supabase";

const hexToRgba = (hex, alpha) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
      "Only letters, numbers, and underscores and @ are allowed",
    ),
});

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
  const [isTeacherPasswordLoading, setIsTeacherPasswordLoading] =
    useState(false);
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  // -- Unified theme tokens (matching home & addcourse) --
  const bg = isDark ? "#000000" : "#f5f5f7";
  const card = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "#1e1e1e" : "#eee";
  const textPrimary = isDark ? "#ffffff" : "#000000";
  const textSecondary = isDark ? "#777777" : "#888888";
  const textTertiary = isDark ? "#444444" : "#bbbbbb";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";

  const {
    control: usernameControl,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
    reset: resetUsername,
  } = useForm({ resolver: yupResolver(usernameSchema) });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({ resolver: yupResolver(passwordSchema) });

  const {
    control: emailControl,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    reset: resetEmail,
  } = useForm({ resolver: yupResolver(emailSchema) });

  const {
    control: teacherPasswordControl,
    handleSubmit: handleTeacherPasswordSubmit,
    formState: { errors: teacherPasswordErrors },
    reset: resetTeacherPassword,
  } = useForm({ resolver: yupResolver(teacherPasswordSchema) });

  useEffect(() => {
    loadUserData();
    loadNotificationState();
  }, []);

  const loadNotificationState = async () => {
    try {
      const stored = await SecureStore.getItemAsync("notificationsEnabled");
      setNotificationsEnabled(stored === "true");
    } catch (e) {
      console.error("Error loading notification state:", e);
    }
  };

  const handleToggleNotifications = async (value) => {
    setIsNotificationLoading(true);
    try {
      const role = await SecureStore.getItemAsync("role");

      if (value) {
        // ── Enable notifications ──
        if (!Device.isDevice) {
          Toast.show({
            type: "error",
            text1: "Notifications require a physical device",
          });
          setIsNotificationLoading(false);
          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          Toast.show({
            type: "error",
            text1: "Notification permission denied",
          });
          setIsNotificationLoading(false);
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PROJECT_ID,
        });

        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
          Toast.show({ type: "error", text1: "No internet connection" });
          setIsNotificationLoading(false);
          return;
        }

        if (role === "teacher") {
          const session = await safeGetSession();
          if (!session?.user?.id) {
            Toast.show({ type: "error", text1: "No active session" });
            setIsNotificationLoading(false);
            return;
          }
          const { data: existing } = await supabase
            .from("notifyteacher")
            .select("id")
            .eq("teacherid", session.user.id)
            .single();

          if (existing) {
            await supabase
              .from("notifyteacher")
              .update({ notifyid: tokenData.data })
              .eq("teacherid", session.user.id);
          } else {
            await supabase
              .from("notifyteacher")
              .insert({ teacherid: session.user.id, notifyid: tokenData.data });
          }
        } else {
          const accessToken = await SecureStore.getItemAsync("accessToken");
          await axios.post(
            "https://timetablr.burjalsama.site/api/user/storetoken",
            { token: tokenData.data },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            },
          );
        }

        await SecureStore.setItemAsync("notificationsEnabled", "true");
        setNotificationsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Notifications enabled" });
      } else {
        // ── Disable notifications ──
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
          Toast.show({ type: "error", text1: "No internet connection" });
          setIsNotificationLoading(false);
          return;
        }

        if (role === "teacher") {
          const session = await safeGetSession();
          if (session?.user?.id) {
            await supabase
              .from("notifyteacher")
              .update({ notifyid: "" })
              .eq("teacherid", session.user.id);
          }
        } else {
          const accessToken = await SecureStore.getItemAsync("accessToken");
          await axios.post(
            "https://timetablr.burjalsama.site/api/user/storetoken",
            { token: "" },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            },
          );
        }

        await SecureStore.setItemAsync("notificationsEnabled", "false");
        setNotificationsEnabled(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: "Notifications disabled" });
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Toast.show({
        type: "error",
        text1: "Failed to update notification settings",
      });
    } finally {
      setIsNotificationLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUsername = await SecureStore.getItemAsync("username");
      const storedEmail = await SecureStore.getItemAsync("email");
      const storedRole = await SecureStore.getItemAsync("role");
      const storedTeacherName = await SecureStore.getItemAsync("teacherName");

      if (storedRole === "teacher") {
        const displayName =
          storedTeacherName ||
          (await getTeacherMetadata()) ||
          storedUsername ||
          "";
        setUsername(displayName);
      } else if (storedUsername) {
        setUsername(storedUsername);
      }
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
        },
      );
      if (response.data.success) {
        await SecureStore.setItemAsync("username", data.newUsername);
        setUsername(data.newUsername);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: response.data.message });
        setActiveForm(null);
        resetUsername();
      } else {
        Toast.show({ type: "error", text1: response.data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Can't Change Username" });
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
        },
      );
      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: response.data.message });
        setActiveForm(null);
        resetPassword();
      } else {
        Toast.show({ type: "error", text1: response.data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Can't Change Password" });
    }
  };

  const toggleForm = (formType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: "success",
        text1: "Email update initiated",
        text2: "",
      });
      setActiveForm(null);
      resetEmail();
    } catch (error) {
      Toast.show({ type: "error", text1: "Can't update email" });
    } finally {
      setIsEmailLoading(false);
    }
  };

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: "success", text1: "Password updated successfully" });
      setActiveForm(null);
      resetTeacherPassword();
    } catch (error) {
      Toast.show({ type: "error", text1: "Can't update password" });
    } finally {
      setIsTeacherPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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
                const { error } = await supabase.auth.signOut();
                if (error) {
                  Toast.show({
                    type: "error",
                    text1: error.message || "Failed to delete account.",
                  });
                  return;
                }
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
                const token = await SecureStore.getItemAsync("accessToken");
                const response = await axios.delete(
                  `${process.env.EXPO_PUBLIC_API_URL}/api/user/deleteaccount`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    withCredentials: true,
                  },
                );
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
      ],
    );
  };

  // ── Reusable setting row (expandable) ──
  const SettingRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    formKey,
    children,
  }) => {
    const isActive = activeForm === formKey;
    return (
      <View
        style={{
          backgroundColor: card,
          borderRadius: 20,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isActive ? iconColor : cardBorder,
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 18,
          }}
          onPress={() => toggleForm(formKey)}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: hexToRgba(iconColor, 0.12),
              alignItems: "center",
              justifyContent: "center",
              marginRight: 14,
            }}
          >
            <Ionicons name={icon} size={21} color={iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: textPrimary,
                marginBottom: 3,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: textSecondary,
                fontWeight: "500",
              }}
            >
              {subtitle}
            </Text>
          </View>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isActive
                ? iconColor
                : isDark
                  ? "#1a1a1a"
                  : "#f0f0f0",
            }}
          >
            <Ionicons
              name={isActive ? "chevron-up" : "chevron-down"}
              size={16}
              color={isActive ? "#ffffff" : textTertiary}
            />
          </View>
        </TouchableOpacity>

        {isActive && (
          <View style={{ paddingHorizontal: 18, paddingBottom: 18 }}>
            <View
              style={{
                backgroundColor: isDark ? "#0a0a0a" : "#f8f8fa",
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: cardBorder,
              }}
            >
              {children}
            </View>
          </View>
        )}
      </View>
    );
  };

  // ── Reusable form input ──
  const FormInput = ({
    control: ctrl,
    name,
    placeholder,
    secureTextEntry,
    error,
    keyboardType,
    autoCapitalize,
  }) => (
    <View style={{ marginBottom: 12 }}>
      <Controller
        control={ctrl}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{
              backgroundColor: inputBg,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              color: textPrimary,
              borderWidth: 1,
              borderColor: error ? "#ff6b6b" : cardBorder,
              fontWeight: "500",
            }}
            placeholder={placeholder}
            placeholderTextColor={textTertiary}
            value={value}
            onChangeText={onChange}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize || "none"}
          />
        )}
      />
      {error && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            gap: 6,
          }}
        >
          <Ionicons name="alert-circle" size={13} color="#ff6b6b" />
          <Text style={{ color: "#ff6b6b", fontSize: 12, fontWeight: "500" }}>
            {error.message}
          </Text>
        </View>
      )}
    </View>
  );

  // ── Reusable submit button ──
  const SubmitButton = ({ onPress, label, color, loading }) => (
    <TouchableOpacity
      style={{
        backgroundColor: color,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 4,
        opacity: loading ? 0.7 : 1,
      }}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text
          style={{
            color: "#ffffff",
            fontWeight: "700",
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, padding: 20, paddingTop: 60 }}>
        {/* ── Header ── */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: hexToRgba("#5f27cd", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="settings" size={24} color="#5f27cd" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "#5f27cd",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Account
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: textPrimary,
                  letterSpacing: -0.5,
                }}
              >
                Settings
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              fontWeight: "500",
              lineHeight: 20,
            }}
          >
            Manage your account and preferences
          </Text>
        </View>

        {/* ── Profile Card ── */}
        <View
          style={{
            backgroundColor: card,
            padding: 28,
            borderRadius: 24,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: cardBorder,
            alignItems: "center",
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 28,
              backgroundColor: hexToRgba("#5f27cd", 0.12),
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              borderWidth: 3,
              borderColor: "#5f27cd",
            }}
          >
            <Text
              style={{
                fontSize: 38,
                fontWeight: "800",
                color: "#5f27cd",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: textPrimary,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}
          >
            {username}
          </Text>

          {email ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: hexToRgba("#54a0ff", 0.1),
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 100,
                gap: 7,
              }}
            >
              <Ionicons name="mail-outline" size={14} color="#54a0ff" />
              <Text
                style={{
                  fontSize: 13,
                  color: "#54a0ff",
                  fontWeight: "600",
                }}
              >
                {email}
              </Text>
            </View>
          ) : null}

          {userRole ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: hexToRgba("#10ac84", 0.1),
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 100,
                gap: 6,
                marginTop: 10,
              }}
            >
              <Ionicons
                name={userRole === "teacher" ? "school" : "person"}
                size={13}
                color="#10ac84"
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#10ac84",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {userRole}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Theme Toggle ── */}
        <View
          style={{
            backgroundColor: card,
            borderRadius: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: cardBorder,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: hexToRgba("#feca57", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={22}
                color="#feca57"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: textPrimary,
                  marginBottom: 3,
                  letterSpacing: -0.2,
                }}
              >
                Appearance
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: textSecondary,
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
                false: "#e0e0e0",
                true: "#5f27cd",
              }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
            />
          </TouchableOpacity>
        </View>

        {/* ── Notifications Toggle ── */}
        <View
          style={{
            backgroundColor: card,
            borderRadius: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: cardBorder,
            opacity: isNotificationLoading ? 0.6 : 1,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() =>
              !isNotificationLoading &&
              handleToggleNotifications(!notificationsEnabled)
            }
            activeOpacity={0.7}
            disabled={isNotificationLoading}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: hexToRgba("#10ac84", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons
                name={
                  notificationsEnabled ? "notifications" : "notifications-off"
                }
                size={22}
                color="#10ac84"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: textPrimary,
                  marginBottom: 3,
                  letterSpacing: -0.2,
                }}
              >
                Notifications
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: textSecondary,
                  fontWeight: "500",
                }}
              >
                {notificationsEnabled
                  ? "Push notifications enabled"
                  : "Push notifications disabled"}
              </Text>
            </View>
            {isNotificationLoading ? (
              <ActivityIndicator color="#10ac84" size="small" />
            ) : (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{
                  false: "#e0e0e0",
                  true: "#10ac84",
                }}
                thumbColor="#ffffff"
                ios_backgroundColor="#e0e0e0"
                disabled={isNotificationLoading}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Account Settings ── */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: textTertiary,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 14,
              marginLeft: 4,
            }}
          >
            Account
          </Text>

          {/* Teacher settings */}
          {userRole === "teacher" && (
            <>
              <SettingRow
                icon="mail"
                iconColor="#54a0ff"
                title="Update Email"
                subtitle="Change your email address"
                formKey="email"
              >
                <FormInput
                  control={emailControl}
                  name="newEmail"
                  placeholder="Enter new email"
                  error={emailErrors.newEmail}
                  keyboardType="email-address"
                />
                <SubmitButton
                  onPress={handleEmailSubmit(onEmailSubmit)}
                  label="Update Email"
                  color="#54a0ff"
                  loading={isEmailLoading}
                />
              </SettingRow>

              <SettingRow
                icon="lock-closed"
                iconColor="#ff9f43"
                title="Change Password"
                subtitle="Update your security credentials"
                formKey="teacherPassword"
              >
                <FormInput
                  control={teacherPasswordControl}
                  name="newPassword"
                  placeholder="Enter new password"
                  secureTextEntry
                  error={teacherPasswordErrors.newPassword}
                />
                <SubmitButton
                  onPress={handleTeacherPasswordSubmit(onTeacherPasswordSubmit)}
                  label="Change Password"
                  color="#ff9f43"
                  loading={isTeacherPasswordLoading}
                />
              </SettingRow>
            </>
          )}

          {/* Student settings */}
          {userRole === "student" && (
            <>
              <SettingRow
                icon="person"
                iconColor="#48dbfb"
                title="Update Username"
                subtitle="Change your display name"
                formKey="username"
              >
                <FormInput
                  control={usernameControl}
                  name="newUsername"
                  placeholder="Enter new username"
                  error={usernameErrors.newUsername}
                />
                <SubmitButton
                  onPress={handleUsernameSubmit(onUsernameSubmit)}
                  label="Update Username"
                  color="#48dbfb"
                />
              </SettingRow>

              <SettingRow
                icon="lock-closed"
                iconColor="#ff9f43"
                title="Change Password"
                subtitle="Update your security credentials"
                formKey="password"
              >
                <FormInput
                  control={passwordControl}
                  name="currentPassword"
                  placeholder="Current password"
                  secureTextEntry
                  error={passwordErrors.currentPassword}
                />
                <FormInput
                  control={passwordControl}
                  name="newPassword"
                  placeholder="New password"
                  secureTextEntry
                  error={passwordErrors.newPassword}
                />
                <SubmitButton
                  onPress={handlePasswordSubmit(onPasswordSubmit)}
                  label="Change Password"
                  color="#ff9f43"
                />
              </SettingRow>
            </>
          )}
        </View>

        {/* ── Danger Zone ── */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: textTertiary,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 14,
              marginLeft: 4,
            }}
          >
            Danger Zone
          </Text>

          {/* Logout */}
          <TouchableOpacity
            style={{
              backgroundColor: card,
              padding: 18,
              borderRadius: 18,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: cardBorder,
              borderLeftWidth: 4,
              borderLeftColor: "#ff9f43",
              marginBottom: 12,
            }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: hexToRgba("#ff9f43", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff9f43" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#ff9f43",
                  letterSpacing: -0.2,
                }}
              >
                Logout
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: textSecondary,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Sign out of your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={{
              backgroundColor: card,
              padding: 18,
              borderRadius: 18,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: cardBorder,
              borderLeftWidth: 4,
              borderLeftColor: "#ff6b6b",
            }}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: hexToRgba("#ff6b6b", 0.12),
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#ff6b6b",
                  letterSpacing: -0.2,
                }}
              >
                Delete Account
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: textSecondary,
                  fontWeight: "500",
                  marginTop: 2,
                }}
              >
                Permanently remove your account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
