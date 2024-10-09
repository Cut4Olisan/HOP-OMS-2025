import * as React from "react";
import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Text,
  DefaultButton,
  ComboBox,
  Panel,
  TooltipHost,
  CommandBar,
  ICommandBarItemProps,
  IComboBoxOption,
} from "@fluentui/react";
import {
  ArrowLeftRegular,
  ArrowRightRegular,
  AddSquareMultipleRegular,
} from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import { IRegistration } from "../../interfaces/IRegistrationProps";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useBoolean } from "@fluentui/react-hooks";
import PeoplePickerComboBox from "./peoplePickerComponent";
/* import BookingComponent from "../../BookingCreation/BookingComponent"; */
import { Button, Divider } from "@fluentui/react-components";
import BookingCardMenu from "./bookingCardMenu";
import RequestComponent from "../../RequestCreation/RequestComponent";
import { FormMode } from "../../RequestCreation/interfaces/IRequestComponentProps";
import RequestList from "../../RequestCreation/RequestList";
import BurnDownRate from "../ProjectBurnDownRate/BurnDownRate/BurnDownRate";
import useGlobal from "../../../hooks/useGlobal";
import { CustomerDTO, ProjectDTO } from "../../interfaces";
import BackEndService from "../../../services/BackEnd";

const ItemType = "BOOKING"; //Til drag n' drop WIP

//***                 Booking Card component                 ***//
const BookingCard: React.FC<{
  booking: IRegistration;
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
}> = ({ booking, onDrop, onEmployeeClick }) => {
  const { customers, projects } = useGlobal();
  const [, drag] = useDrag({
    type: ItemType,
    item: booking,
  });

  const project = projects.find(
    (project) => Number(project.id) === booking.projectId
  );
  const projectName = project?.name || "Unknown Project";

  const customer = customers.find(
    (customer) => customer.id === project?.customerId
  );
  const customerName = customer?.name || "Unknown Customer";

  const capitalize = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

  const employeeFullName = booking.employee.split("@")[0];
  const employeeNameParts = employeeFullName.split(".");
  const formattedEmployeeName = `${capitalize(employeeNameParts[0])} ${capitalize(employeeNameParts[1])}`;
  const [, setRegistrations] = useState<IRegistration[]>([]);

  return (
    <div ref={drag} className={styles.bookingCard}>
      <div className={styles.TitelAndEditIcon}>
        <Text className={styles.projectName} variant="large">
          {booking.shortDescription}
        </Text>
        <BookingCardMenu
          registration={booking}
          onBookingDeleted={(deletedBookingId) => {
            setRegistrations((prevRegistrations) =>
              prevRegistrations.filter((reg) => reg.id !== deletedBookingId)
            ); // Update the registrations state by removing the deleted booking
          }}
        />
      </div>
      <Divider></Divider>
      <Text
        className={styles.employeeName}
        variant="medium"
        onClick={() => onEmployeeClick(booking)}
      >
        <strong>{formattedEmployeeName}</strong>
      </Text>
      <div className={styles.customerAndProjectName}>
        <Text variant="medium">
          <strong>Kunde </strong> {customerName}
        </Text>
        <Text variant="medium">
          <strong>Projekt </strong> {projectName}
        </Text>
      </div>
    </div>
  );
};

//***                 Booking Card component                 ***//

//***                Weekly coloumn component                ***//
const WeekColumn: React.FC<{
  weekNumber: number;
  startDate: string;
  endDate: string;
  bookings: IRegistration[];
  onDrop: (booking: IRegistration, newWeekNumber: number) => void;
  onEmployeeClick: (booking: IRegistration) => void;
}> = ({
  weekNumber,
  startDate,
  endDate,
  bookings,
  onDrop,
  onEmployeeClick,
}) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item: IRegistration) => {
      onDrop(item, weekNumber);
    },
  });

  return (
    <div ref={drop} className={styles.weekColumn}>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onDrop={onDrop}
            onEmployeeClick={onEmployeeClick}
          />
        ))
      ) : (
        <Text className={styles.centered}>
          <strong>Ingen bookinger</strong>
        </Text>
      )}
    </div>
  );
};

//***                Weekly coloumn component                ***//

interface IFiveWeekViewProps {
  context: WebPartContext;
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const { projects, customers } = useGlobal();
  const [registrations, setRegistrations] = useState<IRegistration[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>([]);
  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomerDTO | undefined
  >(undefined);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [selectedBooking, setSelectedBooking] = useState<
    IRegistration | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());

  //***                  Panel controllers                  ***//
  /*   const [
    isBookingOpen,
    { setTrue: openBookingPanel, setFalse: dismissBookingPanel },
  ] = useBoolean(false); //Create Bookings */

