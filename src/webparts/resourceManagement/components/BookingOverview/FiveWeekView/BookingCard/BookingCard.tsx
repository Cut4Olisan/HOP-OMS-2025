import * as React from "react";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { Text } from "@fluentui/react";
import { Divider } from "@fluentui/react-components";
import { RegistrationDTO } from "../../../interfaces";
import styles from "./BookingCard.module.scss";
import BookingCardMenu from "./BookingCardMenu";
import useGlobal from "../../../../hooks/useGlobal";

const ItemType = "BOOKING"; // For drag and drop functionality

const BookingCard: React.FC<{
  booking: RegistrationDTO;
  onDrop: (booking: RegistrationDTO, newWeekNumber: number) => void;
  onEmployeeClick: (booking: RegistrationDTO) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const { customers, projects } = useGlobal();
  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  const project = projects.find(
    (project) => Number(project.id) === booking.projectId
  );
  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );

  const projectName = project?.name || "";
  const customerName = customer?.name || "";
  const bookingTitle = booking.shortDescription || "";

  if (!bookingTitle || !customerName) {
    return null;
  }

  const capitalize = (word: string): string =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const employeeFullName = booking.employee ?? " ".split("@")[0];
  const employeeNameParts = employeeFullName.split(".");
  const formattedEmployeeName = `${capitalize(employeeNameParts[0])} ${capitalize(
    employeeNameParts[1]
  )}`;

  const [, setRegistrations] = useState<RegistrationDTO[]>([]);

  return (
    <div
      ref={drag}
      onDoubleClick={() => onEmployeeClick(booking)}
      className={styles.bookingCard}
    >
      <div className={styles.TitelAndEditIcon}>
        <div>
          <Text className={styles.projectName} variant="large">
            {booking.shortDescription}
          </Text>
        </div>
        <BookingCardMenu
          registration={booking}
          onBookingDeleted={(deletedBookingId) => {
            setRegistrations((prevRegistrations) =>
              prevRegistrations.filter((reg) => reg.id !== deletedBookingId)
            );
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
          <strong>Kunde: </strong> {customerName}
        </Text>
        <Text variant="medium">
          <strong>Projekt: </strong> {projectName}
        </Text>
      </div>
    </div>
  );
};

export default BookingCard;
