import * as React from "react";
import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  PrimaryButton,
  Text,
  Spinner,
  SpinnerSize,
  DefaultButton,
} from "@fluentui/react";
import { GaugeChart } from "@fluentui/react-charting";
import { ProjectDTO, CustomerDTO, RegistrationDTO } from "../../../interfaces";
import styles from "./BurnDownRate.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import BackEndService from "../../../../services/BackEnd";
import { calculateBurndownRate } from "../../HelperFunctions/helperFunctions";

interface IBurnDownRateProps {
  context: WebPartContext;
  onBack: () => void;
}

const BurnDownRate: React.FC<IBurnDownRateProps> = ({ context, onBack }) => {
  const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [filteredCustomers, setFilteredCustomers] = React.useState<
    CustomerDTO[]
  >([]);
  const [filteredProjects, setFilteredProjects] = React.useState<ProjectDTO[]>(
    []
  );
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [expandedCustomers, setExpandedCustomers] = React.useState<Set<number>>(
    new Set()
  );

  React.useEffect(() => {
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
  }, []);

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

  const toggleCustomerExpansion = (customerId: number) => {
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

      {loading ? (
        <Spinner label="Indlæser..." size={SpinnerSize.medium} />
      ) : (
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
      )}
    </div>
  );
};

export default BurnDownRate;

interface IProjectCardProps {
  project: ProjectDTO;
}

const ProjectCard: React.FC<IProjectCardProps> = ({
  project,
}: IProjectCardProps) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [burndownRate, setBurndownRate] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchProjectRegistrations = async () => {
      setLoading(true);
      try {
        const response = await BackEndService.Api.registrationsList({});
        const registrations = response.data as RegistrationDTO[];
        const rate = calculateBurndownRate(registrations);
        setBurndownRate(rate);
      } catch (error) {
        console.error(
          `Error fetching registrations for project ${project.id}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjectRegistrations();
  }, [project.id]);

  // Get CSS custom property value for themePrimary color
  const getComputedColor = (colorVar: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(colorVar)
      .trim();
  };

  const primaryColor = getComputedColor("--gauge-primary-color");

  return (
    <div className={styles.projectCard}>
      <Text variant="large" className={styles.projectName}>
        {project.name}
      </Text>
      {loading ? (
        <Spinner label="Indlæser..." size={SpinnerSize.medium} />
      ) : (
        <GaugeChart
          segments={[
            {
              size: 30, //placerholder indtil der kan hentes faktisk data
              legend: "Opnåede timer",
              color: primaryColor,
            },
          ]}
          chartValue={burndownRate}
          chartTitle="Burndownrate"
          sublabel="Timer opnået"
          minValue={0}
          maxValue={100}
          width={300}
          height={200}
        />
      )}
    </div>
  );
};
