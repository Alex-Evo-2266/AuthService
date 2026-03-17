import type { ClientCreate, Client, ClientUpdate } from "../types";
import { api } from "./axios";

export const useClientsAPI = () => {

  const getClients = () =>
    api.get<Client[]>("/clients/");

  const getClient = (id: string) =>
    api.get<Client>(`/clients/${id}`);

  const addClient = (data: ClientCreate) =>
    api.post<Client>("/clients/", data);

  const updateClient = (id: string, data: ClientUpdate) =>
    api.patch<Client>(`/clients/${id}`, data);

  const deleteClient = (id: string) =>
    api.delete(`/clients/${id}`);

  return {
    getClients,
    getClient,
    addClient,
    updateClient,
    deleteClient,
  };
};