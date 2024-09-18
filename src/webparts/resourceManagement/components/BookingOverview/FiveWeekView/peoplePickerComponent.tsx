import * as React from "react";
import {
  ComboBox,
  IComboBoxOption,
  IComboBox,
  IComboBoxStyles,
} from "@fluentui/react";
import {
  IPersonaProps,
  Persona,
  PersonaSize,
} from "@fluentui/react/lib/Persona";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http"; // Import MSGraphClientV3
import styles from "./FiveWeekView.module.scss";

interface IPeoplePickerComboBoxProps {
  context: WebPartContext;
  onChange: (selectedKeys: string[]) => void;
}

const PeoplePickerComboBox: React.FC<IPeoplePickerComboBoxProps> = ({
  context,
  onChange,
}) => {
  const [employeeOptions, setEmployeeOptions] = React.useState<IPersonaProps[]>(
    []
  );
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  // Fetch users using MSGraphClientV3
  const fetchUsers = async () => {
    try {
      const client: MSGraphClientV3 =
        await context.msGraphClientFactory.getClient("3");
      const response = await client
        .api("/users")
        .select("displayName,mail,id")
        .get();

      // Map response to IPersonaProps array
      const users: IPersonaProps[] = response.value.map((user: any) => ({
        text: user.displayName,
        secondaryText: user.mail,
        id: user.id,
        imageInitials: user.displayName
          .split(" ")
          .map((name: string) => name[0])
          .join(""),
      }));

      setEmployeeOptions(users);
    } catch (error) {
      console.error("Error fetching users from Microsoft Graph:", error);
    }
  };

  // Fetch users on component mount
  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Handler for ComboBox changes
  const handleComboBoxChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption
  ) => {
    if (option) {
      const newSelectedKeys = option.selected
        ? [...selectedKeys, option.key as string]
        : selectedKeys.filter((key) => key !== option.key);

      setSelectedKeys(newSelectedKeys);
      onChange(newSelectedKeys);
    }
  };

  // Custom render for ComboBox options (showing avatars and initials)
  const onRenderOption = (option: IComboBoxOption): JSX.Element => {
    const personaProps = employeeOptions.find(
      (emp) => emp.text === option.text
    );
    return personaProps ? (
      <Persona
        text={personaProps.text}
        imageUrl={personaProps.imageUrl}
        size={PersonaSize.size24}
        initialsColor={personaProps.initialsColor}
        hidePersonaDetails
      />
    ) : (
      <span>{option.text}</span>
    );
  };

  // Custom render for selected items in the ComboBox input
  const onRenderItem = (option: IComboBoxOption): JSX.Element => {
    const personaProps = employeeOptions.find(
      (emp) => emp.text === option.text
    );
    return personaProps ? (
      <Persona
        imageUrl={personaProps.imageUrl}
        text={selectedKeys.length === 1 ? personaProps.text : ""}
        size={PersonaSize.size24}
        initialsColor={personaProps.initialsColor}
        hidePersonaDetails={selectedKeys.length > 1} // Show initials only if more than one person is selected
      />
    ) : (
      <span>{option.text}</span>
    );
  };

  // ComboBox styles to maintain a compact display
  const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: { maxWidth: 300 },
    input: { padding: 0 },
  };

  return (
    <ComboBox
      multiSelect
      options={employeeOptions.map((employee) => ({
        key: employee.text || "", // Provide a fallback for key
        text: employee.text || "Unknown", // Provide a fallback for text
      }))}
      selectedKey={selectedKeys}
      onChange={handleComboBoxChange}
      onRenderOption={onRenderOption}
      onRenderItem={onRenderItem} // Use `onRenderItem` to render selected items
      placeholder="Vælg en medarbejder"
      className={styles.peoplePickerComboBox}
      styles={comboBoxStyles}
    />
  );
};

export default PeoplePickerComboBox;
