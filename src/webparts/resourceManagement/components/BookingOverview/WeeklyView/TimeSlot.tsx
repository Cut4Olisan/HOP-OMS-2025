import React from "react";
import { useDrop, useDrag } from "react-dnd";
import { parseTime } from "../../dateUtils";
import { IRegistration } from "../../interfaces/IRegistrationProps";
import BookingCardMenu from "../FiveWeekView/BookingCard/bookingCardMenu";
import { getBookingDate } from "../HelperFunctions/helperFunctions";
import styles from "./TimeSlot.module.scss";
import { Text, TooltipHost } from "@fluentui/react";
import { formatEmployeeName } from "../HelperFunctions/helperFunctions";
import useGlobal from "../../../hooks/useGlobal";

const ItemType = "BOOKING"; // Draggable item type

// Adjust `TimeSlot` for date checks and alignment
const TimeSlot: React.FC<{
  timeSlotId: string;
  date: string;
  booking: IRegistration | undefined;
  onDrop: (booking: IRegistration, newDate: string, newStart: string) => void;
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
    drop: (item: IRegistration) => {
      onDrop(item, date, timeSlotId);
    },
    hover: () => {
      if (isDraggingGlobal) setIsHovered(true);
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

  const [, setRegistrations] = React.useState<IRegistration[]>([]);

  const bookingDate = booking ? getBookingDate(booking.date) : null;

  const project = projects.find((p) => p.id === booking?.projectId);
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const bookingTime = booking ? `${booking.start} - ${booking.end}` : "";

  const shouldAdjustOffset = booking
    ? parseTime(booking.start).minute !== 0
    : false;

  return (
    <TooltipHost
      content={`Start time: ${timeSlotId}, Date: ${new Date(date).toLocaleDateString("da-DK")}`}
      delay={0}
      hidden={!isDraggingGlobal} // Show tooltip only when dragging
    >
      <div
        ref={drop}
        className={`${styles.timeSlot} ${isHovered}`}
        onMouseLeave={() => setIsHovered(false)}
      >
        {booking && bookingDate && (
          <div
            ref={drag}
            className={styles.booking}
            style={{
              top: shouldAdjustOffset
                ? `calc(${topOffset}px - 0px)`
                : `${topOffset}px`,
              height: `${span * 15}px`,
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
