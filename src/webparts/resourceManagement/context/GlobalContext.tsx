import * as React from "react";
import BackEndService from "../services/BackEnd";
import {
  CustomerDTO,
  EmployeeDTO,
  ProjectDTO,
  RegistrationDTO,
  RequestsDTO,
} from "../components/interfaces";

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
  setShowMyWeekView: React.Dispatch<boolean>;
  showMyWeekView: boolean;
  ///***      Panel controls      ***///

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
}

export const GlobalContext = React.createContext<IGlobalContext | undefined>(
  undefined
);

const GlobalContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [showBookingComponentPanel, setShowBookingComponentPanel] =
    React.useState<boolean>(false);
  const [showRequestPanel, setShowRequestPanel] =
    React.useState<boolean>(false);
  const [showRequestListPanel, setShowRequestListPanel] =
    React.useState<boolean>(false);
  const [showBurnDownPanel, setShowBurnDownPanel] =
    React.useState<boolean>(false);
  const [showMyWeekView, setShowMyWeekView] = React.useState<boolean>(false);

  const [selectedRegistration, setSelectedRegistration] = React.useState<
    RegistrationDTO | undefined
  >();
  const [showRequestComponentPanel, setShowRequestComponentPanel] =
    React.useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = React.useState<
    RequestsDTO | undefined
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

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const c = (await BackEndService.Api.customersList()).data;
      const p = (await BackEndService.Api.projectsList()).data;
      const e = (await BackEndService.Api.employeeList()).data;
      setLoading(false);
      setCustomers(c);
      setProjects(p);
      setEmployees(e);
    })().catch((e) => console.log(e));
  }, []);

  if (loading) return <>Loading</>;

  return (
    <>
      <GlobalContext.Provider
        value={{
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
          showMyWeekView,
          setShowMyWeekView,
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
        }}
      >
        <>{children}</>
      </GlobalContext.Provider>
    </>
  );
};

export default GlobalContextProvider;
