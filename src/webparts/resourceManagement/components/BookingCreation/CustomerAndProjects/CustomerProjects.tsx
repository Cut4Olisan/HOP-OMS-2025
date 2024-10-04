import * as React from "react";
import { ComboBox } from "@fluentui/react";
import { ICustomerProjectsProps } from "../../interfaces/ICustomerProjectsProps";
import styles from "./CustomerProjects.module.scss";

const CustomerProjects: React.FC<ICustomerProjectsProps> = ({
  customers,
  customerLabel,
  projects,
  projectLabel,
  selectedCustomer,
  setSelectedCustomer,
  selectedProject,
  setSelectedProject,
  required
}) => {
  React.useEffect(() => {
    console.log(selectedProject);
  }, [selectedProject]);
  return (
    <>
      <ComboBox
        label={customerLabel}
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
        required={required}
      />

      {selectedCustomer && (
        <ComboBox
          label={projectLabel}
          placeholder="Vælg projekt for kunde"
          options={projects
            .filter((p) => p.customerId === selectedCustomer.id)
            .map((project) => ({
              key: project.id,
              text: project.name,
            }))}
          selectedKey={selectedProject?.id}
          onChange={(e, option) =>
            setSelectedProject(projects.find((p) => p.id === option?.key))
            
          }
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
