import React from "react";
import { useDrop, useDrag } from "react-dnd";
import { parseTime, getBookingDate } from "../../utilities/DateUtilities";
import { Divider } from "@fluentui/react-components";
import styles from "./TimeSlot.module.scss";
import {
  IconButton,
  Persona,
  PersonaSize,
  Stack,
  Text,
  TooltipHost,
} from "@fluentui/react";
import { RegistrationDTO } from "../interfaces";
import BackEndService from "../../services/BackEnd";
import {
  NotificationType,
  RegistrationPanelState,
} from "../../context/GlobalContext";
import useGlobal from "../../hooks/useGlobal";
import globalStyles from "../styles.module.scss";

const ItemType = "BOOKING"; // Draggable item type

const TimeSlot: React.FC<{
  timeSlotId: string;
  date: string;
  booking: RegistrationDTO | undefined;
  onDrop: (booking: RegistrationDTO, newDate: string, newStart: string) => void;
  span: number;
  topOffset: number;
}> = ({ timeSlotId, date, booking, onDrop, span, topOffset }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [, setIsDraggingBooking] = React.useState<boolean>(false);
  const [isDragging] = React.useState<boolean>(false);
  const { customers, projects, notifications, setNotifications } = useGlobal();

  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: RegistrationDTO) => {
      onDrop(item, date, timeSlotId);
      setIsHovered(false); // Reset hover state on drop
    },
    hover: () => {
      setIsHovered(true); // Set hover state when hovering over the slot
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleDragLeave = (): void => {
    setIsHovered(false); // Reset hover state when the drag leaves
  };

  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
    canDrag: !!booking,
    collect: (monitor) => {
      if (monitor.isDragging()) {
        setIsDraggingBooking(true);
      } else {
        setIsDraggingBooking(false);
      }
    },
  });

  const bookingDate = booking ? getBookingDate(booking.date ?? "") : null;

  const project = projects.find((p) => p.id === booking?.projectId);
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const bookingTime = booking ? `${booking.start} - ${booking.end}` : "";

  // Calculate the minute offset and convert to a percentage of the hour
  const minuteOffset = booking ? parseTime(booking.start ?? "").minute : 0;
  const minutePercentage = (minuteOffset / 60) * 100;

  const { setBookingPanelState, registrations, setRegistrations, employees } =
    useGlobal();

  const employee = employees.find(
    (emp) => emp.email?.toLowerCase() === booking?.employee?.toLowerCase()
  );

  const personaImageUrl = `${window.location.origin}/_layouts/15/userphoto.aspx?size=M&accountname=${employee?.email}`;

  const handleEdit = (): void => {
    if (!booking) return;
    return setBookingPanelState({
      state: RegistrationPanelState.Edit,
      data: booking,
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!booking || !booking.id) return;
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
    <TooltipHost
      content={`Start time: ${timeSlotId}, Date: ${new Date(date).toLocaleDateString("da-DK")}`}
      delay={0}
      hidden={!isDragging}
    >
      <div
        ref={drop}
        onMouseLeave={handleDragLeave} // Reset hover state when the mouse leaves
        className={`${styles.timeSlot} ${isHovered ? styles.hoveredTimeSlot : ""}`}
        style={{
          height: "15px",
          position: "relative",
        }}
      >
        {booking && bookingDate && (
          <div
            ref={drag}
            className={styles.booking}
            style={{
              top: `${minutePercentage}%`,
              height: `${span * 15}px`,
              left: 0,
              right: 0,
              position: "absolute",
            }}
          >
            <div className={styles.bookingContent}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text block className={globalStyles.bold} variant="large">
                  {booking.shortDescription}
                </Text>
                <div>
                  <IconButton
                    iconProps={{ iconName: "Edit" }}
                    onClick={() => handleEdit()}
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
                  />
                </div>
              )}
              <Stack
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <Text variant="medium" block>
                  <span className={globalStyles.bold}>Kunde: </span>{" "}
                  {customerName}
                </Text>
                <Text variant="medium" block>
                  <span className={globalStyles.bold}>Projekt: </span>{" "}
                  {projectName}
                </Text>
                <Text variant="medium" block>
                  <span className={globalStyles.bold}>Beskrivelse: </span>{" "}
                  {booking.description}
                </Text>
              </Stack>
              <Text className={styles.bookingTime}>{bookingTime}</Text>
            </div>
          </div>
        )}
      </div>
    </TooltipHost>
  );
};

export default TimeSlot;
