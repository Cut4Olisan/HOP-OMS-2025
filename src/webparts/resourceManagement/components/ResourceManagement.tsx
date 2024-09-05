import * as React from 'react';
import BookingComponent from './booking/BookingComponent'; // Adjust path if necessary

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  customers: Array<{ key: string; text: string }>;
  coworkers: Array<{ key: string; text: string }>;
  projects: Array<{ key: string; text: string }>;
}

const ResourceManagement: React.FC<IResourceManagementProps> = ({
  isDarkTheme,
  environmentMessage,
  customers,
  coworkers,
  projects
}) => {

  return (
    <div>
      <BookingComponent
        customers={customers}
        coworkers={coworkers}
        projects={projects}
      />
    </div>
  );
};

export default ResourceManagement;
