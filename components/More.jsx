import { Text, View } from 'react-native'

const More = () => {
  return (
<>
  <View className="mx-6 mb-36">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Upcoming Classes
        </Text>

        <View className="space-y-3">
          {[
            {
              subject: "Physics",
              time: "12:30 PM",
              room: "Lab 101",
              type: "Lab",
            },
            {
              subject: "Chemistry",
              time: "2:00 PM",
              room: "Room 305",
              type: "Lecture",
            },
          ].map((classItem, index) => (
            <View
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="font-semibold text-gray-800">
                  {classItem.subject}
                </Text>
                <Text className="text-sm text-gray-500">
                  {classItem.room} • {classItem.type}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-medium text-gray-800">
                  {classItem.time}
                </Text>
                <View className="bg-gray-100 px-2 py-1 rounded mt-1">
                  <Text className="text-xs text-gray-800">
                    {classItem.type}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
</>
  )
}

export default More