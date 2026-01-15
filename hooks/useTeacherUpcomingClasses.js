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

                    // Get start time from the Time field (format: "HH:MM - HH:MM" or "HH:MM-HH:MM")
                    const timeParts = cls.Time?.split('-') || cls.Time?.split(' - ');
                    const startTime = timeParts?.[0]?.trim();

                    if (!startTime) return false;

                    return padTime(startTime) > currentTime;
                })
                .sort((a, b) => {
                    const aStart = padTime(a.Time.split('-')[0].trim() || a.Time.split(' - ')[0].trim());
                    const bStart = padTime(b.Time.split('-')[0].trim() || b.Time.split(' - ')[0].trim());
                    return aStart.localeCompare(bStart);
                })
                .map(cls => ({
                    // Map teacher data fields to match Today component expectations
                    ...cls,
                    course_name: cls.Subject || cls.subject_clean || cls.course_name,
                    venue: cls.Location || cls.venue,
                    start_time: cls.Time?.split('-')[0]?.trim() || cls.Time?.split(' - ')[0]?.trim(),
                    end_time: cls.Time?.split('-')[1]?.trim() || cls.Time?.split(' - ')[1]?.trim(),
                    teacher_name: cls.program || cls.teacher_name // For teachers, show program instead
                }));

            setUpcoming(upcomingClasses);
        };

        filterUpcomingClasses();
    }, [timetableString]);

    return upcoming;
}
