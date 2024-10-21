import * as React from "react";
import { DatePicker, DayOfWeek, Stack } from "@fluentui/react";
import { DanishDatePickerStrings, formatDateForDisplay } from "../dateUtils";
import TimeField from "./TimeField/TimeField";
import styles from "./BookingComponent.module.scss";

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

export enum ChosenTime {
  StartTime,
  EndTime,
}

const DateTimePickerComponent: React.FC<IDateTimeProps> = ({
  label,
  value,
  onChange,
  disabled = false,
}) => {
  if (!value)return <></>
  return (
    <Stack>
      {JSON.stringify(value)}
      <DatePicker
        label={label}
        placeholder="Vælg en dato"
        firstDayOfWeek={DayOfWeek.Monday}
        value={value.date}
        strings={DanishDatePickerStrings}
        formatDate={(date) =>
          date ? formatDateForDisplay(date.toISOString()) : ""
        }
        onSelectDate={disabled ? undefined : undefined/* handleDateChange */}
        disabled={disabled}
      />
      <Stack
        horizontal
        tokens={{ childrenGap: 10 }}
        className={styles.fullWidth}
      >
        <TimeField
          label="Start"
          name={!!value.startTime ? value.startTime : ""}
          selectedName={(newTime) =>
            undefined//handleTimeChange(newTime, ChosenTime.StartTime)
          }
          isMobile={true}
        />
        <TimeField
          label="Slut"
          name={!!value.endTime ? value.endTime : ""}
          selectedName={(newTime) =>
            undefined//handleTimeChange(newTime, ChosenTime.EndTime)
          }
          isMobile={true}
        />
      </Stack>
    </Stack>
  );
};

export default DateTimePickerComponent;
