import * as React from "react";
import { IRegistration } from "../components/interfaces/IRegistrationProps";
import BackEndService from "../services/BackEnd";
import { CustomerDTO, ProjectDTO } from "../components/interfaces";

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
  ///***      Panel controls      ***///

  ///*** State to track edit/create for bookingcomponent ***///
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<boolean>;
  ///*** State to track edit/create for bookingcomponent ***///

  selectedRegistration: IRegistration | undefined;
  setSelectedRegistration: React.Dispatch<IRegistration | undefined>;
  customers: CustomerDTO[];
  setCustomers: React.Dispatch<CustomerDTO[]>;
  projects: ProjectDTO[];
  setProjects: React.Dispatch<ProjectDTO[]>;
  loading: boolean;
  setLoading: React.Dispatch<boolean>;
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

  const [selectedRegistration, setSelectedRegistration] = React.useState<
    IRegistration | undefined
  >();
  const [customers, setCustomers] = React.useState<CustomerDTO[]>([]);
  const [projects, setProjects] = React.useState<ProjectDTO[]>([]);
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
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
          showRequestPanel,
          setShowRequestPanel,
          showRequestListPanel,
          setShowRequestListPanel,
          showBurnDownPanel,
          setShowBurnDownPanel,
          selectedRegistration,
          setSelectedRegistration,
          customers,
          setCustomers,
          projects,
          setProjects,
          isEditMode,
          setIsEditMode,
          loading,
          setLoading,
        }}
      >
        <>{children}</>
      </GlobalContext.Provider>
    </>
  );
};

export default GlobalContextProvider;
