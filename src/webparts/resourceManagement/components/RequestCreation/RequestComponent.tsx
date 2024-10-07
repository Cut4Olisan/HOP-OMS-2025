import * as React from "react";
import {
  IRequestCreateDTO,
  IRequestProps,
} from "./interfaces/IRequestComponentProps";
import globalStyles from "../BookingCreation/BookingComponent.module.scss";
import {
  DefaultButton,
  IPersonaProps,
  PrimaryButton,
  Stack,
  TextField,
  Text,
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
import { RegistrationDTO } from "../interfaces";
import { ICustomer, IProject } from "./interfaces/IComponentFormData";
import CustomerProjects from "../BookingCreation/CustomerAndProjects/CustomerProjects";

export interface IRequestComponentFormData {
  title: string;
  info: string;
  estimatedHours?: number;
  selectedCoworkers: string[];
  startDateTime?: Date;
  endDateTime?: Date;
  selectedCustomer?: ICustomer;
  customers: ICustomer[];
  selectedProject?: IProject;
  projects: IProject[];
}

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
  request,
}) => {
  const [formData, setFormData] = React.useState<IRequestComponentFormData>({
    title: "",
    info: "",
    selectedCoworkers: [],
    customers: [],
    projects: [],
  });

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

  const onCreate = async (): Promise<void> => {
    if (!formData.title) return setError("Titel er påkrævet");
    if (!formData.selectedCustomer) return setError("Kunde er påkrævet");

    // const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);
    // if (estimatedHours instanceof Error) {
    //   return setError(estimatedHours.message);
    // }

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
      if (!request) {
        return setFormData({ ...formData, selectedCoworkers: [] });
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
          selectedCoworkers: registration?.employee ? [registration.employee] : [],
          startDateTime: registration
            ? new Date(
                `${dateOnly(registration.date as string)}${formatTime(
                  registration.start as string
                )}`
              )
            : undefined,
          selectedProject: project ? project : undefined,
          selectedCustomer: customer ? customer : undefined
      }
      setFormData(data);
      setInitialState(JSON.stringify(data))
    })();
  }, [request, formData.customers, formData.projects]);

  const onConfirm = async (): Promise<void> => {
    if (!hasSufficientInformation) {
      setError(
        "Denne anmodning har ikke nok information til at omdanne til en booking. Fastlæg nogle konkrete informationer."
      );
      return;
    }

    const completeBooking: IRegistrationData = {
      projectId: formData.selectedProject?.id,
      shortDescription: formData.title,
      description: formData.info || undefined,
      date: formData.startDateTime
        ? formatDateForApi(formData.startDateTime)
        : "",
      start: startTime,
      end: endTime,
      time: formData.estimatedHours || undefined,
      employee: formData.selectedCoworkers[0],
      registrationType: 5, // Template
    };

    try {
      const result =
        await BackEndService.Instance.api.registrationsCreate(completeBooking);
      console.log(result);
      setSuccess("Anmodning bekræftet og booking oprettet!");
      console.warn("Anmodning bekræftet", result);
    } catch (error) {
      console.error("Fejl ved bekræftelse af anmodning:", error);
      setError("Der opstod en fejl, kunne ikke bekræfte anmodning.");
    }
  };

  const onUpdate = async (): Promise<void> => {
    setWarning("Feature only available with premium subscription");
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
    (async () => {
      setFormData({
        ...formData,
        customers: await BackEndService.Instance.getCustomers(),
        projects: await BackEndService.Instance.getProjects(),
      });
    })();
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
      <Text variant={"xxLargePlus"} className={globalStyles.headingMargin}>
        {isCreationMode ? "Anmod om booking" : "Bekræft booking"}
      </Text>
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
        customers={formData.customers}
        customerLabel={isCreationMode ? "Vælg kunde" : "Valgt kunde"}
        projects={formData.projects}
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
            <DefaultButton text="Annuller" />
          </>
        ) : isConfirmMode && hasChanges ? (
          <>
            <PrimaryButton text="Opdater" onClick={onUpdate} />
            <DefaultButton text="Annuller" />
          </>
        ) : (
          isConfirmMode &&
          !hasChanges && (
            <>
              <PrimaryButton text="Godkend" onClick={onConfirm} />
              <DefaultButton text="Afvis" />
            </>
          )
        )}
      </Stack>
    </Stack>
  );
};

export default RequestComponent;
