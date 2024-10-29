/* import * as React from "react";
import { Stack, MessageBar, MessageBarType } from "@fluentui/react";
import useGlobal from "../hooks/useGlobal";

export interface IGlobalMessageBar { //These are seconds
  infoDuration?: number;
  errorDuration?: number;
  warningDuration?: number;
  successDuration?: number;
  //Duration acts as the default duration for all MessageBars, thus required
  duration: number;
}

const GlobalMessageBar: React.FC<IGlobalMessageBar> = ({
  infoDuration,
  errorDuration,
  warningDuration,
  successDuration,
  duration,
}) => {
  const {
    globalInfo,
    setGlobalInfo,
    globalError,
    setGlobalError,
    globalWarning,
    setGlobalWarning,
    globalSuccess,
    setGlobalSuccess,
  } = useGlobal();

  const messages = [
    {
      type: "info",
      value: globalInfo,
      setValue: setGlobalInfo,
      duration: infoDuration,
    },
    {
      type: "error",
      value: globalError,
      setValue: setGlobalError,
      duration: errorDuration,
    },
    {
      type: "warning",
      value: globalWarning,
      setValue: setGlobalWarning,
      duration: warningDuration,
    },
    {
      type: "success",
      value: globalSuccess,
      setValue: setGlobalSuccess,
      duration: successDuration,
    },
  ];

  //we convert property values to milliseconds for the timeout duration
  const getDuration = (specificDuration?: number): number =>
    (specificDuration || duration) * 1000;

  React.useEffect(() => {
    messages.forEach(({ value, setValue, duration }) => {
      if (value) {
        const timer = setTimeout(
          () => setValue(undefined),
          getDuration(duration)
        );
        return () => clearTimeout(timer);
      }
    });
  }, [globalInfo, globalError, globalWarning, globalSuccess]);

  return (
    <Stack>
      {globalInfo && (
        <MessageBar messageBarType={MessageBarType.info}>
          {globalInfo}
        </MessageBar>
      )}
      {globalError && (
        <MessageBar messageBarType={MessageBarType.error}>
          {globalError}
        </MessageBar>
      )}
      {globalWarning && (
        <MessageBar messageBarType={MessageBarType.warning}>
          {globalWarning}
        </MessageBar>
      )}
      {globalSuccess && (
        <MessageBar messageBarType={MessageBarType.success}>
          {globalSuccess}
        </MessageBar>
      )}
    </Stack>
  );
};

export default GlobalMessageBar;
 */