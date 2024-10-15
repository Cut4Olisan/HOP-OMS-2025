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
        const data = (
          await BackEndService.Instance.api.requestsList({
            headers: BackEndService.getHeaders(),
          })
        ).data;
        setRequests(data);
        console.log("Requests:", data);
      } catch (error) {
        console.error("Kunne ikke hente anmodninger:", error);
      }
    };

    fetchRequests().catch((e) => console.error(e));
  }, []);

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <Text variant="xLarge">Anmodninger</Text>
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
