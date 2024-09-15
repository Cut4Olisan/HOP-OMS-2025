import * as React from "react";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
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
  return (
    <div>
      <BookingOverviewComponent></BookingOverviewComponent>
    </div>
  );
};

export default ResourceManagement;
