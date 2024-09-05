import * as React from 'react';
import BookingComponent from './booking/BookingComponent';

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
        coworkers={coworkers}
        projects={projects}
      />
    </div>
  );
};

export default ResourceManagement;