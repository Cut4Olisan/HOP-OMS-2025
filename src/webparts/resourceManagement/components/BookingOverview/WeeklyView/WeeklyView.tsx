import * as React from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Text, DefaultButton } from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./WeeklyView.module.scss";
import { RegistrationDTO } from "../mock/iMockData"; // Mock data
import { WeeklyViewProps } from "./Interfaces/iWeeklyViewProps";
import { TimeSlotProps } from "./Interfaces/iTimeSlotProps";

const ItemType = "BOOKING"; // Draggable item type

const TimeSlot: React.FC<TimeSlotProps> = ({ timeSlotId, booking, onDrop }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: RegistrationDTO) => {
      const newStart = timeSlotId; // Calculate new start time from timeSlotId
      onDrop(item, newStart);
    },
  });

  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  return (
    <div ref={drop} className={styles.timeSlot}>
      {booking && (
        <div ref={drag} className={styles.booking}>
          <Text>{booking.shortDescription}</Text>
        </div>
      )}
    </div>
  );
};

const getWeekStartDate = (weekNumber: number, year: number): Date => {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (weekNumber - 1) * 7;
  const firstMonday = new Date(
    firstDayOfYear.setDate(
      firstDayOfYear.getDate() - firstDayOfYear.getDay() + 1
    )
  );
  return new Date(firstMonday.setDate(firstMonday.getDate() + daysOffset));
};

const WeeklyView: React.FC<WeeklyViewProps> = ({
  weekNumber,
  employeeId,
  weekBookings,
  employeeName,
  onBack,
  onPreviousWeek,
  onNextWeek,
}) => {
  const [currentBookings, setCurrentBookings] = React.useState<
    RegistrationDTO[]
  >([]);
  const [currentWeekNumber, setCurrentWeekNumber] = React.useState(
    parseInt(weekNumber, 10)
  );

  // Update the bookings whenever the week or employee changes
  React.useEffect((): void => {
    const employeeBookings = weekBookings.filter(
      (b) => b.employee === employeeId
    );
    setCurrentBookings(employeeBookings);
  }, [weekBookings, employeeId, currentWeekNumber]);

  // Handle booking drop
  const onBookingDrop = (
    movedBooking: RegistrationDTO,
    newStart: string
  ): void => {
    const updatedBookings = currentBookings.map((b) => {
      if (b.id === movedBooking.id) {
        const newDate = new Date(b.date);
        newDate.setHours(Number(newStart.split(":")[0]));
        newDate.setMinutes(Number(newStart.split(":")[1]));
        const newBooking = { ...b, date: newDate.toISOString() };
        return newBooking;
      }
      return b;
    });
    setCurrentBookings(updatedBookings);
  };

  // Handle updating the week number when navigating between weeks
  const handlePreviousWeek = (): void => {
    setCurrentWeekNumber((prevWeek) => {
      const updatedWeek = prevWeek - 1;
      onPreviousWeek();
      return updatedWeek;
    });
  };

  const handleNextWeek = (): void => {
    setCurrentWeekNumber((prevWeek) => {
      const updatedWeek = prevWeek + 1;
      onNextWeek();
      return updatedWeek;
    });
  };

  const startOfWeek = getWeekStartDate(currentWeekNumber, 2024);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4);

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i); // From 00:00 to 23:00
  const days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.weeklyViewContainer}>
        <div className={styles.controlsContainer}>
          <DefaultButton onClick={onBack}>
            Tilbage til 5 ugers oversigt
          </DefaultButton>
          <div className={styles.weekInfo}>
            <Text variant="large">
              Uge {currentWeekNumber} - Bookinger for {employeeName}
            </Text>
          </div>
          <div className={styles.navigationArrows}>
            <ArrowLeftRegular
              className={styles.arrowButton}
              onClick={handlePreviousWeek}
            />
            <ArrowRightRegular
              className={styles.arrowButton}
              onClick={handleNextWeek}
            />
          </div>
        </div>

        <div className={styles.syncScrollContainer}>
          <div className={styles.gridContainer}>
            <div className={styles.gridHeader}>
              <div className={styles.timeHeader} />
              {days.map((day, i) => (
                <div key={day} className={styles.dayHeader}>
                  <Text>{`${day} - ${weekDays[i].toLocaleDateString()}`}</Text>
                </div>
              ))}
            </div>

            {hours.map((hour) => (
              <div key={hour} className={styles.gridRow}>
                <div className={styles.timeColumn}>
                  <Text variant="large">{`${hour}:00`}</Text>
                </div>

                {days.map((day, i) => (
                  <div key={day} className={styles.dayColumn}>
                    {Array.from({ length: 4 }).map((_, j) => {
                      const timeSlotId = `${hour}:${j * 15}`;
                      const booking =
                        currentBookings.find((b) => {
                          const bookingDate = new Date(b.date);
                          return (
                            bookingDate.getHours() === hour &&
                            bookingDate.getMinutes() === j * 15 &&
                            bookingDate.getDate() === weekDays[i].getDate()
                          );
                        }) || undefined;

                      return (
                        <TimeSlot
                          key={timeSlotId}
                          timeSlotId={timeSlotId}
                          booking={booking}
                          onDrop={onBookingDrop}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default WeeklyView;