import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BACKEND_USER } from "../utils/constant";
import { setUser } from "../redux/userSlice";
import useResponseHandler from "./useResponseHandler";

const useFetchUser = () => {
  const { handleError } = useResponseHandler();
  const { user } = useSelector((state) => state?.user);
  const token = localStorage.getItem("accessToken");
  const dispatch = useDispatch();

  const fetchUser = async () => {
    try {
      const { data } = await axios.get(BACKEND_USER + "/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        dispatch(setUser(data?.data));
      }
    } catch (error) {
      handleError({
        error,
        message: error?.response?.data?.msg,
      });
    }
  };

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user]);
};

export default useFetchUser;
