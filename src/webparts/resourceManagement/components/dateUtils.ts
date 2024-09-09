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

export const calculateEstimatedHours = (
  start: Date | undefined,
  end: Date | undefined
): number | undefined => {
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
    alert("Starttidspunkt kan ikke forekomme efter sluttidspunkt");
    return;
  }

  // Calculate the difference in minutes and convert to hours
  const diffInMinutes = endTotalMinutes - startTotalMinutes;
  const diffInHours = diffInMinutes / 60;

  // Ensure the result is non-negative
  return Math.max(0, diffInHours);
};

export const getDatesBetween = (startDate: Date, endDate: Date): Date[]|undefined => {
  if (endDate < startDate) {
      alert("Slutdato kan ikke forekomme før startdato");
      return 
  }

  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
