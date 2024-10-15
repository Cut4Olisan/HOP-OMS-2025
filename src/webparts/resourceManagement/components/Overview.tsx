import { WebPartContext } from "@microsoft/sp-webpart-base";
import * as React from "react";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import { Stack, Panel, PanelType } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import BookingComponent from "./BookingCreation/BookingComponent";
import { FormMode } from "./RequestCreation/interfaces/IRequestComponentProps";
import RequestComponent from "./RequestCreation/RequestComponent";

export interface IOverview {
  context: WebPartContext;
}

const Overview: React.FC<IOverview> = ({ context }) => {
  const {
    showBookingComponentPanel,
    setShowBookingComponentPanel,
    selectedRegistration,
    setShowRequestComponentPanel,
    showRequestComponentPanel,
    selectedRequest,
    setSelectedRequest,
  } = useGlobal();

  return (
    <Stack>
      <BookingOverviewComponent context={context} />
      <Panel isOpen={showBookingComponentPanel}>
        <BookingComponent
          registration={selectedRegistration}
          context={context}
          dismissPanel={() => setShowBookingComponentPanel(false)}
          onFinish={() => undefined}
        />
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
            setShowRequestComponentPanel(false);
            setSelectedRequest(undefined);
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

export default Overview;
