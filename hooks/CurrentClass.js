import { useEffect, useState } from "react";

export default function useCurrentClass(timetableString) {
  const [currentClass, setCurrentClass] = useState(null);

  useEffect(() => {
    if (!timetableString) return;

    let timetableArray;

    timetableArray = JSON.parse(timetableString);

    const findCurrentClass = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      for (let cls of timetableArray) {
        if (cls.start_time <= currentTime && cls.end_time > currentTime) {
          setCurrentClass(cls);
          return;
        }
      }

      setCurrentClass(null); // No class currently
    };

    findCurrentClass();
  }, [timetableString]);
console.log("returning data")
  return currentClass;
}
