import { useState } from 'react'
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

const makeupclass = () => {
  const [activeTab, setActiveTab] = useState('addMakeup')

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 pt-16 pb-8">
          <View className="bg-black rounded-3xl p-6 shadow-lg">
            <View className="items-center">
              <Text className="text-lg font-light text-gray-300">Class Management</Text>
              <Text className="text-2xl font-bold text-white mt-1">Makeup Classes</Text>
              <Text className="text-sm text-gray-400 mt-2">Schedule and track makeup sessions</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-4">
          <View className="flex-row justify-center space-x-2">
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === 'addMakeup' ? 'bg-black' : 'bg-gray-100'
              }`}
              onPress={() => setActiveTab('addMakeup')}
            >
              <Text className={`font-medium ${
                activeTab === 'addMakeup' ? 'text-white' : 'text-gray-600'
              }`}>
                Add Makeup
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`px-6 py-3 rounded-full ${
                activeTab === 'viewMakeup' ? 'bg-black' : 'bg-gray-100'
              }`}
              onPress={() => setActiveTab('viewMakeup')}
            >
              <Text className={`font-medium ${
                activeTab === 'viewMakeup' ? 'text-white' : 'text-gray-600'
              }`}>
                View Makeup
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-6 mb-8">
          {activeTab === 'addMakeup' ? (
            <View className="pt-2  mb-28">
              <View className="items-center mb-6">
                <Text className="text-4xl font-thin text-black mb-4 tracking-wider">Add Makeup</Text>
                <View className="w-8 h-px bg-black opacity-40" />
              </View>

              {/* Ultra Clean Form */}
              <View className="">
                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
                    01 — Course
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

                <View>
                  <Text className="text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">
                    02 — Date
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Select Date"
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
                    03 — Start Time
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Select Start Time"
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
                    04 — End Time
                  </Text>
                  <View className="relative">
                    <TextInput
                      placeholder="Select End Time"
                      placeholderTextColor="#6B7280"
                      className="text-lg text-gray-800 font-light border-b border-gray-200 pb-4 pr-8"
                    />
                    <View className="absolute right-0 top-0">
                      <View className="w-1 h-6 bg-black" />
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-12">
                <TouchableOpacity className="bg-black py-6 items-center rounded-lg">
                  <Text className="text-white text-sm uppercase tracking-widest font-medium">
                    Schedule Makeup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="pb-24 ">
              <View className="flex-row justify-between space-x-4 mb-6">
                <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-black mb-2">5</Text>
                  <Text className="text-sm text-gray-600 font-medium">Total Makeup</Text>
                </View>

                <View className="flex-1 bg-black p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-white mb-2">3</Text>
                  <Text className="text-sm text-gray-300 font-medium">Upcoming</Text>
                </View>

                <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
                  <Text className="text-3xl font-bold text-black mb-2">2</Text>
                  <Text className="text-sm text-gray-600 font-medium">Completed</Text>
                </View>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-4">Makeup Classes</Text>
                
                <View className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text className="font-semibold text-gray-800">Advanced Mathematics</Text>
                          <Text className="text-sm text-gray-500 mt-1">June 30, 2025 • 2:00 PM - 4:00 PM</Text>
                          <Text className="text-xs text-gray-400 mt-1">Room 205, Building A</Text>
                        </View>
                        <View className={`px-2 py-1 rounded ${
                          index === 0 ? 'bg-green-100' : index === 1 ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Text className={`text-xs ${
                            index === 0 ? 'text-green-800' : index === 1 ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {index === 0 ? 'Today' : index === 1 ? 'Upcoming' : 'Completed'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default makeupclass