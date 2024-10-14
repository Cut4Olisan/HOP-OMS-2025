import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Text, PrimaryButton } from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./WeeklyView.module.scss";
import { IRegistration } from "../../interfaces/IRegistrationProps";
import BackEndService from "../../../services/BackEnd";
import { getWeekNumber } from "../../dateUtils";
import { Button } from "@fluentui/react-components";
import {
  calculateTopOffset,
  calculateSpan,
  getWeekStartDate,
  formatEmployeeName,
} from "../HelperFunctions/helperFunctions";
import TimeSlot from "./TimeSlot";
import { EditRegistrationRequestDTO } from "../../interfaces";

interface WeeklyViewProps {
  weekNumber: string;
  employeeId: string;
  weekBookings: IRegistration[];
  employeeName: string;
  onBack: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  projects: any[];
  customers: any[];
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  weekNumber,
  employeeId,
  employeeName,
  onBack,
  onPreviousWeek,
  onNextWeek,
  projects,
  customers,
}): JSX.Element => {
  const formattedEmployeeName = formatEmployeeName(employeeName);
  const [currentBookings, setCurrentBookings] = React.useState<IRegistration[]>(
    []
  );
  const [currentWeekNumber, setCurrentWeekNumber] = React.useState<number>(
    parseInt(weekNumber, 10)
  );
  const [startOfWeek, setStartOfWeek] = React.useState<Date>(
    getWeekStartDate(currentWeekNumber)
  );

  const fetchWeekBookings = async (weekNum: number): Promise<void> => {
    try {
      const fetchedBookings =
        await BackEndService.Instance.getRegistrationsByType(2);
      const filteredBookings = fetchedBookings.filter(
        (b) =>
          b.employee === employeeId &&
          getWeekNumber(new Date(b.date)) === weekNum
      );
      setCurrentBookings(filteredBookings);
      setStartOfWeek(getWeekStartDate(weekNum)); // Adjust start of week based on the week number
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  React.useEffect((): void => {
    fetchWeekBookings(currentWeekNumber).catch((error) => {
      console.error("Error fetching bookings:", error);
    });
  }, [currentWeekNumber, employeeId]);

  // Helper function to calculate the difference in hours between two times
  const calculateHoursFromStartAndEnd = (
    start: string,
    end: string
  ): number => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTimeInMinutes = startHours * 60 + startMinutes;
    const endTimeInMinutes = endHours * 60 + endMinutes;

    return (endTimeInMinutes - startTimeInMinutes) / 60;
  };

  const calculateDailyHours = (dayDate: Date): number => {
    const filteredBookings = currentBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const isSameDay = bookingDate.toDateString() === dayDate.toDateString();
      return isSameDay;
    });

    const totalHours = filteredBookings.reduce((total, booking) => {
      const bookingHours =
        booking.time ??
        calculateHoursFromStartAndEnd(booking.start, booking.end);
      return total + bookingHours;
    }, 0);

    return totalHours;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    // Convert both start and end times to minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Return the difference in minutes
    return endTotalMinutes - startTotalMinutes;
  };

  const calculateNewEndTime = (
    newStartTime: string,
    duration: number
  ): string => {
    const [startHours, startMinutes] = newStartTime.split(":").map(Number);

    // Convert new start time to total minutes
    const startTotalMinutes = startHours * 60 + startMinutes;

    // Calculate the new end time in total minutes
    const newEndTotalMinutes = startTotalMinutes + duration;

    // Convert the new end time back to hours and minutes
    const newEndHours = Math.floor(newEndTotalMinutes / 60);
    const newEndMinutes = newEndTotalMinutes % 60;

    // Return the new end time in "HH:MM" format
    return `${newEndHours.toString().padStart(2, "0")}:${newEndMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const snapToNearestSlot = (timeSlotId: string): string => {
    const [hour, minute] = timeSlotId.split(":").map(Number);
    const roundedMinutes = Math.round(minute / 15) * 15; // Snap to nearest 15
    return `${hour}:${roundedMinutes.toString().padStart(2, "0")}`;
  };

  const onBookingDrop = async (
    movedBooking: IRegistration,
    newDate: string,
    newStart: string
  ): Promise<void> => {
    const snappedStart = snapToNearestSlot(newStart);
    const duration = calculateDuration(movedBooking.start, movedBooking.end);
    const newEnd = calculateNewEndTime(snappedStart, duration);

    const updatedBooking: EditRegistrationRequestDTO = {
      shortDescription: movedBooking.shortDescription,
      description: movedBooking.description,
      projectId: movedBooking.projectId,
      date: newDate,
      start: snappedStart, // Updated start time
      end: newEnd,
      registrationType: movedBooking.registrationType,
    };

    try {
      await BackEndService.Instance.updateRegistrations(
        movedBooking.id,
        updatedBooking
      );

      // Update local state with the updated booking
      setCurrentBookings((prevBookings) =>
        prevBookings.map((b) =>
          b.id === movedBooking.id
            ? { ...b, date: newDate, start: snappedStart, end: newEnd }
            : b
        )
      );

      console.log("Booking updated successfully!");
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handlePreviousWeek = async (): Promise<void> => {
    const updatedWeek = currentWeekNumber - 1;
    await fetchWeekBookings(updatedWeek);
    onPreviousWeek();
    setCurrentWeekNumber(updatedWeek);
  };

  const handleNextWeek = async (): Promise<void> => {
    const updatedWeek = currentWeekNumber + 1;
    await fetchWeekBookings(updatedWeek);
    onNextWeek();
    setCurrentWeekNumber(updatedWeek);
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.weeklyViewContainer}>
        <div className={styles.controlsContainer}>
          <PrimaryButton onClick={onBack}>Tilbage</PrimaryButton>
          <div className={styles.weekInfo}>
            <Text variant="large">
              <strong>
                Uge {currentWeekNumber} - Bookinger for {formattedEmployeeName}
              </strong>
            </Text>
          </div>
          <div className={styles.navigationContainer}>
            <Button
              className={styles.upIconScale}
              appearance="subtle"
              size="large"
              icon={<ArrowLeftRegular />}
              onClick={handlePreviousWeek}
            />
            <Button
              className={styles.upIconScale}
              appearance="subtle"
              size="large"
              icon={<ArrowRightRegular />}
              onClick={handleNextWeek}
            />
          </div>
        </div>

        <div className={styles.gridHeader}>
          <div className={styles.timeHeader} />
          {days.map((day, i) => (
            <div key={day} className={styles.dayHeader}>
              <Text variant="large">
                <strong>{day}</strong>
                <Text>({calculateDailyHours(weekDays[i])} timer)</Text>
              </Text>
              <Text>{weekDays[i].toLocaleDateString("da-DK")}</Text>
            </div>
          ))}
        </div>

        <div className={styles.syncScrollContainer}>
          <div className={styles.gridContainer}>
            {hours.map((hour) => (
              <div key={hour} className={styles.gridRow}>
                <div className={styles.timeColumn}>
                  <Text variant="large">{`${hour}:00`}</Text>
                </div>

                {days.map((day, i) => {
                  const dayDate = weekDays[i];
                  return (
                    <div key={day} className={styles.dayColumn}>
                      {Array.from({ length: 4 }).map((_, j) => {
                        const timeSlotId = `${hour}:${j * 15}`;
                        const booking = currentBookings.find((b) => {
                          const bookingDate = new Date(b.date);
                          const [startHour, startMinute] = b.start
                            .split(":")
                            .map(Number);
                          return (
                            bookingDate.getDate() === dayDate.getDate() &&
                            startHour === hour &&
                            startMinute >= j * 15 &&
                            startMinute < (j + 1) * 15
                          );
                        });

                        const span = booking
                          ? calculateSpan(booking.start, booking.end)
                          : 1;
                        const topOffset = booking
                          ? calculateTopOffset(booking.start)
                          : 0;

                        return (
                          <TimeSlot
                            key={timeSlotId}
                            timeSlotId={timeSlotId}
                            date={dayDate.toISOString()}
                            booking={booking}
                            onDrop={onBookingDrop}
                            span={span}
                            topOffset={topOffset}
                            projects={projects}
                            customers={customers}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default WeeklyView;
