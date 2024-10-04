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
import { ICustomer, IProject } from "../interfaces/ICustomerProjectsProps";
import {
  IRegistration,
  IRegistrationData,
} from "../interfaces/IRegistrationProps";
import BackEndService from "../../services/BackEnd";
import CustomerProjects from "./CustomerAndProjects/CustomerProjects";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBookingComponentProps {
  context: WebPartContext;
  customers: ICustomer[];
  coworkers: { key: string; text: string }[];
  projects: IProject[];
  onFinish: (bookings: unknown[]) => void;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({
  context,
  onFinish,
  customers,
  projects,
}) => {
  const [title, setTitle] = React.useState<string>("");
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();
  const [info, setInfo] = React.useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<
    ICustomer | undefined
  >(undefined);
  /*   const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
 */
  const [selectedProject, setSelectedProject] = React.useState<IProject | undefined>();
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
        const registrationData: IRegistrationData = {
          projectId: selectedProject?.id,
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
      registrations.map(async (r: IRegistration) => {
        return await BackEndService.Instance.createRegistration(r);
      })
    );

    setSuccess("Booking oprettet!");
    return onFinish(finishedRegistrations);
  };

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
            customerLabel="Vælg kunde"
            projects={projects}
            projectLabel="Vælg projekt"
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            required={true}
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
