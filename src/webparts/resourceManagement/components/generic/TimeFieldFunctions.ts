export interface IDropDownValues {
  key: number;
  text: string;
}

export const generateTimeIntervals = (): IDropDownValues[] => {
  const intervals: IDropDownValues[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const key = hour * 60 + minute;
      const text = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      intervals.push({ key, text });
    }
  }
  return intervals;
};

export const formatInputValue = (value: string): string => {
  const cleanedValue = value.replace(/[^0-9]/g, "");
  if (cleanedValue.length <= 2) {
    return cleanedValue;
  } else {
    return `${cleanedValue.slice(0, 2)}:${cleanedValue.slice(2, 4)}`;
  }
};

export const roundToNearest15Minutes = (
  hours: number,
  minutes: number
): string => {
  const totalMinutes = hours * 60 + minutes;
  const roundedMinutes = Math.round(totalMinutes / 15) * 15;
  const roundedHours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;
  return `${roundedHours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};

export const findClosestInterval = (
  value: string,
  intervals: IDropDownValues[]
): IDropDownValues => {
  const [inputHour, inputMinute] = value.split(":").map(Number);

  // Handle cases where only hours are provided
  const hourOnlyInput = value.length <= 2;

  if (hourOnlyInput) {
    // Find the closest hour match, returning the first 15-minute interval of that hour
    const closestHour = intervals.find((interval) =>
      interval.text.startsWith(`${inputHour.toString().padStart(2, "0")}:00`)
    );
    return closestHour || intervals[0]; // Fallback to the first interval if none found
  } else {
    // Handle cases where both hour and minutes are provided
    const roundedValue = roundToNearest15Minutes(inputHour, inputMinute);
    const closestInterval = intervals.find(
      (interval) => interval.text === roundedValue
    );
    return closestInterval || intervals[0]; // Fallback to the first interval if none found
  }
};
