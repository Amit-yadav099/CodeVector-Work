import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const getProducts = async ({category, cursor,snapshot,}) => {
  const params = {};

  if (category) params.category = category;
  if (cursor) params.cursor = cursor;
  if (snapshot) params.snapshot = snapshot;

  const response = await API.get("/products", {
    params,
  });

  return response.data;
};