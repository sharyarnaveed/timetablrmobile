import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const Today = ({ thecurent, Notcurrentclass }) => {
  const [totalength, setlength] = useState(0);
  const [leftlength, setLeftLength] = useState(0);
  const [progress, SetProgress] = useState(0);

  const gettimetabewhoeldata = async () => {
    try {
      const timedata = await SecureStore.getItemAsync("timetable");
      if (timedata) {
        const parsing = JSON.parse(timedata);
        setLeftLength(Notcurrentclass.length);
        setlength(parsing.length);

        const completedClasses = parsing.length - Notcurrentclass.length;
        const progressPercentage =
          parsing.length > 0 ? (completedClasses / parsing.length) * 100 : 0;
        SetProgress(progressPercentage);
        console.log(`Progress: ${progressPercentage.toFixed(2)}%`);
      }
    } catch (error) {
      console.error("Error getting timetable data:", error);
    }
  };

const covertionoftime = (time24) => {
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  useEffect(() => {
    gettimetabewhoeldata();
  }, [thecurent, Notcurrentclass]);

  const multipleCurrent = thecurent.length > 1;
  const singleCurrent = thecurent.length === 1;

  return (
    <>
      {/* Progress and Stats */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between space-x-4">
          <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
            <View className="items-center mb-4">
              <Text className="text-3xl font-bold text-black mb-2">
                {Math.round(progress)}%
              </Text>
              <Text className="text-sm text-gray-600 font-medium">
                Complete
              </Text>
            </View>
            <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <View
                className="bg-black h-3 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <View className="flex-row justify-between w-full mt-2">
              {[0, 25, 50, 75, 100].map((threshold) => (
                <View
                  key={threshold}
                  className={`w-2 h-2 rounded-full ${
                    progress >= threshold ? "bg-black" : "bg-gray-300"
                  }`}
                />
              ))}
            </View>
          </View>

          <View className="flex-1 bg-black p-6 rounded-2xl items-center">
            <Text className="text-3xl font-bold text-white mb-2">
              {totalength}
            </Text>
            <Text className="text-sm text-gray-300 font-medium">Classes</Text>
          </View>

          <View className="flex-1 bg-gray-50 p-6 rounded-2xl items-center">
            <Text className="text-3xl font-bold text-black mb-2">
              {leftlength}
            </Text>
            <Text className="text-sm text-gray-600 font-medium">Left</Text>
          </View>
        </View>
      </View>

      {/* Current Class(es) */}
      {thecurent.length > 0 && (
        <View className="mx-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            {multipleCurrent ? "Current Classes" : "Current Class"}
          </Text>

          <View className="space-y-4">
            {thecurent.map((cls, index) => (
              <View key={index} className="bg-black p-6 rounded-2xl shadow-lg">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold mb-2">
                      {cls.course_name}
                    </Text>
                    <Text className="text-gray-300 text-sm mb-1">
                      📍 {cls.venue}
                    </Text>
                     <Text className="text-gray-300 text-sm">
                     {covertionoftime(cls.start_time)} - {covertionoftime(cls.end_time)}
                    </Text>
                    <Text className="text-gray-300 text-sm">
                      👨‍🏫 {cls.teacher_name}
                    </Text>
                  </View>
                  <View className="bg-white px-4 py-2 rounded-full">
                    <Text className="text-black text-xs font-bold">LIVE</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Upcoming Classes */}
      { Notcurrentclass.length > 0 ? (
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
                   <Text className="text-sm text-gray-500">
                    {classItem.start_time} • {classItem.end_time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : !singleCurrent ? null : (
        <View className="mx-6 mb-36 bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 items-center">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">📚</Text>
          </View>
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            No Next Class
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-4">
            Enjoy your time!
          </Text>
        </View>
      )}
    </>
  );
};

export default Today;
