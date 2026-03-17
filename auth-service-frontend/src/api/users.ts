import type { UserForm, UserSchema, UserEditSchema, UserEditLevelSchema, UserEditPasswordSchema, UsersDataSchema } from '../types';
import { api } from './axios';

export const useUserAPI = () => {


    const getCurrentUser = () => api.get<UserSchema>("/users");
    const getAllUsers = () => api.get<UsersDataSchema>("/users/all");
    const addUser = (data:UserForm) => api.post("/users", data);
    const editUser = (id:string, data:UserEditSchema) => api.put(`/users/${id}`, data);
    const deleteUser = (id: string) => api.delete(`/users/${id}`);
    const changeRole = (data:UserEditLevelSchema) => api.patch("/users/role", data);
    const changePassword = (data:UserEditPasswordSchema) => api.patch("/users/password", data);

    return{
        getAllUsers, getCurrentUser, addUser, editUser, deleteUser, changePassword, changeRole
    }
}


