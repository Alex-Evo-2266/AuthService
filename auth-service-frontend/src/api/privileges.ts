import type { PrivilegeForm, PrivilegeSchemaList } from '../types';
import { api } from './axios';

export const usePrivilegesAPI = () => {
    
    const getPrivileges = () => api.get<PrivilegeSchemaList>("/privilege");
    const addPrivilege = (data:PrivilegeForm) => api.post("/privilege", data);
    const deletePrivilege = (id: string) => api.delete(`/privilege/${id}`);

    return {
        getPrivileges, addPrivilege, deletePrivilege
    }
}

