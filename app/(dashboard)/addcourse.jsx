import { useState } from 'react'
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const addcourse = () => {
  const [activeTab, setActiveTab] = useState('addCourse')

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-6 pt-16 pb-8">
          <View className="bg-black rounded-3xl p-6 shadow-lg">
            <View className="items-center">
              <Text className="text-lg font-light text-gray-300">Course Management</Text>
              <Text className="text-2xl font-bold text-white mt-1">Add & View Courses</Text>
              <Text className="text-sm text-gray-400 mt-2">Manage your academic schedule</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row justify-center space-x-2">
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === 'addCourse' ? 'bg-black' : 'bg-gray-100'
              }`}
              onPress={() => setActiveTab('addCourse')}
            >
              <Text className={`font-medium ${
                activeTab === 'addCourse' ? 'text-white' : 'text-gray-600'
              }`}>
                Add Course
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === 'viewCourse' ? 'bg-black' : 'bg-gray-100'
              }`}
              onPress={() => setActiveTab('viewCourse')}
            >
              <Text className={`font-medium ${
                activeTab === 'viewCourse' ? 'text-white' : 'text-gray-600'
              }`}>
                View Courses
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 mb-8">
          {activeTab === 'addCourse' ? (
            <View className="pt-8">
              <View className="items-center mb-16">
                <Text className="text-4xl font-thin text-black mb-4 tracking-wider">Add Course</Text>
                <View className="w-8 h-px bg-black opacity-40" />
              </View>

              {/* Ultra Clean Form */}
              <View className="space-y-12">

                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
                    01 — Program
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Select Program"
                      placeholderTextColor="#6B7280"
                      className="text-lg text-gray-800 font-light border-b border-gray-200 pb-4 pr-8"
                    />
                    <View className="absolute right-0 top-0">
                      <View className="w-1 h-6 bg-black" />
                    </View>
                  </View>
                </View>


                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
                    02 — Course
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Select Course"
                      placeholderTextColor="#6B7280"
                      className="text-lg text-gray-800 font-light border-b border-gray-200 pb-4 pr-8"
                    />
                    <View className="absolute right-0 top-0">
                      <View className="w-1 h-6 bg-black" />
                    </View>
                  </View>
                </View>
              </View>


              <View className="mt-20">
                <TouchableOpacity className="bg-black py-6 items-center rounded-lg">
                  <Text className="text-white text-sm uppercase tracking-widest font-medium">
                    Add Course
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>

              <View className="flex-row justify-between space-x-4 mb-6">
                <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-black mb-2">12</Text>
                  <Text className="text-sm text-gray-600 font-medium">Total Courses</Text>
                </View>

                <View className="flex-1 bg-black p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-white mb-2">8</Text>
                  <Text className="text-sm text-gray-300 font-medium">Active</Text>
                </View>

                <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-black mb-2">4</Text>
                  <Text className="text-sm text-gray-600 font-medium">Completed</Text>
                </View>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-4">Your Courses</Text>
                
                <View className="space-y-3">
                  
                 
                  {Array.from({ length: 1 }).map((_, index) => (
                    <View key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-800">Course Name Advanced Mathematics</Text>
                          <Text className="text-sm text-gray-500">Course Code • 3 Credits</Text>
                        </View>
                        <View className="bg-gray-100 px-2 py-1 rounded">
                          <Text className="text-xs text-gray-800">Active</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default addcourse