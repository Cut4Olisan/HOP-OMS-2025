import * as React from "react";
import {
  Panel,
  Stack,
  CommandBar,
  ICommandBarItemProps,
  PanelType,
} from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import BookingComponent from "./BookingCreation/BookingComponent";
import RequestComponent from "./RequestCreation/RequestComponent";
import RequestList from "./RequestCreation/RequestList";
import BurnDownRate from "./BookingOverview/ProjectBurnDownRate/BurnDownRate/BurnDownRate";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { FormMode } from "./RequestCreation/interfaces/IRequestComponentProps";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";

const Overview: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    showBookingComponentPanel,
    setShowBookingComponentPanel,
    showRequestPanel,
    setShowRequestPanel,
    showRequestListPanel,
    setShowRequestListPanel,
    showBurnDownPanel,
    setShowBurnDownPanel,
    selectedRegistration,
    loading,
    setShowRequestComponentPanel,
    showRequestComponentPanel,
    selectedRequest,
    setSelectedRequest,
  } = useGlobal();

  const _faritems: ICommandBarItemProps[] = [
    {
      key: "Overview",
      text: "Oversigt",
      iconProps: { iconName: "TimelineMatrixView" },
      onClick: () => undefined,
    },
    {
      key: "Capacity",
      text: "Kapacitet - WIP",
      iconProps: { iconName: "FunctionalManagerDashboard" },
      onClick: () => undefined,
    },
    {
      key: "Burndown",
      text: "Burndown-rate - WIP",
      iconProps: { iconName: "AreaChart" },
      onClick: () => setShowBurnDownPanel(true),
    },
    {
      key: "Requests",
      text: "Anmodninger",
      iconProps: { iconName: "CollapseMenu" },
      subMenuProps: {
        items: [
          {
            key: "receivedRequests",
            text: "Modtagede anmodninger",
            iconProps: { iconName: "MailLowImportance" },
            onClick: () => setShowRequestListPanel(true),
          },
          {
            key: "sentRequests",
            text: "Sendte anmodninger - WIP",
            iconProps: { iconName: "MailForward" },
            onClick: () => undefined,
          },
          {
            key: "createRequests",
            text: "Opret anmodning",
            iconProps: { iconName: "EditMail" },
            onClick: () => setShowRequestPanel(true),
          },
        ],
      },
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Stack>
      <CommandBar farItems={_faritems} items={[]} />
      <BookingOverviewComponent context={context} />
      <Panel
        type={5}
        isOpen={showBookingComponentPanel}
        onDismiss={() => setShowBookingComponentPanel(false)}
      >
        <BookingComponent
          registration={selectedRegistration}
          context={context}
          dismissPanel={() => setShowBookingComponentPanel(false)}
          onFinish={() => undefined}
        />
      </Panel>

      <Panel
        type={5}
        isOpen={showRequestPanel}
        onDismiss={() => setShowRequestPanel(false)}
      >
        <RequestComponent
          context={context}
          mode={FormMode.CreateRequest}
          onFinish={(request) => setShowRequestPanel(false)}
          onDismiss={() => setShowRequestPanel(false)}
        />
      </Panel>

      <Panel
        type={5}
        isOpen={showRequestListPanel}
        onDismiss={() => setShowRequestListPanel(false)}
      >
        <RequestList context={context} />
      </Panel>

      <Panel
        type={5}
        isOpen={showBurnDownPanel}
        onDismiss={() => setShowBurnDownPanel(false)}
      >
        <BurnDownRate />
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
