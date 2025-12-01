import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get('window');

// Validation schema using Yup
const eventSchema = yup.object().shape({
  name: yup
    .string()
    .required('Task name is required')
    .min(2, 'Task name must be at least 2 characters')
    .max(100, 'Task name must be less than 100 characters'),
  subject: yup
    .string()
    .required('Subject is required')
    .min(2, 'Subject must be at least 2 characters')
    .max(50, 'Subject must be less than 50 characters'),
  message: yup
    .string()
    .max(500, 'Description must be less than 500 characters'),
  time: yup
    .string()
    .required('Time is required'),
  date: yup
    .string()
    .required('Date is required'),
  category: yup
    .string()
    .oneOf(['assignment', 'quiz', 'class', 'project'], 'Invalid category')
    .required('Category is required'),
  priority: yup
    .string()
    .oneOf(['high', 'medium', 'low'], 'Invalid priority')
    .required('Priority is required'),
});

const EventsPage = () => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [events, setEvents] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    time: '',
    date: '',
    category: 'assignment',
    priority: 'medium',
    subject: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Reset form data and errors
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      message: '',
      time: '',
      date: '',
      category: 'assignment',
      priority: 'medium',
      subject: '',
    });
    setFormErrors({});
  }, []);

  // Validate individual field
  const validateField = useCallback(async (fieldName, value) => {
    try {
      await eventSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      return false;
    }
  }, [formData]);

  // Update form data with validation
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  // Validate entire form
  const validateForm = useCallback(async () => {
    try {
      await eventSchema.validate(formData, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
  }, [formData]);

  // Fetch reminders from the server
  const fetchReminders = async () => {
    try {
            const token = await SecureStore.getItemAsync("accessToken");
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/getreminder`,
         {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      const result = await response.json();
      
      if (result.success) {
        // Transform the data to match our events structure
        const transformedEvents = result.data.map(reminder => ({
          id: reminder.id,
          name: reminder.name,
          message: reminder.message,
          time: reminder.time,
          date: reminder.date,
          category: reminder.category,
          priority: reminder.priority,
          subject: reminder.subject
        }));
        
        setEvents(transformedEvents);
      } else {
        Alert.alert(
          'Error',
          'Failed to fetch reminders',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert(
        'Error',
        'Failed to fetch reminders. Please check your connection.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Handle adding event with validation
  const handleAddEvent = useCallback(async () => {
    const isValid = await validateForm();
    
    if (!isValid) {
      Alert.alert(
        'Validation Error',
        'Please fix the errors in the form before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      
      // Add API call to save the reminder
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/addreminder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          date: formData.date,
          message: formData.message,
          name: formData.name,
          priority: formData.priority,
          subject: formData.subject,
          time: formData.time
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the reminders list
        await fetchReminders();
        
        resetForm();
        setModalVisible(false);
        
        Alert.alert(
          'Success',
          'Task added successfully!',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(result.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert(
        'Error',
        'Failed to add task. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [formData, validateForm, resetForm, fetchReminders]);

  // Close modal with confirmation if form has data
  const handleCloseModal = useCallback(() => {
    const hasData = Object.values(formData).some(value => 
      value !== '' && value !== 'assignment' && value !== 'medium'
    );
    
    if (hasData) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              resetForm();
              setModalVisible(false);
            }
          }
        ]
      );
    } else {
      resetForm();
      setModalVisible(false);
    }
  }, [formData, resetForm]);

  const getCategoryIcon = useCallback((category) => {
    const icons = {
      assignment: <Feather name="book-open" size={24} color={isDark? "#fff": "#000"}/>,
      quiz: <MaterialIcons name="quiz" size={24} color={isDark? "#fff": "#000"} />,
      class: <MaterialIcons name="class" size={24} color={isDark? "#fff": "#000"} />,
      project: <AntDesign name="folder1" size={24} color={isDark? "#fff": "#000"} />,
    };
    return icons[category] || icons.assignment;
  }, [isDark]);

  const formatDate = useCallback((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return 'Overdue';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  }, []);

  const { upcomingCount, overdueCount } = useMemo(() => {
    const today = new Date();
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today;
    }).length;
    
    const overdue = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < today;
    }).length;
    
    return { upcomingCount: upcoming, overdueCount: overdue };
  }, [events]);

  const getPriorityDot = useCallback((priority) => {
    if (priority === 'high') return '●';
    if (priority === 'medium') return '◐';
    return '○';
  }, []);

  const formatDateForDisplay = useCallback((year, month, day) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }, []);

  const generateDateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Error component
  const ErrorText = ({ error }) => {
    if (!error) return null;
    return (
      <Text className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
        {error}
      </Text>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-gray-50'}`} style={{ paddingTop: insets.top }}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Modernistic Header with accent */}
      <View className="px-5 py-8">
        <View className="flex-row justify-between items-center mb-8">
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 28,
                  borderRadius: 2.5,
                  backgroundColor: isDark ? "#ffffff" : "#111827",
                  marginRight: 12,
                }}
              />
              <Text 
                style={{
                  fontSize: 38,
                  fontWeight: "800",
                  color: isDark ? "#ffffff" : "#111827",
                  letterSpacing: -1,
                }}
              >
                Schedule
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 17,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(0, 0, 0, 0.04)",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                alignSelf: "flex-start",
              }}
            >
              <Text 
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  fontWeight: "600",
                }}
              >
                {events.length} tasks • {upcomingCount} upcoming
              </Text>
            </View>
          </View>
          
          {/* Modernistic Floating Add Button */}
          <TouchableOpacity
            style={{
              width: 60,
              height: 60,
              borderRadius: 20,
              backgroundColor: isDark ? "#ffffff" : "#111827",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              transform: [{ rotate: "-5deg" }],
            }}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text 
              style={{
                fontSize: 32,
                fontWeight: "300",
                color: isDark ? "#000000" : "#ffffff",
                transform: [{ rotate: "5deg" }],
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modernistic Stats with glassmorphism */}
        <View className="flex-row space-x-3">
          <View 
            style={{
              flex: 1,
              padding: 24,
              borderRadius: 24,
              backgroundColor: isDark
                ? "rgba(17, 17, 17, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
              borderWidth: isDark ? 1.5 : 1,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 6,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(0, 0, 0, 0.03)",
              }}
            />
            <Text 
              style={{
                fontSize: 40,
                fontWeight: "800",
                color: isDark ? "#ffffff" : "#111827",
                marginBottom: 8,
                letterSpacing: -1,
              }}
            >
              {upcomingCount}
            </Text>
            <Text 
              style={{
                fontSize: 14,
                color: isDark ? "#6b7280" : "#9ca3af",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              Upcoming
            </Text>
          </View>
          <View 
            style={{
              flex: 1,
              padding: 24,
              borderRadius: 24,
              backgroundColor: isDark ? "#ffffff" : "#111827",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: -15,
                left: -15,
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: isDark
                  ? "rgba(0, 0, 0, 0.1)"
                  : "rgba(255, 255, 255, 0.1)",
              }}
            />
            <Text 
              style={{
                fontSize: 40,
                fontWeight: "800",
                color: isDark ? "#000000" : "#ffffff",
                marginBottom: 8,
                letterSpacing: -1,
              }}
            >
              {overdueCount}
            </Text>
            <Text 
              style={{
                fontSize: 14,
                color: isDark ? "#6b7280" : "#d1d5db",
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              Overdue
            </Text>
          </View>
        </View>
      </View>

      {/* Modern Events List */}
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.7}
            style={{
              borderRadius: 20,
              padding: 20,
              marginBottom: 12,
              backgroundColor: isDark ? "#111111" : "#ffffff",
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#1f1f1f" : "transparent",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{getCategoryIcon(event.category)}</Text>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className={`text-lg mr-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      {getPriorityDot(event.priority)}
                    </Text>
                    <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                      {event.name}
                    </Text>
                  </View>
                  <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {event.subject} • {event.category}
                  </Text>
                </View>
              </View>
              
              <View className="items-end">
                <Text className={`text-sm font-mono ${isDark ? 'text-white' : 'text-black'}`}>
                  {event.time}
                </Text>
                <Text className={`text-xs mt-1 ${
                  formatDate(event.date) === 'Overdue' 
                    ? isDark ? 'text-red-400' : 'text-red-600'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatDate(event.date)}
                </Text>
              </View>
            </View>

            {event.message && (
              <Text className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {event.message}
              </Text>
            )}
          </TouchableOpacity>
        ))}
        
        {events.length === 0 && (
          <View 
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 60,
            }}
          >
            <Text style={{ fontSize: 64, marginBottom: 20 }}>📅</Text>
            <Text 
              style={{
                fontSize: 22,
                fontWeight: "600",
                marginBottom: 8,
                color: isDark ? "#ffffff" : "#111827",
              }}
            >
              No tasks yet
            </Text>
            <Text 
              style={{
                fontSize: 16,
                textAlign: "center",
                color: isDark ? "#6b7280" : "#9ca3af",
                paddingHorizontal: 40,
              }}
            >
              Add your first task to get started
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modern Modal with Validation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View 
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View 
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
              minHeight: "85%",
              backgroundColor: isDark ? "#000000" : "#ffffff",
            }}
          >
            
            {/* Modern Modal Header */}
            <View 
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <Text 
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#111827",
                  letterSpacing: -0.5,
                }}
              >
                Add Task
              </Text>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: isDark ? "#111111" : "#f3f4f6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Text 
                  style={{
                    fontSize: 24,
                    color: isDark ? "#ffffff" : "#111827",
                    fontWeight: "300",
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <View className="mb-6">
                <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  Category
                </Text>
                <View className="flex-row flex-wrap">
                  {[
                    { key: 'assignment', label: 'Assignment' },
                    { key: 'quiz', label: 'Quiz' },
                    { key: 'class', label: 'Class' },
                    { key: 'project', label: 'Project' },
                  ].map((category, index) => (
                    <TouchableOpacity
                      key={category.key}
                      className={`py-3 px-4 rounded-xl flex-row items-center mr-2 mb-2 border ${
                        formData.category === category.key
                          ? isDark 
                            ? 'border-white bg-white/10' 
                            : 'border-black bg-black/10'
                          : isDark 
                            ? 'border-black' 
                            : 'border-gray-200'
                      }`}
                      style={{ width: (width - 60) / 3 - 8 }}
                      onPress={() => updateFormData('category', category.key)}
                    >
                      <Text className="text-lg mr-2">{getCategoryIcon(category.key)}</Text>
                      <Text className={`font-medium text-xs ${isDark ? 'text-white' : 'text-black'}`}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={formErrors.category} />
              </View>

              {/* Priority Selection */}
              <View className="mb-6">
                <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
                  Priority
                </Text>
                <View className="flex-row space-x-3">
                  {[
                    { key: 'high', label: 'High' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'low', label: 'Low' },
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      className={`flex-1 py-3 px-4 rounded-xl flex-row items-center justify-center border ${
                        formData.priority === priority.key
                          ? isDark 
                            ? 'border-white bg-white/10' 
                            : 'border-black bg-black/10'
                          : isDark 
                            ? 'border-black' 
                            : 'border-gray-200'
                      }`}
                      onPress={() => updateFormData('priority', priority.key)}
                    >
                      <Text className={`text-lg mr-2 ${isDark ? 'text-white' : 'text-black'}`}>
                        {getPriorityDot(priority.key)}
                      </Text>
                      <Text className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={formErrors.priority} />
              </View>

              {/* Form Fields with Validation */}
              <View className="space-y-4">
                <View>
                  <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Task Name *
                  </Text>
                  <TextInput
                    className={`border rounded-xl px-4 py-4 text-base ${
                      formErrors.name
                        ? isDark 
                          ? 'border-red-400 bg-red-900/20 text-white' 
                          : 'border-red-500 bg-red-50 text-black'
                        : isDark 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-gray-50 text-black'
                    }`}
                    placeholder="Enter task name"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                  />
                  <ErrorText error={formErrors.name} />
                </View>

                <View>
                  <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Subject *
                  </Text>
                  <TextInput
                    className={`border rounded-xl px-4 py-4 text-base ${
                      formErrors.subject
                        ? isDark 
                          ? 'border-red-400 bg-red-900/20 text-white' 
                          : 'border-red-500 bg-red-50 text-black'
                        : isDark 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-gray-50 text-black'
                    }`}
                    placeholder="Enter subject"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={formData.subject}
                    onChangeText={(text) => updateFormData('subject', text)}
                  />
                  <ErrorText error={formErrors.subject} />
                </View>

                <View>
                  <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                    Description
                  </Text>
                  <TextInput
                    className={`border rounded-xl px-4 py-4 text-base h-20 ${
                      formErrors.message
                        ? isDark 
                          ? 'border-red-400 bg-red-900/20 text-white' 
                          : 'border-red-500 bg-red-50 text-black'
                        : isDark 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-gray-50 text-black'
                    }`}
                    placeholder="Enter description (optional)"
                    placeholderTextColor={isDark ? "#666" : "#999"}
                    value={formData.message}
                    onChangeText={(text) => updateFormData('message', text)}
                    multiline={true}
                    textAlignVertical="top"
                  />
                  <ErrorText error={formErrors.message} />
                </View>

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      Time *
                    </Text>
                    <TouchableOpacity
                      className={`border rounded-xl px-4 py-4 flex-row justify-between items-center ${
                        formErrors.time
                          ? isDark 
                            ? 'border-red-400 bg-red-900/20' 
                            : 'border-red-500 bg-red-50'
                          : isDark 
                            ? 'border-black bg-black' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text className={`text-base ${
                        formData.time 
                          ? isDark ? 'text-white' : 'text-black'
                          : isDark ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {formData.time || 'Select time'}
                      </Text>
                      <AntDesign 
                        name="clockcircleo" 
                        size={20} 
                        color={isDark ? "#666" : "#999"} 
                      />
                    </TouchableOpacity>
                    <ErrorText error={formErrors.time} />
                  </View>

                  <View className="flex-1">
                    <Text className={`text-base font-semibold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      Date *
                    </Text>
                    <TouchableOpacity
                      className={`border rounded-xl px-4 py-4 flex-row justify-between items-center ${
                        formErrors.date
                          ? isDark 
                            ? 'border-red-400 bg-red-900/20' 
                            : 'border-red-500 bg-red-50'
                          : isDark 
                            ? 'border-black bg-black' 
                            : 'border-gray-200 bg-gray-50'
                      }`}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text className={`text-base ${
                        formData.date 
                          ? isDark ? 'text-white' : 'text-black'
                          : isDark ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {formData.date || 'Select date'}
                      </Text>
                      <AntDesign 
                        name="calendar" 
                        size={20} 
                        color={isDark ? "#666" : "#999"} 
                      />
                    </TouchableOpacity>
                    <ErrorText error={formErrors.date} />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 pt-8 pb-4">
                <TouchableOpacity
                  className={`flex-1 py-4 px-6 rounded-xl border ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}
                  onPress={handleCloseModal}
                >
                  <Text className={`text-center font-semibold text-base ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-4 px-6 rounded-xl ${
                    isDark ? 'bg-white' : 'bg-black'
                  }`}
                  onPress={handleAddEvent}
                >
                  <Text className={`text-center font-semibold text-base ${
                    isDark ? 'text-black' : 'text-white'
                  }`}>
                    Add Task
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl px-6 py-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Select Time
              </Text>
              <TouchableOpacity
                className={`w-8 h-8 rounded-full justify-center items-center ${
                  isDark ? 'bg-gray-900' : 'bg-gray-100'
                }`}
                onPress={() => setShowTimePicker(false)}
              >
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <View className="space-y-2">
                {[
                  { label: '9:00 AM', value: '9:00 AM' },
                  { label: '10:00 AM', value: '10:00 AM' },
                  { label: '11:00 AM', value: '11:00 AM' },
                  { label: '12:00 PM', value: '12:00 PM' },
                  { label: '1:00 PM', value: '1:00 PM' },
                  { label: '2:00 PM', value: '2:00 PM' },
                  { label: '3:00 PM', value: '3:00 PM' },
                  { label: '4:00 PM', value: '4:00 PM' },
                  { label: '5:00 PM', value: '5:00 PM' },
                  { label: '6:00 PM', value: '6:00 PM' },
                  { label: '7:00 PM', value: '7:00 PM' },
                  { label: '8:00 PM', value: '8:00 PM' },
                  { label: '9:00 PM', value: '9:00 PM' },
                  { label: '10:00 PM', value: '10:00 PM' },
                  { label: '11:00 PM', value: '11:00 PM' },
                  { label: '11:59 PM', value: '11:59 PM' },
                ].map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    className={`py-4 px-4 rounded-xl border ${
                      formData.time === time.value
                        ? isDark 
                          ? 'border-white bg-white/10' 
                          : 'border-black bg-black/10'
                        : isDark 
                          ? 'border-gray-800' 
                          : 'border-gray-200'
                    }`}
                    onPress={() => {
                      updateFormData('time', time.value);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text className={`text-base font-medium text-center ${
                      isDark ? 'text-white' : 'text-black'
                    }`}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className={`rounded-t-3xl px-6 py-6 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Select Date
              </Text>
              <TouchableOpacity
                className={`w-8 h-8 rounded-full justify-center items-center ${
                  isDark ? 'bg-gray-900' : 'bg-gray-100'
                }`}
                onPress={() => setShowDatePicker(false)}
              >
                <Text className={`text-lg ${isDark ? 'text-white' : 'text-black'}`}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              <View className="space-y-2">
                {generateDateOptions.map((date, index) => {
                  const dateStr = formatDateForDisplay(date.getFullYear(), date.getMonth(), date.getDate());
                  const displayText = index === 0 ? 'Today' : 
                                    index === 1 ? 'Tomorrow' : 
                                    date.toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    });
                  
                  return (
                    <TouchableOpacity
                      key={dateStr}
                      className={`py-4 px-4 rounded-xl border ${
                        formData.date === dateStr
                          ? isDark 
                            ? 'border-white bg-white/10' 
                            : 'border-black bg-black/10'
                          : isDark 
                            ? 'border-gray-800' 
                            : 'border-gray-200'
                      }`}
                      onPress={() => {
                        updateFormData('date', dateStr);
                        setShowDatePicker(false);
                      }}
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className={`text-base font-medium ${
                          isDark ? 'text-white' : 'text-black'
                        }`}>
                          {displayText}
                        </Text>
                        <Text className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {dateStr}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventsPage;