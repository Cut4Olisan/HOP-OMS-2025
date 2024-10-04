import * as React from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Text, PrimaryButton } from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./WeeklyView.module.scss";
import { Registration } from "../../interfaces/IRegistrationProps";
import BackEndService from "../../../services/BackEnd";
import { getWeekNumber } from "../../dateUtils";
import { Button } from "@fluentui/react-components";

const ItemType = "BOOKING"; // Draggable item type

// Helper function to parse time string (e.g., "08:30")
const parseTime = (timeString: string): { hour: number; minute: number } => {
  const [hour, minute] = timeString.split(":").map(Number);
  return { hour, minute };
};

// Function to get the date object from the booking date string
const getBookingDate = (bookingDate: string): Date => {
  return new Date(bookingDate);
};

// Helper function to calculate the top offset based on start time
const calculateTopOffset = (start: string): number => {
  const startParts = start.split(":").map(Number);
  return (startParts[1] / 60) * 100; // Convert minutes to a percentage for offset
};

// Helper function to calculate the duration of a booking in timeslots
const calculateSpan = (start: string, end: string): number => {
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const startMinutes = startParts[0] * 60 + startParts[1];
  const endMinutes = endParts[0] * 60 + endParts[1];
  const durationInMinutes = endMinutes - startMinutes;
  return Math.ceil(durationInMinutes / 15); // Each timeslot represents 15 minutes
};

// Adjust `TimeSlot` for date checks and alignment
const TimeSlot: React.FC<{
  timeSlotId: string;
  booking: Registration | undefined;
  onDrop: (booking: Registration, newStart: string) => void;
  span: number;
  topOffset: number;
  projects: any[];
  customers: any[];
}> = ({
  timeSlotId,
  booking,
  onDrop,
  span,
  topOffset,
  projects,
  customers,
}) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: Registration) => {
      onDrop(item, timeSlotId);
    },
  });

  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  const bookingDate = booking ? getBookingDate(booking.date) : null;

  const project = projects.find((p) => p.id === booking?.projectId);
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const bookingTime = booking ? `${booking.start} - ${booking.end}` : "";

  const shouldAdjustOffset = booking
    ? parseTime(booking.start).minute !== 0
    : false;

  return (
    <div ref={drop} className={styles.timeSlot}>
      {booking && bookingDate && (
        <div
          ref={drag}
          className={styles.booking}
          style={{
            top: shouldAdjustOffset
              ? `calc(${topOffset}px - 0px)`
              : `${topOffset}px`,
            height: `${span * 15}px`, // Adjusting the span to match duration
          }}
        >
          <div className={styles.bookingContent}>
            <Text className={styles.bookingTitle}>
              {booking.shortDescription}
            </Text>
            <Text className={styles.bookingEmployee}>{}</Text>
            <Text
              className={styles.bookingProject}
            >{`Customer: ${customerName}`}</Text>
            <Text
              className={styles.bookingProject}
            >{`Project: ${projectName}`}</Text>
            <Text className={styles.bookingTime}>{bookingTime}</Text>
          </div>
        </div>
      )}
    </div>
  );
};

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
const formatEmployeeName = (email: string) => {
  const nameParts = email.split("@")[0].split(".");
  return nameParts.map(capitalize).join(" ");
};

interface WeeklyViewProps {
  weekNumber: string;
  employeeId: string;
  weekBookings: Registration[];
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
  weekBookings,
  employeeName,
  onBack,
  onPreviousWeek,
  onNextWeek,
  projects,
  customers,
}): JSX.Element => {
  const formattedEmployeeName = formatEmployeeName(employeeName);
  const [currentBookings, setCurrentBookings] = React.useState<Registration[]>(
    []
  );
  const [currentWeekNumber, setCurrentWeekNumber] = React.useState<number>(
    parseInt(weekNumber, 10)
  );
  const [startOfWeek, setStartOfWeek] = React.useState<Date>(new Date());

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
      setStartOfWeek(new Date()); // Adjust start of week based on the week number
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  React.useEffect((): void => {
    fetchWeekBookings(currentWeekNumber);
  }, [currentWeekNumber, employeeId]);

  const onBookingDrop = (
    movedBooking: Registration,
    newStart: string
  ): void => {
    const updatedBookings = currentBookings.map((b) => {
      if (b.id === movedBooking.id) {
        const newDate = new Date(b.date);
        newDate.setHours(Number(newStart.split(":")[0]));
        newDate.setMinutes(Number(newStart.split(":")[1]));
        return { ...b, date: newDate.toISOString() };
      }
      return b;
    });
    setCurrentBookings(updatedBookings);
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

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4);

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
              Uge {currentWeekNumber} - Bookinger for {formattedEmployeeName}
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
              <Text>{`${day} - ${weekDays[i].toLocaleDateString()}`}</Text>
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
