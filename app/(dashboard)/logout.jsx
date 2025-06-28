import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

const logout = () => {

  const navigation=useRouter()

useEffect(()=>{
navigation.replace("/signin")
},[])


  return (
    <View>
      <Text>logout</Text>
    </View>
  )
}

export default logout