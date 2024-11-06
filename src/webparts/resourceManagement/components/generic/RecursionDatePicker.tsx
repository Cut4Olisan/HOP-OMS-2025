import * as React from "react";
import { Text, Checkbox, Stack, DayOfWeek, SpinButton } from "@fluentui/react";
import globalStyles from "../styles.module.scss";
export interface IRecursionDatePickerProps {
  onRecursionChange: (days: DayOfWeek[], weeks: number) => void;
}

const SUFFIX = " uger";
const MIN = 0;
const MAX = 52;

const RecursionDatePicker: React.FC<IRecursionDatePickerProps> = ({
  onRecursionChange,
}) => {
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>([]);
  const [weeks, setWeeks] = React.useState<number>(0);

  // Funktion til at håndtere valg af dage
  const toggleDaySelection = (day: DayOfWeek): void => {
    setSelectedDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((d) => d !== day)
        : [...prevDays, day]
    );
  };

  const onSpinButtonChange = (
    event: React.SyntheticEvent<HTMLElement>,
    newValue?: string
  ): void => {
    const value = parseInt(newValue || "0", 10);
    if (!isNaN(value)) {
      setWeeks(value);
    }
  };

  const onIncrement = (value: string): string => {
    const newValue = Math.min(parseInt(value, 10) + 1, MAX);
    setWeeks(newValue);
    return newValue.toString() + SUFFIX;
  };

  const onDecrement = (value: string): string => {
    const newValue = Math.max(parseInt(value, 10) - 1, MIN);
    setWeeks(newValue);
    return newValue.toString() + SUFFIX;
  };

  React.useEffect(() => {
    if (!weeks || !selectedDays.length) return;
    onRecursionChange(selectedDays, weeks);
  }, [weeks, selectedDays]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Text className={globalStyles.bold}>Gentag booking hver:</Text>
      <Stack
        tokens={{ childrenGap: 5 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          maxWidth: 400,
        }}
      >
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
        style={{ alignItems: "center" }}
      >
        <SpinButton
          label="Gentag de næste"
          value={weeks + SUFFIX}
          min={MIN}
          max={MAX}
          step={1}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onChange={onSpinButtonChange}
        />
      </Stack>
    </div>
  );
};

export default RecursionDatePicker;
