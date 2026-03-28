import type { UserForm, UserSchema, UserEditSchema, UserEditLevelSchema, UserEditPasswordSchema, UsersDataSchema, UsersDataSchemaPage } from '../types';
import { api } from './axios';

export interface GetAllUsersParams {
  limit?: number;
  cursor?: string;
  search?: string;
}

export interface GetAllUsersParamsPage {
  limit?: number;
  page?: number;
  search?: string;
}

export const useUserAPI = () => {


    const getCurrentUser = () => api.get<UserSchema>("/users");
    const getAllUsers = (params?: GetAllUsersParams) => api.get<UsersDataSchema>("/users/all", {params});
    const getAllUsersPage = (params?: GetAllUsersParamsPage) => api.get<UsersDataSchemaPage>("/users/all/page", {params});
    const addUser = (data:UserForm) => api.post("/users", data);
    const editUser = (id:string, data:UserEditSchema) => api.put(`/users/${id}`, data);
    const deleteUser = (id: string) => api.delete(`/users/${id}`);
    const changeRole = (data:UserEditLevelSchema) => api.patch("/users/role", data);
    const changePassword = (data:UserEditPasswordSchema) => api.patch("/users/password", data);

    return{
        getAllUsers, getCurrentUser, addUser, editUser, deleteUser, changePassword, changeRole, getAllUsersPage
    }
}


