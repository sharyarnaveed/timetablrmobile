import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const Today = ({ thecurent, Notcurrentclass }) => {

const [totalength,setlength]=useState(0)
const [leftlength,setLeftLength]=useState(0)
const [progress,SetProgress]=useState(0)
  const covertionoftime = (time24) => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };


async function gettimetabewhoeldata(){
  const timedata= await SecureStore.getItemAsync("timetable")
  const parsing=JSON.parse(timedata)
  setLeftLength(Notcurrentclass.length)
  setlength(parsing.length)

  
  const completedClasses = parsing.length - Notcurrentclass.length;
  const progressPercentage = parsing.length > 0 ? (completedClasses / parsing.length) * 100 : 0;
  SetProgress(progressPercentage)
  console.log(`Progress: ${progressPercentage.toFixed(2)}%`);
}


useEffect(()=>{
gettimetabewhoeldata()
},[Notcurrentclass])

  return (
    <>
      <View className="px-6 mb-8">
        <View className="flex-row justify-between space-x-4">
          {/* Progress Card */}
          <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
            <View className="items-center mb-4">
              <Text className="text-3xl font-bold text-black mb-2">
                {Math.round(progress)}%
              </Text>
              <Text className="text-sm text-gray-600 font-medium">Complete</Text>
            </View>
            
            {/* Beautiful Progress Bar */}
            <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <View 
                className="bg-gradient-to-r from-black to-gray-700 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </View>
            
            {/* Progress Indicator Dots */}
            <View className="flex-row justify-between w-full mt-2">
              <View className={`w-2 h-2 rounded-full ${progress > 0 ? 'bg-black' : 'bg-gray-300'}`} />
              <View className={`w-2 h-2 rounded-full ${progress > 25 ? 'bg-black' : 'bg-gray-300'}`} />
              <View className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-black' : 'bg-gray-300'}`} />
              <View className={`w-2 h-2 rounded-full ${progress > 75 ? 'bg-black' : 'bg-gray-300'}`} />
              <View className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-black' : 'bg-gray-300'}`} />
            </View>
          </View>

          {/* Classes Card */}
          <View className="flex-1 bg-black p-6 rounded-2xl items-center">
            <Text className="text-3xl font-bold text-white mb-2">{totalength}</Text>
            <Text className="text-sm text-gray-300 font-medium">Classes</Text>
          </View>

          {/* Remaining Card */}
          <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
            <Text className="text-3xl font-bold text-black mb-2">{leftlength}</Text>
            <Text className="text-sm text-gray-600 font-medium">Left</Text>
          </View>
        </View>
      </View>

      {/* Current Class Section */}
      <View className="mx-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            Current Class
          </Text>
          {thecurent && (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-medium">● LIVE</Text>
            </View>
          )}
        </View>

        {thecurent ? (
          <View className="bg-black p-6 rounded-2xl shadow-lg">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-2">
                  {thecurent.course_name}
                </Text>
                <Text className="text-gray-300 text-sm mb-1">
                  📍 {thecurent.venue}
                </Text>
                <Text className="text-gray-300 text-sm">
                  👨‍🏫 {thecurent.teacher_name}
                </Text>
              </View>
              <View className="bg-white px-4 py-2 rounded-full">
                <Text className="text-black text-xs font-bold">LIVE</Text>
              </View>
            </View>

            <View className="bg-gray-800 p-4 rounded-xl">
              <Text className="text-white font-medium text-center">
                {covertionoftime(thecurent.start_time)} - {covertionoftime(thecurent.end_time)}
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-gray-50 p-8 rounded-2xl border border-gray-200 items-center">
            <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">📚</Text>
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2">
              No Class Right Now
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-4">
              Enjoy your free time! Your next class will appear here when it's time.
            </Text>
            <View className="bg-white px-4 py-2 rounded-full border border-gray-300">
              <Text className="text-gray-600 font-medium text-sm">
                ✨ Free Time
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Upcoming Classes */}
      {Notcurrentclass ? (
        <View className="mx-6 mb-36">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Classes
          </Text>

          <View className="space-y-3">
            {Notcurrentclass.map((classItem, index) => (
              <View
                key={index}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center"
              >
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    {classItem.course_name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {classItem.venue} • {classItem.teacher_name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-medium text-gray-800">
                    {covertionoftime(classItem.start_time)} -{" "}
                    {covertionoftime(classItem.end_time)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">📚</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            No Class Right Now
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            Enjoy your free time! Your next class will appear here when it's
            time.
          </Text>
          <View className="bg-white px-4 py-2 rounded-full border border-blue-200">
            <Text className="text-blue-600 font-medium text-sm">
              ✨ Free Time
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default Today;
