import * as React from "react";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { Text } from "@fluentui/react";
import { Divider } from "@fluentui/react-components";
import { IRegistration } from "../../../interfaces/IRegistrationProps";
import styles from "./BookingCard.module.scss";
import BookingCardMenu from "./bookingCardMenu";
import useGlobal from "../../../../hooks/useGlobal";

const ItemType = "BOOKING"; //Til drag n' drop WIP

//***                 Booking Card component                 ***//
const BookingCard: React.FC<{
  booking: IRegistration;
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const { customers, projects } = useGlobal();
  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  const project = projects.find(
    (project) => Number(project.id) === booking.projectId
  );
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const capitalize = (word: string): string =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const employeeFullName = booking.employee.split("@")[0];
  const employeeNameParts = employeeFullName.split(".");
  const formattedEmployeeName = `${capitalize(employeeNameParts[0])} ${capitalize(employeeNameParts[1])}`;
  const [, setRegistrations] = useState<IRegistration[]>([]);

  return (
    <div ref={drag} className={styles.bookingCard}>
      <div className={styles.TitelAndEditIcon}>
        <Text className={styles.projectName} variant="large">
          {booking.shortDescription}
        </Text>
        <BookingCardMenu
          registration={booking}
          onBookingDeleted={(deletedBookingId) => {
            setRegistrations((prevRegistrations) =>
              prevRegistrations.filter((reg) => reg.id !== deletedBookingId)
            ); // Update the registrations state by removing the deleted booking
          }}
        />
      </div>
      <Divider />
      <Text
        className={styles.employeeName}
        variant="medium"
        onClick={() => onEmployeeClick(booking)}
      >
        <strong>{formattedEmployeeName}</strong>
      </Text>
      <div className={styles.customerAndProjectName}>
        <Text variant="medium">
          <strong>Kunde </strong> {customerName}
        </Text>
        <Text variant="medium">
          <strong>Projekt </strong> {projectName}
        </Text>
      </div>
    </div>
  );
};

export default BookingCard;