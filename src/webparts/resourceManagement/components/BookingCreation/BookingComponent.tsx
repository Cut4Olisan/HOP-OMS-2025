import * as React from "react";
import styles from "./BookingComponent.module.scss";
import {
  Text,
  TextField,
  DefaultButton,
  PrimaryButton,
  Stack,
  DayOfWeek,
  Toggle,
  IPersonaProps,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import {
  formatDateForApi,
  extractTime,
  calculateEstimatedHours,
  getDatesBetween,
  calculateRecurrenceDates,
} from "../dateUtils";
import RecursionPanel from "./RecursionDate";
import DateTimePickerComponent from "./DateTimePicker";
import {
  Customer,
  Project,
} from "./CustomerAndProjects/interfaces/ICustomerProjectsProps";
import { Registration } from "./interfaces/IRegistrationProps";
import BackEndService from "../../services/BackEnd";
import CustomerProjects from "./CustomerAndProjects/CustomerProjects";
import { IBookingComponentProps } from "./interfaces/IBookingComponentProps";

export interface IPeoplePickerItem {
  id: string;
  fullName: string;
  email: string;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({
  context,
  onFinish,
}) => {
  const [title, setTitle] = React.useState<string>("");
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();
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
  const [isRecurring, setIsRecurring] = React.useState<boolean>(false);
  const [recursionData, setRecursionData] = React.useState<{
    days: DayOfWeek[];
    weeks: number;
  } | null>(null);

  React.useEffect(() => {
    setTimeout(() => setSuccess(undefined), 5000);
  }, [success]);
  React.useEffect(() => {
    setTimeout(() => setError(undefined), 5000);
  }, [error]);

  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const onSave = async (): Promise<void> => {
    if (!title)
      return setError("Kunne ikke oprette booking - Titel er påkrævet");
    if (!selectedCustomer)
      return setError("Kunne ikke oprette booking - Manglende kunde");
    if (!startDateTime || !endDateTime)
      return setError("Kunne ikke oprette booking - Manglende datoer");
    if (!selectedCoworkers || selectedCoworkers.length === 0)
      return setError("Kunne ikke oprette booking - Manglende medarbejdere");

    let dates: Date[] = [];
    const dateResult = getDatesBetween(startDateTime, endDateTime);
    if (dateResult instanceof Error) {
      console.log(dateResult.message);
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

    // Create a registration for each coworker for each date
    const registrations = selectedCoworkers.flatMap((coworker) =>
      dates.map((date) => {
        const registrationData: Partial<Registration> = {
          shortDescription: title,
          description: info,
          date: formatDateForApi(date),
          start: startTime,
          end: endTime,
          time: estimatedHours,
          employee: coworker,
          registrationType: 2, // Booking
        };

        return registrationData;
      })
    );

    const finishedRegistrations = await Promise.all(
      registrations.map(async (r: Registration) => {
        return await BackEndService.Instance.createRegistration(r);
      })
    );

    setSuccess("Booking oprettet!");
    return onFinish(finishedRegistrations);
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
        {success && (
          <MessageBar messageBarType={MessageBarType.success}>
            {success}
          </MessageBar>
        )}
        {error && (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        )}
        <Stack tokens={{ childrenGap: 15 }}>
          <Text variant={"xxLargePlus"} className={styles.headingMargin}>
            Opret booking
          </Text>

          <TextField
            label="Titel"
            placeholder="Titel"
            value={title}
            onChange={(e, newValue) => setTitle(newValue || "")}
            onGetErrorMessage={(value) => {
              return !!value.length ? "" : "Titel er påkrævet";
            }}
            validateOnLoad={false}
            required
          />

          <CustomerProjects
            customers={customers}
            projects={projects}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
          />

          <DateTimePickerComponent
            label="Starttid"
            value={startDateTime}
            onChange={setStartDateTime}
          />

          <DateTimePickerComponent
            label="Sluttid"
            value={endDateTime}
            onChange={setEndDateTime}
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
