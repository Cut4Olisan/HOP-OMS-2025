import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export enum DEV_WP_VIEW {
  BookingComponent,
  BookingOverview,
}

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  coworkers: { key: string; text: string }[];
  context: WebPartContext;
}

const ResourceManagement: React.FC<IResourceManagementProps> = ({
  context,
}) => {
  const [view] = React.useState<DEV_WP_VIEW>(DEV_WP_VIEW.BookingOverview);

  const coworkers = [
    { key: "coworker1", text: "Coworker 1" },
    { key: "coworker2", text: "Coworker 2" },
  ];

  const [, setIsPanelOpen] = React.useState(false);
  const dismissPanel = () => setIsPanelOpen(false);

  return (
    <div>
      {view === DEV_WP_VIEW.BookingOverview && (
        <BookingOverviewComponent context={context} />
      )}

      {view === DEV_WP_VIEW.BookingComponent && (
        <BookingComponent
          coworkers={coworkers}
          context={context}
          customers={[]}
          projects={[]}
          dismissPanel={dismissPanel}
          onFinish={(bookings: unknown[]) => {
            console.log("Bookings created: ", bookings);
          }}
        />
      )}
    </div>
  );
};

export default ResourceManagement;