  const [
    isRequestOpen,
    { setTrue: openRequestPanel, setFalse: dismissRequestPanel },
  ] = useBoolean(false); //Create Request

  const [
    isRequestListOpen,
    { setTrue: openRequestListPanel, setFalse: dismissRequestListPanel },
  ] = useBoolean(false); //Requests list

  const [
    isBurnDownOpen,
    { setTrue: openBurnDownPanel, setFalse: dismissBurnDownPanel },
  ] = useBoolean(false);

  const { setShowBookingComponentPanel, setSelectedRegistration } = useGlobal();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const fetchedRegistrations =
          await BackEndService.Instance.getRegistrationsByType();
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    void fetchData();
  }, []);

  /*const [
    isSentRequestOpen,
    { setTrue: openSentRequestPanel, setFalse: dismissSentRequestPanel },
  ] = useBoolean(false); //Create Request*/

  //***                  Panel controllers                  ***//

  useEffect(() => {
    if (clearSelection) {
      setClearSelection(false);
    }
  }, [clearSelection]);

  const weeksToDisplay = getWeeksFromDate(currentDate);

  const clearFilters = (): void => {
    setSelectedEmployee([]);
    setSelectedCustomer(undefined);
    setSelectedProject(undefined);
    setClearSelection(true);
  };

  const handlePreviousWeeks = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7 * 5);
    setCurrentDate(newDate);
  };

  const handleNextWeeks = (): void => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7 * 5);
    setCurrentDate(newDate);
  };

  const handleDrop = (
    movedBooking: IRegistration,
    newWeekNumber: number
  ): void => {
    const updatedBookings = registrations.map((booking) => {
      if (booking.id === movedBooking.id) {
        return { ...booking, date: `2024-W${newWeekNumber}` };
      }
      return booking;
    });
    setRegistrations(updatedBookings);
  };

  const handleEmployeeClick = (booking: IRegistration): void => {
    setSelectedBooking(booking); // Update selected booking
  };

  // Filter bookings based on selected filters (employee, customer, project)
  const filteredBookings = registrations.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    return (
      booking.registrationType === 2 &&
      (selectedEmployee.length === 0 ||
        selectedEmployee.includes(booking.employee)) &&
      (!selectedCustomer || project?.customerId === selectedCustomer?.id) &&
      (!selectedProject || booking.projectId === Number(selectedProject))
    );
  });

  const filteredProjects = selectedCustomer
    ? projects.filter((p) => p.customerId === selectedCustomer.id)
    : projects;

  // If an employee is clicked, render the WeeklyView
  if (selectedBooking) {
    const selectedWeekNumber = getWeekNumber(new Date(selectedBooking.date));
    const weekBookings = registrations.filter(
      (booking) =>
        getWeekNumber(new Date(booking.date)) === selectedWeekNumber &&
        booking.employee === selectedBooking.employee &&
        booking.registrationType === 2
    );

    return (
      <WeeklyView
        weekNumber={selectedWeekNumber.toString()}
        employeeId={selectedBooking.employee}
        weekBookings={weekBookings}
        employeeName={selectedBooking.employee}
        onBack={() => setSelectedBooking(undefined)} // Reset to go back to FiveWeekView
        onPreviousWeek={handlePreviousWeeks}
        onNextWeek={handleNextWeeks}
        projects={projects}
        customers={customers}
      />
    );
  }

  const _items: ICommandBarItemProps[] = [
    {
      key: "Overview",
      text: "Oversigt",
      iconProps: { iconName: "report" },
      onClick: () => undefined,
    },
    {
      key: "Capacity",
      text: "Kapacitet",
      iconProps: { iconName: "report" },
      onClick: () => undefined,
    },
    {
      key: "Burndown",
      text: "Burndown-rate",
      iconProps: { iconName: "" },
      onClick: openBurnDownPanel,
    },
    {
      key: "Requests",
      text: "Anmodninger",
      iconProps: { iconName: "List" },
      subMenuProps: {
        items: [
          {
            key: "receivedRequests",
            text: "Modtagede anmodninger",
            onClick: openRequestListPanel,
          },
          {
            key: "sentRequests",
            text: "Sendte anmodninger",
            onClick: () => undefined,
          },
          {
            key: "createRequests",
            text: "Opret anmodning",
            onClick: openRequestPanel,
          },
        ],
      },
    },
  ];

  return (
    <div className={styles.teamsContext}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.container}>
          <CommandBar items={_items}></CommandBar>
          <div className={styles.controlsContainer}>
            <div className={styles.filterContainer}>
              <PeoplePickerComboBox
                context={context}
                onChange={(selectedEmails) =>
                  setSelectedEmployee(selectedEmails)
                }
                clearSelection={clearSelection}
              />

              <ComboBox
                placeholder="Vælg en kunde"
                options={
                  customers
                    .filter((c) => c.active)
                    .map((customer) => ({
                      key: customer.id?.toString(),
                      text: customer.name,
                    })) as IComboBoxOption[]
                }
                selectedKey={selectedCustomer?.id?.toString() || ""}
                onChange={(e, option) =>
                  setSelectedCustomer(
                    customers.find((c) => c.id?.toString() === option?.key) ||
                      undefined
                  )
                }
                calloutProps={{
                  doNotLayer: true,
                  className: styles.limitCalloutSize,
                }}
                allowFreeInput
                autoComplete="on"
              />

              <ComboBox
                placeholder="Vælg et projekt"
                options={
                  filteredProjects.map((project: ProjectDTO) => ({
                    key: project.id?.toString(),
                    text: project.name,
                  })) as IComboBoxOption[]
                }
                selectedKey={selectedProject || ""}
                onChange={(e, option) =>
                  setSelectedProject(option?.key as string)
                }
                calloutProps={{
                  doNotLayer: true,
                  className: styles.limitCalloutSize,
                }}
                allowFreeInput
                autoComplete="on"
              />

              {(selectedEmployee.length > 0 ||
                selectedCustomer ||
                selectedProject) && (
                <DefaultButton text="Ryd filter" onClick={clearFilters} />
              )}
            </div>

            <div className={styles.navigationContainer}>
              <Panel
                type={5}
                isOpen={isRequestOpen}
                closeButtonAriaLabel="Close"
                isHiddenOnDismiss={false}
                onDismiss={dismissRequestPanel}
              >
                <RequestComponent
                  context={context}
                  mode={FormMode.CreateRequest}
                  onFinish={(request) => {
                    console.log("Finished request", request);
                    dismissRequestPanel();
                  }}
                ></RequestComponent>
              </Panel>

              {/*Request liste panel*/}
              <Panel
                type={5}
                isOpen={isRequestListOpen}
                closeButtonAriaLabel="Close"
                isHiddenOnDismiss={false}
                onDismiss={dismissRequestListPanel}
              >
                <RequestList context={context}></RequestList>
              </Panel>

              {/*Burndown panel*/}
              <Panel
                type={5}
                isOpen={isBurnDownOpen}
                closeButtonAriaLabel="Close"
                isHiddenOnDismiss={false}
                onDismiss={dismissBurnDownPanel}
              >
                <BurnDownRate></BurnDownRate>
              </Panel>

              <TooltipHost content="Forrige uge..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<ArrowLeftRegular />}
                  onClick={handlePreviousWeeks}
                />
              </TooltipHost>

              <TooltipHost content="Næste uge..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<ArrowRightRegular />}
                  onClick={handleNextWeeks}
                />
              </TooltipHost>

              <TooltipHost content="Opret booking..">
                <Button
                  className={styles.upIconScale}
                  appearance="subtle"
                  size="large"
                  icon={<AddSquareMultipleRegular />}
                  onClick={() => {
                    setShowBookingComponentPanel(true);
                    setSelectedRegistration(undefined);
                  }}
                />
              </TooltipHost>
            </div>
          </div>
          <div className={styles.gridHeader}>
            {weeksToDisplay.map((week, index) => (
              <div key={index} className={styles.weekHeader}>
                <Text variant="large">
                  <strong>Uge {week.weekNumber}</strong>
                  <Text>(timer)</Text>
                  {/*regn sum af timer for ugen ud, ved filter regn sum for den/de valgte medarbejdere*/}
                </Text>
                <Text>
                  {week.start.toLocaleDateString()} -{" "}
                  {week.end.toLocaleDateString()}
                </Text>
              </div>
            ))}
          </div>

          <div className={styles.weekGrid}>
            {weeksToDisplay.map((week, index) => {
              const weekNumber = week.weekNumber;
              const weekBookings = filteredBookings.filter(
                (booking) =>
                  getWeekNumber(new Date(booking.date)) === weekNumber
              );

              return (
                <WeekColumn
                  key={index}
                  weekNumber={weekNumber}
                  startDate={week.start.toLocaleDateString()}
                  endDate={week.end.toLocaleDateString()}
                  bookings={weekBookings}
                  onDrop={handleDrop}
                  onEmployeeClick={handleEmployeeClick}
                />
              );
            })}
          </div>
        </div>
      </DndProvider>
    </div>
  );
};

export default FiveWeekView;
