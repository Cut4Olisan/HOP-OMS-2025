import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import BackEndService from "../services/BackEnd";
import {
  CustomerDTO,
  EmployeeDTO,
  ProjectDTO,
  RegistrationDTO,
  RequestsDTO,
} from "../components/interfaces";

export enum ViewMode {
  Overview = "Overview",
  MyWeek = "MyWeek",
  Capacity = "Capacity",
  BurnDown = "BurnDown",
}

export enum NotificationType {
  Success,
  Info,
  Warning,
  Error,
}

export interface INotification {
  type: NotificationType;
  message: string;
}

export interface IGlobalContext {
  ///***      Panel controls      ***///
  showBookingComponentPanel: boolean;
  setShowBookingComponentPanel: React.Dispatch<boolean>;
  showRequestPanel: boolean;
  setShowRequestPanel: React.Dispatch<boolean>;
  showRequestListPanel: boolean;
  setShowRequestListPanel: React.Dispatch<boolean>;
  showBurnDownPanel: boolean;
  setShowBurnDownPanel: React.Dispatch<boolean>;
  currentView: ViewMode;
  setCurrentView: React.Dispatch<React.SetStateAction<ViewMode>>;
  ///***      Panel controls      ***///

  ///***      Controls for My week view in the commandbar      ***///
  currentEmployee: EmployeeDTO | undefined;
  setCurrentEmployee: React.Dispatch<
    React.SetStateAction<EmployeeDTO | undefined>
  >;
  ///***      Controls for My week view in the commandbar      ***///

  ///*** State to track edit/create for bookingcomponent ***///
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<boolean>;
  ///*** State to track edit/create for bookingcomponent ***///

  selectedRegistration: RegistrationDTO | undefined;
  setSelectedRegistration: React.Dispatch<RegistrationDTO | undefined>;
  showRequestComponentPanel: boolean;
  setShowRequestComponentPanel: React.Dispatch<boolean>;
  selectedRequest: RequestsDTO | undefined;
  setSelectedRequest: React.Dispatch<RequestsDTO | undefined>;
  customers: CustomerDTO[];
  setCustomers: React.Dispatch<CustomerDTO[]>;
  projects: ProjectDTO[];
  setProjects: React.Dispatch<ProjectDTO[]>;
  loading: boolean;
  setLoading: React.Dispatch<boolean>;
  isDraggingBooking: boolean;
  setIsDraggingBooking: React.Dispatch<boolean>;
  isDraggingGlobal: boolean;
  setIsDraggingGlobal: React.Dispatch<boolean>;
  employees: EmployeeDTO[];
  setEmployees: React.Dispatch<EmployeeDTO[]>;
  registrations: RegistrationDTO[];
  setRegistrations: React.Dispatch<RegistrationDTO[]>;

  ///*** State for messagebar user feedback ***///
  /*   globalInfo: string | undefined;
  setGlobalInfo: React.Dispatch<string | undefined>;
  globalError: string | undefined;
  setGlobalError: React.Dispatch<string | undefined>;
  globalWarning: string | undefined;
  setGlobalWarning: React.Dispatch<string | undefined>;
  globalSuccess: string | undefined;
  setGlobalSuccess: React.Dispatch<string | undefined>; */

  // Erstat 4x state med dette
  notifications: INotification[];
  setNotifications: React.Dispatch<INotification[]>;
}

export const GlobalContext = React.createContext<IGlobalContext | undefined>(
  undefined
);

const GlobalContextProvider: React.FC<
  React.PropsWithChildren<{ context: WebPartContext }>
