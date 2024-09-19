import * as React from "react";
import BookingComponent from "./BookingCreation/BookingComponent";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ICustomer, IProject } from "./interfaces/ICustomerProjectsProps";
import BackEndService from "../services/BackEnd";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { DefaultButton } from "@fluentui/react";

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
  const [customers, setCustomers] = React.useState<ICustomer[]>([]);
  const [projects, setProjects] = React.useState<IProject[]>([]);

  const [wp, setWp] = React.useState<DEV_WP_VIEW>(DEV_WP_VIEW.BookingOverview);

  React.useEffect(() => {
    (async () => {
      setCustomers(await BackEndService.Instance.getCustomers());
      setProjects(await BackEndService.Instance.getProjects());
    })().catch((e) => console.error(e));
  }, []);

  const coworkers = [
    { key: "coworker1", text: "Coworker 1" },
    { key: "coworker2", text: "Coworker 2" },
  ];

  return (
    <div>
      <div style={{ margin: "0 auto", display: "grid", gap: 16 }}>
        <DefaultButton
          text="Booking component"
          onClick={() => setWp(DEV_WP_VIEW.BookingComponent)}
        />
        <DefaultButton
          text="Booking overview"
          onClick={() => setWp(DEV_WP_VIEW.BookingOverview)}
        />
      </div>
      <div>
        {wp === DEV_WP_VIEW.BookingComponent && (
          <BookingComponent
            coworkers={coworkers}
            context={context}
            customers={customers}
            projects={projects}
            onFinish={(registrations) => console.log(registrations)}
          />
        )}
        {wp === DEV_WP_VIEW.BookingOverview && <BookingOverviewComponent />}
      </div>
    </div>
  );
};

export default ResourceManagement;
