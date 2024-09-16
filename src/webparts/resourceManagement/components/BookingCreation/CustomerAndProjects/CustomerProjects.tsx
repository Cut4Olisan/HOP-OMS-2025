import * as React from "react";
import { Dropdown, IDropdownStyles } from "@fluentui/react";
import { ICustomerProjectsProps } from "./interfaces/ICustomerProjectsProps";

const dropdownStyles: Partial<IDropdownStyles> = {
  callout: {
    maxHeight: 200,
    overflowY: "auto",
  },
  dropdownItem: {
    height: "auto",
  },
  dropdownOptionText: {
    overflow: "visible",
    whiteSpace: "normal",
  },
};

const CustomerProjects: React.FC<ICustomerProjectsProps> = ({
  customers,
  projects,
  selectedCustomer,
  setSelectedCustomer,
  selectedProject,
  setSelectedProject,
}) => {
  return (
    <>
      <Dropdown
        label="Kunde"
        placeholder="Vælg en kunde"
        options={customers
          .filter((c) => c.active)
          .map((customer) => ({
            key: customer.id,
            text: customer.name,
          }))}
        selectedKey={selectedCustomer?.id}
        onChange={(e, option) =>
          option
            ? setSelectedCustomer(
                customers.find((c) => c.id === Number(option?.key))
              )
            : undefined
        }
        styles={dropdownStyles}
        required
        // calloutProps={{ className: styles.<className_Here> }}
      />

      {selectedCustomer && (
        <Dropdown
          label="Projekt"
          placeholder="Vælg projekt for kunde"
          options={projects
            .filter((p) => p.customerId === selectedCustomer.id)
            .map((project) => ({
              key: project.id,
              text: project.name,
            }))}
          selectedKey={selectedProject}
          onChange={(e, option) => setSelectedProject(option?.key as string)}
          styles={dropdownStyles}
          required
        />
      )}
    </>
  );
};

export default CustomerProjects;
