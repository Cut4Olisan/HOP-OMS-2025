import * as React from "react";
import { IRequestProps } from "./interfaces/IRequestComponentProps";
// import styles from "./RequestComponent.module.scss";
import globalStyles from "../BookingCreation/BookingComponent.module.scss";
import {
  DefaultButton,
  IPersonaProps,
  PrimaryButton,
  Stack,
  TextField,
  Text,
} from "@fluentui/react";
// import DateTimePickerComponent from "../BookingCreation/DateTimePicker";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
// import CustomerProjects from "../BookingCreation/CustomerAndProjects/CustomerProjects";

const RequestComponent: React.FC<IRequestProps> = ({ context }) => {
  const [title, setTitle] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<string[]>(
    []
  );
  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };
  return (
    <>
      <Stack tokens={{ childrenGap: 15 }}>
        <Text variant={"xxLargePlus"} className={globalStyles.headingMargin}>
          Anmod om booking
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
          required
        />

        {/* <CustomerProjects
        customers={customers}
        projects={projects}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      /> */}

        {/* Vises hvis en bruger vælger at angive dato */}
        {/* <DateTimePickerComponent
        label="Starttid"
        value={startDateTime}
        onChange={setStartDateTime}
      />

      <DateTimePickerComponent
        label="Sluttid"
        value={endDateTime}
        onChange={setEndDateTime}
      /> */}

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
        />

        <TextField
          label="Booking information"
          placeholder="Skriv information om booking"
          value={info}
          onChange={(e, newValue) => setInfo(newValue || "")}
          multiline
          rows={5}
        />

        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton
            text="Opret"
            onClick={() => console.log(selectedCoworkers)}
          />
          <DefaultButton
            text="Annuller"
            onClick={() => console.log("Cancelled")}
          />
        </Stack>
      </Stack>
    </>
  );
};
export default RequestComponent;
