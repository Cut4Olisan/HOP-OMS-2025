export interface ICustomerProjectsProps {
  customers: ICustomer[];
  customerLabel: string;
  projects: IProject[];
  projectLabel: string;
  selectedCustomer: ICustomer | undefined;
  setSelectedCustomer: React.Dispatch<
    React.SetStateAction<ICustomer | undefined>
  >;
  selectedProject: IProject | undefined;
  setSelectedProject: React.Dispatch<React.SetStateAction<IProject | undefined>>;
  required: boolean;
}

export interface ICustomer {
  id: number;
  name: string;
  active: boolean;
}

export interface IProject {
  id: number;
  name: string;
  customerId: number;
}
