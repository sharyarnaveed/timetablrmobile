import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const More = () => {
  const [selectedDay, setSelectedDay] = useState('Monday')

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const [scheduleData,SetScheduledata] = useState([])


const getalltimetable=async()=>
{
        const token = await SecureStore.getItemAsync("accessToken");
  console.log(token)
  try {
    const responce=await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/user/alltimetable`,{
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
    )
    console.log(responce.data);
    SetScheduledata(responce.data.timetable)
   


  } catch (error) {
    console.log("error in getiing timetable",error);
    
  }
}

 const covertionoftime = (time24) => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

useEffect(()=>
{
  console.log("in use");
  
  getalltimetable()

},[])
    const filterredschedule=scheduleData.filter(item=>item.day===selectedDay)


  return (
    <View className="flex-1 bg-gray-50 mb-36">
      {/* Header */}
      <View className="bg-white px-6 pt-4 pb-2 shadow-sm">
        
        {/* Day Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row space-x-2">
            {days.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(fullDays[index])}
                className={`px-6 py-3 rounded-full ${
                  selectedDay === fullDays[index] 
                    ? 'bg-gray-900' 
                    : 'bg-gray-100'
                }`}
              >
                <Text className={`font-medium ${
                  selectedDay === fullDays[index] 
                    ? 'text-white' 
                    : 'text-gray-600'
                }`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Schedule Cards */}
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="space-y-4">
          {filterredschedule.length > 0 ? (
            filterredschedule.map((classItem, index) => (
              <View
                key={index}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="text-md font-semibold text-gray-900 mb-1">
                      {classItem.course_name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {classItem.venue}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-gray-900">
                      {covertionoftime(classItem.start_time)}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {classItem.duration}
                    </Text>
                  </View>
                </View>

              </View>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 items-center">
              <Text className="text-gray-500 text-center">
                No classes scheduled for {selectedDay}
              </Text>
              <Text className="text-sm text-gray-400 mt-2">
                Enjoy your free day! 🎉
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default More