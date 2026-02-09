import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

/**
 * Storage adapter for Supabase auth.
 * - When localStorage is available (web browser): use localStorage.
 * - Otherwise: use AsyncStorage (React Native); if it throws, use in-memory fallback.
 *
 * Note: In React Native, `window` is defined but `window.localStorage` is NOT,
 * so we must check for localStorage directly, not just `window`.
 */
const memoryFallback = {};
const hasLocalStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const supabaseStorage = {
    getItem: async (key) => {
        if (hasLocalStorage) {
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        }
        try {
            return await AsyncStorage.getItem(key);
        } catch {
            return memoryFallback[key] ?? null;
        }
    },
    setItem: async (key, value) => {
        if (hasLocalStorage) {
            try {
                window.localStorage.setItem(key, value);
            } catch {}
            return;
        }
        try {
            await AsyncStorage.setItem(key, value);
        } catch {
            memoryFallback[key] = value;
        }
    },
    removeItem: async (key) => {
        if (hasLocalStorage) {
            try {
                window.localStorage.removeItem(key);
            } catch {}
            return;
        }
        try {
            await AsyncStorage.removeItem(key);
        } catch {
            delete memoryFallback[key];
        }
    },
};

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_KEY,
    {
        auth: {
            storage: supabaseStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
        realtime: {
            enabled: false,
        },
    }
);

/**
 * Get teacher metadata (name) from the current Supabase session
 * @returns {Promise<string|null>} Teacher name or null if not found
 */
export async function getTeacherMetadata() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            console.error('No active teacher session:', error);
            return null;
        }

        // Get teacher name from user metadata
        const teacherName = session.user?.user_metadata?.teacher_name;

        if (!teacherName) {
            console.error('Teacher name not found in session metadata');
            return null;
        }

        return teacherName;
    } catch (error) {
        console.error('Error getting teacher metadata:', error);
        return null;
    }
}

/**
 * Convert full day name to abbreviated format used in database
 * @param {string} fullDay - Full day name (e.g., "Monday", "Friday")
 * @returns {string} Abbreviated day (e.g., "mo", "fri")
 */
function convertDayToAbbrev(fullDay) {
    const dayMap = {
        'Monday': 'Mo',
        'Tuesday': 'Tu',
        'Wednesday': 'We',
        'Thursday': 'Th',
        'Friday': 'Fr',
        'Saturday': 'sa',
        'Sunday': 'su'
    };
    return dayMap[fullDay] || fullDay.toLowerCase().substring(0, 2);
}

/**
 * Fetch teacher timetable data from Supabase
 * @param {string} teacherName - The teacher's name
 * @param {string} day - The day of the week (e.g., "Monday")
 * @returns {Promise<Array>} Array of timetable entries
 */
export async function getTeacherTimetable(teacherName, day) {
    try {
        const abbreviatedDay = convertDayToAbbrev(day);
        console.log("[TEACHER] Fetching timetable for:", teacherName, "Day:", day, "->", abbreviatedDay);

        const { data, error } = await supabase
            .from('teachersdata')
            .select('*')
            .eq('teacher_name', teacherName)
            .eq('Day', abbreviatedDay);
        console.log("[TEACHER] Timetable data:", data);

        if (error) {
            console.error('Error fetching teacher timetable:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getTeacherTimetable:', error);
        return [];
    }
}

/**
 * Fetch all teacher timetable data for the week
 * @param {string} teacherName - The teacher's name
 * @returns {Promise<Array>} Array of all timetable entries for the week
 */
export async function getTeacherWeekTimetable(teacherName) {
    try {
        const { data, error } = await supabase
            .from('teachersdata')
            .select('*')
            .eq('teacher_name', teacherName);
        // console.log(data);

        if (error) {
            console.error('Error fetching teacher week timetable:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getTeacherWeekTimetable:', error);
        return [];
    }
}
