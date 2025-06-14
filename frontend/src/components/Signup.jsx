import React, { useActionState, useState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_USER } from "../utils/constant";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { toast } from "react-toastify";
import useResponseHandler from "../hooks/useResponseHandler";

const Signup = () => {
  const { handleResponse, handleError } = useResponseHandler();
  const [preview, setPreview] = useState("/Photo.png");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFile(file);
    }
  };

  const [formData, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const name = formData?.get("name") || previousState?.name || "";
      const email = formData?.get("email") || previousState?.email || "";
      const password =
        formData?.get("password") || previousState?.password || "";

      const payload = new FormData();
      payload.append("name", name);
      payload.append("email", email);
      payload.append("password", password);
      payload.append("avatar", file);

      const toastId = toast.loading("Creating account...");

      try {
        const { status, data } = await axios.post(
          BACKEND_USER + "/register",
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        handleResponse({
          status: status,
          message: data.msg,
          toastId,
          showToast: true,
          onSuccess: () => {
            localStorage.setItem("accessToken", data?.accessToken);
            localStorage.setItem("refreshToken", data?.refreshToken);
            dispatch(setUser(data?.data));
            navigate("/");
          },
        });
      } catch (error) {
        handleError({
          error,
          toastId,
          showToast: true,
          message: error?.response?.data?.msg || "Failed to create user.",
        });
        return { name, email, password };
      }
    },
    null
  );

  return (
    <div className="flex justify-center items-center bg-lightGray dark:bg-lightBlack h-svh w-dvw">
      <div className="form-container">
        <p className="title">Create account</p>
        <form action={submitAction} className="form text-sm">
          <input
            type="text"
            name="name"
            defaultValue={formData?.name}
            required
            className="input"
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            className="input"
            required
            defaultValue={formData?.email}
            placeholder="Email"
          />
          <input
            type="password"
            name="password"
            defaultValue={formData?.password}
            className="input"
            required
            placeholder="Password"
          />
          <div className="flex items-center gap-5 justify-between mt-[15px]">
            <img
              src={preview}
              className="border border-lightGray dark:border-lightBlack object-cover flex-shrink-0 rounded-full w-12 h-12"
              alt=""
            />
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="bg-[#008080] dark:bg-[#049c62] text-white px-4 py-2 rounded-md max-w-full w-52"
            />
          </div>
          <div className="w-full h-full place-items-center">
            {isPending ? (
              <p className="loader mb-7 mt-2"></p>
            ) : (
              <button className="form-btn w-full my-2" disabled={isPending}>
                {" "}
                Create Account
              </button>
            )}
          </div>
        </form>
        <Link to={"/login"}>
          <button
            disabled={isPending}
            className="text-sm cursor-pointer sign-up-label"
          >
            Already have an account?{" "}
            <span className="text-[#008080] dark:text-[#049c62]">Log in</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Signup;
