import * as React from "react";
import { ComboBox } from "@fluentui/react";
import { ICustomerProjectsProps } from "../../interfaces/ICustomerProjectsProps";
import styles from "./CustomerProjects.module.scss";

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
      <ComboBox
        label="Vælg kunde"
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
        calloutProps={{ doNotLayer: true, className: styles.limitCalloutSize }}
        allowFreeInput
        autoComplete="on"
        required
      />

      {selectedCustomer && (
        <ComboBox
          label="Vælg projekt"
          placeholder="Vælg projekt for kunde"
          options={projects
            .filter((p) => p.customerId === selectedCustomer.id)
            .map((project) => ({
              key: project.id,
              text: project.name,
            }))}
          selectedKey={selectedProject}
          onChange={(e, option) => setSelectedProject(option?.key as string)}
          calloutProps={{
            doNotLayer: true,
            className: styles.limitCalloutSize,
          }}
          allowFreeInput
          autoComplete="on"
          required
        />
      )}
    </>
  );
};

export default CustomerProjects;
