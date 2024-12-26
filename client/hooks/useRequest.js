import { useState } from "react";
import axios from "axios";

export const useRequest = (url, method = "get", body = null, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const makeRequest = async (onSuccess = (data = null) => { }, overrideUrl = null, overrideMethod = null, overrideBody = null, overrideConfig = {}) => {
        setError(null);
        setLoading(true);
        try {
            const { data } = await axios({
                url: overrideUrl || url,
                method: overrideMethod || method,
                data: overrideBody || body,
                ...config,
                ...overrideConfig,
            });
            setData(data);
            onSuccess && onSuccess(data);
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return { data, error, loading, makeRequest };
};
