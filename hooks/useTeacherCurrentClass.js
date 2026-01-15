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

                // Parse time strings and compare (format: "14:00 - 17:00")
                const timeParts = cls.Time?.split('-') || cls.Time?.split(' - ');
                const startTime = timeParts?.[0]?.trim();
                const endTime = timeParts?.[1]?.trim();

                if (!startTime || !endTime) return false;

                return startTime <= currentTime && endTime > currentTime;
            }).map(cls => ({
                // Map teacher data fields to match Today component expectations
                ...cls,
                course_name: cls.Subject || cls.subject_clean || cls.course_name,
                venue: cls.Location || cls.venue,
                start_time: cls.Time?.split('-')[0]?.trim() || cls.Time?.split(' - ')[0]?.trim(),
                end_time: cls.Time?.split('-')[1]?.trim() || cls.Time?.split(' - ')[1]?.trim(),
                teacher_name: cls.program || cls.teacher_name // For teachers, show program instead
            }));

            setCurrentClasses(ongoingClasses);
        };

        findCurrentClasses();
    }, [timetableString]);

    return currentClasses;
}
