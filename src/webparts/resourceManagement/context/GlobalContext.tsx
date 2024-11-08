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

export enum RegistrationPanelState {
  Hidden,
  Create,
  Edit,
}

export enum RequestsPanelState {
  Hidden,
  Create,
  Confirm,
}

export interface PanelState<S, D> {
  state: S;
  data?: D;
}

export interface IGlobalContext {
  bookingPanelState: PanelState<RegistrationPanelState, RegistrationDTO>;
  setBookingPanelState: React.Dispatch<
    PanelState<RegistrationPanelState, RegistrationDTO>
  >;

  requestsPanelState: PanelState<RequestsPanelState, RequestsDTO>;
  setRequestsPanelState: React.Dispatch<
    PanelState<RequestsPanelState, RequestsDTO>
  >;

  showRequestListPanel: boolean;
  setShowRequestListPanel: React.Dispatch<boolean>;
  showBurnDownPanel: boolean;
  setShowBurnDownPanel: React.Dispatch<boolean>;
  currentView: ViewMode;
  setCurrentView: React.Dispatch<ViewMode>;

  customers: CustomerDTO[];
  projects: ProjectDTO[];
  employees: EmployeeDTO[];

  registrations: RegistrationDTO[];
  setRegistrations: React.Dispatch<RegistrationDTO[]>;

  requests: RequestsDTO[];
  setRequests: React.Dispatch<RequestsDTO[]>;

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
  const [bookingPanelState, setBookingPanelState] = React.useState<
    PanelState<RegistrationPanelState, RegistrationDTO>
  >({ state: RegistrationPanelState.Hidden });
  const [requestsPanelState, setRequestsPanelState] = React.useState<
    PanelState<RequestsPanelState, RequestsDTO>
  >({ state: RequestsPanelState.Hidden });
  const [showRequestListPanel, setShowRequestListPanel] =
    React.useState<boolean>(false);
  const [showBurnDownPanel, setShowBurnDownPanel] =
    React.useState<boolean>(false);

  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [employees, setEmployees] = React.useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [registrations, setRegistrations] = React.useState<RegistrationDTO[]>(
    []
  );
  const [requests, setRequests] = React.useState<RequestsDTO[]>([]);

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
          requestsResponse,
        ] = await Promise.all([
          BackEndService.Api.customersList(),
          BackEndService.Api.projectsList(),
          BackEndService.Api.employeeList(),
          BackEndService.Api.registrationsTypeDetail(2),
          BackEndService.Api.requestsList(),
        ]);
        const customers = customersResponse.data;
        const projects = projectsResponse.data;
        const employees = employeesResponse.data;
        const registrations = registrationsResponse.data;
        const requests = requestsResponse.data;

        setCustomers(customers);
        setProjects(projects);
        setEmployees(employees);
        setRegistrations(registrations);
        setRequests(requests);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })().catch((e) => console.log(e));
  }, [context]);

  if (loading) return <>Loading</>;

  return (
    <>
      <GlobalContext.Provider
        value={{
          bookingPanelState,
          setBookingPanelState,
          requestsPanelState,
          setRequestsPanelState,

          currentView,
          setCurrentView,

          showRequestListPanel,
          setShowRequestListPanel,

          showBurnDownPanel,
          setShowBurnDownPanel,

          customers,
          projects,
          employees,

          requests,
          setRequests,
          registrations,
          setRegistrations,

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
