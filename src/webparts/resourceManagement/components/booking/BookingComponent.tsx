import * as React from "react";
import styles from "./BookingComponent.module.scss";
import {
  Text,
  TextField,
  Dropdown,
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
import {
  formatDateForApi,
  formatDateForDisplay,
  extractTime,
  calculateEstimatedHours,
  getDatesBetween,
} from "../dateUtils";
import BackEndService, { Registration } from "../../services/BackEnd";
import {
  DateConvention,
  DateTimePicker,
  TimeConvention,
  TimeDisplayControlType,
} from "@pnp/spfx-controls-react";

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
  // const [estimatedHours, setEstimatedHours] = React.useState<string>("");
  // const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [startDateTime, setStartDateTime] = React.useState<Date | undefined>(
    undefined
  );
  const [endDateTime, setEndDateTime] = React.useState<Date | undefined>(
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
    if (!startDateTime || !endDateTime) {
      alert("Vælg en start- og slutdato!");
      console.error("Brugeren har ikke valgt start- eller slutdato");
      return;
    }

    const dates = getDatesBetween(startDateTime, endDateTime);
    const startTime = extractTime(startDateTime);
    const endTime = extractTime(endDateTime);
    const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);

    if (dates === undefined || estimatedHours === undefined) {
      console.error(
        "Kunne ikke oprette booking, da startdato forekom efter slutdato"
      );
      return;
    }

    // Create a registration for each day
    const registrations = dates.map((date) => {
      const registrationData: Partial<Registration> = {
        shortDescription: title,
        description: info,
        date: formatDateForApi(date),
        start: startTime,
        end: endTime,
        time: estimatedHours,
        employee: selectedCoworkers.map((coworker) => coworker.email).join(","),
        registrationType: 2, // = "Booking"
      };

      return registrationData;
    });

    // Send each registration to the database
    registrations.forEach((registration) => {
      BackEndService.Instance.createRegistration(registration);
      console.log(registration);
    });

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

  React.useEffect(() => {}, []);

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

          {/* <TextField
            placeholder="Estimat i hele timer"
            value={estimatedHours}
            onChange={(e, newValue) => setEstimatedHours(newValue || "")}
            type="number"
            className={styles.inputFields}
            required
          /> */}

          {/* <DatePicker
            placeholder="Vælg dato"
            showMonthPickerAsOverlay
            value={selectedDate}
            onSelectDate={(date) => setSelectedDate(date || undefined)}
            firstDayOfWeek={DayOfWeek.Monday}
            className={styles.inputFields}
            formatDate={(date) =>
              date ? formatDateForDisplay(date.toISOString()) : ""
            }
          /> */}

          {/* Start DateTimePicker */}
          <DateTimePicker
            label="Starttid"
            placeholder="Vælg en dato"
            dateConvention={DateConvention.DateTime}
            timeConvention={TimeConvention.Hours24}
            firstDayOfWeek={DayOfWeek.Monday}
            timeDisplayControlType={TimeDisplayControlType.Dropdown}
            minutesIncrementStep={5}
            showMonthPickerAsOverlay
            showSeconds={false}
            value={startDateTime}
            formatDate={(date) =>
              date ? formatDateForDisplay(date.toISOString()) : ""
            }
            onChange={(date) => setStartDateTime(date || undefined)}
          />

          {/* End DateTimePicker */}
          <DateTimePicker
            label="Sluttid"
            placeholder="Vælg en dato"
            dateConvention={DateConvention.DateTime}
            timeConvention={TimeConvention.Hours24}
            firstDayOfWeek={DayOfWeek.Monday}
            timeDisplayControlType={TimeDisplayControlType.Dropdown}
            minutesIncrementStep={5}
            showMonthPickerAsOverlay
            showSeconds={false}
            value={endDateTime}
            formatDate={(date) =>
              date ? formatDateForDisplay(date.toISOString()) : ""
            }
            onChange={(date) => setEndDateTime(date || undefined)}
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
