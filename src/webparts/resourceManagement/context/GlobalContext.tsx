import * as React from "react";
import { IRegistration } from "../components/interfaces/IRegistrationProps";
import BackEndService from "../services/BackEnd";
import { CustomerDTO, ProjectDTO, RequestsDTO } from "../components/interfaces";

export interface IGlobalContext {
  showBookingComponentPanel: boolean;
  setShowBookingComponentPanel: React.Dispatch<boolean>;
  selectedRegistration: IRegistration | undefined;
  setSelectedRegistration: React.Dispatch<IRegistration | undefined>;
  showRequestComponentPanel: boolean;
  setShowRequestComponentPanel: React.Dispatch<boolean>;
  selectedRequest: RequestsDTO | undefined;
  setSelectedRequest: React.Dispatch<RequestsDTO | undefined>;
  customers: CustomerDTO[];
  setCustomers: React.Dispatch<CustomerDTO[]>;
  projects: ProjectDTO[];
  setProjects: React.Dispatch<ProjectDTO[]>;
}

export const GlobalContext = React.createContext<IGlobalContext | undefined>(
  undefined
);

const GlobalContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [showBookingComponentPanel, setShowBookingComponentPanel] =
    React.useState<boolean>(false);
  const [selectedRegistration, setSelectedRegistration] = React.useState<
    IRegistration | undefined
  >();
  const [showRequestComponentPanel, setShowRequestComponentPanel] =
    React.useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = React.useState<
    RequestsDTO | undefined
  >(undefined);
  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const c = (
        await BackEndService.Instance.api.customersList({
          headers: BackEndService.getHeaders(),
        })
      ).data;
      const p = (
        await BackEndService.Instance.api.projectsList({
          headers: BackEndService.getHeaders(),
        })
      ).data;
      setLoading(false);
      setCustomers(c);
      setProjects(p);
    })().catch((e) => console.log(e));
  }, []);

  if (loading) return <>Loading</>;

  return (
    <>
      <GlobalContext.Provider
        value={{
          showBookingComponentPanel,
          setShowBookingComponentPanel,
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
        }}
      >
        <>{children}</>
      </GlobalContext.Provider>
    </>
  );
};

export default GlobalContextProvider;
