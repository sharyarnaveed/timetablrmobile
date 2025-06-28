import { Link } from "expo-router";
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const home = () => {
  const [selectedTab, setSelectedTab] = useState('Today')

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1">

        <View className="px-6 pt-16 pb-8">
          <View className="bg-black rounded-3xl p-6 shadow-lg">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-light text-gray-300">Good morning</Text>
                <Text className="text-2xl font-bold text-white mt-1">Sharyar</Text>
                <Text className="text-sm text-gray-400 mt-2">Thursday, June 26</Text>
              </View>
<View className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
  <Link 
    className="w-12 h-12 rounded-full flex justify-center items-center text-center" 
    href="/settings"
  >
    <Text className="text-black font-semibold text-[2rem] flex justify-center items-center">S</Text>
  </Link>
</View>
            </View>
          </View>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row justify-center space-x-2">
            {['Today', 'Week', 'Calendar'].map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`px-6 py-3 rounded-full ${
                  selectedTab === tab ? 'bg-black' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedTab(tab)}
              >
                <Text className={`font-medium ${
                  selectedTab === tab ? 'text-white' : 'text-gray-600'
                }`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        <View className="px-6 mb-8">
          <View className="flex-row justify-between space-x-4">
            {/* Progress Card */}
            <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
              <View className="w-12 h-12 bg-black rounded-full items-center justify-center mb-3">
                <Text className="text-white font-bold">75</Text>
              </View>
              <Text className="text-sm text-gray-600 font-medium">Progress</Text>
            </View>

            {/* Classes Card */}
            <View className="flex-1 bg-black p-6 rounded-2xl items-center">
              <Text className="text-3xl font-bold text-white mb-2">8</Text>
              <Text className="text-sm text-gray-300 font-medium">Classes</Text>
            </View>

            {/* Remaining Card */}
            <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
              <Text className="text-3xl font-bold text-black mb-2">3</Text>
              <Text className="text-sm text-gray-600 font-medium">Left</Text>
            </View>
          </View>
        </View>

        {/* Current Class Section */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">Current Class</Text>
            <TouchableOpacity>
              <Text className="text-black font-medium">View Schedule</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-black p-6 rounded-2xl shadow-lg border border-gray-800">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">Mathematics</Text>
                <Text className="text-gray-300 text-sm">Advanced Calculus</Text>
              </View>
              <View className="bg-white px-3 py-1 rounded-full">
                <Text className="text-black text-xs font-medium">LIVE</Text>
              </View>
            </View>
            
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-300 text-sm">Room 204 • Prof. Johnson</Text>
                <Text className="text-white font-medium">10:30 AM - 12:00 PM</Text>
              </View>
              <TouchableOpacity className="bg-white px-4 py-2 rounded-lg">
                <Text className="text-black font-medium">Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Upcoming Classes */}
        <View className="mx-6 mb-36">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Upcoming Classes</Text>
          
          <View className="space-y-3">
            {[
              { subject: 'Physics', time: '12:30 PM', room: 'Lab 101', type: 'Lab' },
              { subject: 'Chemistry', time: '2:00 PM', room: 'Room 305', type: 'Lecture' },

            ].map((classItem, index) => (
              <View key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">{classItem.subject}</Text>
                  <Text className="text-sm text-gray-500">{classItem.room} • {classItem.type}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-medium text-gray-800">{classItem.time}</Text>
                  <View className="bg-gray-100 px-2 py-1 rounded mt-1">
                    <Text className="text-xs text-gray-800">{classItem.type}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default home