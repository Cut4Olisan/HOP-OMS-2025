import * as React from "react";
import Card, { ICardProps } from "../generic/Card";
import { Stack, Text, Persona, IconButton, PersonaSize } from "@fluentui/react";
import { RegistrationDTO } from "../interfaces";
import globalStyles from "../styles.module.scss";
import useGlobal from "../../hooks/useGlobal";

export interface IBookingOverviewCardProps extends ICardProps {
  registration: RegistrationDTO;
  onEdit: (registration: RegistrationDTO) => void;
  onDelete: (registration: RegistrationDTO) => void;
  onCopyRegistration: (registration: RegistrationDTO) => void;
}

const BookingOverviewCard: React.FC<IBookingOverviewCardProps> = ({
  registration,
  style,
  onEdit,
  onDelete,
  onCopyRegistration,
}) => {
  const { employees, customers, projects } = useGlobal();

  const employee = employees.find(
    (e) => e.email?.toLowerCase() === registration.employee?.toLowerCase()
  );
  const project = projects.find((p) => p.id === registration.projectId);
  const customer = customers.find((c) => c.id === project?.customerId);

  const personaImageUrl = `${window.location.origin}/_layouts/15/userphoto.aspx?size=M&accountname=${employee?.email}`;

  return (
    <Card style={style}>
      <Stack
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Text
          block
          className={globalStyles.bold}
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
          variant="large"
        >
          {registration.shortDescription}
        </Text>
        <div style={{ display: "flex" }}>
          <IconButton
            iconProps={{ iconName: "Edit" }}
            onClick={() => onEdit(registration)}
          />
          <IconButton
            iconProps={{ iconName: "Copy" }}
            onClick={() => onCopyRegistration(registration)}
          />
          <IconButton
            iconProps={{ iconName: "Trash" }}
            onClick={async () => onDelete(registration)}
          />
        </div>
      </Stack>
      {employee && (
        <Stack>
          <Persona
            text={`${employee.givenName ?? ""} ${employee.surName ?? ""}`}
            imageUrl={personaImageUrl}
            size={PersonaSize.size32}
          />
        </Stack>
      )}
      <Stack>
        {customer && (
          <Text variant="medium" block>
            <span className={globalStyles.bold}>Kunde: </span> {customer?.name}
          </Text>
        )}
        {project && (
          <Text variant="medium" block>
            <span className={globalStyles.bold}>Projekt: </span> {project?.name}
          </Text>
        )}
        <Text variant="medium" block>
          <span className={globalStyles.bold}>Beskrivelse: </span>{" "}
          {registration.description}
        </Text>
        {!!registration.date && (
          <Text variant="medium" block>
            <span className={globalStyles.bold}>Tidspunkt: </span>{" "}
            {registration.date.split("T")[0]}
            {!!registration.start && !!registration.end && (
              <>
                {" - "}
                {registration.start}
                {" - "}
                {registration.end}
              </>
            )}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default BookingOverviewCard;
