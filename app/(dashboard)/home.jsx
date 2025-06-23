import { Link } from "expo-router";
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const home = () => {
  const [progress, setProgress] = useState(0)
  const targetProgress = 75

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(interval)
          return targetProgress
        }
        return prev + 1
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#22c55e' // green
    if (percentage >= 60) return '#eab308' // yellow
    if (percentage >= 40) return '#f97316' // orange
    return '#ef4444' // red
  }

  return (
      <View className="border-2 border-red-400 h-full bg-white">
      <View className=" h-[10%] flex-row justify-between items-end px-4 border-2 border-red-400">
        <Text className="text-lg font-semibold">Welcome, Sharyar</Text>
        <TouchableOpacity>
          <Link href={"/signup"} className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center">
            <Text className="text-sm font-bold text-center">S</Text>
          </Link>
        </TouchableOpacity>
      </View>

      <View className="h-[12%] flex-row justify-around items-center px-4 ">
        <TouchableOpacity className="flex items-center border-2 border-black py-4 px-6 rounded-full">
          <Text className="text-base font-medium text-black">Today</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex items-center  border-2 border-black py-4 px-6 rounded-full">
          <Text className="text-base font-medium text-gray-500">See More</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex items-center  border-2 border-black py-4 px-6 rounded-full">
          <Text className="text-base font-medium text-gray-500">Timetable</Text>
        </TouchableOpacity>
      </View>

      {/* Rectangular Card */}
      <View className="mx-4 mt-2 p-2 bg-white  border-2 border-black rounded-lg shadow-sm">
        <Text className="text-[1.2rem]">Daily Stats -{'>'}</Text>
        <View className="flex-row justify-around items-center mt-4">
          

          <TouchableOpacity className="items-center" onPress={() => {
            setProgress(0)
            setTimeout(() => {
              const interval = setInterval(() => {
                setProgress(prev => {
                  if (prev >= targetProgress) {
                    clearInterval(interval)
                    return targetProgress
                  }
                  return prev + 2
                })
              }, 20)
            }, 100)
          }}>
            <View className="w-28 h-28 items-center justify-center relative">
              <View className="absolute w-28 h-28 border-4 border-gray-200 rounded-full" />
              
              <View 
                className="absolute w-24 h-24 border-4 rounded-full"
                style={{
                  borderColor: '#e5e7eb',
                  borderTopColor: progress > 0 ? getProgressColor(progress) : '#e5e7eb',
                  borderRightColor: progress > 25 ? getProgressColor(progress) : '#e5e7eb',
                  borderBottomColor: progress > 50 ? getProgressColor(progress) : '#e5e7eb',
                  borderLeftColor: progress > 75 ? getProgressColor(progress) : '#e5e7eb',
                  transform: [{ rotate: '-90deg' }]
                }}
              />
              
              {/* Center Content */}
              <View className="items-center justify-center">
                <Text 
                  className="text-xl font-bold" 
                  style={{ color: getProgressColor(progress) }}
                >
                  {progress}%
                </Text>
                <Text className="text-xs text-gray-500">Complete</Text>
              </View>
            </View>

          </TouchableOpacity>

          {/* Square Card */}
          <View className="w-32 h-32 bg-black border border-gray-300 rounded-lg flex items-center justify-center">
            <View className="items-center">
              <Text className="text-[3rem] font-bold text-white">12</Text>
              <Text className="text-xl text-gray-200">Jun</Text>
            </View>
          </View>

        </View>
      </View>

<Text className="mx-5 mt-10 mb-5 text-[1.2rem] ">
  Current Class - {'>'}
</Text>
   <View className="mx-4 mt-2 p-3 w-[93%] h-[20%] bg-black  border-2 border-black rounded-2xl shadow-sm">


   </View>


    </View>
  )
}

export default home