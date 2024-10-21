import * as React from "react";
import { Stack, Text, Separator } from "@fluentui/react";
import BackEndService from "../../services/BackEnd";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { RequestsDTO } from "../interfaces/index";
import useGlobal from "../../hooks/useGlobal";

interface IRequestListProps {
  context: WebPartContext;
}

const RequestList: React.FC<IRequestListProps> = ({ context }) => {
  const { setSelectedRequest, setShowRequestComponentPanel } = useGlobal();
  const [requests, setRequests] = React.useState<RequestsDTO[]>([]);

  React.useEffect(() => {
    const fetchRequests = async (): Promise<void> => {
      try {
        const response = await BackEndService.Api.requestsList();
        setRequests(response.data);
      } catch (error) {
        console.error("Kunne ikke hente anmodninger:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Separator/>
      {requests.map((req, index) => (
        <React.Fragment key={req.id}>
          <Text
            block
            onClick={() => {
              setSelectedRequest(req);
              setShowRequestComponentPanel(true);
            }}
          >
            {req.title}
          </Text>
          {!!requests[index + 1] ? <Separator /> : undefined}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default RequestList;
