import { ProjectDTO } from "../../interfaces";
import { IRegistration } from "../../interfaces/IRegistrationProps";

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

export const calculateWeeklyHours = (
  startDate: Date,
  endDate: Date,
  bookings: IRegistration[],
  projects: ProjectDTO[],
  selectedEmployees: string[] = [],
  selectedCustomerId?: number,
  selectedProjectId?: number
): number => {
  const filteredBookings = bookings.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    const bookingDate = new Date(booking.date);

    const matchesDateRange = bookingDate >= startDate && bookingDate <= endDate;
    const matchesEmployee =
      selectedEmployees.length === 0 ||
      selectedEmployees.includes(booking.employee);
    const matchesCustomer =
      !selectedCustomerId || project?.customerId === selectedCustomerId;
    const matchesProject =
      !selectedProjectId || booking.projectId === selectedProjectId;
    const matchesRegistrationType = booking.registrationType === 2;

    const isMatch =
      matchesDateRange &&
      matchesEmployee &&
      matchesCustomer &&
      matchesProject &&
      matchesRegistrationType;

    return isMatch;
  });

  const totalHours = filteredBookings.reduce((total, booking) => {
    const bookingTime = booking.time || 0;
    return total + bookingTime;
  }, 0);

  return totalHours;
};
