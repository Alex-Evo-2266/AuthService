import { useErrorLogout } from "../context/AuthContext";
import type { ConfigItem, MessageData } from "../types";
import { apiEmail } from "./axios";

export const useEmailConfigAPI = () => {
    const logoutError = useErrorLogout()
    
    const getEmailConfig = () => logoutError(apiEmail.get<ConfigItem[]>("config"));
    const editEmailConfig = (data:Record<string, string>) => logoutError(apiEmail.patch("config", data));
    const sendEmail = (data:MessageData) => logoutError(apiEmail.post("send", data));

    return {
        getEmailConfig, editEmailConfig, sendEmail
    }
}
