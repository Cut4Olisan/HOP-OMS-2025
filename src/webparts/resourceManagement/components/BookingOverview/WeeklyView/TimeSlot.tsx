import React from "react";
import { useDrop, useDrag } from "react-dnd";
import { parseTime } from "../../dateUtils";
import BookingCardMenu from "../FiveWeekView/BookingCard/bookingCardMenu";
import { getBookingDate } from "../HelperFunctions/helperFunctions";
import styles from "./TimeSlot.module.scss";
import { Text, TooltipHost } from "@fluentui/react";
import { formatEmployeeName } from "../HelperFunctions/helperFunctions";
import useGlobal from "../../../hooks/useGlobal";
import { RegistrationDTO } from "../../interfaces";

const ItemType = "BOOKING"; // Draggable item type

const TimeSlot: React.FC<{
  timeSlotId: string;
  date: string;
  booking: RegistrationDTO | undefined;
  onDrop: (booking: RegistrationDTO, newDate: string, newStart: string) => void;
  span: number;
  topOffset: number;
  projects: any[];
  customers: any[];
}> = ({
  timeSlotId,
  date,
  booking,
  onDrop,
  span,
  topOffset,
  projects,
  customers,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { setIsDraggingBooking, isDraggingGlobal } = useGlobal();

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

  const handleDragLeave = () => {
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

  const [, setRegistrations] = React.useState<RegistrationDTO[]>([]);

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

  return (
    <TooltipHost
      content={`Start time: ${timeSlotId}, Date: ${new Date(date).toLocaleDateString("da-DK")}`}
      delay={0}
      hidden={!isDraggingGlobal}
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
              top: `${minutePercentage}%`, // Using minute percentage to position the booking
              height: `${span * 15}px`, // Booking spans based on its duration
              left: 0,
              right: 0,
              position: "absolute",
            }}
          >
            <div className={styles.bookingContent}>
              <div className={styles.TitelAndEditIcon}>
                <Text className={styles.bookingTitle}>
                  {booking.shortDescription}
                </Text>
                <BookingCardMenu
                  registration={booking}
                  onBookingDeleted={(deletedBookingId) => {
                    setRegistrations((prevRegistrations) =>
                      prevRegistrations.filter(
                        (reg) => reg.id !== deletedBookingId
                      )
                    );
                  }}
                />
              </div>
              <Text className={styles.bookingEmployee}>
                {formatEmployeeName}
              </Text>
              <Text
                className={styles.bookingProject}
              >{`Customer: ${customerName}`}</Text>
              <Text
                className={styles.bookingProject}
              >{`Project: ${projectName}`}</Text>
              <Text className={styles.bookingTime}>{bookingTime}</Text>
            </div>
          </div>
        )}
      </div>
    </TooltipHost>
  );
};

export default TimeSlot;
