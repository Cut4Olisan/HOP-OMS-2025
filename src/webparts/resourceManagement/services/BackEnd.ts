class BackEndService {
    private static _instance: BackEndService;

    public static get Instance(): BackEndService {
        if (!this._instance) {
            this._instance = new BackEndService();
        }
        return this._instance;
    }

    public static Init(): BackEndService {
        this._instance = new BackEndService();
        return this._instance;
    }

    public async fetchCustomers<T>(): Promise<T> {
        const response = await fetch("https://ngage-financial.azurewebsites.net/api/customers", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching customers: ${response.statusText}, ${errorText}`);
        }

        return await response.json() as T;
    }
}

export default BackEndService;
