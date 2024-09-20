import { WebPartContext } from "@microsoft/sp-webpart-base";

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
  shortDescription?: string;
  registrationId?: number;
  accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
}

export interface IRequestInformationDTO {
  id: number;
  shortDescription: string;
  description: string | undefined;
  projectId: number | undefined;
  startDate: string | undefined;
  startTime: string | undefined;
  endDate: string | undefined;
  endTime: string | undefined;
  time: number | undefined;
  employee: string;
  registrationType: number | undefined;
}

export interface IRequestCreateDTO {
  id: number;
  shortDescription?: string;
  registrationId?: number;
  accepted?: boolean; // null = pending, 0 = rejected, 1 = accepted
  registration?: IRequestInformationDTO;
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
