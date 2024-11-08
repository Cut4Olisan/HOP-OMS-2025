import React from "react";
import { useDrop, useDrag } from "react-dnd";
import styles from "./TimeSlot.module.scss";
import { TooltipHost } from "@fluentui/react";
import { RegistrationDTO } from "../interfaces";
import BackEndService from "../../services/BackEnd";
import {
  NotificationType,
  RegistrationPanelState,
} from "../../context/GlobalContext";
import useGlobal from "../../hooks/useGlobal";
import BookingOverviewCard from "./BookingOverviewCard";

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
  const { notifications, setNotifications } = useGlobal();

  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: RegistrationDTO) => {
      onDrop(item, date, timeSlotId);
      setIsHovered(false); // Reset hover state on drop
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

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

  const { setBookingPanelState, registrations, setRegistrations, employees } =
    useGlobal();

  const employee = employees.find(
    (emp) => emp.email?.toLowerCase() === booking?.employee?.toLowerCase()
  );

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

  const handleCopy = async (): Promise<void> => {
    if (
      !booking ||
      !booking.date ||
      !booking.registrationType ||
      !booking.projectId
    )
      return;

    const r = await BackEndService.Api.registrationsCreate({
      date: new Date(new Date(booking.date).getTime() + 86400000 + 3600000) // One day + One hour
        .toISOString()
        .split("T")[0],
      end: booking.end,
      start: booking.start,
      description: booking.description,
      employee: booking.employee,
      registrationType: booking.registrationType,
      projectId: booking.projectId,
      shortDescription: booking.shortDescription,
      phaseId: booking.phaseId,
    }).then((r) => r.json());

    setNotifications([
      ...notifications,
      {
        message: `Kopi af "${booking.shortDescription}" er nu oprettet`,
        type: NotificationType.Success,
      },
    ]);

    return setRegistrations([...registrations, r as RegistrationDTO]);
  };
  return (
    <TooltipHost
      content={`Start time: ${timeSlotId}, Date: ${new Date(date).toLocaleDateString("da-DK")}`}
      delay={0}
      hidden={!isDragging}
    >
      <div
        ref={drop}
        onDragEnter={() => setIsHovered(true)}
        onDragLeave={() => setIsHovered(false)}
        onDrop={() => setIsHovered(false)}
        className={`${styles.timeSlot} ${isHovered ? styles.hoveredTimeSlot : ""}`}
        style={{
          height: "15px",
          position: "relative",
        }}
      >
        {booking && (
          <div
            ref={drag}
            style={{
              height: `${span * 15}px`,
              left: 12,
              right: 12,
              zIndex: registrations.findIndex((r) => r.id === booking.id),
              position: "absolute",
            }}
          >
            <BookingOverviewCard
              style={{
                cursor: !!employee ? "pointer" : undefined,
                height: "100%",
              }}
              registration={booking}
              onEdit={() => handleEdit()}
              onDelete={async () => await handleDelete()}
              onCopyRegistration={async () => await handleCopy()}
            />
          </div>
        )}
      </div>
    </TooltipHost>
  );
};

export default TimeSlot;
