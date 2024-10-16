import * as React from "react";
import styles from "./BookingComponent.module.scss";
import {
  Text,
  TextField,
  DefaultButton,
  PrimaryButton,
  Stack,
  Toggle,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  formatDateForApi,
  extractTime,
  calculateEstimatedHours,
  getDatesBetween,
  calculateRecurrenceDates,
} from "../dateUtils";
import RecursionPanel from "./RecursionDate";
import DateTimePickerComponent from "./DateTimePicker";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import BackEndService from "../../services/BackEnd";
import CustomerProjects from "./CustomerAndProjects/CustomerProjects";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IRecursionData } from "../RequestCreation/interfaces/IComponentFormData";
import {
  CustomerDTO,
  EditRegistrationRequestDTO,
  ProjectDTO,
  RegistrationDTO,
} from "../interfaces";
import useGlobal from "../../hooks/useGlobal";
import { parseTime } from "../dateUtils";
import OurPeoplePicker from "../PeoplePicker";

export interface IComponentFormData {
  title: string;
  info: string;
  selectedCustomer?: CustomerDTO;
  selectedProject?: ProjectDTO;
  startDateTime?: Date;
  endDateTime?: Date;
  selectedCoworkers: string[];
  isRecurring: boolean;
  recursionData?: IRecursionData;
}

export interface IBookingComponentProps {
  context: WebPartContext;
  onFinish: (bookings: unknown[]) => void;
  dismissPanel: () => void;
  registration?: RegistrationDTO;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({
  context,
  onFinish,
  dismissPanel,
  registration,
}) => {
  const { employees } = useGlobal();
  const { customers, projects, isEditMode } = useGlobal();
  const [formData, setFormData] = React.useState<IComponentFormData>({
    title: "",
    info: "",
    isRecurring: false,
    selectedCoworkers: [],
  });

  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!registration) return;

    const project = projects.find((p) => p.id === registration.projectId);
    const customer = customers.find((c) => c.id === project?.customerId);

    if (!project || !customer) return;

    const datePart = registration.date ?? "".split("T")[0];
    const { hour: startHour, minute: startMinute } = parseTime(
      registration.start ?? ""
    );
    const { hour: endHour, minute: endMinute } = parseTime(
      registration.end ?? ""
    );

