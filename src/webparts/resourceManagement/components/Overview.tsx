import * as React from "react";
import { Stack, CommandBar, ICommandBarItemProps } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import { ViewMode } from "../context/GlobalContext"; //used for fullpages
import { WebPartContext } from "@microsoft/sp-webpart-base";
import BookingOverviewComponent from "./BookingOverview/BookingOverviewComponent";
import Panels from "./PanelsComponent";
import WeeklyView from "./BookingOverview/WeeklyView/WeeklyView";
import { getWeekNumber } from "./dateUtils";

const Overview: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    setShowRequestPanel,
    setShowRequestListPanel,
    setShowBurnDownPanel,
    setShowBookingComponentPanel,
    setCurrentView,
    currentView,
    currentEmployee,
    registrations,
    loading,
  } = useGlobal();

  const _faritems: ICommandBarItemProps[] = [
    {
      key: "Overview",
      text: "Oversigt",
      iconProps: { iconName: "TimelineMatrixView" },
      onClick: () => setCurrentView(ViewMode.Overview),
    },
    {
      key: "MyWeek",
      text: "Min uge",
      iconProps: { iconName: "CalendarDay" },
      onClick: () => setCurrentView(ViewMode.MyWeek),
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
      onClick: () => setCurrentView(ViewMode.Capacity),
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

      {currentView === ViewMode.Overview && (
        <BookingOverviewComponent context={context} />
      )}

      {currentView === ViewMode.MyWeek && (
        <WeeklyView
          employeeId={currentEmployee?.email ?? ""}
          employeeName={
            `${currentEmployee?.givenName} ${currentEmployee?.surName}` ?? ""
          }
          weekNumber={getWeekNumber(new Date()).toString()}
          weekBookings={registrations}
          onBack={() => setCurrentView(ViewMode.Overview)}
          onPreviousWeek={() => {}}
          onNextWeek={() => {}}
          projects={[]}
          customers={[]}
        />
      )}

      <Panels context={context} />
    </Stack>
  );
};

export default Overview;
