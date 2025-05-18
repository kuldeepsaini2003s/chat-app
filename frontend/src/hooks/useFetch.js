import axios from "axios";
import { useEffect, useState } from "react";
import useResponseHandler from "./useResponseHandler";

export const useFetch = (url, option = {}) => {
  const { handleError } = useResponseHandler();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post(url, option);
        if (data?.success) {
          setData(data?.data);
        }
      } catch (error) {
        handleError({
          error,
          message: error?.response?.data?.msg,
        });
      }
    };
    fetchData();
  }, []);

  return { data };
};
