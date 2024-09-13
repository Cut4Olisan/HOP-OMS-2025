import * as React from "react";
import BookingComponent from "./booking/BookingComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";

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
      />
    </div>
  );
};

export default ResourceManagement;
