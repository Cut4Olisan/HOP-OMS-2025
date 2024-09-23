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
  extractTime,
  // extractTime,
  formatDateForApi,
} from "../dateUtils";
import { IRegistrationData } from "../interfaces/IRegistrationProps";

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
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
  const [selectedProject, setSelectedProject] = React.useState<string>("");

  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const isReadOnly = mode === FormMode.ConfirmRequest;
  const isCreationMode = mode === FormMode.CreateRequest;
  const startTime = extractTime(startDateTime);
  const endTime = extractTime(endDateTime);
  const hasSufficientInformation =
    title && selectedCoworkers.length > 0 && startDateTime && endDateTime;

  const onCreate = async (): Promise<void> => {
    if (!title) return setError("Titel er påkrævet");
    if (!selectedCoworkers || selectedCoworkers.length === 0)
      return setError("Medarbejder er påkrævet");

    // const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);
    // if (estimatedHours instanceof Error) {
    //   return setError(estimatedHours.message);
    // }
    if (!startDateTime) {
      return;
    }

    const completeBooking: IRegistrationData = {
      shortDescription: title,
      date: formatDateForApi(startDateTime),
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
      // registration: hasSufficientInformation ? completeBooking : undefined,
    };

    console.log("registration", completeBooking);
    console.log("requestDTO:", requestDTO);
    try {
      const result = await BackEndService.client.api.requestsCreate({
        createRegistrationRequestDTO: { ...completeBooking },
        title: requestDTO.title,
        shortDescription: requestDTO.shortDescription,
        estimatedHours: requestDTO.estimatedHours,
      });
      //const result = await BackEndService.Instance.createRequest(requestDTO);
      setWarning(undefined);
      if (hasSufficientInformation) {
        setSuccess("Booking oprettet!");
      } else {
        setSuccess(
          "Request oprettet med manglende information. En kladde er gemt."
        );
      }
      console.warn("Request oprettet", result);
    } catch (error) {
      console.error("Error creating request:", error);
      setError("Failed to create request. Please try again.");
    }
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
        onChange={(e, newValue) => setTitle(newValue || "")}
        required={!isReadOnly}
        disabled={isReadOnly}
      />
      <CustomerProjects
        customers={customers}
        projects={projects}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
      <TextField
        label="Antal timer (angivet i milisekunder)"
        placeholder="Antal timer"
        value={estimatedHours}
        onChange={(e, newValue) => setEstimatedHours(newValue || "")}
        disabled={isReadOnly}
      />
      {/* Viser dato/tid-vælgeren hvis knappen ovenover er togglet, eller hvis det
      er read-only og datoer er angivet */}
      {(isCreationMode || (isReadOnly && startDateTime && endDateTime)) && (
        <>
          <DateTimePickerComponent
            label="Starttid"
            value={startDateTime}
            onChange={setStartDateTime}
            disabled={isReadOnly}
          />
          <DateTimePickerComponent
            label="Sluttid"
            value={endDateTime}
            onChange={setEndDateTime}
            disabled={isReadOnly}
          />
        </>
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
      {isReadOnly && selectedCoworkers.length > 0 && (
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
          required={!isReadOnly}
          disabled={isReadOnly}
        />
      )}
      {(isCreationMode || (isReadOnly && info)) && (
        <TextField
          label="Booking information"
          placeholder="Skriv information om booking"
          value={info}
          onChange={(e, newValue) => setInfo(newValue || "")}
          multiline
          rows={5}
          disabled={isReadOnly}
        />
      )}
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        {isCreationMode ? (
          <>
            <PrimaryButton text="Opret" onClick={onCreate} />
            <DefaultButton text="Annuller" />
          </>
        ) : (
          <>
            <PrimaryButton text="Godkend" onClick={onCreate} />
            <DefaultButton text="Afvis" />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default RequestComponent;
