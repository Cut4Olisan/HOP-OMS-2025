import * as React from "react";
import { Stack, CommandBar, ICommandBarItemProps } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";
import {
  RegistrationPanelState,
  RequestsPanelState,
  ViewMode,
} from "../context/GlobalContext"; //used for fullpages
import { WebPartContext } from "@microsoft/sp-webpart-base";
import WeeklyView from "./Overview/WeeklyView";
import { getWeekNumber } from "../utilities/DateUtilities";
import BurnDownRate from "./Overview/BurnDownRate";
import { DndProvider } from "react-dnd";
import FiveWeekView from "./Overview/FiveWeekView";
import { HTML5Backend } from "react-dnd-html5-backend";
import Notifications from "./Notifications";

const Overview: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const {
    setShowRequestListPanel,
    setCurrentView,
    setRequestsPanelState,
    setBookingPanelState,
    currentView,
    registrations,
    employees,
    notifications,
    setNotifications,
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
      onClick: () =>
        setBookingPanelState({
          state: RegistrationPanelState.Create,
          data: undefined,
        }),
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
      onClick: () => setCurrentView(ViewMode.BurnDown),
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
            onClick: () =>
              setRequestsPanelState({
                state: RequestsPanelState.Create,
                data: undefined,
              }),
          },
        ],
      },
    },
  ];
  const employee = employees.find(
    (e) =>
      e.email?.toLowerCase() === context.pageContext.user.email.toLowerCase()
  );
  return (
    <Stack>
      <CommandBar farItems={_faritems} items={[]} />
      <Notifications
        notifications={notifications}
        onDismiss={(notif) =>
          setNotifications(notifications.filter((n) => n !== notif))
        }
      />
      {currentView === ViewMode.Overview && (
        <DndProvider backend={HTML5Backend}>
          <FiveWeekView context={context} />
        </DndProvider>
      )}

      {currentView === ViewMode.MyWeek && employee && (
        <WeeklyView
          employee={employee}
          weekNumber={getWeekNumber(new Date()).toString()}
          weekBookings={registrations}
          onBack={() => setCurrentView(ViewMode.Overview)}
          onPreviousWeek={() => undefined}
          onNextWeek={() => undefined}
        />
      )}

      {currentView === ViewMode.BurnDown && (
        <BurnDownRate
          context={context}
          onBack={() => setCurrentView(ViewMode.Overview)}
        />
      )}
    </Stack>
  );
};

export default Overview;
