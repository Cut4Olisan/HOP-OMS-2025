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
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IOurPeoplePicker {
  employees: EmployeeDTO[];
  onChange: (people: EmployeeDTO | undefined) => void;
  placeholder?: string;
  label?: string;
  context: WebPartContext;
}

const OurPeoplePicker: React.FC<IOurPeoplePicker> = ({
  employees,
  onChange,
  placeholder,
  label,
  context,
}) => {
  const suggestionProps: IBasePickerSuggestionsProps = {
    suggestionsHeaderText: "Foreslag til søgning",
    mostRecentlyUsedHeaderText: "Foreslået medarbejdere",
    noResultsFoundText: "Ingen medarbejder fundet",
    loadingText: "Loading",
    showRemoveButtons: false,
    suggestionsAvailableAlertText: "Foreslag tilgængelig",
    suggestionsContainerAriaLabel: "Foreslået medarbejdere",
  };
  function getTextFromItem(persona: IPersonaProps): string {
    return persona.text as string;
  }
  const getEmployeePersona = (empl: EmployeeDTO): IPersonaProps => {
    return {
      text: `${empl.givenName} ${empl.surName}`,
      secondaryText: empl.email as string,
      imageUrl: `${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${empl.email}`,
    };
  };
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
                imageUrl: `${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${empl.email}`
            };
            return persona;
          })}
        inputProps={{
            placeholder: placeholder
        }}
        onResolveSuggestions={(filter) => {
          const filteredEmployees = employees
            .filter(
              (empl) =>
                !!empl.email?.toLowerCase().includes(filter.toLowerCase()) ||
                !!empl.givenName?.toLowerCase().includes(filter.toLowerCase())
            )
            .map((empl) => getEmployeePersona(empl));
          return filteredEmployees;
        }}
        onRenderSuggestionsItem={(personaProps) => <Persona {...personaProps} />}
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
