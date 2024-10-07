import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IRegistration } from "./interfaces/IRegistrationProps";
import RequestComponent from "./RequestCreation/RequestComponent";
import { FormMode } from "./RequestCreation/interfaces/IRequestComponentProps";
import RequestList from "./RequestCreation/RequestList";
import { DefaultButton } from "@fluentui/react";

export enum DEV_WP_VIEW {
  BookingComponent,
  BookingOverview,
  CreateRequestComponent,
  ConfirmRequestComponent,
  RequestList,
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
  const [view, setView] = React.useState<DEV_WP_VIEW>(DEV_WP_VIEW.BookingOverview);
  const [selectedRegistration, setSelectedRegistration] = React.useState<
    IRegistration | undefined
  >();
  const coworkers = [
    { key: "coworker1", text: "Coworker 1" },
    { key: "coworker2", text: "Coworker 2" },
  ];
  setSelectedRegistration;
  const [, setIsPanelOpen] = React.useState(false);
  const dismissPanel = () => setIsPanelOpen(false);

  return (
    <div>
      <DefaultButton
        text="Opret request"
        onClick={() => setView(DEV_WP_VIEW.CreateRequestComponent)}
      />
      <DefaultButton
        text="Bekræft request"
        onClick={() => setView(DEV_WP_VIEW.ConfirmRequestComponent)}
      />
      <DefaultButton
        text="Request liste"
        onClick={() =>  setView(DEV_WP_VIEW.RequestList)}
      />
      {view === DEV_WP_VIEW.BookingOverview && (
        <BookingOverviewComponent context={context} />
      )}

      {view === DEV_WP_VIEW.BookingComponent && (
        <BookingComponent
          registration={selectedRegistration ? selectedRegistration : undefined}
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
      {view === DEV_WP_VIEW.CreateRequestComponent && (
        <RequestComponent
          context={context}
          mode={FormMode.CreateRequest}
          onFinish={(requests) => console.log(requests)}
        />
      )}
      {view === DEV_WP_VIEW.ConfirmRequestComponent && (
        <RequestComponent
          context={context}
          mode={FormMode.ConfirmRequest}
          onFinish={(requests) => console.log(requests)}
        />
      )}
      {view === DEV_WP_VIEW.RequestList && <RequestList context={context} />}
    </div>
  );
};

export default ResourceManagement;
