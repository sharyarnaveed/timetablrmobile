import { Tabs } from "expo-router"

const _layout = () => {
  return (
   <Tabs
     screenOptions={{
       headerShown: false,
       tabBarStyle: {
         backgroundColor: '#1b1b1d', 
         borderTopWidth: 0,
         elevation: 8, 
         shadowOpacity: 0.15, 
         shadowOffset: { width: 0, height: 4 },
         shadowRadius: 6,
         shadowColor: '#000',
         borderRadius: 30, 
         marginHorizontal: 16, 
         marginBottom: 20, 
         height: 65, 
         paddingBottom: 8,
         paddingTop: 8,
         position: 'absolute', 
         left: 0,
         right: 0,
         bottom: 30,
       },
       tabBarActiveTintColor: '#fff', 
       tabBarInactiveTintColor: '#000',
       tabBarInactiveBackgroundColor: 'transparent',
       tabBarShowLabel: false, 
       tabBarIconStyle: {
         marginBottom: 0,
         marginTop: 0,
       },
       tabBarItemStyle: {
         borderRadius: 20, 
         marginHorizontal: 8,
         marginVertical: 8,
         justifyContent: 'center',
         alignItems: 'center',
       },

     }}
   />
  )
}

export default _layout