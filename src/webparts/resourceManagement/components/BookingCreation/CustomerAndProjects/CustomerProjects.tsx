import * as React from "react";
import { ComboBox, IComboBoxOption } from "@fluentui/react";
import styles from "./CustomerProjects.module.scss";
import { CustomerDTO, ProjectDTO } from "../../interfaces";

export interface ICustomerProjectsProps {
  customers: CustomerDTO[];
  customerLabel: string;
  projects: ProjectDTO[];
  projectLabel: string;
  selectedCustomer: CustomerDTO | undefined;
  onUpdateSelectedCustomer: (customer: CustomerDTO) => void;
  selectedProject: ProjectDTO | undefined;
  onUpdateSelectedProject: (project: ProjectDTO) => void;
  required: boolean;
}

const CustomerProjects: React.FC<ICustomerProjectsProps> = ({
  customers,
  customerLabel,
  projects,
  projectLabel,
  selectedCustomer,
  onUpdateSelectedCustomer,
  selectedProject,
  onUpdateSelectedProject,
  required,
}) => {
  React.useEffect(() => {
    console.log(selectedProject);
  }, [selectedProject]);
  return (
    <>
      <ComboBox
        label={customerLabel}
        placeholder="Vælg en kunde"
        options={
          customers
            .filter((c) => c.active)
            .map((customer) => ({
              key: customer.id,
              text: customer.name,
            })) as IComboBoxOption[]
        }
        selectedKey={selectedCustomer?.id}
        onChange={(e, option) => {
          const customer = customers.find((c) => c.id === option?.key);
          if (!customer) return;

          return onUpdateSelectedCustomer(customer);
        }}
        calloutProps={{ doNotLayer: true, className: styles.limitCalloutSize }}
        allowFreeInput
        autoComplete="on"
        required={required}
      />

      {selectedCustomer && (
        <ComboBox
          label={projectLabel}
          placeholder="Vælg projekt for kunde"
          options={
            projects
              .filter((p) => p.customerId === selectedCustomer.id)
              .map((project) => ({
                key: project.id,
                text: project.name,
              })) as IComboBoxOption[]
          }
          selectedKey={selectedProject?.id}
          onChange={(e, option) => {
            const project = projects.find((p) => p.id === option?.key);
            if (!project) return;

            return onUpdateSelectedProject(project);
          }}
          calloutProps={{
            doNotLayer: true,
            className: styles.limitCalloutSize,
          }}
          allowFreeInput
          autoComplete="on"
          required={required}
        />
      )}
    </>
  );
};

export default CustomerProjects;
