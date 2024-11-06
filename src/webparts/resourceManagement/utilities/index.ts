import { RegistrationDTO } from "../components/interfaces";

import * as DateUtilities from "./DateUtilities";

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

export const capitalize = (word: string): string => {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const formatEmployeeName = (email: string): string => {
  const nameParts = email.split("@")[0].split(".");
  return nameParts.map(capitalize).join(" ");
};

export const calculateBurndownRate = (
  registrations: RegistrationDTO[]
): number => {
  // Sample calculation logic for burndown rate
  const totalPlannedHours = 100; // Placeholder value
  const actualSpentHours = registrations.reduce(
    (sum, reg) => sum + (reg.time ?? 0),
    0
  );
  const percentageRemaining =
    ((totalPlannedHours - actualSpentHours) / totalPlannedHours) * 100;
  return Math.max(0, Math.min(100, percentageRemaining));
};

export const dateUtilities = DateUtilities;
