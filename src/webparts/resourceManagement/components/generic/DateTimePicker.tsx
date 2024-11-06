import * as React from "react";
import { DatePicker, DayOfWeek, Stack } from "@fluentui/react";
import {
  DanishDatePickerStrings,
  formatDateForDisplay,
} from "../../utilities/DateUtilities";
import TimeField from "./TimeField";

export interface IDateTimePickerValue {
  date: Date;
  startTime: string;
  endTime: string;
}

export interface IDateTimeProps {
  label: string;
  value: IDateTimePickerValue;
  onChange: (value: IDateTimePickerValue) => void;
  disabled?: boolean;
}

enum ChosenTime {
  StartTime = "startTime",
  EndTime = "endTime",
}

const DateTimePickerComponent: React.FC<IDateTimeProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  const handleDateChange = (newDate: Date | null | undefined): void => {
    if (newDate) {
      onChange({
        ...value,
        date: newDate,
      });
    }
  };

  const handleTimeChange = (newTime: string, timeType: ChosenTime): void => {
    onChange({
      ...value,
      [timeType]: newTime,
    });
  };

  if (!value) return <></>;
  return (
    <Stack>
      <DatePicker
        label={label}
        placeholder="Vælg en dato"
        firstDayOfWeek={DayOfWeek.Monday}
        value={value.date}
        strings={DanishDatePickerStrings}
        formatDate={(date) =>
          date ? formatDateForDisplay(date.toISOString()) : ""
        }
        onSelectDate={disabled ? undefined : handleDateChange}
        disabled={disabled}
      />
      <Stack horizontal tokens={{ childrenGap: 10 }} style={{ width: "100%" }}>
        <TimeField
          label="Start"
          name={!!value.startTime ? value.startTime : ""}
          selectedName={(newTime) =>
            handleTimeChange(newTime, ChosenTime.StartTime)
          }
          isMobile={true}
        />
        <TimeField
          label="Slut"
          name={!!value.endTime ? value.endTime : ""}
          selectedName={(newTime) =>
            handleTimeChange(newTime, ChosenTime.EndTime)
          }
          isMobile={true}
        />
      </Stack>
    </Stack>
  );
};

export default DateTimePickerComponent;
