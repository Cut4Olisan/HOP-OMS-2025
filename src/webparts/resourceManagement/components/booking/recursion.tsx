import * as React from "react";
import {
  Text,
  Checkbox,
  Stack,
  TextField,
  ITextFieldStyles,
  DayOfWeek,
} from "@fluentui/react";
import styles from "./Recursion.module.scss";

export interface IRecursionProps {
  onRecursionChange: (days: DayOfWeek[], weeks: number) => void;
}

const narrowTextFieldStyles: Partial<ITextFieldStyles> = {
  fieldGroup: { width: 42, height: 22 },
  field: { padding: "0 6px" },
};

const MAX_INPUT_LENGTH = 3;

const RecursionPanel: React.FC<IRecursionProps> = ({ onRecursionChange }) => {
  const [TextFieldValue, setTextFieldValue] = React.useState("");
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>([]);

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

  const toggleDaySelection = (day: DayOfWeek): void => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  React.useEffect(() => {
    if (!parseInt(TextFieldValue, 10)) return;

    if (!selectedDays.length) return;

    return onRecursionChange(selectedDays, parseInt(TextFieldValue, 10));
  }, [TextFieldValue, selectedDays]);

  return (
    <div>
      <Text variant="large">Gentag booking hver:</Text>
      <Stack tokens={{ childrenGap: 5 }}>
        <Checkbox
          label="Mandag"
          onChange={() => toggleDaySelection(DayOfWeek.Monday)}
        />
        <Checkbox
          label="Tirsdag"
          onChange={() => toggleDaySelection(DayOfWeek.Tuesday)}
        />
        <Checkbox
          label="Onsdag"
          onChange={() => toggleDaySelection(DayOfWeek.Wednesday)}
        />
        <Checkbox
          label="Torsdag"
          onChange={() => toggleDaySelection(DayOfWeek.Thursday)}
        />
        <Checkbox
          label="Fredag"
          onChange={() => toggleDaySelection(DayOfWeek.Friday)}
        />
      </Stack>
      <Stack
        horizontal
        tokens={{ childrenGap: 5 }}
        className={styles.verticalAligned}
      >
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
