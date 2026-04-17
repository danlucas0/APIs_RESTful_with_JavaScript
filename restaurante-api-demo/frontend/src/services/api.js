import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getCardapio = () => {
  return api.get("/cardapio");
};

export const getCardapioItem = (id) => {
  return api.get(`/cardapio/${id}`);
};

export const createComanda = (comanda) => {
  return api.post("/comandas", comanda);
};

export const getComandas = () => {
  return api.get("/comandas");
};

export const getMinhasComandas = () => {
  return api.get("/comandas/minhas");
};

export const updateComandaStatus = (id, novoStatus) => {
  return api.patch(`/comandas/${id}`, { status: novoStatus });
};

export const deleteComanda = (id) => {
  return api.delete(`/comandas/${id}`);
};

export const getMesas = () => {
  return api.get("/mesas");
};

export default api;