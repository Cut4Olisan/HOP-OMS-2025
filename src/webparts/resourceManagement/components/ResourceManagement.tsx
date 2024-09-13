import * as React from "react";
//import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import FiveWeekView from "./BookingOverview/FiveWeekView/FiveWeekView";

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
}

// Udkommenteret midlertidigt for at teste
/*const ResourceManagement: React.FC<IResourceManagementProps> = () => {
  return <></>
}

export default ResourceManagement; */

export default class ResourceManagement extends React.Component<IResourceManagementProps> {
  constructor(props: IResourceManagementProps) {
    super(props);
    this.state = {};
  }

  // Midlertidig render for testing UI
  public render(): React.ReactElement<IResourceManagementProps> {
    return (
      <div>
        <FiveWeekView />
      </div>
    );
  }
}
