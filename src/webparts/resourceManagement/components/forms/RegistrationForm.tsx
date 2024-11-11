import * as React from "react";
import {
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
  calculateEstimatedHours,
  calculateRecurrenceDates,
} from "../../utilities/DateUtilities";
import RecursionDatePicker from "../generic/RecursionDatePicker";
import DateTimePicker from "../generic/DateTimePicker";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import BackEndService from "../../services/BackEnd";
import CustomerProjectsPicker from "../generic/CustomerProjects";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IRecursionData } from "../interfaces/IComponentFormData";
import {
  CustomerDTO,
  EditRegistrationRequestDTO,
  ProjectDTO,
  RegistrationDTO,
} from "../interfaces";
import useGlobal from "../../hooks/useGlobal";
import {
  NotificationType,
  PanelState,
  RegistrationPanelState,
} from "../../context/GlobalContext";
import PeoplePicker from "../PeoplePicker";

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

export interface IRegistrationFormProps {
  context: WebPartContext;
  onFinish: () => void;
  dismissPanel: () => void;
  formState: PanelState<RegistrationPanelState, RegistrationDTO>;
}

const RegistrationForm: React.FC<IRegistrationFormProps> = ({
  context,
  onFinish,
  dismissPanel,
  formState,
}) => {
  const { employees, createNotification } = useGlobal();
  const { customers, projects } = useGlobal();
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
    if (!formState.data) return;

    setFormData({
      ...formData,
      date: new Date(formState.data.date || ""),
      startTime: formState.data.start || "",
      endTime: formState.data.end || "",
    });
  }, []);
  React.useEffect(() => {
    if (!formState.data) return;

    const project = projects.find((p) => p.id === formState.data?.projectId);
    const customer = customers.find((c) => c.id === project?.customerId);

    if (!project || !customer) return;

    const datePart = formState.data.date ?? "".split("T")[0];

    setFormData({
      title: formState.data.shortDescription || "",
      info: formState.data.description || "",
      isRecurring: false,
      selectedCoworker: formState.data.employee ?? "",
      selectedCustomer: customer,
      selectedProject: project,
      date: new Date(datePart),
      startTime: formState.data.start || "",
      endTime: formState.data.end || "",
    });
  }, [formState.data, projects, customers]);

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
    if (formState.state === RegistrationPanelState.Edit && formState.data) {
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
          formState.data.id ?? 0,
          updateData
        );
        createNotification("Booking opdateret!", NotificationType.Success);
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
        createNotification("Booking oprettet!", NotificationType.Success);
        return onFinish();
      } catch (error) {
        setError("Kunne ikke oprette booking.");
      }
    }
  };

  return (
    <>
      <Stack
        style={{ width: "100%", display: "flex", flexDirection: "column" }}
      >
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

          <CustomerProjectsPicker
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

          <DateTimePicker
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

          {formState.state !== RegistrationPanelState.Edit && (
            <>
              <Toggle
                label="Gentag booking"
                checked={formData.isRecurring}
                onChange={(e, checked) =>
                  setFormData({ ...formData, isRecurring: !!checked })
                }
              />
              {formData.isRecurring && (
                <RecursionDatePicker
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
          <PeoplePicker
            employees={employees}
            selectedEmployee={employees.find(
              (e) =>
                e.email?.toLowerCase() ===
                formData.selectedCoworker.toLowerCase()
            )}
            onChange={(employee) => {
              if (!employee)
                return setFormData({ ...formData, selectedCoworker: "" });

              return setFormData({
                ...formData,
                selectedCoworker: employee.email ? employee.email : "",
              });
            }}
            label="Vælg medarbejder"
            placeholder="Vælg medarbejder"
            context={context}
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

export default RegistrationForm;
