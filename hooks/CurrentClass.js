import { useEffect, useState } from "react";

export default function useCurrentClass(timetableString) {
  const [currentClasses, setCurrentClasses] = useState([]);

  useEffect(() => {
    if (!timetableString) return;

    const timetableArray = JSON.parse(timetableString);

    const findCurrentClasses = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      const ongoingClasses = timetableArray.filter(cls =>
        cls.start_time <= currentTime && cls.end_time > currentTime
      );

      setCurrentClasses(ongoingClasses);
     
    };

    findCurrentClasses();
  }, [timetableString]);
console.log(currentClasses);

  return currentClasses;
}
