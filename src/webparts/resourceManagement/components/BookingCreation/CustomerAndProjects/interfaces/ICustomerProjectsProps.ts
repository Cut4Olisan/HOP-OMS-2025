export interface ICustomerProjectsProps {
  customers: Customer[];
  projects: Project[];
  selectedCustomer: Customer | undefined;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | undefined>>;
  selectedProject: string;
  setSelectedProject: React.Dispatch<React.SetStateAction<string>>;
}

export interface Customer {
    id: number;
    name: string;
    active: boolean;
  }
  
  export interface Project {
    id: string;
    name: string;
    customerId: number;
  }