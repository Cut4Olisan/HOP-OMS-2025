import * as React from "react";
import {
  DateTimePicker,
  DateConvention,
  TimeConvention,
  TimeDisplayControlType,
} from "@pnp/spfx-controls-react";
import { DayOfWeek } from "@fluentui/react";
import { formatDateForDisplay, getDateOfTomorrow } from "../dateUtils";

export interface IDateTimeProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const DateTimePickerComponent: React.FC<IDateTimeProps> = ({
  label,
  value,
  onChange,
}) => {
  const defaultDate = label === "Sluttid" ? getDateOfTomorrow() : new Date();
  return (
    <DateTimePicker
      label={label}
      placeholder="Vælg en dato"
      dateConvention={DateConvention.DateTime}
      timeConvention={TimeConvention.Hours24}
      firstDayOfWeek={DayOfWeek.Monday}
      timeDisplayControlType={TimeDisplayControlType.Dropdown}
      minutesIncrementStep={5}
      showMonthPickerAsOverlay
      showSeconds={false}
      value={value || defaultDate}
      formatDate={(date) =>
        date ? formatDateForDisplay(date.toISOString()) : ""
      }
      onChange={onChange}
    />
  );
};

export default DateTimePickerComponent;
