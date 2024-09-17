import { WebPartContext } from "@microsoft/sp-webpart-base";

export enum FormMode {
  CreateRequest = "CreateRequest",
  ConfirmRequest = "ConfirmRequest",
}

export interface IRequestProps {
  context: WebPartContext;
  mode: FormMode;
}
