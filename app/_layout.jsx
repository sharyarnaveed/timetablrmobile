import { Stack } from 'expo-router';
import React from 'react';
import "./global.css";
export default function _layout() {
  return (
<Stack screenOptions={{
  headerShown:false
}}>
  <Stack.Screen name='(dashboard)' screenOptions={{
  headerShown:false
}}/>
 <Stack.Screen name='(auth)' screenOptions={{
  headerShown:false
}}/>


</Stack>
  )
}