import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import RequestComponent from "./RequestCreation/RequestComponent";
import { FormMode } from "./RequestCreation/interfaces/IRequestComponentProps";

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  coworkers: { key: string; text: string }[];
  context: WebPartContext;
}

const ResourceManagement: React.FC<IResourceManagementProps> = ({
  context,
}) => {
  const coworkers = [
    { key: "coworker1", text: "Coworker 1" },
    { key: "coworker2", text: "Coworker 2" },
  ];

  return (
    <div>
      <BookingComponent
        coworkers={coworkers}
        context={context}
        customers={[]}
        projects={[]}
        onFinish={(registrations) => console.log(registrations)}
      />
      <RequestComponent context={context} mode={FormMode.CreateRequest}/>
      <RequestComponent context={context} mode={FormMode.ConfirmRequest}/>
    </div>
  );
};

export default ResourceManagement;
