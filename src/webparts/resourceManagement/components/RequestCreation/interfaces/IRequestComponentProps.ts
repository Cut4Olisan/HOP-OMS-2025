import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Registration } from "../../BookingCreation/interfaces/IRegistrationProps";

export enum FormMode {
  CreateRequest = "CreateRequest",
  ConfirmRequest = "ConfirmRequest",
}

export interface IRequestProps {
  context: WebPartContext;
  mode: FormMode;
}

export interface IRequest {
  id: number;
  shortDescription?: string;
  registrationId?: number;
  accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
}
 
export interface IRequestCreateDTO {
  id: number;
  shortDescription?: string;
  registrationId?: number;
  accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
  registration?: Registration;
}
 
export interface IRequestEditDTO {
  id: number;
  shortDescription?: string;
  registrationId?: number;
}
 
export interface IRequestAcceptDTO {
  id: number;
  registrationId?: number;
  Accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
  start: Date;
  end: Date;
  repeated: number;
}
