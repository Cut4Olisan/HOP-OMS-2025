import { DayOfWeek } from "@fluentui/react";

export interface IRecursionData {
  days: DayOfWeek[];
  weeks: number;
}

export interface ICustomer {
  id: number;
  name: string;
  active: boolean;
}

export interface IProject {
  id: number;
  name: string;
  customerId: number;
}

export default interface IComponentFormData {
  title: string;
  info: string;
  selectedCustomer?: ICustomer;
  selectedProject?: IProject;
  startDateTime?: Date;
  endDateTime?: Date;
  selectedCoworkers: string[];
  isRecurring: boolean;
  recursionData?: IRecursionData;
}
