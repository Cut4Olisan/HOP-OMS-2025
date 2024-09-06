import * as React from "react";
import styles from "./BookingComponent.module.scss";
import {
  Text,
  TextField,
  Dropdown,
  DatePicker,
  DefaultButton,
  PrimaryButton,
  Stack,
  DayOfWeek,
  IDropdownStyles,
} from "@fluentui/react";
import { useCustomerList } from "../Customers/fetchCustomers";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBookingComponentProps {
  context: WebPartContext;
  customers: { key: string; text: string }[];
  coworkers: { key: string; text: string }[];
  projects: { key: string; text: string }[];
}

export interface IPeoplePickerItem {
  id: string;
  fullName: string;
  email: string;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({
  coworkers,
  projects,
  context,
}) => {
  const [title, setTitle] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<
    string | undefined
  >(undefined);
  const [estimatedHours, setEstimatedHours] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<
    IPeoplePickerItem[]
  >([]);

  const { customers } = useCustomerList();

  const _getPeoplePickerItems = (items: IPeoplePickerItem[]): void => {
    setSelectedCoworkers(items);
  };

  const onSave = (): void => {
    console.log({
      title,
      selectedCustomer,
      estimatedHours,
      selectedDate,
      selectedCoworkers,
    });
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const dropdownStyles: Partial<IDropdownStyles> = {
    callout: {
      maxHeight: 200,
      overflowY: "auto",
    },
    dropdown: {
      maxWidth: 300,
    },
    dropdownItem: {
      height: "auto",
    },
    dropdownOptionText: {
      overflow: "visible",
      whiteSpace: "normal",
    },
  };

  return (
    <Stack horizontal>
      <div className={styles.halfWidth}>
        <Stack tokens={{ childrenGap: 15 }}>
          <Text variant={"xxLargePlus"} className={styles.headingMargin}>
            Opret booking
          </Text>

          <TextField
            placeholder="Titel"
            value={title}
            onChange={(e, newValue) => setTitle(newValue || "")}
            className={styles.inputFields}
            required
          />

          <Dropdown
            placeholder="Vælg kunde"
            options={customers.map((customer) => ({
              key: customer.id,
              text: customer.name,
            }))}
            selectedKey={selectedCustomer}
            onChange={(e, option) => setSelectedCustomer(option?.key as string)}
            className={styles.inputFields}
            styles={dropdownStyles}
            required
          />

          <TextField
            placeholder="Estimat i hele timer"
            value={estimatedHours}
            onChange={(e, newValue) => setEstimatedHours(newValue || "")}
            type="number"
            className={styles.inputFields}
            required
          />

          <DatePicker
            placeholder="Vælg dato"
            showMonthPickerAsOverlay
            value={selectedDate}
            onSelectDate={(date) => setSelectedDate(date || undefined)}
            firstDayOfWeek={DayOfWeek.Monday}
            className={styles.inputFields}
            formatDate={formatDate}
          />

          <PeoplePicker
            context={{
              absoluteUrl: context.pageContext.web.absoluteUrl,
              msGraphClientFactory: context.msGraphClientFactory,
              spHttpClient: context.spHttpClient,
            }}
            titleText="Vælg medarbejder"
            personSelectionLimit={3}
            groupName={""} // Empty = filter from all users
            showtooltip={false}
            required={false}
            onChange={_getPeoplePickerItems}
            principalTypes={[PrincipalType.User]}
            resolveDelay={1000}
          />

          <TextField
            placeholder="Information..."
            value={info}
            onChange={(e, newValue) => setInfo(newValue || "")}
            multiline
            rows={7}
            resizable={false}
            className={styles.textArea}
          />

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton text="Gem" onClick={onSave} />
            <DefaultButton
              text="Annuller"
              onClick={() => console.log("Cancelled")}
            />
          </Stack>
        </Stack>
      </div>
      <div className={styles.halfWidth}>
        <Text variant={"xxLarge"} className={styles.headingMargin}>
          Fremtidige bookinger på
        </Text>
      </div>
    </Stack>
  );
};

export default BookingComponent;
