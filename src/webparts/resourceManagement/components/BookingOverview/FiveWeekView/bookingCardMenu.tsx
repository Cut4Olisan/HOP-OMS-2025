import styles from "./bookingCardMenu.module.scss";
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components"; //Fra v9
import * as React from "react";
import {
  SettingsCogMultipleRegular,
  EditRegular,
  CopyAddRegular,
  DeleteRegular,
} from "@fluentui/react-icons";
import BackEndService from "../../../services/BackEnd";
import { TooltipHost } from "@fluentui/react";

interface IBookingCardMenuProps {
  bookingId: number;
  onBookingDeleted: (bookingId: number) => void;
}

const BookingCardMenu: React.FC<IBookingCardMenuProps> = ({
  bookingId,
  onBookingDeleted,
}) => {
  // Function to handle delete action
  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Er du sikker på du vil slette denne booking?"
    );
    if (confirmation) {
      try {
        await BackEndService.Instance.deleteBooking(bookingId); // Backend call to delete booking
        onBookingDeleted(bookingId); // Pass the bookingId back to the parent
      } catch (error) {
        console.error("Failed to delete booking:", error);
        alert("Kunne ikke slette booking. Prøv igen.");
      }
    }
  };

  const editBooking = async () => {};

  return (
    <div>
      <Menu>
        <TooltipHost content="Mere..">
          <MenuTrigger disableButtonEnhancement>
            <Button
              icon={<SettingsCogMultipleRegular />}
              size="large"
              appearance="subtle"
            />
          </MenuTrigger>
        </TooltipHost>
        <MenuPopover className={styles.menuPopover}>
          <MenuList className={styles.menuListItems}>
            <MenuItem icon={<EditRegular />} onClick={editBooking}>
              Rediger
            </MenuItem>
            <MenuItem icon={<CopyAddRegular />} onClick={undefined}>
              Kopier
            </MenuItem>
            <MenuItem icon={<DeleteRegular />} onClick={handleDelete}>
              Slet
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default BookingCardMenu;
