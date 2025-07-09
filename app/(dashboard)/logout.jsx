import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const logout = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear all stored data
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("username");
        await SecureStore.deleteItemAsync("timetable");
        await SecureStore.deleteItemAsync("day");
        
        // Navigate to signin
        router.replace("/signin");
      } catch (error) {
        console.log("Error during logout:", error);
        // Still navigate even if there's an error clearing storage
        router.replace("/signin");
      }
    };

    performLogout();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#000" />
      <Text className="mt-4 text-gray-600">Logging out...</Text>
    </View>
  );
};

export default logout;