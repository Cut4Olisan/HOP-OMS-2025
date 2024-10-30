import * as React from "react";
import { Panel, Stack, PanelType } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import BookingComponent from "./BookingCreation/BookingComponent";
import RequestComponent from "./RequestCreation/RequestComponent";
import RequestList from "./RequestCreation/RequestList";
//import BurnDownRate from "./BookingOverview/ProjectBurnDownRate/BurnDownRate/BurnDownRate";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { FormMode } from "./RequestCreation/interfaces/IRequestComponentProps";
import BackEndService from "../services/BackEnd";

const Panels: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    showBookingComponentPanel,
    setShowBookingComponentPanel,
    showRequestPanel,
    setShowRequestPanel,
    showRequestListPanel,
    setShowRequestListPanel,
    //showBurnDownPanel,
    //setShowBurnDownPanel,
    selectedRegistration,
    setShowRequestComponentPanel,
    showRequestComponentPanel,
    selectedRequest,
    setSelectedRequest,
    isEditMode,
    setRegistrations,
  } = useGlobal();

  return (
    <Stack>
      <Panel
        type={PanelType.medium}
        isOpen={showBookingComponentPanel}
        onDismiss={() => setShowBookingComponentPanel(false)}
        headerText={isEditMode ? "Rediger booking" : "Opret booking"}
      >
        <BookingComponent
          registration={selectedRegistration}
          context={context}
          dismissPanel={() => setShowBookingComponentPanel(false)}
          onFinish={async () => {
            const r = (await BackEndService.Api.registrationsTypeDetail(2))
              .data;
            setShowBookingComponentPanel(false);
            return setRegistrations(r);
          }}
        />
      </Panel>

      <Panel
        type={PanelType.medium}
        isOpen={showRequestPanel}
        onDismiss={() => setShowRequestPanel(false)}
        headerText="Opret anmodning"
      >
        <RequestComponent
          context={context}
          mode={FormMode.CreateRequest}
          onFinish={(request) =>
            setTimeout(() => {
              setShowRequestPanel(false);
            }, 2000)
          }
          onDismiss={() => setShowRequestPanel(false)}
        />
      </Panel>

      <Panel
        type={PanelType.medium}
        isOpen={showRequestListPanel}
        onDismiss={() => setShowRequestListPanel(false)}
        headerText="Modtagede anmodninger"
      >
        <RequestList context={context} />
      </Panel>

      <Panel
        type={PanelType.medium}
        isOpen={showRequestComponentPanel}
        onDismiss={() => {
          setShowRequestComponentPanel(false);
          setSelectedRequest(undefined);
        }}
        headerText="Håndter en anmodning"
      >
        <RequestComponent
          context={context}
          mode={FormMode.ConfirmRequest}
          onFinish={(request) => {
            console.log("Finished request confirmation", request);
            setTimeout(() => {
              setShowBookingComponentPanel(false);
              setSelectedRequest(undefined);
            }, 2000);
          }}
          onDismiss={() => {
            setShowRequestComponentPanel(false);
            setSelectedRequest(undefined);
          }}
          request={selectedRequest}
        />
      </Panel>
    </Stack>
  );
};

export default Panels;
