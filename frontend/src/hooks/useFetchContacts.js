import React, { useEffect } from "react";
import { BACKEND_USER } from "../utils/constant";
import axios from "axios";
import { setContacts } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

const useFetchContacts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.user);
  const fetchContacts = async () => {
    const { data } = await axios.get(BACKEND_USER + "/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (data) {
      dispatch(setContacts(data?.data));
    }
  };
  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);
};

export default useFetchContacts;
