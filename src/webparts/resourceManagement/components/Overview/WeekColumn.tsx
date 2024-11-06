import * as React from "react";
import { useDrop } from "react-dnd";
import { Text } from "@fluentui/react";
import { RegistrationDTO } from "../interfaces";
import styles from "./WeekColumn.module.scss";
import BookingCard from "./BookingCard";
import globalStyles from "../styles.module.scss"

const ItemType = "BOOKING"; //Til drag n' drop WIP

const WeekColumn: React.FC<{
  weekNumber: number;
  startDate: string;
  endDate: string;
  bookings: RegistrationDTO[];
  onDrop: (booking: RegistrationDTO, newWeekNumber: number) => void;
  onEmployeeClick: (booking: RegistrationDTO) => void;
}> = ({ weekNumber, bookings, onDrop, onEmployeeClick }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: RegistrationDTO) => {
      onDrop(item, weekNumber);
    },
  });

  return (
    <div ref={drop} className={styles.weekColumn}>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onDrop={onDrop}
            onEmployeeClick={onEmployeeClick}
          />
        ))
      ) : (
        <Text className={styles.centered}>
          <span className={globalStyles.bold}>Ingen bookinger</span>
        </Text>
      )}
    </div>
  );
};

export default WeekColumn;
