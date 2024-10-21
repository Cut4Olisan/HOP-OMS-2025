import * as React from "react";
import { ComboBox, IComboBox, IComboBoxOption, Stack } from "@fluentui/react";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import BackEndService from "../../../services/BackEnd";
import { EmployeeDTO } from "../../interfaces";

export interface IPeoplePickerComponentProps {
  onSelectionChange: (selectedEmployees: EmployeeDTO[]) => void;
  selectedEmployees: EmployeeDTO[];
}
const PeoplePickerComponent: React.FC<IPeoplePickerComponentProps> = ({
  onSelectionChange,
  selectedEmployees,
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

        const options = fetchedEmployees.map((employee) => ({
          key: employee.email || employee.id || (0).toString(),
          text: `${employee.givenName} ${employee.surName}`,
          data: {
            persona: (
              <Persona
                text={`${employee.givenName} ${employee.surName}`}
                size={PersonaSize.size40}
              />
            ),
            employee: employee,
          },
        }));

        setEmployeeOptions(options);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees().catch(console.error);
  }, [onSelectionChange]);

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
      {loading && <p>Henter medarbejdere...</p>}
    </Stack>
  );
};
export default PeoplePickerComponent;
