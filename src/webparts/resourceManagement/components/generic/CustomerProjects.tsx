import * as React from "react";
import { ComboBox, IComboBoxOption, Stack } from "@fluentui/react";
import { CustomerDTO, ProjectDTO } from "../interfaces";
import useGlobal from "../../hooks/useGlobal";

export interface ICustomerProjectsPickerProps {
  customerLabel: string;
  projectLabel: string;
  selectedCustomer: CustomerDTO | undefined;
  onUpdateSelectedCustomer: (customer: CustomerDTO) => void;
  selectedProject: ProjectDTO | undefined;
  onUpdateSelectedProject: (project: ProjectDTO) => void;
  customerRequired: boolean;
  projectRequired: boolean;
}

const CustomerProjectsPicker: React.FC<ICustomerProjectsPickerProps> = ({
  customerLabel,
  projectLabel,
  selectedCustomer,
  onUpdateSelectedCustomer,
  selectedProject,
  onUpdateSelectedProject,
  customerRequired,
  projectRequired,
}) => {
  const { customers, projects } = useGlobal();

  return (
    <Stack>
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
        calloutProps={{
          doNotLayer: true,
          styles: {
            root: {
              maxHeight: 300,
              width: "50%",
              height: "auto",
              overflow: "auto",
            },
          },
        }}
        allowFreeInput
        autoComplete="on"
        required={customerRequired}
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
            styles: {
              root: {
                maxHeight: 300,
                width: "50%",
                height: "auto",
                overflow: "auto",
              },
            },
          }}
          allowFreeInput
          autoComplete="on"
          required={projectRequired}
        />
      )}
    </Stack>
  );
};

export default CustomerProjectsPicker;
