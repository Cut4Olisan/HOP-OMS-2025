import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IRegistrationData } from "../../interfaces/IRegistrationProps";

export enum FormMode {
  CreateRequest = "CreateRequest",
  ConfirmRequest = "ConfirmRequest",
}

export interface IRequestProps {
  context: WebPartContext;
  mode: FormMode;
  onFinish: (requests: IRequestCreateDTO) => void;
}

export interface IRequest {
  id: number;
  title: string;
  shortDescription?: string;
  registrationId?: number;
  accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
  estimatedHours?: number;
}
 
export interface IRequestCreateDTO {
  title: string;
  shortDescription: string;
  estimatedHours?: number;
  registration?: IRegistrationData;
}
 
export interface IRequestEditDTO {
  id: number;
  title: string;
  shortDescription: string;
  registrationId?: number;
  estimatedHours?: number;
  registration?: IRegistrationData; // overrides the existing registrationid if pressent - Remember to alert the user if this was intended (that there is already a registration connected)
}
 
export interface IRequestAcceptDTO {
  // InPath - id: int;
  start: Date;
  end: Date;
  repeated: number;
}