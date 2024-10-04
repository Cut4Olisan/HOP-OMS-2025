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
import CustomerProjects from "../BookingCreation/CustomerAndProjects/CustomerProjects";
import BackEndService from "../../services/BackEnd";
import { ICustomer, IProject } from "../interfaces/ICustomerProjectsProps";
import {
  dateOnly,
  extractTime,
  // extractTime,
  formatDateForApi,
  formatTime,
} from "../dateUtils";
import { IRegistrationData } from "../interfaces/IRegistrationProps";
import { RegistrationDTO } from "../interfaces";

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
  request,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const [warning, setWarning] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();
  const [title, setTitle] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [estimatedHours, setEstimatedHours] = React.useState<string>("");
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<string[]>(
    []
  );
  const [startDateTime, setStartDateTime] = React.useState<Date | undefined>(
    undefined
  );
  const [endDateTime, setEndDateTime] = React.useState<Date | undefined>(
    undefined
  );
  const [selectedCustomer, setSelectedCustomer] = React.useState<
    ICustomer | undefined
  >(undefined);
  const [customers, setCustomers] = React.useState<ICustomer[]>([]);
  const [projects, setProjects] = React.useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<
    IProject | undefined
  >();
  const [hasChanges, setHasChanges] = React.useState<boolean>(false);

  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const isConfirmMode = mode === FormMode.ConfirmRequest;
  const isCreationMode = mode === FormMode.CreateRequest;
  const startTime = extractTime(startDateTime);
  const endTime = extractTime(endDateTime);
  const requiredInformation = title && selectedCustomer;
  const hasSufficientInformation =
    requiredInformation &&
    selectedCoworkers.length > 0 &&
    startDateTime &&
    endDateTime;

  const onCreate = async (): Promise<void> => {
    if (!title) return setError("Titel er påkrævet");
    if (!selectedCustomer) return setError("Kunde er påkrævet");

    // const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);
    // if (estimatedHours instanceof Error) {
    //   return setError(estimatedHours.message);
    // }

    const completeBooking: IRegistrationData = {
      projectId: selectedProject?.id,
      shortDescription: title,
      date: startDateTime ? formatDateForApi(startDateTime) : "",
      description: info || undefined,
      start: startTime,
      end: endTime,
      time: parseInt(estimatedHours) || undefined,
      employee: selectedCoworkers[0],
      registrationType: 5, // Template
    };
    const requestDTO: IRequestCreateDTO = {
      title: title,
      shortDescription: info,
      estimatedHours: parseInt(estimatedHours) || undefined,
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
      if (request) {
        setTitle(request.title);
        setInfo(request.shortDescription || "");
        setEstimatedHours(request.estimatedHours?.toString() || "");

        if (request.registrationId) {
          const registration = await BackEndService.client.api
            .registrationsTypeDetail(5)
            .then((r) => r.json() as Promise<RegistrationDTO[]>)
            .then((d) => d.find((data) => data.id === request.registrationId));
          if (!registration) return;

          if (registration.employee) {
            setSelectedCoworkers([registration.employee]);
          }
          if (registration.projectId) {
            const project = projects.find(
              (p) => p.id === registration.projectId
            );
            const customer = project
              ? customers.find((c) => c.id === project.customerId)
              : undefined;

            setSelectedCustomer(customer);
            setSelectedProject(project);
          }

          if (registration.date && registration.start) {
            setStartDateTime(
              new Date(
                `${dateOnly(registration.date)}${formatTime(
                  registration.start
                )}`
              )
            );
          }
        } else {
          // Fjerner valgte informationer hvis der ikke er nogen
          // Ellers viser de samme value fra tidligere valgte request
          setSelectedCoworkers([]);
        }
        setHasChanges(false);
        console.log(hasChanges);
      }
    })();
    console.log("customer:", selectedCustomer);
    console.log("project:", selectedProject);
  }, [request, customers, projects]);

  const onConfirm = async (): Promise<void> => {
    if (!hasSufficientInformation) {
      setError(
        "Denne anmodning har ikke nok information til at omdanne til en booking. Fastlæg nogle konkrete informationer."
      );
      return;
    }

    const completeBooking: IRegistrationData = {
      projectId: selectedProject?.id,
      shortDescription: title,
      description: info || undefined,
      date: startDateTime ? formatDateForApi(startDateTime) : "",
      start: startTime,
      end: endTime,
      time: parseInt(estimatedHours) || undefined,
      employee: selectedCoworkers[0],
      registrationType: 5, // Template
    };

    try {
      const result = await BackEndService.Instance.api.registrationsCreate(
        completeBooking
      );
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
  }, [title, selectedCoworkers, startDateTime, endDateTime]);

  React.useEffect(() => {
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

    const fetchRequests = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.getRequests();
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCustomers().catch((e) => console.error(e));
    fetchProjects().catch((e) => console.error(e));
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
      <Text variant={"xxLargePlus"} className={globalStyles.headingMargin}>
        {isCreationMode ? "Anmod om booking" : "Bekræft booking"}
      </Text>
      <TextField
        label="Titel"
        placeholder="Titel"
        value={title}
        onChange={(e) => {
          setEstimatedHours(e.currentTarget.value || "");
          setHasChanges(true);
        }}
        required={isCreationMode}
        disabled={false}
      />
      <CustomerProjects
        customers={customers}
        customerLabel={isCreationMode ? "Vælg kunde" : "Valgt kunde"}
        projects={projects}
        projectLabel={
          isCreationMode ? "Vælg kundeprojekt" : "Valgt kundeprojekt"
        }
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        required={isCreationMode}
      />
      <TextField
        label="Antal timer"
        placeholder="Antal timer"
        value={estimatedHours}
        onChange={(e) => {
          setEstimatedHours(e.currentTarget.value || "");
          setHasChanges(true);
        }}
        disabled={false}
      />
      {/* Viser dato/tid-vælgeren i creationMode, eller hvis det
      er read-only og datoer er angivet */}
      {(isCreationMode || (isConfirmMode && startDateTime && endDateTime)) && (
        <>
          <DateTimePickerComponent
            label="Starttid"
            value={startDateTime}
            onChange={setStartDateTime}
            disabled={false}
          />
          <DateTimePickerComponent
            label="Sluttid"
            value={endDateTime}
            onChange={setEndDateTime}
            disabled={false}
          />
        </>
      )}
      {isConfirmMode && startDateTime && (
        <DateTimePickerComponent
          label="Starttid"
          value={startDateTime}
          onChange={setStartDateTime}
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
      {isConfirmMode && selectedCoworkers.length > 0 && (
        <TextField
          label="Valgt medarbejdere"
          placeholder="Medarbejder"
          value={selectedCoworkers
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
      {(isCreationMode || (isConfirmMode && info)) && (
        <TextField
          label="Booking information"
          placeholder="Skriv information om booking"
          value={info}
          onChange={(e) => {
            setEstimatedHours(e.currentTarget.value || "");
            setHasChanges(true);
          }}
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
        ) : isConfirmMode ? (
          <>
            <PrimaryButton text="Godkend" onClick={onConfirm} />
            <DefaultButton text="Afvis" />
          </>
        ) : (
          <>
            <PrimaryButton text="Opdater" onClick={onUpdate} />
            <DefaultButton text="Annuller" />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default RequestComponent;
