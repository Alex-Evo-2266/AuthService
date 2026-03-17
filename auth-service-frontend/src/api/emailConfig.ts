import type { ConfigItem, MessageData } from "../types";
import { apiEmail } from "./axios";

export const useEmailConfigAPI = () => {
    
    const getEmailConfig = () => apiEmail.get<ConfigItem[]>("config");
    const editEmailConfig = (data:Record<string, string>) => apiEmail.patch("config", data);
    const sendEmail = (data:MessageData) => apiEmail.post("send", data);

    return {
        getEmailConfig, editEmailConfig, sendEmail
    }
}
