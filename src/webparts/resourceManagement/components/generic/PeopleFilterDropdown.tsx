import * as React from "react";
import { ComboBox, IComboBox, IComboBoxOption, Stack } from "@fluentui/react";
import { Persona, PersonaSize } from "@fluentui/react/lib/Persona";
import { EmployeeDTO } from "../interfaces";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import useGlobal from "../../hooks/useGlobal";

export interface IPeopleFilterDropdownProps {
  onSelectionChange: (selectedEmployees: EmployeeDTO[]) => void;
  context: WebPartContext;
  clearSelection: boolean;
}

const PeopleFilterDropdown: React.FC<IPeopleFilterDropdownProps> = ({
  onSelectionChange,
  context,
  clearSelection,
}) => {
  const { employees } = useGlobal();
  const [employeeOptions, setEmployeeOptions] = React.useState<
    IComboBoxOption[]
  >([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Current logged-in user email
    const currentUserEmail = context.pageContext.user.email.toLowerCase();

    const options = employees.map((employee) => {
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
  }, []);

  React.useEffect(() => {
    if (clearSelection) {
      setSelectedKeys([]);
      onSelectionChange([]);
    }
  }, []);

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
        allowFreeInput={false}
        onRenderOption={(option) => option?.data?.persona}
      />
    </Stack>
  );
};

export default PeopleFilterDropdown;
