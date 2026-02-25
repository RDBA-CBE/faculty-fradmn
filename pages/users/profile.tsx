"use client";

import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import TextInput from "@/components/FormFields/TextInput.component";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconMail from "@/components/Icon/IconMail";
import IconUser from "@/components/Icon/IconUser";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import Utils from "@/imports/utils.import";
import {
  capitalizeFLetter,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";
import { error } from "console";
import { UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  const [state, setState] = useSetState({
    confirm_password: "",
    password: "",
    error: "",
    showCurrentPassword: false,
    isOpen: false,
    username: "",
    email: "",
  });

  useEffect(() => {
    profile();
  }, []);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      console.log("✌️res --->", res);
      setState({ profile: res, username: res.username, email: res.email });
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const submitForm = async (e: any) => {
    e.preventDefault();
    try {
      setState({ btnLoading: true });
      const body = {
        current_password: state.current_password,
        new_password: state.new_password,
        confirm_password: state.confirm_password,
      };

      await Utils.Validation.change_password.validate(body, {
        abortEarly: false,
      });

      await Models.auth.change_password(body);
      Success("Password updated successfully");

      setState({
        btnLoading: false,
        current_password: "",
        new_password: "",
        confirm_password: "",
        error: "",
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateProfile = async () => {
    try {
      const userString = localStorage.getItem("userId");
      console.log("✌️userString --->", userString);
      if (userString) {
        const body = {
          username: state.username,
          email: state.email,
        };
        await Utils.Validation.update_profile.validate(body, {
          abortEarly: false,
        });
        await Models.auth.updateUser(userString, body);
        Success("Profile updated successfully");
        setState({
          isOpen: false,
          error: "",
        });
        profile()
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }

      console.log("✌️error --->", error);
    }
  };

  return (
    <div className="p-6">
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex min-h-[500px] flex-col md:flex-row">
          {/* 🔹 Vertical Tabs */}
          <div className="w-full border-r bg-gray-50 dark:border-gray-800 dark:bg-gray-950 md:w-64">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Profile </h2>
            </div>

            <nav className="flex flex-col space-y-2 px-3 pb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`rounded-lg px-4 py-2 text-left transition ${
                  activeTab === "profile"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                Profile Info
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`rounded-lg px-4 py-2 text-left transition ${
                  activeTab === "password"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* 🔹 Content Area */}
          <div className="flex-1 p-8">
            {activeTab === "profile" && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className=" text-xl font-semibold">
                    Profile Information
                  </h3>

                  <div
                    onClick={() => setState({ isOpen: true })}
                    className="cursor-pointer rounded-full p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  >
                    <IconEdit />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <InfoCard
                    label="Username"
                    value={capitalizeFLetter(state.profile?.username)}
                  />
                  <InfoCard label="Email" value={state.profile?.email} />
                  <InfoCard
                    label="Role"
                    value={state.profile?.role.toUpperCase()}
                  />
                  {/* <InfoCard label="Status" value={state.profile?.status} /> */}
                  {state.profile?.institution?.name && (
                    <InfoCard
                      label="Institution"
                      value={capitalizeFLetter(
                        state.profile?.institution?.name
                      )}
                    />
                  )}
                  {state.profile?.department?.department_name && (
                    <InfoCard
                      label="Department"
                      value={capitalizeFLetter(
                        state.profile?.department?.department_name
                      )}
                    />
                  )}
                  {state.profile?.college?.length > 0 && (
                    <InfoCard
                      label="College"
                      value={
                        state.profile?.college
                          ?.map((c) => capitalizeFLetter(c.college_name))
                          .join(", ") || "-"
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                <TextInput
                  name="email"
                  title="Current Password"
                  placeholder="Current Password"
                  type={state.showCurrentPassword ? "text" : "password"}
                  value={state.current_password}
                  onChange={(e) =>
                    setState({ current_password: e.target.value })
                  }
                  error={state.error?.current_password}
                  icon={<IconLockDots fill={true} />}
                  rightIcon={
                    state.showCurrentPassword ? <IconEyeOff /> : <IconEye />
                  }
                  rightIconOnlick={() =>
                    setState({
                      showCurrentPassword: !state.showCurrentPassword,
                    })
                  }
                  required
                />
                <TextInput
                  name="email"
                  title="Password"
                  placeholder="Password"
                  type={state.showPassword ? "text" : "password"}
                  value={state.new_password}
                  onChange={(e) => setState({ new_password: e.target.value })}
                  error={state.error?.new_password}
                  icon={<IconLockDots fill={true} />}
                  rightIcon={state.showPassword ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() =>
                    setState({ showPassword: !state.showPassword })
                  }
                  required
                />
                <TextInput
                  id="Password"
                  title="Confirm Password"
                  type={state.showPassword1 ? "text" : "password"}
                  placeholder="Enter Confirm Password"
                  className="form-input ps-10 placeholder:text-white-dark"
                  onChange={(e) =>
                    setState({ confirm_password: e.target.value })
                  }
                  value={state.confirm_password}
                  error={state.error?.confirm_password}
                  icon={<IconLockDots fill={true} />}
                  rightIcon={state.showPassword1 ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() =>
                    setState({ showPassword1: !state.showPassword1 })
                  }
                  required
                />

                {/* <button
                 type="submit"
                 className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
               >
                 Sign in
               </button> */}
                {/* <PrimaryButton text={"Sign In"} /> */}
                <div className="flex justify-end">
                  <PrimaryButton
                    type="submit"
                    text="Submit"
                    className="btn btn-gradient !mt-6 border-0 px-6 py-2 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                    loading={state.btnLoading}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={state.isOpen}
        close={() =>
          setState({
            isOpen: false,
            first_name: "",
            last_name: "",
            email: "",
          })
        }
        renderComponent={() => (
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900">
                <UserCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Update Profile
              </h2>
            </div>
            <div className="mb-5 space-y-5">
              <TextInput
                title="User Name"
                placeholder="Enter User Name"
                className="form-input ps-10 placeholder:text-white-dark"
                onChange={(e) => setState({ username: e.target.value })}
                value={state.username}
                error={state.error?.username}
                icon={<IconUser fill={true} />}
                required
              />

              <TextInput
                title="Email"
                placeholder="Enter Email"
                className="form-input ps-10 placeholder:text-white-dark"
                onChange={(e) => setState({ email: e.target.value })}
                value={state.email}
                error={state.error?.email}
                icon={<IconMail fill={true} />}
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setState({
                    isOpen: false,
                 
                  })
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => updateProfile()}
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-white hover:shadow-lg"
              >
                Update
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function InfoCard({ label, value }: any) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
