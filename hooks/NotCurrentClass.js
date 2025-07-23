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

      const upcoming = timetableArray
        .filter((cls) => cls.start_time > currentTime)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      setUpcoming(upcoming);
    };

    filterUpcomingClasses();
  }, [timetableString]);
  // console.log("returbning not current",upcoming);
  return upcoming;
}
