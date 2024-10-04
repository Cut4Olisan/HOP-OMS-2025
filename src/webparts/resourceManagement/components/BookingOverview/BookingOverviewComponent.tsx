import React from "react";
import FiveWeekView from "./FiveWeekView/FiveWeekView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface OverviewComponentsProps {
  context: WebPartContext;
}

const BookingOverviewComponent: React.FC<OverviewComponentsProps> = ({
  context,
}) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <FiveWeekView context={context} />
    </DndProvider>
  );
};

export default BookingOverviewComponent;
