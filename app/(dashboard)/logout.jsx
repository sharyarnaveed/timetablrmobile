import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

const logout = () => {
  const router = useRouter();

  useEffect(() => {
   const handleLogout = () => {
     Alert.alert(
       "Logout",
       "Are you sure you want to logout?",
       [
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
               router.replace("/signin");
             } catch (error) {
               console.error("Error during logout:", error);
             }
           },
         },
       ]
     );
   };

   handleLogout()
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#000" />
      <Text className="mt-4 text-gray-600">Logging out...</Text>
    </View>
  );
};

export default logout;
