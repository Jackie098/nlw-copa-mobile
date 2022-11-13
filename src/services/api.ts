import axios from "axios";

// IP of my PC
export const api = axios.create({
  baseURL: "http://192.168.1.15:3333",
});
