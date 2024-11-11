import * as React from "react";
import { INotification, NotificationType } from "../context/GlobalContext";
import { MessageBar, MessageBarType, Stack } from "@fluentui/react";

export interface INotificationProps {
  notifications: INotification[];
  onDismiss: (notification: INotification) => void;
}

const Notifications: React.FC<INotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <Stack style={{ position: "absolute", left: 0, right: 0, zIndex: 99 }}>
      {notifications.map((notif, index) => (
        <React.Fragment key={index}>
          {notif.type === NotificationType.Info && (
            <MessageBar
              messageBarType={MessageBarType.info}
              onDismiss={() => onDismiss(notif)}
            >
              {notif.message}
            </MessageBar>
          )}
          {notif.type === NotificationType.Warning && (
            <MessageBar
              messageBarType={MessageBarType.warning}
              onDismiss={() => onDismiss(notif)}
            >
              {notif.message}
            </MessageBar>
          )}
          {notif.type === NotificationType.Success && (
            <MessageBar
              messageBarType={MessageBarType.success}
              onDismiss={() => onDismiss(notif)}
            >
              {notif.message}
            </MessageBar>
          )}
          {notif.type === NotificationType.Error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              onDismiss={() => onDismiss(notif)}
            >
              {notif.message}
            </MessageBar>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default Notifications;
