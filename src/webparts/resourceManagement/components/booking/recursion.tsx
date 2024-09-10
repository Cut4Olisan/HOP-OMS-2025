import * as React from "react";
import {
  Text,
  Checkbox,
  Stack,
  TextField,
  ITextFieldStyles,
} from "@fluentui/react";
import styles from "./Recursion.module.scss";

export interface IRecursionProps {}

const narrowTextFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 42, height: 22, },
  field: { padding: "0 6px",},
};
const MAX_INPUT_LENGTH = 3;

const RecursionPanel: React.FC<IRecursionProps> = () => {
  const [TextFieldValue, setTextFieldValue] = React.useState("");

  const limitTextFieldLength = React.useCallback(
    (
      event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      newValue?: string
    ): void => {
      if (!newValue || newValue.length <= MAX_INPUT_LENGTH) {
        setTextFieldValue(newValue || "");
      }
    },
    []
  );

  return (
    <div>
      <Text variant="large">Gentag booking hver:</Text>
      <Stack tokens={{ childrenGap: 5 }}>
        <Checkbox label="Mandag" />
        <Checkbox label="Tirsdag" />
        <Checkbox label="Onsdag" />
        <Checkbox label="Torsdag" />
        <Checkbox label="Fredag" />
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 5 }} className={styles.verticalAligned}>
        <Text variant={"large"}>I de næste</Text>
        <TextField
          placeholder="..."
          value={TextFieldValue}
          styles={narrowTextFieldStyles}
          onChange={limitTextFieldLength}
        />
        <Text variant={"large"}>uger</Text>
      </Stack>
    </div>
  );
};
export default RecursionPanel;
