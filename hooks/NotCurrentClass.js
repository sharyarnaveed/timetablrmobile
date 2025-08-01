import { useEffect, useState } from "react";

export default function useupcomingClasses(timetableString) {
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (!timetableString) return;

    let timetableArray = JSON.parse(timetableString);

    const filterUpcomingClasses = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      const padTime = (timeStr) => {
        // Handles "9:00" -> "09:00"
        const [h, m] = timeStr.split(":");
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
      };

      const upcoming = timetableArray
        .filter((cls) => padTime(cls.start_time) > currentTime)
        .sort((a, b) => padTime(a.start_time).localeCompare(padTime(b.start_time)));
      setUpcoming(upcoming);
    };

    filterUpcomingClasses();
  }, [timetableString]);
  // console.log("returbning not current",upcoming);
  return upcoming;
}
