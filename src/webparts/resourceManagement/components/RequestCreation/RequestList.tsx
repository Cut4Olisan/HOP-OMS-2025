import * as React from "react";
import {
  Stack,
  DetailsList,
  IColumn,
  SelectionMode,
  Text,
} from "@fluentui/react";
import BackEndService from "../../services/BackEnd";
import RequestComponent from "./RequestComponent";
import { FormMode, IRequest } from "./interfaces/IRequestComponentProps";
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface IRequestListProps {
  context: WebPartContext;
}

const RequestList: React.FC<IRequestListProps> = ({ context }) => {
  const [requests, setRequests] = React.useState<IRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = React.useState<
    IRequest | undefined
  >(undefined);

  React.useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const data = await BackEndService.Instance.getRequests();
        setRequests(data);
        console.log(data);
      } catch (error) {
        console.error("Kunne ikke hente anmodninger:", error);
      }
    };

    fetchRequests().catch((e) => console.error(e));
  }, []);

  const columns: IColumn[] = [
    {
      key: "column1",
      name: "Titel",
      fieldName: "title",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
    {
      key: "column2",
      name: "Dato",
      fieldName: "date",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
    },
  ];

  const onItemInvoked = (item: IRequest): void => {
    setSelectedRequest(item);
  };

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Text variant="xLarge">Anmodninger</Text>
      <DetailsList
        items={requests}
        columns={columns}
        selectionMode={SelectionMode.none}
        onItemInvoked={onItemInvoked}
      />
      {selectedRequest && (
        <RequestComponent
          context={context}
          mode={FormMode.ConfirmRequest}
          onFinish={() => setSelectedRequest(undefined)}
          request={selectedRequest}
        />
      )}
    </Stack>
  );
};

export default RequestList;
