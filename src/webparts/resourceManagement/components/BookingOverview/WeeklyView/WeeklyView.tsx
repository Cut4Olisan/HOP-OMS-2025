import * as React from "react";
import { Text, DefaultButton } from "@fluentui/react";
import {
  AddSquare24Regular,
  ArrowLeftRegular,
  ArrowRightRegular,
} from "@fluentui/react-icons";
import styles from "./WeeklyView.module.scss";
import { mockRegistrations } from "../mock/mockData";
import { RegistrationDTO } from "../mock/iMockData";

interface IWeeklyViewProps {
  weekNumber: string;
  employeeId: string;
  onBack: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const weekDayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

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

// Filter bookings for a specific day and employee
const getBookingsForDay = (
  day: Date,
  bookings: RegistrationDTO[],
  employeeId: string
) => {
  return bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return (
      booking.employee === employeeId && // Match employee
      bookingDate.getFullYear() === day.getFullYear() &&
      bookingDate.getMonth() === day.getMonth() &&
      bookingDate.getDate() === day.getDate()
    );
  });
};

const WeeklyView: React.FC<IWeeklyViewProps> = ({
  weekNumber,
  employeeId,
  onBack,
  onPreviousWeek,
  onNextWeek,
}) => {
  const currentWeekNumber = parseInt(weekNumber);

  const startOfWeek = getWeekStartDate(currentWeekNumber, 2024);

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const filteredBookings = mockRegistrations.filter(
    (booking) =>
      booking.weekNumber === currentWeekNumber &&
      booking.employee === employeeId
  );

  return (
    <div className={styles.container}>
      <div className={styles.controlsContainer}>
        <DefaultButton
          text="Tilbage til 5 ugers oversigt"
          onClick={onBack}
          className={styles.backButton}
        />

        <div className={styles.weekHeader}>
          <AddSquare24Regular className={styles.addIcon} />
          <Text variant="large" className={styles.Bold}>
            Uge {weekNumber} - Bookings for {employeeId}
          </Text>
        </div>

        <div className={styles.navigationContainer}>
          <ArrowLeftRegular
            className={styles.arrowButton}
            onClick={onPreviousWeek}
          />
          <ArrowRightRegular
            className={styles.arrowButton}
            onClick={onNextWeek}
          />
        </div>
      </div>

      <div className={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <div key={index} className={styles.dayBlock}>
            <Text variant="large" className={styles.dayName}>
              {weekDayNames[index]} - {day.toLocaleDateString()}
            </Text>

            <div className={styles.bookingsList}>
              {getBookingsForDay(day, filteredBookings, employeeId).length >
              0 ? (
                getBookingsForDay(day, filteredBookings, employeeId).map(
                  (booking) => (
                    <div key={booking.id} className={styles.bookingCard}>
                      <Text className={styles.projectName} variant="large">
                        Project {booking.projectId}
                      </Text>
                      <Text className={styles.description}>
                        {booking.description}
                      </Text>
                      <Text variant="small">
                        {booking.start} - {booking.end}, {booking.time} hours
                      </Text>
                    </div>
                  )
                )
              ) : (
                <Text>Ingen bookinger for {weekDayNames[index]}</Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;
