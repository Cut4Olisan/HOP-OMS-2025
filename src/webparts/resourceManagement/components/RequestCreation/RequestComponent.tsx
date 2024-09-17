import * as React from "react";
import { IRequestProps } from "./interfaces/IRequestComponentProps";
import globalStyles from "../BookingCreation/BookingComponent.module.scss";
import {
  DefaultButton,
  IPersonaProps,
  PrimaryButton,
  Stack,
  TextField,
  Text,
} from "@fluentui/react";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import DateTimePickerComponent from "../BookingCreation/DateTimePicker";
import { FormMode } from "./interfaces/IRequestComponentProps";

const RequestComponent: React.FC<IRequestProps> = ({ context, mode }) => {
  const [title, setTitle] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [selectedCoworkers, setSelectedCoworkers] = React.useState<string[]>([]);
  const [startDateTime, setStartDateTime] = React.useState<Date | undefined>(undefined);
  const [endDateTime, setEndDateTime] = React.useState<Date | undefined>(undefined);
  const [dateToggle, setDateToggle] = React.useState<boolean>(false);
//   const [customerToggle, setCustomerToggle] = React.useState<boolean>(false);

  // People picker handler
  const _getPeoplePickerItems = (items: IPersonaProps[]): void => {
    const emails = items.map((item) => item.secondaryText);
    setSelectedCoworkers(emails.filter((e) => !!e) as string[]);
  };

  const handleToggleDate = (): void => {
    setDateToggle((prevState) => !prevState);
  };

  // Function to check if the form is in read-only mode
  const isReadOnly = mode === FormMode.ConfirmRequest;

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Text variant={"xxLargePlus"} className={globalStyles.headingMargin}>
        {mode === FormMode.CreateRequest ? "Anmod om booking" : "Bekræft booking"}
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
          text={dateToggle ? "Skjul dato" : "Vælg en dato"}
          onClick={handleToggleDate}
        />
      )}

      {(dateToggle || isReadOnly) && (
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
            <PrimaryButton
              text="Godkend"
              onClick={() => console.log("Confirm booking")}
            />
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