> = ({ children, context }) => {
  const [currentView, setCurrentView] = React.useState<ViewMode>(
    ViewMode.Overview
  );
  const [showBookingComponentPanel, setShowBookingComponentPanel] =
    React.useState<boolean>(false);
  const [showRequestPanel, setShowRequestPanel] =
    React.useState<boolean>(false);
  const [showRequestListPanel, setShowRequestListPanel] =
    React.useState<boolean>(false);
  const [showBurnDownPanel, setShowBurnDownPanel] =
    React.useState<boolean>(false);
  const [selectedRegistration, setSelectedRegistration] = React.useState<
    RegistrationDTO | undefined
  >();
  const [showRequestComponentPanel, setShowRequestComponentPanel] =
    React.useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = React.useState<
    RequestsDTO | undefined
  >(undefined);
  const [currentEmployee, setCurrentEmployee] = React.useState<
    EmployeeDTO | undefined
  >(undefined);

  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [employees, setEmployees] = React.useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isDraggingBooking, setIsDraggingBooking] =
    React.useState<boolean>(false);
  const [isDraggingGlobal, setIsDraggingGlobal] =
    React.useState<boolean>(false);
  const [registrations, setRegistrations] = React.useState<RegistrationDTO[]>(
    []
  );

  ///// erstat
  /*   const [globalInfo, setGlobalInfo] = React.useState<string | undefined>();
  const [globalError, setGlobalError] = React.useState<string | undefined>();
  const [globalWarning, setGlobalWarning] = React.useState<
    string | undefined
  >();
  const [globalSuccess, setGlobalSuccess] = React.useState<
    string | undefined
  >(); */

  const [notifications, setNotifications] = React.useState<INotification[]>([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [
          customersResponse,
          projectsResponse,
          employeesResponse,
          registrationsResponse,
        ] = await Promise.all([
          BackEndService.Api.customersList(),
          BackEndService.Api.projectsList(),
          BackEndService.Api.employeeList(),
          BackEndService.Api.registrationsTypeDetail(2),
        ]);
        const customers = customersResponse.data;
        const projects = projectsResponse.data;
        const employees = employeesResponse.data;
        const registrations = registrationsResponse.data;

        setCustomers(customers);
        setProjects(projects);
        setEmployees(employees);
        setRegistrations(registrations);

        setLoading(false);

        const currentUserEmail = context.pageContext.user.email;

        let foundEmployee = employees.find(
          (emp) => emp.email === currentUserEmail
        );

        // Fallback mechanism for dev account - temporary for testing
        if (
          !foundEmployee &&
          currentUserEmail === "oliver.sund@dev4ngage.onmicrosoft.com"
        ) {
          foundEmployee = {
            id: -1,
            email: "oliver.sund@dev4ngage.onmicrosoft.com",
            givenName: "Oliver",
            surName: "Sund",
            allocatable: true,
          } as EmployeeDTO;

          setEmployees([]);
        }

        setCurrentEmployee(foundEmployee);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })().catch((e) => console.log(e));
  }, [context]);

  /*    For actual use after testing
       
       const foundEmployee = employees.find(
          (emp) => emp.email === currentUserEmail
        );

        
        if (foundEmployee) {
          setCurrentEmployee(foundEmployee);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [context]);*/

  if (loading) return <>Loading</>;

  return (
    <>
      <GlobalContext.Provider
        value={{
          currentView,
          setCurrentView,
          showBookingComponentPanel,
          setShowBookingComponentPanel,
          showRequestPanel,
          setShowRequestPanel,
          showRequestListPanel,
          setShowRequestListPanel,
          showBurnDownPanel,
          setShowBurnDownPanel,
          selectedRegistration,
          setSelectedRegistration,
          showRequestComponentPanel,
          setShowRequestComponentPanel,
          selectedRequest,
          setSelectedRequest,
          customers,
          setCustomers,
          projects,
          setProjects,
          isEditMode,
          setIsEditMode,
          loading,
          setLoading,
          isDraggingBooking,
          setIsDraggingBooking,
          isDraggingGlobal,
          setIsDraggingGlobal,
          employees,
          setEmployees,
          currentEmployee,
          setCurrentEmployee,
          registrations,
          setRegistrations,
          /*           globalInfo,
          setGlobalInfo,
          globalError,
          setGlobalError,
          globalWarning,
          setGlobalWarning,
          globalSuccess,
          setGlobalSuccess, */

          notifications,
          setNotifications,
        }}
      >
        <>{children}</>
      </GlobalContext.Provider>
    </>
  );
};

export default GlobalContextProvider;
