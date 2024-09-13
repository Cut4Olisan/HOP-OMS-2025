import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IBookingComponentProps {
    context: WebPartContext;
    customers: { key: string; text: string }[];
    coworkers: { key: string; text: string }[];
    projects: { key: string; text: string }[];
  }