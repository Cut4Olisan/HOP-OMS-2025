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
  Toggle,
  Checkbox,
  ITextFieldStyles,
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
  const [startDateTime, setStartDateTime] = React.useState<Date | undefined>(
    undefined
  );
  const [endDateTime, setEndDateTime] = React.useState<Date | undefined>(
    undefined
  );
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<string[]>(
    []
  );
  const [debuggingMode, setDebuggingMode] = React.useState<boolean>(false);
  const [isRecurring, setIsRecurring] = React.useState<boolean>(false);
  const { customers } = useCustomerList();

  const _getPeoplePickerItems = (items: any[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails);
  };

  const onSave = async (): Promise<void> => {
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
        employee: selectedCoworkers.join(","),
        registrationType: 2, // = "Booking"
      };

      return registrationData;
    });
    console.log("Debugging mode is: ", debuggingMode);
    registrations.forEach(async (registration) => {
      if (!debuggingMode) {
        // POST'er til DB hvis debugging mode er slået fra
        await BackEndService.Instance.createRegistration(registration);
        console.log("Booking oprettet: ", registration);
      } else {
        console.log("Debugging mode: Booking not posted to DB: ", registration);
      }
    });
  };

  const narrowTextFieldStyles: Partial<ITextFieldStyles> = {
    fieldGroup: { width: 100 },
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

  React.useEffect(() => {
    const getBookings = async (): Promise<void> => {
      try {
        const bookings = await BackEndService.Instance.getRegistrations(2);
        console.log(bookings);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      }
    };

    getBookings().catch((e) => console.error(e));
  }, []);

  return (
    <Stack horizontal>
      <div className={styles.halfWidth}>
        <Stack tokens={{ childrenGap: 15 }}>
          <Text variant={"xxLargePlus"} className={styles.headingMargin}>
            Opret booking
          </Text>

          <Toggle
            label="Debugging mode (ingen DB posts)"
            checked={debuggingMode}
            onChange={(e, checked) => {
              if (checked) {
                console.log(
                  "Debugging mode: " + !!checked + " - no database actions."
                );
              } else {
                console.warn(
                  "Debugging mode: " +
                    !!checked +
                    " - database actions enabled!"
                );
              }
              setDebuggingMode(!!checked);
            }}
          />

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

          <Toggle
            label="Skal denne booking gentages ugentligt?"
            checked={isRecurring}
            onChange={(e, checked) => {
              setIsRecurring(!!checked);
            }}
          />

          {isRecurring && (
            <div>
              <Text variant="large">Gentag booking hver...</Text>
              <Stack tokens={{ childrenGap: 5 }}>
                <Checkbox label="Mandag" />
                <Checkbox label="Tirsdag" />
                <Checkbox label="Onsdag" />
                <Checkbox label="Torsdag" />
                <Checkbox label="Fredag" />
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 5 }}>
                <Text variant={"large"}>I de næste</Text>
                <TextField placeholder="..." styles={narrowTextFieldStyles} />
                <Text variant={"large"}>uger</Text>
              </Stack>
            </div>
          )}

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
            rows={3}
            className={styles.inputFields}
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
    </Stack>
  );
};

export default BookingComponent;
