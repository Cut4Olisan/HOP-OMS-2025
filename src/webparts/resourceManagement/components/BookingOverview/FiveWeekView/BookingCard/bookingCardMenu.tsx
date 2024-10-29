import styles from "./bookingCardMenu.module.scss";
import { IIconProps, IconButton } from "@fluentui/react";
import * as React from "react";
import BackEndService from "../../../../services/BackEnd";
import { RegistrationDTO } from "../../../interfaces";
import useGlobal from "../../../../hooks/useGlobal";

interface IBookingCardMenuProps {
  registration: RegistrationDTO;
  onBookingDeleted: (bookingId: number) => void;
}

const BookingCardMenu: React.FC<IBookingCardMenuProps> = ({
  registration,
  onBookingDeleted,
}) => {
  const {
    setShowBookingComponentPanel,
    setSelectedRegistration,
    setIsEditMode,
  } = useGlobal();

  const handleDelete = async (): Promise<void> => {
    if (window.confirm("Er du sikker på du vil slette denne booking?")) {
      try {
        await BackEndService.Api.registrationsDelete(registration.id ?? 0);
        onBookingDeleted(registration.id ?? 0);
      } catch (error) {
        console.error("Failed to delete booking:", error);
        alert("Kunne ikke slette booking. Prøv igen.");
      }
    }
  };

  const handleEditBooking = async (): Promise<void> => {
    setSelectedRegistration(registration);
    setShowBookingComponentPanel(true);
    setIsEditMode(true);
  };

  const copyBooking = async (): Promise<void> => {};

  const penIcon: IIconProps = { iconName: "Edit" };
  const copyIcon: IIconProps = { iconName: "Copy" };
  const deleteIcon: IIconProps = { iconName: "Delete" };

  return (
    <div className={styles.cardMenu}>
      <IconButton iconProps={penIcon} onClick={handleEditBooking} />

      <IconButton iconProps={copyIcon} onClick={copyBooking} />

      <IconButton iconProps={deleteIcon} onClick={handleDelete} />
    </div>
  );
};

export default BookingCardMenu;
