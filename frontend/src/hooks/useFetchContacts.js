import { useEffect } from "react";
import { BACKEND_USER } from "../utils/constant";
import axios from "axios";
import { setContacts } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import useResponseHandler from "./useResponseHandler";

const useFetchContacts = () => {
  const dispatch = useDispatch();
  const { handleError } = useResponseHandler();
  const { user } = useSelector((store) => store?.user);
  const fetchContacts = async () => {
    try {
      const { data } = await axios.get(BACKEND_USER + "/contacts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (data) {
        dispatch(setContacts(data?.data));
      }
    } catch (error) {
      handleError({
        error,
        message: error?.response?.data?.msg,
      });
    }
  };
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);
};

export default useFetchContacts;
