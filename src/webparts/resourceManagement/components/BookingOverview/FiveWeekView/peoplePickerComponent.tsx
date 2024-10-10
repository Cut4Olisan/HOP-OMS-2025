import * as React from "react";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IComboBoxStyles,
} from "@fluentui/react";
import { Persona } from "@fluentui/react-components"; // Fluent UI v9 Persona //Ikke skiftes til v7 Avatar - For now atleast..
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";
import { ResponseType } from "@microsoft/microsoft-graph-client";
import styles from "./FiveWeekView.module.scss";

interface IPeoplePickerComboBoxProps {
  context: WebPartContext;
  onChange: (selectedEmails: string[]) => void;
  clearSelection: boolean;
}

interface IUser {
  id: string;
  displayName: string;
  mail: string;
}

const PeoplePickerComboBox: React.FC<IPeoplePickerComboBoxProps> = ({
  context,
  onChange,
  clearSelection,
}) => {
  const [employeeOptions, setEmployeeOptions] = React.useState<
    IComboBoxOption[]
  >([]);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  //const [selectedUserKey, setSelectedUserKey] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

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
      return "";
    }
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      const client: MSGraphClientV3 =
        await context.msGraphClientFactory.getClient("3");

      const currentUser = await client
        .api("/me")
        .select("id,displayName,mail")
        .get();

      const response = await client
        .api("/users")
        .select("displayName,mail,id")
        .get();

      const filteredUsers = response.value.filter(
        (user: IUser) =>
          user.mail &&
          (user.mail.endsWith("@ngage.dk") ||
            user.mail.endsWith("@dev4ngage.onmicrosoft.com"))
      );

      const users = await Promise.all(
        filteredUsers.map(async (user: IUser) => {
          const imageUrl = await fetchUserProfilePicture(user.id);
          return {
            key: user.id,
            text: user.displayName || "No Name",
            data: {
              id: user.id,
              mail: user.mail,
              text: user.displayName || "No Name",
              imageUrl: imageUrl || "",
              initials: user.displayName
                .split(" ")
                .map((name: string) => name[0])
                .join(""),
            },
          };
        })
      );

      setEmployeeOptions(users);
      setSelectedKeys(currentUser.id);
    } catch (error) {
      console.error("Error fetching users from Microsoft Graph:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (clearSelection) {
      setSelectedKeys([]);
    }
  }, [clearSelection]);

  const handleComboBoxChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption
  ): void => {
    if (option) {
      const newSelectedKeys = option.selected
        ? [...selectedKeys, option.key as string]
        : selectedKeys.filter((key) => key !== option.key);

      setSelectedKeys(newSelectedKeys);

      // Extract only the `mail` strings
      const selectedEmails = newSelectedKeys
        .map((key) => {
          const selectedOption = employeeOptions.find((opt) => opt.key === key);
          return selectedOption?.data?.mail || "";
        })
        .filter((email) => email); // Remove empty strings

      onChange(selectedEmails);
    }
  };

  console.log(selectedKeys, "selectedkeys");

  const onRenderOption = (option: IComboBoxOption): JSX.Element => {
    const { text, data } = option;
    return (
      <div
        style={{ display: "flex", alignItems: "center", padding: "5px 10px" }}
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
