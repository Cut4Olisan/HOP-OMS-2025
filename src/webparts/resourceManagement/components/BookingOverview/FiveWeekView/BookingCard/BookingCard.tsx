import * as React from "react";
import { useState } from "react";
import { useDrag } from "react-dnd";
import { Text } from "@fluentui/react";
import { Divider } from "@fluentui/react-components";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import { RegistrationDTO } from "../../../interfaces";
import styles from "./BookingCard.module.scss";
import BookingCardMenu from "./bookingCardMenu";
import useGlobal from "../../../../hooks/useGlobal";

const ItemType = "BOOKING"; // For drag and drop functionality

const BookingCard: React.FC<{
  booking: RegistrationDTO;
  onDrop: (booking: RegistrationDTO, newWeekNumber: number) => void;
  onEmployeeClick: (booking: RegistrationDTO) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const { customers, projects, employees } = useGlobal();
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

  const employee = employees.find((emp) => emp.email === booking.employee);
  const personaImageUrl = `${window.location.origin}/_layouts/15/userphoto.aspx?size=M&accountname=${employee?.email}`;

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
      <div>
        <Persona
          text={`${employee?.givenName ?? ""} ${employee?.surName ?? ""}`}
          secondaryText={`${employee?.givenName ?? ""} ${employee?.surName ?? ""}`}
          imageUrl={personaImageUrl}
          size={PersonaSize.size32}
          onClick={() => onEmployeeClick(booking)}
        />
      </div>

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
