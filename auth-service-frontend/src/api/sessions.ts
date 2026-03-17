import type { Session, SessionResp } from '../types';
import { api } from './axios';

export const useSessionsAPI = () => {


    const getSession = () => api.get<Session>("/session");
    const getSessions = () => api.get<SessionResp>("/session/all");
    const deleteSession = (id: string) => api.delete(`/session/${id}`);

    return{
        getSession, deleteSession, getSessions
    }
}


