import * as React from "react";
import { Stack, CommandBar, ICommandBarItemProps } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import Panels from "./PanelsComponent";

const Overview: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    setShowRequestPanel,
    setShowRequestListPanel,
    setShowBurnDownPanel,
    setShowBookingComponentPanel,
    loading,
  } = useGlobal();

  const _faritems: ICommandBarItemProps[] = [
    {
      key: "Overview",
      text: "Oversigt",
      iconProps: { iconName: "TimelineMatrixView" },
      onClick: () => undefined,
    },
    {
      key: "CreateBooking",
      text: "Opret booking",
      iconProps: { iconName: "OpenEnrollment" },
      onClick: () => setShowBookingComponentPanel(true),
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
      <Panels context={context} />
    </Stack>
  );
};

export default Overview;
