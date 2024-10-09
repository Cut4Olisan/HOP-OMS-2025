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
import { IRegistration } from "../../interfaces/IRegistrationProps";
import useGlobal from "../../../hooks/useGlobal";

interface IBookingCardMenuProps {
  registration: IRegistration;
  onBookingDeleted: (bookingId: number) => void;
}

const BookingCardMenu: React.FC<IBookingCardMenuProps> = ({
  registration,
  onBookingDeleted,
}) => {
  const {
    setShowBookingComponentPanel,
    /*     showBookingComponentPanel,
    selectedRegistration, */
    setSelectedRegistration,
  } = useGlobal();
  // Function to handle delete action
  const handleDelete = async (): Promise<void> => {
    const confirmation = window.confirm(
      "Er du sikker på du vil slette denne booking?"
    );
    if (confirmation) {
      try {
        await BackEndService.Instance.deleteBooking(registration.id); // Backend call to delete booking
        onBookingDeleted(registration.id); // Pass the bookingId back to the parent
      } catch (error) {
        console.error("Failed to delete booking:", error);
        alert("Kunne ikke slette booking. Prøv igen.");
      }
    }
  };

  const editBooking = async (): Promise<void> => {
    setSelectedRegistration(registration);
    setShowBookingComponentPanel(true);
  };

  const copyBooking = async (): Promise<void> => {};

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
            <MenuItem icon={<CopyAddRegular />} onClick={copyBooking}>
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
