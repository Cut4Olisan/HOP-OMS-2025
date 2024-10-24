import { DayOfWeek } from "@fluentui/react";

export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const extractTime = (date: Date | undefined): string => {
  if (!date) return "00:00";
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const dateOnly = (date: string): string => {
  return date.split("T")[0];
};

export const formatTime = (time: string): string => {
  return `T${time}:00`;
};

export const calculateEstimatedHours = (
  start: Date | undefined,
  end: Date | undefined
): number | undefined | Error => {
  if (!start || !end) return 0;

  // Extract hours and minutes from start and end times
  const startHours = start.getHours();
  const startMinutes = start.getMinutes();
  const endHours = end.getHours();
  const endMinutes = end.getMinutes();

  // Convert the times to minutes
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Check if the end time is before the start time
  if (endTotalMinutes <= startTotalMinutes) {
    return new Error("Starttidspunkt kan ikke forekomme efter sluttidspunkt");
  }

  // Calculate the difference in minutes and convert to hours
  const diffInMinutes = endTotalMinutes - startTotalMinutes;
  const diffInHours = diffInMinutes / 60;

  // Ensure the result is non-negative
  return Math.max(0, diffInHours);
};

export const getDatesBetween = (
  startDate: Date,
  endDate: Date
): Date[] | Error => {
  if (endDate < startDate) {
    return new Error("Slutdato kan ikke forekomme før startdato");
  }

  const dates = [];
  const currentDate = new Date(startDate);
  //eslint-disable-next-line
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

export const calculateRecurrenceDates = (
  startDate: Date,
  selectedDays: DayOfWeek[],
  weeks: number
): Date[] => {
  const recurrenceDates: Date[] = [];
  const currentDate = new Date(startDate);

  for (let week = 0; week < weeks; week++) {
    selectedDays.forEach((day) => {
      const date = new Date(currentDate);
      date.setDate(
        currentDate.getDate() + ((day - currentDate.getDay() + 7) % 7)
      );
      recurrenceDates.push(new Date(date));
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return recurrenceDates;
};

//used in the booking-overview
export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const firstDayOfWeek = new Date(
    date.setDate(date.getDate() - date.getDay() + 1)
  );
  const lastDayOfWeek = new Date(date.setDate(firstDayOfWeek.getDate() + 6));
  return { start: firstDayOfWeek, end: lastDayOfWeek };
};

export const getWeeksFromDate = (
  startDate: Date
): { start: Date; end: Date; weekNumber: number }[] => {
  const weeks = [];
  for (let i = 0; i < 5; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i * 7);
    const { start, end } = getWeekRange(currentDate);
    weeks.push({ start, end, weekNumber: getWeekNumber(start) });
  }
  return weeks;
};

export const getWeekStartDate = (weekNumber: number): Date => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const startDayOffset = startOfYear.getDay() === 0 ? 1 : 0;
  const daysToAdd = (weekNumber - 1) * 7 - startDayOffset;
  startOfYear.setDate(startOfYear.getDate() + daysToAdd);
  return startOfYear;
};

export const parseTime = (
  timeString: string
): { hour: number; minute: number } => {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute };
};

export const getFormattedDateTimeOfToday = (): Date => {
  const today = new Date();
  today.setMinutes(0, 0, 0);
  return today;
};

export const getFormattedDateTimeOfTomorrow = (): Date => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMinutes(0, 0, 0);
  return tomorrow;
};
