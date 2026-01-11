import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

const logout = () => {
  const router = useRouter();
  const alertShown = useRef(false);

  useEffect(() => {
    const handleLogout = () => {
      if (alertShown.current) return;
      alertShown.current = true;
      
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            router.replace("/"); // Navigate away from logout screen
          } 
        },
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

    handleLogout();
  }, []); // Remove router from dependency array

  return (
    <View 
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <ActivityIndicator size="large" color="#111827" />
      <Text 
        style={{
          marginTop: 16,
          fontSize: 16,
          color: "#6b7280",
          fontWeight: "500",
        }}
      >
        Logging out...
      </Text>
    </View>
  );
};

export default logout;