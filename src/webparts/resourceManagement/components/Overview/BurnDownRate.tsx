import * as React from "react";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  PrimaryButton,
  Text,
  /*   Spinner,
  SpinnerSize, */
  DefaultButton,
} from "@fluentui/react";
import { ProjectDTO, CustomerDTO } from "../interfaces";
import styles from "./BurnDownRate.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import useGlobal from "../../hooks/useGlobal";
import ProjectCard from "./ProjectCard";

interface IBurnDownRateProps {
  context: WebPartContext;
  onBack: () => void;
}

const BurnDownRate: React.FC<IBurnDownRateProps> = ({ context, onBack }) => {
  /*   const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]); */
  const { projects, customers } = useGlobal();

  const [filteredCustomers, setFilteredCustomers] = React.useState<
    CustomerDTO[]
  >([]);
  const [filteredProjects, setFilteredProjects] = React.useState<ProjectDTO[]>(
    []
  );
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [expandedCustomers, setExpandedCustomers] = React.useState<Set<number>>(
    new Set()
  );

  //// ERSTAT MED useGlobal variabler. værdierne er allerede hentet -- Linje 73, 74
  /*   React.useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsResponse = await BackEndService.Api.projectsList();
        const customersResponse = await BackEndService.Api.customersList();

        const activeProjects = projectsResponse.data.filter(
          (project) => project.projectStatus === 1 // Filter projects with status 1 ("Igang")
        );

        // Only keep customers with projects
        const customersWithProjects = customersResponse.data.filter(
          (customer) =>
            activeProjects.some((project) => project.customerId === customer.id)
        );

        setProjects(activeProjects);
        setCustomers(customersWithProjects);
        setFilteredProjects(activeProjects);
        setFilteredCustomers(customersWithProjects); // Initialize with all customers
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); */

  const relevantProjects = projects.filter((p) => p.projectStatus === 1);
  const relevantCustomers = customers.filter(
    (c) => !!projects.find((p) => p.customerId === c.id)
  );
  relevantProjects;
  relevantCustomers;
  const handleCustomerChange = (
    event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption
  ): void => {
    if (!option) return;

    let updatedKeys = [...selectedKeys];
    if (option.selected) {
      updatedKeys.push(option.key as string);
    } else {
      updatedKeys = updatedKeys.filter((key) => key !== option.key);
    }

    setSelectedKeys(updatedKeys);

    // Filter customers based on selection
    const selectedCustomerIds = updatedKeys.map((key) => parseInt(key, 10));
    const filteredCustomersList = customers.filter((customer) =>
      selectedCustomerIds.includes(customer.id || 0)
    );
    setFilteredCustomers(filteredCustomersList);

    // Filter projects by selected customers
    const filteredProjectsList = projects.filter((project) =>
      selectedCustomerIds.includes(project.customerId || 0)
    );
    setFilteredProjects(filteredProjectsList);
  };

  const customerOptions: IComboBoxOption[] = customers.map((customer) => ({
    key: customer.id?.toString() || "",
    text: customer.name || "",
  }));

  const projectsByCustomer = filteredCustomers.reduce(
    (acc, customer) => {
      if (customer.id !== undefined) {
        acc[customer.id] = filteredProjects.filter(
          (project) => project.customerId === customer.id
        );
      }
      return acc;
    },
    {} as Record<number, ProjectDTO[]>
  );

  const toggleCustomerExpansion = (customerId: number): void => {
    setExpandedCustomers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <PrimaryButton text="Tilbage" onClick={onBack} />
        <div className={styles.comboBoxWrapper}>
          <ComboBox
            multiSelect
            placeholder="Filtrer på kunde"
            options={customerOptions}
            selectedKey={selectedKeys}
            onChange={handleCustomerChange}
            className={styles.customerComboBox}
          />
          {selectedKeys.length > 0 && (
            <DefaultButton
              text="Nulstil filter"
              onClick={() => {
                setFilteredCustomers(customers);
                setFilteredProjects(projects);
                setSelectedKeys([]);
              }}
            />
          )}
        </div>

        <div className={styles.centeredHeader}>
          <Text variant="xLarge" className={styles.headerTitle}>
            <strong>Burndown rates for aktive projekter</strong>
          </Text>
        </div>
      </div>

      <div className={styles.projectsContainer}>
        {filteredCustomers
          .filter(
            (customer): customer is CustomerDTO & { id: number } =>
              customer.id !== undefined &&
              projectsByCustomer[customer.id]?.length > 0
          )
          .map((customer) => {
            const isExpanded = expandedCustomers.has(customer.id);
            const projectsToShow = isExpanded
              ? projectsByCustomer[customer.id]
              : projectsByCustomer[customer.id].slice(0, 6);

            return (
              <div key={customer.id} className={styles.customerSection}>
                <div className={styles.customerHeader}>
                  {projectsByCustomer[customer.id].length > 6 && (
                    <PrimaryButton
                      onClick={() => toggleCustomerExpansion(customer.id)}
                      text={isExpanded ? "Skjul" : "Udvid"}
                      className={styles.expandButton}
                    />
                  )}
                  <Text variant="xLarge" className={styles.customerName}>
                    {customer.name}
                  </Text>
                </div>
                <div className={styles.projectCards}>
                  {projectsToShow.map((project: ProjectDTO) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default BurnDownRate;
