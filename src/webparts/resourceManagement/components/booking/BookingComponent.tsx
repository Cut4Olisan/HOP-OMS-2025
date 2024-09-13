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
  IPersonaProps,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
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
  calculateRecurrenceDates,
} from "../dateUtils";
import BackEndService, { Registration } from "../../services/BackEnd";
import {
  DateConvention,
  DateTimePicker,
  TimeConvention,
  TimeDisplayControlType,
} from "@pnp/spfx-controls-react";
import RecursionPanel from "./recursion";

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

export interface Customer {
  id: number;
  name: string;
  active: boolean;
}

export interface Project {
  id: string;
  name: string;
  customerId: number;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({ context }) => {
  const [title, setTitle] = React.useState<string>("");
  const [error, setError] = React.useState<string | undefined>();
  const [info, setInfo] = React.useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<
    Customer | undefined
  >(undefined);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<string>("");
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
  const [recursionData, setRecursionData] = React.useState<{
    days: DayOfWeek[];
    weeks: number;
  } | null>(null);

  React.useEffect(() => {
    setTimeout(() => setError(undefined), 5000);
  }, [error]);

  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const onSave = async (): Promise<void> => {
    if (!startDateTime || !endDateTime) {
      return setError("Vælg en start- og slutdato!");
    }
    if (!title) {
      return setError("Titel manger");
    }
    if (!selectedCustomer) {
      return setError("Vælg en kunde");
    }
    if (!selectedCoworkers) {
      return setError("Vælg en medarbejder");
    }

    let dates: Date[] | [] = [];
    const dateResult = getDatesBetween(startDateTime, endDateTime);
    if (dateResult instanceof Error) {
      setError(dateResult.message);
    } else {
      dates = dateResult;
    }

    if (isRecurring && recursionData && recursionData.weeks > 0) {
      const recurrenceDates = calculateRecurrenceDates(
        startDateTime,
        recursionData.days,
        recursionData.weeks
      );
      dates = [...dates, ...recurrenceDates];
    }
    const startTime = extractTime(startDateTime);
    const endTime = extractTime(endDateTime);
    const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);

    if (dates === undefined || estimatedHours === undefined) {
      return setError("Kunne ikke oprette booking - Ugyldig datoer");
    }

    if (estimatedHours instanceof Error) {
      return setError(estimatedHours.message);
    }

    // Laver en registrering for hver dag
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
        // POST'er kun til DB hvis debugging mode er slået fra
        await BackEndService.Instance.createRegistration(registration);
        console.log("Booking oprettet: ", registration);
      } else {
        console.log("Debugging mode: Booking not posted to DB: ", registration);
      }
    });
  };

  const dropdownStyles: Partial<IDropdownStyles> = {
    callout: {
      maxHeight: 200,
      overflowY: "auto",
    },
    dropdown: {
      maxWidth: 400,
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
        const bookings = await BackEndService.Instance.getRegistrationsByType(
          2
        );
        console.log(bookings);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      }
    };

    getBookings().catch((e) => console.error(e));

    const fetchCustomers = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchProjects = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.getProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomers().catch((e) => console.error(e));
    fetchProjects().catch((e) => console.error(e));
  }, []);

  return (
    <>
      <Stack className={styles.componentBody}>
        {error && (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        )}
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
            label="Titel"
            placeholder="Titel"
            value={title}
            onChange={(e, newValue) => setTitle(newValue || "")}
            required
          />

          <Dropdown
            label="Vælg en kunde"
            placeholder="Vælg en kunde"
            options={customers
              .filter((c) => c.active)
              .map((customer) => ({
                key: customer.id,
                text: customer.name,
              }))}
            selectedKey={selectedCustomer?.id}
            onChange={(e, option) =>
              option
                ? setSelectedCustomer(
                    customers.find((c) => c.id === Number(option.key))
                  )
                : undefined
            }
            styles={dropdownStyles}
            required
          />
          {selectedCustomer && (
            <Dropdown
              label="Projekt"
              placeholder="Vælg projekt for kunde"
              options={projects
                .filter((p) => p.customerId === selectedCustomer.id)
                .map((project) => ({
                  key: project.id,
                  text: project.name,
                }))}
              selectedKey={selectedProject}
              onChange={(e, option) =>
                setSelectedProject(option?.key as string)
              }
              styles={dropdownStyles}
              className={styles.isShorter}
              required
            />
          )}

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
            onChange={(e, checked) => setIsRecurring(!!checked)}
          />
          {isRecurring && (
            <RecursionPanel
              onRecursionChange={(d, w) =>
                setRecursionData({ days: d, weeks: w })
              }
            />
          )}

          <PeoplePicker
            placeholder="Vælg medarbejder"
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
            label="Booking information"
            placeholder="Skriv information om booking"
            value={info}
            onChange={(e, newValue) => setInfo(newValue || "")}
            multiline
            rows={5}
          />

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton text="Gem" onClick={onSave} />
            <DefaultButton
              text="Annuller"
              onClick={() => console.log("Cancelled")}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default BookingComponent;