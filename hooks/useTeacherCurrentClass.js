import { useEffect, useState } from "react";

// Map abbreviated day to full day name
const dayAbbrevToFull = {
    'Mo': 'Monday',
    'Tu': 'Tuesday',
    'We': 'Wednesday',
    'Th': 'Thursday',
    'Fr': 'Friday',
    'Sa': 'Saturday',
    'Su': 'Sunday'
};

export default function useTeacherCurrentClass(timetableString) {
    const [currentClasses, setCurrentClasses] = useState([]);

    useEffect(() => {
        if (!timetableString) return;

        const timetableArray = JSON.parse(timetableString);

        const findCurrentClasses = () => {
            const now = new Date();
            const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;

            // Filter classes for today and current time
            const ongoingClasses = timetableArray.filter(cls => {
                // Convert abbreviated day to full day name
                const classDay = dayAbbrevToFull[cls.Day] || cls.Day;

                // Check if the class is today
                if (classDay !== dayName) return false;

                // Parse time strings and compare (format: "9:00 - 12:00" or "14:00 - 17:00")
                // Try " - " format first (with spaces), then "-" format
                let timeParts = cls.Time?.split(' - ');
                if (!timeParts || timeParts.length !== 2) {
                    timeParts = cls.Time?.split('-');
                }
                const startTime = timeParts?.[0]?.trim();
                const endTime = timeParts?.[1]?.trim();

                if (!startTime || !endTime) return false;

                // Pad times to ensure proper comparison (e.g., "9:00" -> "09:00")
                const padTime = (timeStr) => {
                    const [h, m] = timeStr.split(":");
                    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
                };

                const paddedStart = padTime(startTime);
                const paddedEnd = padTime(endTime);
                const paddedCurrent = padTime(currentTime);

                return paddedStart <= paddedCurrent && paddedEnd > paddedCurrent;
            }).map(cls => {
                // Parse time properly
                let timeParts = cls.Time?.split(' - ');
                if (!timeParts || timeParts.length !== 2) {
                    timeParts = cls.Time?.split('-');
                }
                const startTime = timeParts?.[0]?.trim() || '';
                const endTime = timeParts?.[1]?.trim() || '';

                return {
                    // Map teacher data fields to match Today component expectations
                    ...cls,
                    course_name: cls.subject_clean || cls.Subject || cls.course_name,
                    venue: cls.Location || cls.venue || 'TBA',
                    start_time: startTime,
                    end_time: endTime,
                    teacher_name: cls.teacher_name || cls.program || 'TBA'
                };
            });

            setCurrentClasses(ongoingClasses);
        };

        findCurrentClasses();
    }, [timetableString]);

    return currentClasses;
}
