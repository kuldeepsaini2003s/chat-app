import axios from "axios";
import { useEffect, useState } from "react";

export const useFetch = (url, option = {}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.post(url, option);
        if (data?.success) {
          setData(data?.data);
        }
      } catch (error) {
        console.error("Error while fetching data", error);
      }
    };
    fetchData();
  }, []);

  return { data };
};
