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
import { calculateEstimatedHours, extractTime, formatDateForApi } from "../dateUtils";
import { IRegistration } from "../interfaces/IRegistrationProps";

const RequestComponent: React.FC<IRequestProps> = ({
  context,
  mode,
  onFinish,
}) => {
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();
  const [title, setTitle] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
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

  const [toggles, setToggles] = React.useState<{ [key: string]: boolean }>({
    dateToggle: false,
    customerToggle: false,
  });

  const handleToggle = (key: string): void => {
    setToggles((prevToggles) => ({
      ...prevToggles,
      [key]: !prevToggles[key],
    }));
  };

  // People picker handler
  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const isReadOnly = mode === FormMode.ConfirmRequest;

  const onCreate = async (): Promise<void> => {
    if (!title) return setError("Please provide a title.");
    if (!startDateTime || !endDateTime) return setError("Start and End times are required.");
    if (!selectedCoworkers || selectedCoworkers.length === 0) return setError("Please select coworkers.");
    if (!selectedProject) return setError("Project is required.");
  
    const projectId = parseInt(selectedProject, 10);
    const date = formatDateForApi(startDateTime);
    const startTime = extractTime(startDateTime);
    const endTime = extractTime(endDateTime);
  
    const estimatedHours = calculateEstimatedHours(startDateTime, endDateTime);
    if (estimatedHours instanceof Error) {
      return setError(estimatedHours.message);
    }
  
    const registration: IRegistration = {
      id: 0,
      shortDescription: title,
      description: info || undefined,
      projectId,
      date,
      start: startTime,
      end: endTime,
      time: estimatedHours,
      invoiceable: true,
      hourlyRate: undefined,
      employee: selectedCoworkers.join(', '),
      registrationType: 5, // = Template
      forecastEstimate: undefined,
    };
  
    const requestDTO: IRequestCreateDTO = {
      id: 0,
      shortDescription: title,
      registration,
    };
  
    try {
      const result = await BackEndService.Instance.createRequest(requestDTO);
      setSuccess("Request created successfully!");
      return onFinish(result);
    } catch (error) {
      console.error("Error creating request:", error);
      setError("Failed to create request. Please try again.");
    }
  };
  
 

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

    fetchCustomers().catch((e) => console.error(e));
    fetchProjects().catch((e) => console.error(e));
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      {success && (
        <MessageBar messageBarType={MessageBarType.success}>
          {success}
        </MessageBar>
      )}
      {error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}
      <Text variant={"xxLargePlus"} className={globalStyles.headingMargin}>
        {mode === FormMode.CreateRequest
          ? "Anmod om booking"
          : "Bekræft booking"}
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
        required={!isReadOnly}
        disabled={isReadOnly}
      />

      {mode === FormMode.CreateRequest && (
        <DefaultButton
          text={toggles.customerToggle ? "Skjul kunde" : "Angiv en kunde"}
          onClick={() => handleToggle("customerToggle")}
        />
      )}
      {toggles.customerToggle && (
        <CustomerProjects
          customers={customers}
          projects={projects}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
        />
      )}
      {mode === FormMode.ConfirmRequest && selectedCustomer && (
        <>
          <TextField
            label="Kunde"
            placeholder="Kunde"
            value={selectedCustomer.name}
            disabled={isReadOnly}
          />
          {selectedProject && (
            <TextField
              label="Projekt"
              placeholder="Projekt"
              value={selectedProject}
              disabled={isReadOnly}
            />
          )}
        </>
      )}
      {mode === FormMode.CreateRequest && (
        <DefaultButton
          text={toggles.dateToggle ? "Skjul dato" : "Angiv en dato"}
          onClick={() => handleToggle("dateToggle")}
        />
      )}

      {(toggles.dateToggle || isReadOnly) && (
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
        disabled={isReadOnly}
      />

      <TextField
        label="Booking information"
        placeholder="Skriv information om booking"
        value={info}
        onChange={(e, newValue) => setInfo(newValue || "")}
        multiline
        rows={5}
        disabled={isReadOnly}
      />

      <Stack horizontal tokens={{ childrenGap: 10 }}>
        {mode === FormMode.CreateRequest ? (
          <>
            <PrimaryButton
              text="Opret"
              onClick={() => console.log(selectedCoworkers)}
            />
            <DefaultButton
              text="Annuller"
              onClick={() => console.log("Cancelled")}
            />
          </>
        ) : (
          <>
            <PrimaryButton text="Godkend" onClick={onCreate} />
            <DefaultButton
              text="Afvis"
              onClick={() => console.log("Decline request")}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default RequestComponent;
