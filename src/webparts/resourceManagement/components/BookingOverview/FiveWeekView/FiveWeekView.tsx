import * as React from "react";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Text,
  DefaultButton,
  ComboBox,
  TooltipHost,
  IComboBoxOption,
} from "@fluentui/react";
import { ArrowLeftRegular, ArrowRightRegular } from "@fluentui/react-icons";
import styles from "./FiveWeekView.module.scss";
import WeeklyView from "../WeeklyView/WeeklyView";
import { getWeeksFromDate, getWeekNumber } from "../../dateUtils";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import PeoplePickerComboBox from "./peoplePickerComponent";
import { Button } from "@fluentui/react-components";
import useGlobal from "../../../hooks/useGlobal";
import {
  CustomerDTO,
  EditRegistrationRequestDTO,
  EmployeeDTO,
  ProjectDTO,
  RegistrationDTO,
} from "../../interfaces";
import BackEndService from "../../../services/BackEnd";
import WeekColumn from "./WeekColumn/WeekColumn";
import { calculateWeeklyHours } from "../HelperFunctions/helperFunctions";

interface IFiveWeekViewProps {
  context: WebPartContext;
}

const FiveWeekView: React.FC<IFiveWeekViewProps> = ({ context }) => {
  const { projects, customers } = useGlobal();
  const [registrations, setRegistrations] = useState<RegistrationDTO[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string[]>([]);
  const [, setSelectedEmployees] = useState<EmployeeDTO[]>([]);
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
  const {} = useGlobal();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await BackEndService.Api.registrationsTypeDetail(2);
        const fetchedRegistrations = response.data;
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    void fetchData();
  }, []);

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
    setSelectedBooking(booking);
  };

  const filteredBookings = registrations.filter((booking) => {
    const project = projects.find((p) => Number(p.id) === booking.projectId);
    return (
      booking.registrationType === 2 &&
      (selectedEmployee.length === 0 ||
        selectedEmployee.includes(booking.employee ?? "")) &&
      (!selectedCustomer || project?.customerId === selectedCustomer?.id) &&
      (!selectedProject || booking.projectId === Number(selectedProject))
    );
  });

  const filteredProjects = selectedCustomer
    ? projects.filter((p) => p.customerId === selectedCustomer.id)
    : projects;

  if (selectedBooking) {
    const selectedWeekNumber = getWeekNumber(new Date(selectedBooking.date!));
    const weekBookings = registrations.filter(
      (booking) =>
        getWeekNumber(new Date(booking.date!)) === selectedWeekNumber &&
        booking.employee === selectedBooking.employee &&
        booking.registrationType === 2
    );

    return (
      <WeeklyView
        weekNumber={selectedWeekNumber.toString()}
        employeeId={selectedBooking.employee ?? ""}
        weekBookings={weekBookings}
        employeeName={selectedBooking.employee ?? ""}
        onBack={() => setSelectedBooking(undefined)}
        onPreviousWeek={handlePreviousWeeks}
        onNextWeek={handleNextWeeks}
        projects={projects}
        customers={customers}
      />
    );
  }

  return (
    <div className={styles.teamsContext}>
      <DndProvider backend={HTML5Backend}>
        <div className={styles.container}>
          <div className={styles.controlsContainer}>
            <div className={styles.filterContainer}>
              <PeoplePickerComboBox
                onSelectionChange={(selectedEmployees) => {
                  setSelectedEmployees(selectedEmployees);
                }}
                selectedEmployees={[]}
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
                  <strong>Uge {week.weekNumber} </strong>
                  <Text>
                    (
                    {calculateWeeklyHours(
                      week.start,
                      week.end,
                      registrations,
                      projects,
                      selectedEmployee,
                      selectedCustomer?.id,
                      selectedProject ? Number(selectedProject) : undefined
                    )}{" "}
                    timer)
                  </Text>
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
                  getWeekNumber(new Date(booking.date!)) === weekNumber
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
