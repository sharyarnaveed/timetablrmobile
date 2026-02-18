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
import { supabase } from "../../utils/supabase";

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
  const [userRole, setUserRole] = useState(null);

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

  // Theme colors - pure black and white
  const colors = useMemo(() => ({
    bg: isDark ? '#000000' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    textSecondary: isDark ? '#666666' : '#888888',
    textTertiary: isDark ? '#444444' : '#bbbbbb',
    border: isDark ? '#1a1a1a' : '#f0f0f0',
    borderActive: isDark ? '#ffffff' : '#000000',
    cardBg: isDark ? '#0a0a0a' : '#fafafa',
    accent: isDark ? '#ffffff' : '#000000',
    accentText: isDark ? '#000000' : '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.6)',
    error: isDark ? '#ff6b6b' : '#dc2626',
  }), [isDark]);

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

  // Fetch reminders from the server (different logic for students vs teachers)
  const fetchReminders = async (role) => {
    try {
      if (role === "teacher") {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('No active teacher session:', sessionError);
          return;
        }

        const { data, error } = await supabase
          .from('teacher_reminders')
          .select('*')
          .eq('teacher_id', session.user.id)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching teacher reminders:', error);
          Alert.alert('Error', 'Failed to fetch reminders', [{ text: 'OK' }]);
          return;
        }

        const transformedEvents = (data || []).map(reminder => ({
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
          Alert.alert('Error', 'Failed to fetch reminders', [{ text: 'OK' }]);
        }
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert('Error', 'Failed to fetch reminders. Please check your connection.', [{ text: 'OK' }]);
    }
  };

  useEffect(() => {
    const initializeReminders = async () => {
      const role = await SecureStore.getItemAsync("role");
      setUserRole(role);
      fetchReminders(role);
    };
    initializeReminders();
  }, []);

  // Handle adding event with validation
  const handleAddEvent = useCallback(async () => {
    const isValid = await validateForm();

    if (!isValid) {
      Alert.alert('Validation Error', 'Please fix the errors in the form before submitting.', [{ text: 'OK' }]);
      return;
    }

    try {
      const role = await SecureStore.getItemAsync("role");

      if (role === "teacher") {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error('No active teacher session');
        }

        const { error } = await supabase
          .from('teacher_reminders')
          .insert([{
            teacher_id: session.user.id,
            category: formData.category,
            date: formData.date,
            message: formData.message,
            name: formData.name,
            priority: formData.priority,
            subject: formData.subject,
            time: formData.time
          }]);

        if (error) {
          throw new Error(error.message || 'Failed to add task');
        }

        await fetchReminders(role);
        resetForm();
        setModalVisible(false);
        Alert.alert('Success', 'Task added successfully!', [{ text: 'OK' }]);
      } else {
        const token = await SecureStore.getItemAsync("accessToken");

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
          await fetchReminders(role);
          resetForm();
          setModalVisible(false);
          Alert.alert('Success', 'Task added successfully!', [{ text: 'OK' }]);
        } else {
          throw new Error(result.message || 'Failed to add task');
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task. Please try again.', [{ text: 'OK' }]);
    }
  }, [formData, validateForm, resetForm, userRole]);

  // Handle deleting reminder (teachers only)
  const handleDeleteReminder = useCallback(async (reminderId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('teacher_reminders')
                .delete()
                .eq('id', reminderId);

              if (error) {
                throw new Error(error.message || 'Failed to delete task');
              }

              // Refresh the reminders list
              await fetchReminders('teacher');
              Alert.alert('Success', 'Task deleted successfully!', [{ text: 'OK' }]);
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.', [{ text: 'OK' }]);
            }
          }
        }
      ]
    );
  }, []);

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
    const iconColor = colors.text;
    const icons = {
      assignment: <Feather name="book-open" size={18} color={iconColor} />,
      quiz: <MaterialIcons name="quiz" size={18} color={iconColor} />,
      class: <MaterialIcons name="class" size={18} color={iconColor} />,
      project: <AntDesign name="folderopen" size={18} color={iconColor} />,
    };
    return icons[category] || icons.assignment;
  }, [colors]);

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
      <Text style={{ fontSize: 12, marginTop: 4, color: colors.error }}>
        {error}
      </Text>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Minimal Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '300',
              color: colors.text,
              letterSpacing: -1,
              marginBottom: 8,
            }}>
              Tasks
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              fontWeight: '400',
              letterSpacing: 0.5,
            }}>
              {events.length} total · {upcomingCount} upcoming
            </Text>
          </View>

          {/* Minimal Add Button */}
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 24,
              fontWeight: '300',
              color: colors.accentText,
              marginTop: -2,
            }}>
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
          <View style={{
            flex: 1,
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 16,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '300',
              color: colors.text,
              marginBottom: 4,
            }}>
              {upcomingCount}
            </Text>
            <Text style={{
              fontSize: 12,
              color: colors.textSecondary,
              fontWeight: '500',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Upcoming
            </Text>
          </View>

          <View style={{
            flex: 1,
            paddingVertical: 20,
            paddingHorizontal: 20,
            borderRadius: 16,
            backgroundColor: colors.accent,
          }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '300',
              color: colors.accentText,
              marginBottom: 4,
            }}>
              {overdueCount}
            </Text>
            <Text style={{
              fontSize: 12,
              color: isDark ? '#666666' : '#999999',
              fontWeight: '500',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Overdue
            </Text>
          </View>
        </View>
      </View>

      {/* Task List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {events.map((event) => (
          <TouchableOpacity
            key={event.id}
            activeOpacity={0.6}
            style={{
              borderRadius: 16,
              padding: 20,
              marginBottom: 12,
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: event.priority === 'high' ? colors.text :
                      event.priority === 'medium' ? colors.textSecondary : colors.textTertiary,
                    marginRight: 10,
                  }} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}>
                    {event.name}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginLeft: 16,
                }}>
                  {event.subject}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    fontSize: 13,
                    color: colors.text,
                    fontFamily: 'monospace',
                    letterSpacing: -0.5,
                  }}>
                    {event.time}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: formatDate(event.date) === 'Overdue' ? colors.error : colors.textSecondary,
                  }}>
                    {formatDate(event.date)}
                  </Text>
                </View>

                {/* Delete button - Teachers only */}
                {userRole === 'teacher' && (
                  <TouchableOpacity
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: colors.border,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => handleDeleteReminder(event.id)}
                    activeOpacity={0.6}
                  >
                    <Feather name="trash-2" size={14} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {event.message && (
              <Text style={{
                fontSize: 13,
                lineHeight: 20,
                color: colors.textSecondary,
                marginTop: 12,
                marginLeft: 16,
              }}>
                {event.message}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {events.length === 0 && (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 80,
          }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.cardBg,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Feather name="calendar" size={24} color={colors.textSecondary} />
            </View>
            <Text style={{
              fontSize: 18,
              fontWeight: '400',
              marginBottom: 8,
              color: colors.text,
            }}>
              No tasks yet
            </Text>
            <Text style={{
              fontSize: 14,
              textAlign: 'center',
              color: colors.textSecondary,
              paddingHorizontal: 40,
            }}>
              Tap + to add your first task
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <View style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
            minHeight: '85%',
            backgroundColor: colors.bg,
          }}>
            {/* Modal Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: '300',
                color: colors.text,
                letterSpacing: -0.5,
              }}>
                New Task
              </Text>
              <TouchableOpacity
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleCloseModal}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: 18,
                  color: colors.textSecondary,
                  fontWeight: '300',
                }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.textSecondary,
                  marginBottom: 12,
                }}>
                  Category
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { key: 'assignment', label: 'Assignment' },
                    { key: 'quiz', label: 'Quiz' },
                    { key: 'class', label: 'Class' },
                    { key: 'project', label: 'Project' },
                  ].map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: formData.category === category.key ? colors.borderActive : colors.border,
                        backgroundColor: formData.category === category.key ? (isDark ? '#111' : '#f5f5f5') : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                      onPress={() => updateFormData('category', category.key)}
                    >
                      {getCategoryIcon(category.key)}
                      <Text style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: colors.text,
                      }}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={formErrors.category} />
              </View>

              {/* Priority Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.textSecondary,
                  marginBottom: 12,
                }}>
                  Priority
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { key: 'high', label: 'High' },
                    { key: 'medium', label: 'Medium' },
                    { key: 'low', label: 'Low' },
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: formData.priority === priority.key ? colors.borderActive : colors.border,
                        backgroundColor: formData.priority === priority.key ? (isDark ? '#111' : '#f5f5f5') : 'transparent',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                      onPress={() => updateFormData('priority', priority.key)}
                    >
                      <View style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: priority.key === 'high' ? colors.text :
                          priority.key === 'medium' ? colors.textSecondary : colors.textTertiary,
                      }} />
                      <Text style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: colors.text,
                      }}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <ErrorText error={formErrors.priority} />
              </View>

              {/* Form Fields */}
              <View style={{ gap: 20 }}>
                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: colors.textSecondary,
                    marginBottom: 10,
                  }}>
                    Task Name
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      borderColor: formErrors.name ? colors.error : colors.border,
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                    }}
                    placeholder="Enter task name"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.name}
                    onChangeText={(text) => updateFormData('name', text)}
                  />
                  <ErrorText error={formErrors.name} />
                </View>

                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: colors.textSecondary,
                    marginBottom: 10,
                  }}>
                    Subject
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      borderColor: formErrors.subject ? colors.error : colors.border,
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                    }}
                    placeholder="Enter subject"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.subject}
                    onChangeText={(text) => updateFormData('subject', text)}
                  />
                  <ErrorText error={formErrors.subject} />
                </View>

                <View>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: colors.textSecondary,
                    marginBottom: 10,
                  }}>
                    Description
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 15,
                      height: 80,
                      borderColor: formErrors.message ? colors.error : colors.border,
                      backgroundColor: colors.cardBg,
                      color: colors.text,
                    }}
                    placeholder="Enter description (optional)"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.message}
                    onChangeText={(text) => updateFormData('message', text)}
                    multiline={true}
                    textAlignVertical="top"
                  />
                  <ErrorText error={formErrors.message} />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: colors.textSecondary,
                      marginBottom: 10,
                    }}>
                      Time
                    </Text>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderColor: formErrors.time ? colors.error : colors.border,
                        backgroundColor: colors.cardBg,
                      }}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text style={{
                        fontSize: 15,
                        color: formData.time ? colors.text : colors.textTertiary,
                      }}>
                        {formData.time || 'Select'}
                      </Text>
                      <Feather name="clock" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <ErrorText error={formErrors.time} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: colors.textSecondary,
                      marginBottom: 10,
                    }}>
                      Date
                    </Text>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderColor: formErrors.date ? colors.error : colors.border,
                        backgroundColor: colors.cardBg,
                      }}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{
                        fontSize: 15,
                        color: formData.date ? colors.text : colors.textTertiary,
                      }}>
                        {formData.date || 'Select'}
                      </Text>
                      <Feather name="calendar" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <ErrorText error={formErrors.date} />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, paddingTop: 32, paddingBottom: 20 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: 'transparent',
                  }}
                  onPress={handleCloseModal}
                >
                  <Text style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: 15,
                    color: colors.text,
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    backgroundColor: colors.accent,
                  }}
                  onPress={handleAddEvent}
                >
                  <Text style={{
                    textAlign: 'center',
                    fontWeight: '500',
                    fontSize: 15,
                    color: colors.accentText,
                  }}>
                    Add Task
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Time Picker Overlay */}
            {showTimePicker && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.overlay,
                justifyContent: 'flex-end',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <View style={{
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 24,
                  backgroundColor: colors.bg,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '400', color: colors.text }}>
                      Select Time
                    </Text>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.cardBg,
                        borderWidth: 1,
                        borderColor: colors.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={{ fontSize: 16, color: colors.textSecondary }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 6 }}>
                      {[
                        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
                        '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM',
                        '9:00 PM', '10:00 PM', '11:00 PM', '11:59 PM',
                      ].map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={{
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: formData.time === time ? colors.borderActive : colors.border,
                            backgroundColor: formData.time === time ? (isDark ? '#111' : '#f5f5f5') : 'transparent',
                          }}
                          onPress={() => {
                            updateFormData('time', time);
                            setShowTimePicker(false);
                          }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: '500', textAlign: 'center', color: colors.text }}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Date Picker Overlay */}
            {showDatePicker && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: colors.overlay,
                justifyContent: 'flex-end',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              }}>
                <View style={{
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  paddingHorizontal: 24,
                  paddingVertical: 24,
                  backgroundColor: colors.bg,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '400', color: colors.text }}>
                      Select Date
                    </Text>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.cardBg,
                        borderWidth: 1,
                        borderColor: colors.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={{ fontSize: 16, color: colors.textSecondary }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 6 }}>
                      {generateDateOptions.map((date, index) => {
                        const dateStr = formatDateForDisplay(date.getFullYear(), date.getMonth(), date.getDate());
                        const displayText = index === 0 ? 'Today' :
                          index === 1 ? 'Tomorrow' :
                            date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            });

                        return (
                          <TouchableOpacity
                            key={dateStr}
                            style={{
                              paddingVertical: 14,
                              paddingHorizontal: 16,
                              borderRadius: 10,
                              borderWidth: 1,
                              borderColor: formData.date === dateStr ? colors.borderActive : colors.border,
                              backgroundColor: formData.date === dateStr ? (isDark ? '#111' : '#f5f5f5') : 'transparent',
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                            onPress={() => {
                              updateFormData('date', dateStr);
                              setShowDatePicker(false);
                            }}
                          >
                            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                              {displayText}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                              {dateStr}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EventsPage;