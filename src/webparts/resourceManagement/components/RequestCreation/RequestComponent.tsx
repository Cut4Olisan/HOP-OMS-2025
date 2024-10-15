import * as React from "react";
import {
  IRequestCreateDTO,
  IRequestProps,
} from "./interfaces/IRequestComponentProps";
import {
  DefaultButton,
  IPersonaProps,
  PrimaryButton,
  Stack,
  TextField,
  MessageBar,
  MessageBarType,
} from "@fluentui/react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import DateTimePickerComponent from "../BookingCreation/DateTimePicker";
import { FormMode } from "./interfaces/IRequestComponentProps";
import BackEndService from "../../services/BackEnd";
import {
  dateOnly,
  extractTime,
  // extractTime,
  formatDateForApi,
  formatTime,
} from "../dateUtils";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import {
  AcceptRequestRequestDTO,
  CustomerDTO,
  ProjectDTO,
  RegistrationDTO,
} from "../interfaces";
import CustomerProjects from "../BookingCreation/CustomerAndProjects/CustomerProjects";
// import useGlobal from "../../hooks/useGlobal";

export interface IRequestComponentFormData {
  title: string;
  info: string;
  estimatedHours?: number;
  selectedCoworkers: string[];
  startDateTime?: Date;
  endDateTime?: Date;
  selectedCustomer?: CustomerDTO;
  customers: CustomerDTO[];
  selectedProject?: ProjectDTO;
  projects: ProjectDTO[];
}

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
  onDismiss,
  request,
}) => {
  const [formData, setFormData] = React.useState<IRequestComponentFormData>({
    title: "",
    info: "",
    selectedCoworkers: [],
    customers: [],
    projects: [],
  });
  // const { customers, projects } = useGlobal();
  const [error, setError] = React.useState<string | undefined>();
  const [warning, setWarning] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();
  const [hasChanges, setHasChanges] = React.useState<boolean>(false);
  const [initialState, setInitialState] = React.useState<string>(
    JSON.stringify(formData)
  );
  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setFormData({
      ...formData,
      selectedCoworkers: emails.filter((e) => !!e) as string[],
    });
  };

  const isConfirmMode = mode === FormMode.ConfirmRequest;
  const isCreationMode = mode === FormMode.CreateRequest;
  const startTime = extractTime(formData.startDateTime);
  const endTime = extractTime(formData.endDateTime);
  const requiredInformation = formData.title && formData.selectedCustomer;
  const hasSufficientInformation =
    requiredInformation &&
    formData.selectedCoworkers.length > 0 &&
    formData.startDateTime &&
    formData.endDateTime;

  /*   const updateChangedRequest = (key: keyof IRequestCreateDTO, value: any) => {
    setChangedRequest((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }; */

  React.useEffect(() => {
    if (JSON.stringify(formData) !== initialState) {
      return setHasChanges(true);
    }

    return setHasChanges(false);
  }, [formData, initialState]);

  const completeBooking: IRegistrationData = {
    projectId: formData.selectedProject?.id,
    shortDescription: formData.title,
    date: formData.startDateTime
      ? formatDateForApi(formData.startDateTime)
      : "",
    description: formData.info || undefined,
    start: startTime,
    end: endTime,
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
    setSuccess(undefined);
    setWarning(undefined);
  };

  const onCreate = async (): Promise<void> => {
    if (!formData.title) return setError("Titel er påkrævet");
    if (!formData.selectedCustomer) return setError("Kunde er påkrævet");

    console.log("registration", completeBooking);
    console.log("requestDTO:", requestDTO);
    try {
      const result = await BackEndService.Instance.api.requestsCreate(
        {
          createRegistrationRequestDTO: { ...completeBooking },
          title: requestDTO.title,
          shortDescription: requestDTO.shortDescription,
          estimatedHours: requestDTO.estimatedHours,
        },
        { headers: BackEndService.getHeaders() }
      );
      setWarning(undefined);
      if (hasSufficientInformation) {
        setSuccess("Booking oprettet!");
      } else {
        setSuccess(
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
        ? await BackEndService.client.api
            .registrationsTypeDetail(5)
            .then((r) => r.json() as Promise<RegistrationDTO[]>)
            .then((d) => d.find((data) => data.id === request.registrationId))
        : undefined;

      const project = formData.projects.find(
        (p) => p.id === registration?.projectId
      );
      const customer = formData.customers.find(
        (c) => c.id === project?.customerId
      );
      const data: IRequestComponentFormData = {
        ...formData,
        title: request.title,
        info: request.shortDescription || "",
        estimatedHours: request.estimatedHours,
        selectedCoworkers: registration?.employee
          ? [registration.employee]
          : [],
        startDateTime: registration
          ? new Date(
              `${dateOnly(registration.date as string)}${formatTime(
                registration.start as string
              )}`
            )
          : undefined,
        selectedProject: project ? project : undefined,
        selectedCustomer: customer ? customer : undefined,
      };
      setFormData(data);
      setInitialState(JSON.stringify(data));
    })().catch((e) => console.log(e));
  }, [request, formData.customers, formData.projects]);

  const onAccept = async (): Promise<void> => {
    if (!request || !request.id) {
      setError("Ingen anmodning valgt at bekræfte.");
      return;
    }
    if (!formData.startDateTime) {
      setError("Kan ikke bekræfte en anmodning uden datoer.");
      return;
    }

    const acceptRequestData: AcceptRequestRequestDTO = {
      start: `${formatDateForApi(formData.startDateTime)}${formatTime(startTime)}`,
      end: String(formData.endDateTime),
    };

    console.log(
      `${formatDateForApi(formData.startDateTime)}${formatTime(startTime)}`,
      formData.endDateTime
    );

    try {
      await BackEndService.Instance.api.requestsAcceptPartialUpdate(
        request.id,
        acceptRequestData,
        { headers: BackEndService.getHeaders() }
      );
      setSuccess("Anmodning bekræftet!");
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
        await BackEndService.Instance.api.requestsRejectPartialUpdate(
          request.id,
          { headers: BackEndService.getHeaders() }
        );
        setSuccess("Anmodning afvist!");
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
      const result = await BackEndService.Instance.api.requestsUpdate(
        request.id,
        {
          id: request.id,
          createRegistrationRequestDTO: { ...completeBooking },
          title: requestDTO.title,
          shortDescription: requestDTO.shortDescription,
          estimatedHours: requestDTO.estimatedHours,
        },
        { headers: BackEndService.getHeaders() }
      );

      setWarning(undefined);
      setSuccess("Anmodning opdateret!");
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
  }, [
    formData.title,
    formData.selectedCoworkers,
    formData.startDateTime,
    formData.endDateTime,
  ]);

  React.useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.getRequests();
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests().catch((e) => console.error(e));
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      {success && (
        <MessageBar messageBarType={MessageBarType.success}>
          {success}
        </MessageBar>
      )}
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
        required={isCreationMode}
      />
      <TextField
        label="Antal timer"
        placeholder="Antal timer"
        value={formData.estimatedHours ? String(formData.estimatedHours) : ""}
        onChange={(e) => {
          if (!new RegExp(/^[0-9]/g).test(e.currentTarget.value)) {
            return;
          }

          return setFormData({
            ...formData,
            estimatedHours: Number(e.currentTarget.value),
          });
        }}
        disabled={false}
      />
      {/* Viser dato/tid-vælgeren i creationMode, eller hvis det
      er read-only og datoer er angivet */}
      {(isCreationMode ||
        (isConfirmMode && formData.startDateTime && formData.endDateTime)) && (
        <>
          <DateTimePickerComponent
            label="Starttid"
            value={formData.startDateTime}
            onChange={(d) => setFormData({ ...formData, startDateTime: d })}
            disabled={false}
          />
          <DateTimePickerComponent
            label="Sluttid"
            value={formData.endDateTime}
            onChange={(d) => setFormData({ ...formData, endDateTime: d })}
            disabled={false}
          />
        </>
      )}
      {isConfirmMode && formData.startDateTime && (
        <DateTimePickerComponent
          label="Starttid"
          value={formData.startDateTime}
          onChange={(d) => setFormData({ ...formData, startDateTime: d })}
          disabled={false}
        />
      )}
      {/* Viser people picker i creation mode */}
      {isCreationMode && (
        <PeoplePicker
          placeholder="Vælg medarbejder"
          context={{
            absoluteUrl: context.pageContext.web.absoluteUrl,
            msGraphClientFactory: context.msGraphClientFactory,
            spHttpClient: context.spHttpClient,
          }}
          titleText="Vælg medarbejder"
          personSelectionLimit={3}
          groupName={""}
          onChange={_getPeoplePickerItems}
          principalTypes={[PrincipalType.User]}
          resolveDelay={1000}
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
