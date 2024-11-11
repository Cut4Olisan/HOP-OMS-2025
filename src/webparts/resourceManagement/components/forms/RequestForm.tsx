import * as React from "react";
import {
  DefaultButton,
  PrimaryButton,
  Stack,
  TextField,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import DateTimePickerComponent from "../generic/DateTimePicker";
import BackEndService from "../../services/BackEnd";
import {
  dateOnly,
  formatDateForApi,
  formatTime,
} from "../../utilities/DateUtilities";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import {
  AcceptRequestRequestDTO,
  CreateRequestRequstDTO,
  CustomerDTO,
  ProjectDTO,
  RequestsDTO,
} from "../interfaces";
import CustomerProjects from "../generic/CustomerProjects";
import PeoplePicker from "../PeoplePicker";
import useGlobal from "../../hooks/useGlobal";
import { NotificationType } from "../../context/GlobalContext";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export enum FormMode {
  CreateRequest = "CreateRequest",
  ConfirmRequest = "ConfirmRequest",
}

export interface IRequestFormProps {
  context: WebPartContext;
  mode: FormMode;
  onFinish: () => void;
  onAccept: () => void;
  onReject: () => void;
  onDismiss?: () => void;
  request?: RequestsDTO;
}

export interface IRequestComponentFormData {
  title: string;
  info: string;
  estimatedHours?: number;
  selectedCoworkers: string[];
  date?: Date;
  startTime: string;
  endTime: string;
  selectedCustomer?: CustomerDTO;
  selectedProject?: ProjectDTO;
}

const RequestComponent: React.FC<IRequestFormProps> = ({
  context,
  mode,
  onFinish,
  onDismiss,
  request,
}) => {
  const { employees, customers, projects, createNotification } = useGlobal();
  const [formData, setFormData] = React.useState<IRequestComponentFormData>({
    title: "",
    info: "",
    selectedCoworkers: [],
    date: new Date(),
    startTime: "08:00",
    endTime: "16:00",
  });
  const [error, setError] = React.useState<string | undefined>();
  const [warning, setWarning] = React.useState<string | undefined>();

  const [hasChanges, setHasChanges] = React.useState<boolean>(false);
  const [initialState, setInitialState] = React.useState<string>(
    JSON.stringify(formData)
  );

  const isConfirmMode = mode === FormMode.ConfirmRequest;
  const isCreationMode = mode === FormMode.CreateRequest;

  const requiredInformation = formData.title && formData.selectedCustomer;
  const hasSufficientInformation =
    requiredInformation &&
    formData.selectedCoworkers.length > 0 &&
    formData.date;

  React.useEffect(() => {
    if (JSON.stringify(formData) !== initialState) {
      return setHasChanges(true);
    }
    return setHasChanges(false);
  }, [formData, initialState]);

  const completeBooking: IRegistrationData = {
    projectId: formData.selectedProject?.id,
    shortDescription: formData.title,
    date: formData.date ? formatDateForApi(formData.date) : "",
    description: formData.info || undefined,
    start: formData.startTime,
    end: formData.endTime,
    time: formData.estimatedHours ? formData.estimatedHours : undefined,
    employee: formData.selectedCoworkers[0],
    registrationType: 5, // Template
  };
  const requestDTO: CreateRequestRequstDTO = {
    title: formData.title,
    shortDescription: formData.info,
    estimatedHours: formData.estimatedHours || undefined,
    createRegistrationRequestDTO: completeBooking,
  };

  const clearMessageBar = (): void => {
    setError(undefined);
    setWarning(undefined);
  };

  const onCreate = async (): Promise<void> => {
    if (!formData.title) return setError("Titel er påkrævet");
    if (!formData.selectedCustomer) return setError("Kunde er påkrævet");

    try {
      const result = await BackEndService.Api.requestsCreate({
        createRegistrationRequestDTO: { ...completeBooking },
        title: requestDTO.title,
        shortDescription: requestDTO.shortDescription,
      });
      setWarning(undefined);

      const r = await result.json();
      console.log(r);
      if (hasSufficientInformation) {
        createNotification("Anmodning oprettet", NotificationType.Success);
      } else {
        createNotification(
          "Anmodning oprettet med manglende information. En kladde er gemt.",
          NotificationType.Success
        );
      }

      return onFinish();
    } catch (error) {
      console.error("Kunne ikke oprette anmodning:", error);
      setError("Anmodning kunne ikke oprettes. Server fejl.");
    }
  };

  React.useEffect(() => {
    (async (): Promise<void> => {
      clearMessageBar();
      if (!request) {
        return setFormData({ ...formData, selectedCoworkers: [] });
      }
      if (!request.title || !request.estimatedHours) {
        return setError("Anmodning mangler titel eller time-estimat");
      }

      const registration = request.registrationId
        ? await BackEndService.Api.registrationsTypeDetail(5).then((response) =>
            response.data.find((data) => data.id === request.registrationId)
          )
        : undefined;

      const project = !!projects.length
        ? projects.find((p) => p.id === registration?.projectId)
        : undefined;
      const customer = customers.find((c) => c.id === project?.customerId);
      const data: IRequestComponentFormData = {
        ...formData,
        title: request.title,
        info: request.shortDescription || "",
        estimatedHours: request.estimatedHours,
        selectedCoworkers: registration?.employee
          ? [registration.employee]
          : [],
        date: !!registration?.date
          ? new Date(`${dateOnly(registration?.date as string)}`)
          : undefined,
        startTime: registration?.start ? registration.start : "08:00",
        endTime: registration?.end ? registration.end : "16:00",
        selectedProject: project ? project : undefined,
        selectedCustomer: customer ? customer : undefined,
      };
      setFormData(data);
      setInitialState(JSON.stringify(data));
    })().catch((e) => console.log(e));
  }, [request]);

  const onAccept = async (): Promise<void> => {
    if (!request || !request.id) {
      setError("Ingen anmodning valgt at bekræfte.");
      return;
    }
    if (!formData.date) {
      setError("Kan ikke bekræfte en anmodning uden dato.");
      return;
    }

    const acceptRequestData: AcceptRequestRequestDTO = {
      start: `${formatDateForApi(formData.date)}${formatTime(formData.startTime)}`,
      end: `${formatDateForApi(formData.date)}${formatTime(formData.endTime)}`,
    };

    try {
      await BackEndService.Api.requestsAcceptPartialUpdate(
        request.id,
        acceptRequestData
      );

      createNotification("Anmodning bekræftet", NotificationType.Success);
      console.warn("Anmodning bekræftet:", acceptRequestData);
    } catch (error) {
      console.error("Fejl ved bekræftelse af anmodning:", error);
      setError("Der opstod en fejl, kunne ikke bekræfte anmodning.");
    }
  };

  const onReject = async (): Promise<void> => {
    if (!request || !request.id) {
      setError("Ingen valt anmodning til afvisning.");
      return;
    }
    if (confirm("Er du sikker på du vil afvise denne anmodning?")) {
      try {
        await BackEndService.Api.requestsRejectPartialUpdate(request.id);

        createNotification("Anmodning afvist", NotificationType.Success);
        console.warn("Anmodning afvist", request);
      } catch (error) {
        console.error("Fejl ved afvisning af anmodning:", error);
        setError("Der opstod en fejl, kunne ikke afvise anmodning.");
      }
    }
  };

  const onUpdate = async (): Promise<void> => {
    if (!request || !request.id) {
      setError("Ingen anmodning er valgt.");
      return;
    }

    try {
      const result = await BackEndService.Api.requestsUpdate(request.id, {
        id: request.id,
        createRegistrationRequestDTO: { ...completeBooking },
        title: requestDTO.title,
        shortDescription: requestDTO.shortDescription,
        estimatedHours: requestDTO.estimatedHours,
      });

      setWarning(undefined);
      createNotification("Anmodning opdateret", NotificationType.Success);
      await result.json();
      onFinish();
    } catch (error) {
      console.error("Kunne ikke opdatere anmodning:", error);
      setError("Anmodning kunne ikke opdateres. Server fejl.");
    }
  };

  React.useEffect(() => {
    setWarning(
      hasSufficientInformation
        ? undefined
        : "Kan ikke oprette en færdig booking med den angivne information - en kladde gemmes i stedet"
    );
  }, [formData.title, formData.selectedCoworkers, formData.date]);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      {/* Warning bruges kun i creation mode til at informere om manglende information */}
      {warning && isCreationMode && (
        <MessageBar messageBarType={MessageBarType.warning}>
          {warning}
        </MessageBar>
      )}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      <TextField
        label="Titel"
        placeholder="Titel"
        value={formData.title}
        onChange={(e) => {
          setFormData({ ...formData, title: e.currentTarget.value });
        }}
        required={isCreationMode}
      />
      <TextField
        multiline
        label="Beskrivelse"
        placeholder="Beskrivelse"
        value={formData.info}
        onChange={(e) =>
          setFormData({ ...formData, info: e.currentTarget.value })
        }
        required={isCreationMode}
      />
      <CustomerProjects
        customerLabel={isCreationMode ? "Vælg kunde" : "Valgt kunde"}
        projectLabel={
          isCreationMode ? "Vælg kundeprojekt" : "Valgt kundeprojekt"
        }
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
          date: !!formData.date ? formData.date : new Date(),
          endTime: formData.endTime.length ? formData.endTime : "16:00",
          startTime: formData.startTime.length ? formData.startTime : "08:00",
        }}
        onChange={(d) =>
          setFormData({
            ...formData,
            date: d.date,
            startTime: d.startTime,
            endTime: d.endTime,
          })
        }
        disabled={false}
      />
      <PeoplePicker
        selectedEmployee={employees.find(
          (e) =>
            e.email?.toLowerCase() ===
            formData.selectedCoworkers.find(
              (c) => c.toLowerCase() === e.email?.toLowerCase()
            )
        )}
        employees={employees}
        onChange={(employee) => {
          if (!employee)
            return setFormData({ ...formData, selectedCoworkers: [] });

          return setFormData({
            ...formData,
            selectedCoworkers: employee.email ? [employee.email] : [],
          });
        }}
        label="Vælg medarbejder"
        placeholder="Vælg medarbejder"
        context={context}
      />
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        {isCreationMode ? (
          <>
            <PrimaryButton text="Opret" onClick={onCreate} />
            <DefaultButton text="Annuller" onClick={onDismiss} />
          </>
        ) : isConfirmMode && hasChanges ? (
          <>
            <PrimaryButton text="Opdater" onClick={onUpdate} />
            <DefaultButton text="Annuller" onClick={onDismiss} />
          </>
        ) : (
          isConfirmMode &&
          !hasChanges && (
            <>
              <PrimaryButton text="Godkend" onClick={onAccept} />
              <DefaultButton text="Afvis" onClick={onReject} />
            </>
          )
        )}
      </Stack>
    </Stack>
  );
};

export default RequestComponent;
