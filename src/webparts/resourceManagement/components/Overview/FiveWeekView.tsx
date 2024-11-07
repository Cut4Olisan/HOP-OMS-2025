import * as React from "react";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Text,
  ComboBox,
  TooltipHost,
  IComboBoxOption,
  PrimaryButton,
} from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "./WeeklyView";
import { getWeeksFromDate, getWeekNumber } from "../../utilities/DateUtilities";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Button } from "@fluentui/react-components";
import useGlobal from "../../hooks/useGlobal";
import {
  CustomerDTO,
  EditRegistrationRequestDTO,
  EmployeeDTO,
  ProjectDTO,
  RegistrationDTO,
} from "../interfaces";
import BackEndService from "../../services/BackEnd";
import WeekColumn from "./WeekColumn";
import PeopleFilterDropdown from "../generic/PeopleFilterDropdown";
import globalStyles from "../styles.module.scss";

interface IFiveWeekViewProps {
  context: WebPartContext;
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const { projects, customers, employees } =
    useGlobal();
  const [selectedEmployeeEmails, setSelectedEmployeeEmails] = useState<
    string[]
  >([]);
  const [clearSelection, setClearSelection] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<
    CustomerDTO | undefined
  >(undefined);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [selectedBooking, setSelectedBooking] = useState<
    RegistrationDTO | undefined
  >(undefined);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { registrations, setRegistrations } = useGlobal();

  useEffect(() => {
    if (clearSelection) {
      setClearSelection(false);
    }
  }, [clearSelection]);

  const weeksToDisplay = getWeeksFromDate(currentDate);

  const clearFilters = (): void => {
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

  const handleEmployeeSelectionChange = (employees: EmployeeDTO[]): void => {
    setSelectedEmployeeEmails(employees.map((emp) => emp.email ?? ""));
  };

  const calculateNewDateForWeek = (
    currentDate: string,
    newWeekNumber: number
  ): string => {
    const current = new Date(currentDate);
    const currentWeekNumber = getWeekNumber(current);
    const weekDifference = newWeekNumber - currentWeekNumber;

    const newDate = new Date(
      current.setDate(current.getDate() + weekDifference * 7)
    );

    return newDate.toISOString().split("T")[0] + "T00:00:00";
  };

  const handleDrop = async (
    movedBooking: RegistrationDTO,
    newWeekNumber: number
  ): Promise<void> => {
    const updatedDate = calculateNewDateForWeek(
      movedBooking.date ?? new Date().toISOString(),
      newWeekNumber
    );

    const updatedBooking: EditRegistrationRequestDTO = {
      shortDescription: movedBooking.shortDescription ?? "Ingen beskrivelse",
      description: movedBooking.description ?? "",
      projectId: movedBooking.projectId ?? 0,
      date: updatedDate,
      start: movedBooking.start ?? "",
      end: movedBooking.end ?? "",
      registrationType: movedBooking.registrationType ?? 2,
    };

    try {
      await BackEndService.Api.registrationsUpdate(
        movedBooking.id ?? 0,
        updatedBooking
      );

      const updatedBookings = registrations.map((booking) =>
        booking.id === movedBooking.id
          ? { ...booking, date: updatedDate }
          : booking
      );
      setRegistrations(updatedBookings);
    } catch (error) {
      console.error("Failed to update booking:", error);
    }
  };

  const handleEmployeeClick = (booking: RegistrationDTO): void => {
    if (!booking.employee) return;
    setSelectedBooking(booking);
  };

  const filteredBookings = registrations.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    return (
      booking.registrationType === 2 &&
      (selectedEmployeeEmails.length === 0 ||
        selectedEmployeeEmails.includes(booking.employee ?? "")) &&
      (!selectedCustomer || project?.customerId === selectedCustomer?.id) &&
      (!selectedProject || booking.projectId === Number(selectedProject))
    );
  });

  const filteredProjects = selectedCustomer
    ? projects.filter((p) => p.customerId === selectedCustomer.id)
    : [];

  if (selectedBooking && selectedBooking.date) {
    const selectedWeekNumber = getWeekNumber(new Date(selectedBooking.date));
    const weekBookings = registrations.filter(
      (booking) =>
        getWeekNumber(new Date(booking.date || "")) === selectedWeekNumber &&
        booking.employee === selectedBooking.employee &&
        booking.registrationType === 2
    );

    const employee = employees.find(
      (e) => e.email?.toLowerCase() === selectedBooking.employee?.toLowerCase()
    );
    if (!employee) return <>Employee not found</>;

    return (
      <WeeklyView
        employee={employee}
        weekNumber={selectedWeekNumber.toString()}
        weekBookings={weekBookings}
        onBack={() => setSelectedBooking(undefined)}
        onPreviousWeek={handlePreviousWeeks}
        onNextWeek={handleNextWeeks}
      />
    );
  }

  return (
    <div className={styles.teamsContext}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.container}>
          <div className={styles.controlsContainer}>
            <div className={styles.filterContainer}>
              <PeopleFilterDropdown
                onSelectionChange={handleEmployeeSelectionChange}
                context={context}
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

              {selectedCustomer && (
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
              )}

              {(selectedEmployeeEmails.length > 0 ||
                selectedCustomer ||
                selectedProject) && (
                <PrimaryButton text="Ryd filter" onClick={clearFilters} />
              )}
            </div>

            <div className={styles.navigationContainer}>
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
            </div>
          </div>
          <div className={styles.gridHeader}>
            {weeksToDisplay.map((week, index) => (
              <div key={index} className={styles.weekHeader}>
                <Text variant="large">
                  <span className={globalStyles.bold}>Uge {week.weekNumber} </span>
                </Text>
                <Text>
                  {week.start.toLocaleDateString("da-DK")} -{" "}
                  {week.end.toLocaleDateString("da-DK")}
                </Text>
              </div>
            ))}
          </div>

          <div className={styles.weekGrid}>
            {weeksToDisplay.map((week, index) => {
              const weekNumber = week.weekNumber;
              const weekBookings = filteredBookings.filter(
                (booking) =>
                  getWeekNumber(new Date(booking.date || "")) === weekNumber
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
