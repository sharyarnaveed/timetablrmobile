import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1b1b1d",
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.15,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 6,
          shadowColor: "#000",
          borderRadius: 30,
          marginHorizontal: 16,
          marginBottom: 20,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 30,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#000",
        tabBarInactiveBackgroundColor: "transparent",
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 0,
        },
        tabBarItemStyle: {
          borderRadius: 20,
          marginHorizontal: 8,
          marginVertical: 8,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >

<Tabs.Screen
name="home"
options={{
tabBarIcon:({focused,color,size})=> (
<Ionicons
name={focused ? "home": "home-outline"}
size={24}
 color={focused ? '#fff' : '#666'} 
/>
)
}}
/>

  <Tabs.Screen 
       name="addcourse" 
       options={{
         tabBarIcon: ({ focused, color, size }) => (
           <AntDesign 
             name={focused ? "pluscircle" : "pluscircle"} 
             size={24} 
             color={focused ? '#fff' : '#666'} 
           />
         )
       }}
     />

  <Tabs.Screen 
       name="makeupclass" 
       options={{
         tabBarIcon: ({ focused, color, size }) => (
           <MaterialIcons 
             name={focused ? "class" : "class"} 
             size={24} 
             color={focused ? '#fff' : '#666'} 
           />
         ),
       }}
     />


  <Tabs.Screen 
       name="logout" 
       options={{
         tabBarIcon: ({ focused, color, size }) => (
           <MaterialCommunityIcons 
             name={focused ? "logout" : "logout"}
             size={24} 
             color='#8B0000'
           />
         ),
       }}
     />


      </Tabs>
  );
};

export default _layout;
