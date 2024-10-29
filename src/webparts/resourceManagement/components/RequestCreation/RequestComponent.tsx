import * as React from "react";
import {
  IRequestCreateDTO,
  IRequestProps,
} from "./interfaces/IRequestComponentProps";
import {
  DefaultButton,
  PrimaryButton,
  Stack,
  TextField,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import DateTimePickerComponent from "../BookingCreation/DateTimePicker";
import { FormMode } from "./interfaces/IRequestComponentProps";
import BackEndService from "../../services/BackEnd";
import { dateOnly, formatDateForApi, formatTime } from "../dateUtils";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import {
  AcceptRequestRequestDTO,
  CustomerDTO,
  ProjectDTO,
} from "../interfaces";
import CustomerProjects from "../BookingCreation/CustomerAndProjects/CustomerProjects";
import OurPeoplePicker from "../PeoplePicker";
import useGlobal from "../../hooks/useGlobal";

export interface IRequestComponentFormData {
  title: string;
  info: string;
  estimatedHours?: number;
  selectedCoworkers: string[];
  date: Date;
  startTime: string;
  endTime: string;
  selectedCustomer?: CustomerDTO;
  selectedProject?: ProjectDTO;
}

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
  onDismiss,
  request,
}) => {
  const { employees, customers, projects, setGlobalSuccess } = useGlobal();
  const [formData, setFormData] = React.useState<IRequestComponentFormData>({
    title: "",
    info: "",
    selectedCoworkers: [],
    date: new Date(),
    startTime: "",
    endTime: "",
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
    console.log(formData);
  }, [formData]);
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
  const requestDTO: IRequestCreateDTO = {
    title: formData.title,
    shortDescription: formData.info,
    estimatedHours: formData.estimatedHours || undefined,
    registration: completeBooking,
  };

  const clearMessageBar = (): void => {
    setError(undefined);
    setGlobalSuccess(undefined);
    setWarning(undefined);
  };

  const onCreate = async (): Promise<void> => {
    if (!formData.title) return setError("Titel er påkrævet");
    if (!formData.selectedCustomer) return setError("Kunde er påkrævet");

    console.log("registration", completeBooking);
    console.log("requestDTO:", requestDTO);
    try {
      const result = await BackEndService.Api.requestsCreate({
        createRegistrationRequestDTO: { ...completeBooking },
        title: requestDTO.title,
        shortDescription: requestDTO.shortDescription,
        estimatedHours: requestDTO.estimatedHours,
      });
      setWarning(undefined);
      if (hasSufficientInformation) {
        setGlobalSuccess("Anmodning oprettet!");
      } else {
        setGlobalSuccess(
          "Anmodning oprettet med manglende information. En kladde er gemt."
        );
      }
      const r = await result.json();
      console.log(r);
      return onFinish(r as IRequestCreateDTO);
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
        date: new Date(`${dateOnly(registration?.date as string)}`),
        startTime: registration?.start ? registration.start : "",
        endTime: registration?.end ? registration.end : "",
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
      setGlobalSuccess("Anmodning bekræftet!");
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
        setGlobalSuccess("Anmodning afvist!");
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
      setGlobalSuccess("Anmodning opdateret!");
      const updatedRequest = await result.json();
      onFinish(updatedRequest as IRequestCreateDTO);
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
        disabled={false}
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
      <TextField
        label="Antal timer"
        placeholder="Antal timer"
        value={formData.estimatedHours ? String(formData.estimatedHours) : ""}
        onChange={(e) => {
          const value = e.currentTarget.value;
          if ((value === "" || /^[0-9]*$/.test(value)) && value.length <= 6) {
            setFormData({
              ...formData,
              estimatedHours: value === "" ? undefined : Number(value),
            });
          }
        }}
        disabled={false}
      />
      {/* Viser dato/tid-vælgeren i creationMode, eller hvis det
      er read-only og datoer er angivet */}
      {(isCreationMode || (isConfirmMode && formData.date)) && (
        <>
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
            disabled={false}
          />
        </>
      )}
      {/* Viser people picker i creation mode */}
      {isCreationMode && (
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
          context={context}
        />
      )}
      {/* Viser valgte medarbejdere i et disabled textfield i readOnly */}
      {isConfirmMode && formData.selectedCoworkers.length > 0 && (
        <TextField
          label="Valgt medarbejdere"
          placeholder="Medarbejder"
          value={formData.selectedCoworkers
            .map((email) => {
              const [name] = email.split("@");
              const formattedName = name
                .split(".")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
              return formattedName;
            })
            .join(", ")}
          required={!isConfirmMode}
          disabled={false}
        />
      )}
      {(isCreationMode || (isConfirmMode && formData.info)) && (
        <TextField
          label="Booking information"
          placeholder="Skriv information om booking"
          value={formData.info}
          onChange={(e) =>
            setFormData({ ...formData, info: e.currentTarget.value })
          }
          multiline
          rows={5}
          disabled={false}
        />
      )}
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
