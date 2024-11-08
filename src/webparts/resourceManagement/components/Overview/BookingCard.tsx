import * as React from "react";
import { useDrag } from "react-dnd";
import { RegistrationDTO } from "../interfaces";
import useGlobal from "../../hooks/useGlobal";
import {
  NotificationType,
  RegistrationPanelState,
} from "../../context/GlobalContext";
import BackEndService from "../../services/BackEnd";
import BookingOverviewCard from "./BookingOverviewCard";

const ItemType = "BOOKING"; // For drag and drop functionality

const BookingCard: React.FC<{
  booking: RegistrationDTO;
  onDrop: (booking: RegistrationDTO, newWeekNumber: number) => void;
  onEmployeeClick: (booking: RegistrationDTO) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const {
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

  const employee = employees.find(
    (emp) => emp.email?.toLowerCase() === booking.employee?.toLowerCase()
  );

  const handleEdit = (): void => {
    return setBookingPanelState({
      state: RegistrationPanelState.Edit,
      data: booking,
    });
  };

  const handleCopy = async (): Promise<void> => {
    if (!booking.date || !booking.registrationType || !booking.projectId)
      return;

    const r = await BackEndService.Api.registrationsCreate({
      date: new Date(new Date(booking.date).getTime() + 604800000 + 3600000)
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
    >
      <BookingOverviewCard
        style={{ cursor: !!employee ? "pointer" : undefined }}
        registration={booking}
        onEdit={() => handleEdit()}
        onDelete={async () => await handleDelete()}
        onCopyRegistration={async () => await handleCopy()}
      />
    </div>
  );
};

export default BookingCard;
