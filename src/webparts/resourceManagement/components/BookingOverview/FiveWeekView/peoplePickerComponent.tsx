import * as React from "react";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IComboBoxStyles,
} from "@fluentui/react";
import { Persona } from "@fluentui/react-components"; // Fluent UI v9 Persona
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ResponseType } from "@microsoft/microsoft-graph-client";
import styles from "./FiveWeekView.module.scss";

interface IPeoplePickerComboBoxProps {
  context: WebPartContext;
  onChange: (selectedKeys: string[]) => void;
  clearSelection: boolean;
}

const PeoplePickerComboBox: React.FC<IPeoplePickerComboBoxProps> = ({
  context,
  onChange,
  clearSelection,
}) => {
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [employeeOptions, setEmployeeOptions] = React.useState<
    IComboBoxOption[]
  >([]);

  const fetchUserProfilePicture = async (userId: string): Promise<string> => {
    try {
      const client: MSGraphClientV3 =
        await context.msGraphClientFactory.getClient("3");
      const response = await client
        .api(`/users/${userId}/photo/$value`)
        .responseType(ResponseType.BLOB)
        .get();
      return URL.createObjectURL(response);
    } catch (error) {
      console.error(
        `Error fetching profile picture for user ${userId}:`,
        error
      );
      return ""; // Return an empty string if fetching fails
    }
  };

  const fetchUsers = async () => {
    try {
      const client: MSGraphClientV3 =
        await context.msGraphClientFactory.getClient("3");
      const response = await client
        .api("/users")
        .select("displayName,mail,id")
        .get();

      const filteredUsers = response.value.filter(
        (user: any) =>
          user.mail &&
          (user.mail.endsWith("@ngage.dk") ||
            user.mail.endsWith("@dev4ngage.onmicrosoft.com"))
      );

      const users = await Promise.all(
        filteredUsers.map(async (user: any) => {
          const imageUrl = await fetchUserProfilePicture(user.id);
          const initials = user.displayName
            .split(" ")
            .map((name: string) => name[0])
            .join("");

          return {
            key: user.id,
            text: user.displayName || "No Name",
            data: {
              mail: user.mail,
              id: user.id,
              text: user.displayName || "No Name",
              imageUrl: imageUrl || "",
              initials: initials,
            },
          };
        })
      );

      const completeUsers = users.filter(
        (user) => user && user.text && user.key && user.data?.text
      );

      setEmployeeOptions(completeUsers);
    } catch (error) {
      console.error("Error fetching users from Microsoft Graph:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Effect to handle clearing of selection
  React.useEffect(() => {
    if (clearSelection) {
      setSelectedKeys([]); // Clear selected keys
      onChange([]); // Pass an empty array to the parent component
    }
  }, [clearSelection, onChange]);

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

  const onRenderOption = (option: IComboBoxOption): JSX.Element => {
    const { text, data } = option;
    const isSelected = selectedKeys.includes(option.key as string);
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px",
          backgroundColor: isSelected ? "#e0e0e0" : "transparent",
          cursor: "pointer",
        }}
      >
        <Persona
          name={text || "No Name"}
          avatar={{
            image: data?.imageUrl ? { src: data.imageUrl } : undefined,
            name: text,
            initials: data?.initials || text.charAt(0),
          }}
          size="medium"
          style={{ marginRight: 8 }}
        />
      </div>
    );
  };

  const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: { maxWidth: 300 },
    input: { padding: 0 },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ComboBox
      multiSelect
      options={employeeOptions}
      selectedKey={selectedKeys}
      onChange={handleComboBoxChange}
      onRenderOption={onRenderOption}
      placeholder="Vælg en medarbejder"
      className={styles.peoplePickerComboBox}
      styles={comboBoxStyles}
      calloutProps={{
        doNotLayer: true,
        className: styles.limitCalloutSize,
      }}
      allowFreeform={false}
      autoComplete="on"
    />
  );
};

export default PeoplePickerComboBox;
