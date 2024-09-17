import React from "react";
import FiveWeekView from "./FiveWeekView/FiveWeekView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface OverviewComponentsProps {
  context: WebPartContext; // Add context prop
}

const BookingOverviewComponent: React.FC<OverviewComponentsProps> = ({
  context,
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FiveWeekView context={context} /> {/* Pass the context prop here */}
    </DndProvider>
  );
};

export default BookingOverviewComponent;
