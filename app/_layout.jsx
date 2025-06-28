import { Stack } from 'expo-router';
import React from 'react';
import Toast from 'react-native-toast-message';
import "./global.css";
export default function _layout() {
  return (
<Stack screenOptions={{
  headerShown:false
}}>
  <Stack.Screen name='(auth)' screenOptions={{
   headerShown:false
 }}/>
  <Stack.Screen name='(dashboard)' screenOptions={{
  headerShown:false
}}/>
 <Toast/>

</Stack>
  )
}