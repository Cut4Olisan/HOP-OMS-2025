import * as React from "react";
import {
  IBasePickerSuggestionsProps,
  IPersonaProps,
  Label,
  NormalPeoplePicker,
  Persona,
  Stack,
} from "@fluentui/react";
import { EmployeeDTO } from "./interfaces";

export interface IOurPeoplePicker {
  employees: EmployeeDTO[];
  onChange: (people: EmployeeDTO | undefined) => void;
  placeholder?: string;
  label?: string
}

const OurPeoplePicker: React.FC<IOurPeoplePicker> = ({
  employees,
  onChange,
  placeholder,
  label
}) => {
  const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: "Suggested People",
    mostRecentlyUsedHeaderText: "Suggested Contacts",
    noResultsFoundText: "No results found",
    loadingText: "Loading",
    showRemoveButtons: false,
    suggestionsAvailableAlertText: "People Picker Suggestions available",
    suggestionsContainerAriaLabel: "Suggested contacts",
  };
  function getTextFromItem(persona: IPersonaProps): string {
    return persona.text as string;
  }
  return (
    <Stack>
         {label && <Label>{label}</Label>}
      <NormalPeoplePicker
        itemLimit={1}
        pickerSuggestionsProps={suggestionProps}
        getTextFromItem={getTextFromItem}
        onEmptyResolveSuggestions={() => employees.map((empl) => {
            const persona: IPersonaProps = {
              text: `${empl.givenName} ${empl.surName}`,
              secondaryText: empl.email as string,
            };
            return persona;
          })}
        inputProps={{
            placeholder: placeholder
        }}
        onResolveSuggestions={(filter) => {
          const e = employees
            .filter(
              (empl) =>
                !!empl.email?.includes(filter) ||
                !!empl.givenName?.includes(filter)
            )
            .map((empl) => {
              const persona: IPersonaProps = {
                text: `${empl.givenName} ${empl.surName}`,
                secondaryText: empl.email as string,
              };
              return persona;
            });
          return e;
        }}
        onRenderSuggestionsItem={(props) => <Persona {...props} />}
        onChange={(personas?: IPersonaProps[]): void => {
            if (!personas || personas.length === 0) {
              return onChange(undefined);
            }
            const selectedEmail = personas[0]?.secondaryText;
            const selectedEmployee = employees.find(
              (e) => e.email === selectedEmail
            );
            onChange(selectedEmployee);
        }}
      />
    </Stack>
  );
};

export default OurPeoplePicker;
