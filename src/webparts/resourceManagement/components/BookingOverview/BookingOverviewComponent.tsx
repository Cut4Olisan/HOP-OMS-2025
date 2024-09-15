import React from "react";
import FiveWeekView from "./FiveWeekView/FiveWeekView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface OverviewComponentsProps {}

const BookingOverviewComponent: React.FC<OverviewComponentsProps> = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FiveWeekView />
    </DndProvider>
  );
};

export default BookingOverviewComponent;
