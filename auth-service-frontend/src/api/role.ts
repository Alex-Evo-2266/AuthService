import type { CreateRole, EditPrivilegeRoleForm, Role, RoleList } from '../types';
import { api } from './axios';

export const useRoleAPI = () => {
    
    const getRoles = () => api.get<RoleList>("/role/all");
    const getRole = (id:string) => api.get<Role>(`/role/${id}`);
    const addRole = (data:CreateRole) => api.post("/role", data);
    const editRole = (data:EditPrivilegeRoleForm) => api.put("/role/privilege", data);
    const deleteRole = (id: string) => api.delete(`/role/${id}`);

    return {
        getRole, getRoles, addRole, editRole, deleteRole
    }
}

