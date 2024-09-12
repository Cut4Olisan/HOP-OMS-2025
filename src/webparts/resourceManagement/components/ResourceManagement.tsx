import * as React from 'react';
import BookingComponent from './booking/BookingComponent';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  coworkers: { key: string; text: string }[];
  projects: { key: string; text: string }[];
  context: WebPartContext
}


const ResourceManagement: React.FC<IResourceManagementProps> = ({context}) => {
  const coworkers = [
    { key: 'coworker1', text: 'Coworker 1' },
    { key: 'coworker2', text: 'Coworker 2' },
  ];

  const projects = [
    { key: 'project1', text: 'Project 1' },
    { key: 'project2', text: 'Project 2' },
  ];

  return (
    <div>
      <BookingComponent
        coworkers={coworkers}
        projects={projects}
        context={context} customers={[]}      />
    </div>
  );
};

export default ResourceManagement;
