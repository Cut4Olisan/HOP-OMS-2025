export interface ICustomerProjectsProps {
  customers: ICustomer[];
  projects: IProject[];
  selectedCustomer: ICustomer | undefined;
  setSelectedCustomer: React.Dispatch<
    React.SetStateAction<ICustomer | undefined>
  >;
  selectedProject: string;
  setSelectedProject: React.Dispatch<React.SetStateAction<string>>;
}

export interface ICustomer {
  id: number;
  name: string;
  active: boolean;
}

export interface IProject {
  id: string;
  name: string;
  customerId: number;
}
