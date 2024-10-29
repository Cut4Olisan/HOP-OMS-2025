import * as React from "react";
import styles from "./BookingComponent.module.scss";
import {
  TextField,
  DefaultButton,
  PrimaryButton,
  Stack,
  Toggle,
  MessageBar,
  MessageBarType,
  Persona,
  PersonaSize,
  Label,
  /*   Persona,
  PersonaSize, */
} from "@fluentui/react";
import {
  formatDateForApi,
  calculateEstimatedHours,
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
// import { parseTime } from "../dateUtils";
import OurPeoplePicker from "../PeoplePicker";
import { NotificationType } from "../../context/GlobalContext";

export interface IComponentFormData {
  title: string;
  info: string;
  selectedCustomer?: CustomerDTO;
  selectedProject?: ProjectDTO;
  date: Date;
  startTime: string;
  endTime: string;
  selectedCoworker: string;
  isRecurring: boolean;
  recursionData?: IRecursionData;
}

export interface IBookingComponentProps {
  context: WebPartContext;
  onFinish: () => void;
  dismissPanel: () => void;
  registration?: RegistrationDTO;
}

const BookingComponent: React.FC<IBookingComponentProps> = ({
  context,
  onFinish,
  dismissPanel,
  registration,
}) => {
  const { employees, notifications, setNotifications } = useGlobal();
  const { customers, projects, isEditMode } = useGlobal();
  const [formData, setFormData] = React.useState<IComponentFormData>({
    title: "",
    info: "",
    isRecurring: false,
    selectedCoworker: "",
    date: new Date(),
    startTime: "",
    endTime: "",
  });
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (!registration) return;

    setFormData({
      ...formData,
      date: new Date(registration.date || ""),
      startTime: registration.start || "",
      endTime: registration.end || "",
    });
  }, []);
  React.useEffect(() => {
    if (!registration) return;

    const project = projects.find((p) => p.id === registration.projectId);
    const customer = customers.find((c) => c.id === project?.customerId);

    if (!project || !customer) return;

    const datePart = registration.date ?? "".split("T")[0];
    // const { hour: startHour, minute: startMinute } = parseTime(
    //   registration.start ?? ""
    // );
    // const { hour: endHour, minute: endMinute } = parseTime(
    //   registration.end ?? ""
    // );

    // const startDateTime = new Date(datePart);
    // startDateTime.setHours(startHour, startMinute, 0, 0);

    // const endDateTime = new Date(datePart);
    // endDateTime.setHours(endHour, endMinute, 0, 0);

    // if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    //   console.error("Invalid date format in registration:", {
    //     startDateTimeString: registration.start,
    //     endDateTimeString: registration.end,
    //   });
    //   return; //Exit if we have invalid dates
    // }

    setFormData({
      title: registration.shortDescription || "",
      info: registration.description || "",
      isRecurring: false,
      selectedCoworker: registration.employee ?? "",
      selectedCustomer: customer,
      selectedProject: project,
      date: new Date(datePart),
      startTime: registration.start || "",
      endTime: registration.end || "",
    });
  }, [registration, projects, customers]);

  React.useEffect(() => {
    const timer = setTimeout(() => setError(undefined), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const onSave = async (): Promise<void> => {
    if (!formData.title)
      return setError("Kunne ikke oprette booking - Titel er påkrævet");
    if (!formData.selectedCustomer)
      return setError("Kunne ikke oprette booking - Manglende kunde");
    if (!formData.date)
      return setError("Kunne ikke oprette booking - Manglende dato");
    if (!formData.selectedCoworker || formData.selectedCoworker.length === 0)
      return setError("Kunne ikke oprette booking - Manglende medarbejdere");

    let dates: Date[] = [];

    if (
      formData.isRecurring &&
      formData.recursionData &&
      formData.recursionData.weeks > 0
    ) {
      const recurrenceDates = calculateRecurrenceDates(
        formData.date,
        formData.recursionData.days,
        formData.recursionData.weeks
      );
      dates = [...recurrenceDates];
    }

    const estimatedHours = calculateEstimatedHours(
      formData.startTime,
      formData.endTime
    );

    if (dates === undefined || estimatedHours === undefined) {
      return setError("Kunne ikke oprette booking - Ugyldig dato");
    }

    if (estimatedHours instanceof Error) {
      return setError(estimatedHours.message);
    }

    const recurring = dates.map((date) => {
      const registrationData: IRegistrationData = {
        projectId: formData.selectedProject?.id,
        shortDescription: formData.title,
        description: formData.info,
        date: formatDateForApi(date),
        start: formData.startTime,
        end: formData.endTime,
        time: estimatedHours,
        employee: formData.selectedCoworker,
        registrationType: 2, // Booking
      };

      return registrationData;
    });
    const single: IRegistrationData = {
      projectId: formData.selectedProject?.id,
      shortDescription: formData.title,
      description: formData.info,
      date: formatDateForApi(formData.date),
      start: formData.startTime,
      end: formData.endTime,
      time: estimatedHours,
      employee: formData.selectedCoworker,
      registrationType: 2, // Booking
    };

    //Check if we are in edit mode or create mode
    if (isEditMode && registration) {
      //Update existing booking
      try {
        const updateData: EditRegistrationRequestDTO = {
          shortDescription: formData.title,
          description: formData.info,
          projectId: formData.selectedProject?.id,
          date: formatDateForApi(formData.date),
          start: formData.startTime,
          end: formData.endTime,
          registrationType: 2,
        };

        await BackEndService.Api.registrationsUpdate(
          registration.id ?? 0,
          updateData
        );
        setNotifications([
          ...notifications,
          {
            type: NotificationType.Success,
            message: "Booking opdateret!",
          },
        ]);
        return onFinish();
      } catch (error) {
        return setError("Kunne ikke opdatere booking.");
      }
    } else {
      //Create new booking
      try {
        await Promise.all(
          [...recurring, single].map(async (r) => {
            return await BackEndService.Api.registrationsCreate(r);
          })
        );
        setNotifications([
          ...notifications,
          {
            type: NotificationType.Success,
            message: "Booking oprettet!",
          },
        ]);
        return onFinish();
      } catch (error) {
        setError("Kunne ikke oprette booking.");
      }
    }
  };

  return (
    <>
      <Stack className={styles.componentBody}>
        {error && (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        )}
        <Stack tokens={{ childrenGap: 15 }}>
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
            customerRequired={true}
            projectRequired={false}
          />

          <DateTimePickerComponent
            label="Dato"
            value={{
              date: formData.date,
              endTime: formData.endTime,
              startTime: formData.startTime,
            }}
            onChange={(d) =>
              setFormData({
                ...formData,
                date: d.date,
                startTime: d.startTime,
                endTime: d.endTime,
              })
            }
          />

          {!isEditMode && (
            <>
              <Toggle
                label="Gentag booking"
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
            </>
          )}

          {!isEditMode ? (
            <OurPeoplePicker
              employees={employees}
              onChange={(employee) => {
                employee
                  ? setFormData({
                      ...formData,
                      selectedCoworker: employee.email ? employee.email : "",
                    })
                  : setFormData({ ...formData, selectedCoworker: "" });
              }}
              label="Vælg medarbejder"
              placeholder="Vælg medarbejder"
              context={context}
            />
          ) : (
            (() => {
              const employee = employees.find(
                (e) =>
                  e.email?.toLowerCase() ===
                  registration?.employee?.toLowerCase()
              );
              console.log(employee);
              if (!employee) return undefined;
              return (
                <>
                  <Label style={{ fontWeight: 600 }}>Medarbejder</Label>
                  <Persona
                    text={`${employee.givenName} ${employee.surName}`}
                    secondaryText={employee.email as string | undefined}
                    size={PersonaSize.size32}
                    imageUrl={`${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${employee.email}`}
                  />
                </>
              );
            })()
          )}

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
