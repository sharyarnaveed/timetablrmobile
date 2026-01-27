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

export default function useTeacherUpcomingClasses(timetableString) {
    const [upcoming, setUpcoming] = useState([]);

    useEffect(() => {
        if (!timetableString) return;

        let timetableArray = JSON.parse(timetableString);

        const filterUpcomingClasses = () => {
            const now = new Date();
            const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;

            const padTime = (timeStr) => {
                // Handles "9:00" -> "09:00"
                const [h, m] = timeStr.split(":");
                return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
            };

            // Filter classes for today that haven't started yet
            const upcomingClasses = timetableArray
                .filter((cls) => {
                    // Convert abbreviated day to full day name
                    const classDay = dayAbbrevToFull[cls.Day] || cls.Day;

                    // Check if the class is today
                    if (classDay !== dayName) return false;

                    // Get start time from the Time field (format: "9:00 - 12:00" or "14:00 - 17:00")
                    // Try " - " format first (with spaces), then "-" format
                    let timeParts = cls.Time?.split(' - ');
                    if (!timeParts || timeParts.length !== 2) {
                        timeParts = cls.Time?.split('-');
                    }
                    const startTime = timeParts?.[0]?.trim();

                    if (!startTime) return false;

                    return padTime(startTime) > currentTime;
                })
                .sort((a, b) => {
                    let aParts = a.Time?.split(' - ');
                    if (!aParts || aParts.length !== 2) {
                        aParts = a.Time?.split('-');
                    }
                    let bParts = b.Time?.split(' - ');
                    if (!bParts || bParts.length !== 2) {
                        bParts = b.Time?.split('-');
                    }
                    const aStart = padTime(aParts?.[0]?.trim() || '');
                    const bStart = padTime(bParts?.[0]?.trim() || '');
                    return aStart.localeCompare(bStart);
                })
                .map(cls => {
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

            setUpcoming(upcomingClasses);
        };

        filterUpcomingClasses();
    }, [timetableString]);

    return upcoming;
}
