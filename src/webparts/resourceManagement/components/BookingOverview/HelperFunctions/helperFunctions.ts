import { ProjectDTO, RegistrationDTO } from "../../interfaces";

// Function to get the date object from the booking date string
export const getBookingDate = (bookingDate: string): Date => {
  return new Date(bookingDate);
};

// Helper function to calculate the top offset based on start time
export const calculateTopOffset = (start: string): number => {
  const [hours, minutes] = start.split(":").map(Number);

  // Calculate the number of 15-minute blocks since the start of the day
  const totalBlocks = hours * 4 + Math.floor(minutes / 15);

  // Each block is 15px high, so the top offset is simply the number of blocks * 15px
  return totalBlocks * 15;
};

// Helper function to calculate the duration of a booking in timeslots
export const calculateSpan = (start: string, end: string): number => {
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);

  // Convert start and end times to total minutes
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Calculate duration in minutes and return the span in 15-minute blocks
  const durationInMinutes = endTotalMinutes - startTotalMinutes;
  return Math.ceil(durationInMinutes / 15); // Return the number of 15-minute slots
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
  bookings: RegistrationDTO[],
  projects: ProjectDTO[],
  selectedEmployees: string[] = [],
  selectedCustomerId?: number,
  selectedProjectId?: number
): number => {
  const filteredBookings = bookings.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    const bookingDate = new Date(booking.date ?? "");

    const matchesDateRange = bookingDate >= startDate && bookingDate <= endDate;
    const matchesEmployee =
      selectedEmployees.length === 0 ||
      selectedEmployees.includes(booking.employee ?? "");
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
