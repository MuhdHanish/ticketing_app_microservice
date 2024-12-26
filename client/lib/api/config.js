import axios from "axios";

let serverAxiosInstance = null;
let clientAxiosInstance = null;

export const axiosInstace = ({ req }) => {
    const isServer = typeof window === "undefined";
    if (isServer) {
        if (!serverAxiosInstance) {
            serverAxiosInstance = axios.create({
                baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
                headers: req?.headers, 
            });
        }
        return serverAxiosInstance;
    }
    if (!clientAxiosInstance) {
        clientAxiosInstance = axios.create({
            baseURL: "/",
        });
    }
    return clientAxiosInstance;
}