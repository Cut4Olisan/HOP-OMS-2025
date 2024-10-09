import * as React from "react";
import { useDrop } from "react-dnd";
import { Text } from "@fluentui/react";
import { IRegistration } from "../../../interfaces/IRegistrationProps";
import styles from "./WeekColumn.module.scss";
import BookingCard from "../BookingCard/BookingCard";

const ItemType = "BOOKING"; //Til drag n' drop WIP

const WeekColumn: React.FC<{
  weekNumber: number;
  startDate: string;
  endDate: string;
  bookings: IRegistration[];
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
}> = ({ weekNumber, bookings, onDrop, onEmployeeClick }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: IRegistration) => {
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
          <strong>Ingen bookinger</strong>
        </Text>
      )}
    </div>
  );
};

export default WeekColumn;
