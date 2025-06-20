import { Stack } from 'expo-router';
import React from 'react';
import "./global.css";
export default function _layout() {
  return (
<Stack screenOptions={{
  headerShown:false
}}>
  <Stack.Screen name='home'/>
  <Stack.Screen name='signin'/>
  <Stack.Screen name='signup'/>

</Stack>
  )
}