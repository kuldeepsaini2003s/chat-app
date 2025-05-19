import React, { useActionState, useState } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_USER } from "../utils/constant";
import { toast } from "react-toastify";
import useResponseHandler from "../hooks/useResponseHandler";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { handleResponse, handleError } = useResponseHandler();
  const [step, setStep] = useState(1);
  const [emailState, setEmailState] = useState("");

  const [formData, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const toastId = toast.loading(
        step === 1 ? "Sending OTP..." : "Resetting password..."
      );

      const email = formData.get("email") || emailState || "";
      const otp = formData.get("otp") || "";
      const newPassword = formData.get("newPassword") || "";

      try {
        if (step === 1) {
          const { status, data } = await axios.post(
            BACKEND_USER + "/forgotPassword",
            { email }
          );
          handleResponse({
            status,
            message: data?.msg,
            toastId,
            showToast: true,
            onSuccess: () => {
              setEmailState(email);
              localStorage.setItem("resetToken", data?.resetToken);
              setStep(2);
            },
          });
        } else {
          const { status, data } = await axios.post(
            BACKEND_USER + "/resetPassword",
            {
              activation_otp: otp,
              password: newPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("resetToken")}`,
              },
            }
          );
          handleResponse({
            status,
            message: data?.msg,
            toastId,
            showToast: true,
            onSuccess: () => navigate("/login"),
          });
        }
      } catch (error) {
        handleError({
          error,
          toastId,
          message: error?.response?.data?.msg || "Something went wrong.",
          showToast: true,
        });
        return Object.fromEntries(formData);
      }
    },
    null
  );

  return (
    <div className="flex justify-center items-center bg-[#e8e8e8] h-svh w-dvw">
      <div className="form-container">
        <p className="title">Forgot Password</p>
        <form action={submitAction} className="form text-sm">
          {step === 1 ? (
            <>
              <input
                defaultValue={formData?.email}
                type="email"
                name="email"
                required
                className="input"
                placeholder="Enter your email"
              />
              <button
                type="submit"
                disabled={isPending}
                className="form-btn mt-4"
              >
                {isPending ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                defaultValue={formData?.otp}
                type="text"
                name="otp"
                required
                className="input"
                placeholder="Enter OTP"
              />
              <input
                defaultValue={formData?.newPassword}
                type="password"
                name="newPassword"
                required
                className="input"
                placeholder="Enter new password"
              />
              <button
                type="submit"
                disabled={isPending}
                className="form-btn mt-4"
              >
                {isPending ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