    const startDateTime = new Date(datePart);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(datePart);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      console.error("Invalid date format in registration:", {
        startDateTimeString: registration.start,
        endDateTimeString: registration.end,
      });
      return; //Exit if we have invalid dates
    }

    setFormData({
      title: registration.shortDescription || "",
      info: registration.description || "",
      isRecurring: false,
      selectedCoworkers: [registration.employee ?? ""],
      selectedCustomer: customer,
      selectedProject: project,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    });

    console.log("Form data set with registration:", {
      title: registration.shortDescription,
      info: registration.description || "",
      selectedCoworkers: [registration.employee],
      selectedCustomer: customer,
      selectedProject: project,
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    });
  }, [registration, projects, customers]);

  React.useEffect(() => {
    setTimeout(() => setSuccess(undefined), 5000);
  }, [success]);
  React.useEffect(() => {
    setTimeout(() => setError(undefined), 5000);
  }, [error]);

  // const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
  //   const emails = items.map((item) => item.secondaryText);
  //   setFormData({
  //     ...formData,
  //     selectedCoworkers: emails.filter((e) => !!e) as string[],
  //   });
  // };

  const onSave = async (): Promise<void> => {
    if (!formData.title)
      return setError("Kunne ikke oprette booking - Titel er påkrævet");
    if (!formData.selectedCustomer)
      return setError("Kunne ikke oprette booking - Manglende kunde");
    if (!formData.selectedProject)
      return setError("Kunne ikke oprette booking - Manglende projekt");
    if (!formData.startDateTime || !formData.endDateTime)
      return setError("Kunne ikke oprette booking - Manglende datoer");
    if (!formData.selectedCoworkers || formData.selectedCoworkers.length === 0)
      return setError("Kunne ikke oprette booking - Manglende medarbejdere");

    let dates: Date[] = [];
    const dateResult = getDatesBetween(
      formData.startDateTime,
      formData.endDateTime
    );
    if (dateResult instanceof Error) {
      console.log(dateResult.message);
    } else {
      dates = dateResult;
    }

    if (
      formData.isRecurring &&
      formData.recursionData &&
      formData.recursionData.weeks > 0
    ) {
      const recurrenceDates = calculateRecurrenceDates(
        formData.startDateTime,
        formData.recursionData.days,
        formData.recursionData.weeks
      );
      dates = [...dates, ...recurrenceDates];
    }

    const startTime = extractTime(formData.startDateTime);
    const endTime = extractTime(formData.endDateTime);
    const estimatedHours = calculateEstimatedHours(
      formData.startDateTime,
      formData.endDateTime
    );

    if (dates === undefined || estimatedHours === undefined) {
      return setError("Kunne ikke oprette booking - Ugyldige datoer");
    }

    if (estimatedHours instanceof Error) {
      return setError(estimatedHours.message);
    }

    const registrations = formData.selectedCoworkers.flatMap((coworker) =>
      dates.map((date) => {
        const registrationData: IRegistrationData = {
          projectId: formData.selectedProject?.id,
          shortDescription: formData.title,
          description: formData.info,
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

    //Check if we are in edit mode or create mode
    if (isEditMode && registration) {
      //Update existing booking
      try {
        const updatePromises = registrations.map(async (r) => {
          const updateData: EditRegistrationRequestDTO = {
            shortDescription: r.shortDescription,
            description: r.description,
            projectId: r.projectId,
            date: r.date,
            start: r.start,
            end: r.end,
            time: r.time,
            registrationType: r.registrationType,
          };

          return await BackEndService.Api.registrationsUpdate(
            registration.id ?? 0,
            updateData
          );
        });

        await Promise.all(updatePromises);
        setSuccess("Booking opdateret!");
        return onFinish([]);
      } catch (error) {
        setError("Kunne ikke opdatere booking.");
      }
    } else {
      //Create new booking
      try {
        const createPromises = registrations.map(async (r) => {
          return await BackEndService.Api.registrationsCreate(r);
        });

        await Promise.all(createPromises);
        setSuccess("Booking oprettet!");
        return onFinish([]);
      } catch (error) {
        setError("Kunne ikke oprette booking.");
      }
    }
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
            {isEditMode ? "Redigere booking" : "Opret booking"}
          </Text>

          <TextField
            label="Titel"
            placeholder="Titel"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.currentTarget.value })
            }
            onGetErrorMessage={(value) => {
              return !!value.length ? "" : "Titel er påkrævet";
            }}
            validateOnLoad={false}
            required
          />

          <CustomerProjects
            customerLabel="Vælg kunde"
            projectLabel="Vælg projekt"
            selectedCustomer={formData.selectedCustomer}
            onUpdateSelectedCustomer={(customer) =>
              setFormData({ ...formData, selectedCustomer: customer })
            }
            selectedProject={formData.selectedProject}
            onUpdateSelectedProject={(project) =>
              setFormData({ ...formData, selectedProject: project })
            }
            required={true}
          />

          <DateTimePickerComponent
            label="Starttid"
            value={formData.startDateTime}
            onChange={(d) => setFormData({ ...formData, startDateTime: d })}
          />

          <DateTimePickerComponent
            label="Sluttid"
            value={formData.endDateTime}
            onChange={(d) => setFormData({ ...formData, endDateTime: d })}
          />

          <Toggle
            label="Skal denne booking gentages ugentligt?"
            checked={formData.isRecurring}
            onChange={(e, checked) =>
              setFormData({ ...formData, isRecurring: !!checked })
            }
          />
          {formData.isRecurring && (
            <RecursionPanel
              onRecursionChange={(d, w) =>
                setFormData({
                  ...formData,
                  recursionData: { days: d, weeks: w },
                })
              }
            />
          )}

          {/* <PeoplePicker
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
            defaultSelectedUsers={
              formData.selectedCoworkers.filter(
                (email) => email !== undefined
              ) as string[]
            }
            principalTypes={[PrincipalType.User]}
            resolveDelay={1000}
          /> */}

          <OurPeoplePicker
            employees={employees}
            onChange={(employee) => {
              employee
                ? setFormData({
                    ...formData,
                    selectedCoworkers: employee.email ? [employee.email] : [],
                  })
                : setFormData({ ...formData, selectedCoworkers: [] });
            }}
            label="Vælg medarbejder"
            placeholder="Vælg medarbejder"
          />

          <TextField
            label="Booking information"
            placeholder="Skriv information om booking"
            value={formData.info}
            onChange={(e) =>
              setFormData({ ...formData, info: e.currentTarget.value })
            }
            multiline
            rows={5}
          />

          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton text="Gem" onClick={onSave} />
            <DefaultButton text="Annuller" onClick={dismissPanel} />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};

export default BookingComponent;
