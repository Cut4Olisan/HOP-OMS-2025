import styles from "./bookingCardMenu.module.scss";
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from "@fluentui/react-components";
import * as React from "react";
import {
  ClipboardEditRegular,
  EditRegular,
  CopyAddRegular,
  DeleteRegular,
} from "@fluentui/react-icons";

interface IBookingCardMenuProps {}

const BookingCardMenu: React.FC<IBookingCardMenuProps> = ({}) => {
  /*
        Menu punkt til bookingcard - kommer til at indholde kald til => slet, rediger, kopier funktionerne i *MenuItem*
  */

  return (
    <div>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button icon={<ClipboardEditRegular />} size="small"></Button>
        </MenuTrigger>
        <MenuPopover className={styles.menuPopover}>
          <MenuList className={styles.menuListItems}>
            <MenuItem icon={<EditRegular />} onClick={undefined}>
              Rediger
            </MenuItem>
            <MenuItem icon={<CopyAddRegular />} onClick={undefined}>
              Kopier
            </MenuItem>
            <MenuItem icon={<DeleteRegular />} onClick={undefined}>
              Slet
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default BookingCardMenu;
