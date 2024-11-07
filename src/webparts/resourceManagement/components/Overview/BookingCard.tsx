import * as React from "react";
/* import { useState } from "react"; */
import { useDrag } from "react-dnd";
import { IconButton, Stack, Text } from "@fluentui/react";
import { Divider } from "@fluentui/react-components";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import { RegistrationDTO } from "../interfaces";
import styles from "./BookingCard.module.scss";
/* import BookingCardMenu from "./bookingCardMenu"; */
import useGlobal from "../../hooks/useGlobal";
import {
  NotificationType,
  RegistrationPanelState,
} from "../../context/GlobalContext";
import BackEndService from "../../services/BackEnd";
import globalStyles from "../styles.module.scss";

const ItemType = "BOOKING"; // For drag and drop functionality

const BookingCard: React.FC<{
  booking: RegistrationDTO;
  onDrop: (booking: RegistrationDTO, newWeekNumber: number) => void;
  onEmployeeClick: (booking: RegistrationDTO) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const {
    customers,
    projects,
    employees,
    setBookingPanelState,
    setRegistrations,
    registrations,
    notifications,
    setNotifications,
  } = useGlobal();
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

  const employee = employees.find(
    (emp) => emp.email?.toLowerCase() === booking.employee?.toLowerCase()
  );

  const personaImageUrl = `${window.location.origin}/_layouts/15/userphoto.aspx?size=M&accountname=${employee?.email}`;

  /*   const [, setRegistrations] = useState<RegistrationDTO[]>([]); */

  const handleEdit = (): void => {
    return setBookingPanelState({
      state: RegistrationPanelState.Edit,
      data: booking,
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!booking.id) return;
    await BackEndService.Api.registrationsDelete(booking.id);
    setNotifications([
      ...notifications,
      {
        message: `Slettede booking ${booking.shortDescription} for ${employee?.givenName}`,
        type: NotificationType.Info,
      },
    ]);
    return setRegistrations(registrations.filter((r) => r.id !== booking.id));
  };

  return (
    <div
      ref={drag}
      onDoubleClick={() => {
        console.log(booking.employee);
        if (
          !!employees.find(
            (e) => e.email?.toLowerCase() === booking.employee?.toLowerCase()
          )
        )
          onEmployeeClick(booking);
      }}
      className={styles.bookingCard}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          block
          className={globalStyles.bold}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          variant="large"
        >
          {booking.shortDescription}
        </Text>
        <div style={{ display: "flex" }}>
          <IconButton
            iconProps={{ iconName: "Edit" }}
            onClick={async () => await handleEdit()}
          />
          <IconButton
            iconProps={{ iconName: "Trash" }}
            onClick={async () => await handleDelete()}
          />
        </div>
      </div>
      <Divider />
      {employee && (
        <div className={styles.employeeInfo}>
          <Persona
            text={`${employee.givenName ?? ""} ${employee.surName ?? ""}`}
            imageUrl={personaImageUrl}
            size={PersonaSize.size32}
            onClick={() => onEmployeeClick(booking)}
          />
        </div>
      )}

      <Stack style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text variant="medium" block>
          <span className={globalStyles.bold}>Kunde: </span> {customerName}
        </Text>
        <Text variant="medium" block>
          <span className={globalStyles.bold}>Projekt: </span> {projectName}
        </Text>
        {!!booking.date && (
          <Text variant="medium" block>
            <span className={globalStyles.bold}>Tidspunkt: </span>{" "}
            {booking.date.split("T")[0]}
            {!!booking.start && !!booking.end && (
              <>
                {" - "}
                {booking.start}
                {" - "}
                {booking.end}
              </>
            )}
          </Text>
        )}
      </Stack>
    </div>
  );
};

export default BookingCard;
