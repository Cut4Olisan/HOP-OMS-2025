// Function to get the date object from the booking date string
export const getBookingDate = (bookingDate: string): Date => {
  return new Date(bookingDate);
};

// Helper function to calculate the top offset based on start time
export const calculateTopOffset = (start: string): number => {
  const startParts = start.split(":").map(Number);
  return (startParts[1] / 60) * 100; // Convert minutes to a percentage for offset
};

// Helper function to calculate the duration of a booking in timeslots
export const calculateSpan = (start: string, end: string): number => {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  const durationInMinutes = endMinutes - startMinutes;
  return Math.ceil(durationInMinutes / 15); // Each timeslot represents 15 minutes
};

export const getWeekStartDate = (weekNumber: number): Date => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const startDayOffset = startOfYear.getDay() === 0 ? 1 : 0;
  const daysToAdd = (weekNumber - 1) * 7 - startDayOffset;
  startOfYear.setDate(startOfYear.getDate() + daysToAdd);
  return startOfYear;
};

export const capitalize = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const formatEmployeeName = (email: string): string => {
  const nameParts = email.split("@")[0].split(".");
  return nameParts.map(capitalize).join(" ");
};
