import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";
//import { ICustomer, IProject } from "./interfaces/ICustomerProjectsProps";
//import BackEndService from "../services/BackEnd";
//import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
//import { DefaultButton } from "@fluentui/react";

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  coworkers: { key: string; text: string }[];
  context: WebPartContext;
}

export enum DEV_WP_VIEW {
  BookingComponent,
  BookingOverview,
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
        projects={[]} onFinish={function (bookings: unknown[]): void {
          throw new Error("Function not implemented.");
        } }      />
    </div>
  );
};

export default ResourceManagement;
