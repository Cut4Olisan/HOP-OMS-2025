import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DefaultButton } from "@fluentui/react";

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
  const [view, setView] = React.useState<DEV_WP_VIEW>(
    DEV_WP_VIEW.BookingComponent
  );

  const coworkers = [
    { key: "coworker1", text: "Coworker 1" },
    { key: "coworker2", text: "Coworker 2" },
  ];

  return (
    <div>
      <div>
        <DefaultButton
          text="Create Booking"
          onClick={() => setView(DEV_WP_VIEW.BookingComponent)}
        />
        <DefaultButton
          text="Booking Overview"
          onClick={() => setView(DEV_WP_VIEW.BookingOverview)}
        />
      </div>

      {view === DEV_WP_VIEW.BookingComponent && (
        <BookingComponent
          coworkers={coworkers}
          context={context}
          customers={[]}
          projects={[]}
          dismissPanel
          onFinish={(bookings: unknown[]) => {
            console.log("Bookings created: ", bookings);
          }}
        />
      )}

      {view === DEV_WP_VIEW.BookingOverview && (
        <BookingOverviewComponent context={context} />
      )}
    </div>
  );
};

export default ResourceManagement;
