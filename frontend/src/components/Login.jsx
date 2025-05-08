import React, { useActionState } from "react";
import "./Signup.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_USER } from "../utils/constant";
import { setUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData?.get("email") || previousState?.email || "";
      const password =
        formData?.get("password") || previousState?.password || "";
      if (!email) {
      }
      try {
        const { data } = await axios.post(BACKEND_USER + "/login", {
          email,
          password,
        });

        if (data?.success) {
          localStorage.setItem("accessToken", data?.accessToken);
          localStorage.setItem("refreshToken", data?.refreshToken);
          dispatch(setUser(data?.data));
          toast.success(data?.msg);
          navigate("/");
        }
      } catch (error) {
        console.error("Error while login", error);
        toast.error(error?.response?.data?.msg);
        return { email, password };
      }
    },
    null
  );

  return (
    <div className="flex justify-center items-center bg-[#e8e8e8] h-dvh w-dvw">
      <div className="form-container">
        <p className="title">Login</p>
        <form action={submitAction} className="form text-sm">
          <input
            defaultValue={formData?.email}
            type="email"
            name="email"
            required
            className="input"
            placeholder="Email"
          />
          <input
            defaultValue={formData?.password}
            type="password"
            name="password"
            required
            className="input"
            placeholder="Password"
          />
          <Link
            to={"/forgot-password"}
            className="flex justify-end items-center"
          >
            <button
              type="button"
              disabled={isPending}
              className="text-[#008080] my-2 cursor-pointer"
            >
              Forgot Password
            </button>
          </Link>
          <div className="min-w-full h-full place-items-center">
            {isPending ? (
              <p className="loader mb-7 mt-2"></p>
            ) : (
              <button className="form-btn mb-2" disabled={isPending}>
                {" "}
                Login
              </button>
            )}
          </div>
        </form>
        <Link to={"/signup"}>
          <button
            disabled={isPending}
            className="text-sm cursor-pointer sign-up-label"
          >
            Don't have account? <span className="text-[#008080]">Sign Up</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
