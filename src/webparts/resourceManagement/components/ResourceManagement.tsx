import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import GlobalContextProvider from "../context/GlobalContext";
import Overview from "./Overview";
import Panels from "./Panels";

export interface IResourceManagementProps {
  isDarkTheme: boolean;
  environmentMessage: string;
  context: WebPartContext;
}

const ResourceManagement: React.FC<IResourceManagementProps> = ({
  context,
}) => {
  return (
    <div>
      <GlobalContextProvider context={context}>
        <Overview context={context} />
        <Panels context={context}/>
      </GlobalContextProvider>
    </div>
  );
};

export default ResourceManagement;
