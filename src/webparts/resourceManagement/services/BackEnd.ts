import { Api } from "../components/interfaces";

export default class BackEndService {
  private static _instance: Api<{}>;

  public static Init(baseUrl: string): void {
    if (!this._instance) {
      this._instance = new Api({
        baseUrl: baseUrl,
        baseApiParams: {
          headers: {
            "Content-Type": "application/json",
            "api-key": "e67651b1-80a9-41c5-9f1e-acf409d5464b",
          },
        },
      });
    }
  }

  public static get Api() {
    if (!this._instance) {
      throw new Error("BackEndService not initialized. Call Init first.");
    }
    return this._instance.api;
  }
}
