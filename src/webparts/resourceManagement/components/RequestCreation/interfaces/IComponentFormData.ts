import { DayOfWeek } from "@fluentui/react";
import { CustomerDTO, ProjectDTO } from "../../interfaces";

export interface IRecursionData {
  days: DayOfWeek[];
  weeks: number;
}

export default interface IComponentFormData {
  title: string;
  info: string;
  selectedCustomer?: CustomerDTO;
  selectedProject?: ProjectDTO;
  startDateTime?: Date;
  endDateTime?: Date;
  selectedCoworkers: string[];
  isRecurring: boolean;
  recursionData?: IRecursionData;
}
