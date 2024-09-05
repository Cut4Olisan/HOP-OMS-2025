import * as React from 'react';
import BookingComponent from './booking/BookingComponent';
import { useCustomerList } from './Customers/fetchCustomers';

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  customers: { key: string; text: string }[];
  coworkers: { key: string; text: string }[];
  projects: { key: string; text: string }[];
}


const ResourceManagement: React.FC<IResourceManagementProps> = () => {
  const { customers } = useCustomerList();

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
        customers={customers.map(c => ({ key: c.id, text: c.name }))}
      />
    </div>
  );
};

export default ResourceManagement;
