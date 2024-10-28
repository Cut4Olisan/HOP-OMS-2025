import * as React from "react";
import { ComboBox, IComboBox, IComboBoxOption, Stack } from "@fluentui/react";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import BackEndService from "../../../services/BackEnd";
import { EmployeeDTO } from "../../interfaces";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IPeoplePickerComponentProps {
  onSelectionChange: (selectedEmployees: EmployeeDTO[]) => void;
  selectedEmployees: EmployeeDTO[];
  context: WebPartContext;
  clearSelection: boolean;
}

const PeoplePickerComponent: React.FC<IPeoplePickerComponentProps> = ({
  onSelectionChange,
  selectedEmployees,
  context,
  clearSelection,
}) => {
  const [employeeOptions, setEmployeeOptions] = React.useState<
    IComboBoxOption[]
  >([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchEmployees = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await BackEndService.Api.employeeList();
        const fetchedEmployees: EmployeeDTO[] = response.data;

        // Current logged-in user email
        const currentUserEmail = context.pageContext.user.email;

        const options = fetchedEmployees.map((employee) => {
          const email = employee.email || "";
          const personaImageUrl = `${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?size=M&accountname=${email}`;

          return {
            key: email,
            text: `${employee.givenName} ${employee.surName}`,
            data: {
              persona: (
                <Persona
                  text={`${employee.givenName} ${employee.surName}`}
                  imageUrl={personaImageUrl}
                  size={PersonaSize.size32}
                />
              ),
              employee: employee,
            },
          };
        });

        setEmployeeOptions(options);

        // Set default selected employee as the current signed in user
        const defaultOption = options.find(
          (option) => option.key === currentUserEmail
        );
        if (defaultOption) {
          setSelectedKeys([defaultOption.key as string]);
          onSelectionChange([defaultOption.data.employee]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees().catch(console.error);
  }, [onSelectionChange, context]);

  React.useEffect(() => {
    if (clearSelection) {
      setSelectedKeys([]);
      onSelectionChange([]);
    }
  }, [clearSelection, onSelectionChange]);

  const handleComboBoxChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    index?: number
  ): void => {
    if (!option) return;
    const newSelectedKeys = option.selected
      ? [...selectedKeys, option.key as string]
      : selectedKeys.filter((key) => key !== option.key);

    setSelectedKeys(newSelectedKeys);

    const selectedEmployeeData = employeeOptions
      .filter((opt) => newSelectedKeys.includes(opt.key as string))
      .map((opt) => opt.data.employee);
    onSelectionChange(selectedEmployeeData);
  };

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <ComboBox
        placeholder="Vælg medarbejder"
        multiSelect
        options={employeeOptions}
        selectedKey={selectedKeys}
        onChange={handleComboBoxChange}
        useComboBoxAsMenuWidth
        disabled={loading}
        allowFreeInput={false}
        onRenderOption={(option) => option?.data?.persona}
      />
    </Stack>
  );
};

export default PeoplePickerComponent;
