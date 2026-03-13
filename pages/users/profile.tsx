"use client";

import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import TextInput from "@/components/FormFields/TextInput.component";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconLoader from "@/components/Icon/IconLoader";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconMail from "@/components/Icon/IconMail";
import IconUser from "@/components/Icon/IconUser";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import Utils from "@/imports/utils.import";
import {
  buildFormData,
  capitalizeFLetter,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";

import { UserCheck, Building2, GraduationCap, BookOpen } from "lucide-react";

import { useEffect, useState } from "react";
import * as Yup from "yup";

export default function Profile() {
  const [state, setState] = useSetState({
    confirm_password: "",
    current_password: "",
    new_password: "",
    error: {},
    showCurrentPassword: false,
    showPassword: false,
    showPassword1: false,
    btnLoading: false,
    isOpen: false,
    username: "",
    email: "",
    profile: null,
  });

  useEffect(() => {
    profile();
  }, []);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();

      setState({
        profile: res,
        username: res?.username,
        email: res?.email,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
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
        error: {},
      });
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};

        error.inner.forEach((err) => {
          validationErrors[err.path!] = err.message;
        });

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateProfile = async () => {
    try {
      setState({btnLoading:true})
      const userString = localStorage.getItem("userId");

      if (!userString) return;

      const body = {
        username: state.username,
        email: state.email,
      };

      await Utils.Validation.update_profile.validate(body, {
        abortEarly: false,
      });

      const formData = buildFormData(body);

      await Models.auth.updateUser(userString, formData);

      Success("Profile updated successfully");

      setState({
        isOpen: false,
        error: {},
        btnLoading:false
      });

      profile();
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};

        error.inner.forEach((err) => {
          validationErrors[err.path!] = err.message;
        });

        setState({ error: validationErrors,btnLoading:false });
      } else {
        setState({ btnLoading:false });

        Failure(error?.error);
      }
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings, password, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-8">
        {/* Sidebar */}
        <aside className="md:w-80 md:shrink-0">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-dblue text-3xl font-bold text-white shadow-lg">
                    {state.profile?.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="absolute bottom-1 right-1 block h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {capitalizeFLetter(state.profile?.username)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {state.profile?.role?.replace("_", " ").toUpperCase()}
                </p>
              </div>
              <nav className="flex flex-col space-y-1">
                <a
                  href="#profile-information"
                  className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                >
                  <UserCheck className="h-5 w-5 text-gray-400 group-hover:text-dblue" />
                  <span>Profile Information</span>
                </a>
                <a
                  href="#security-settings"
                  className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white"
                >
                  <IconLockDots className="h-5 w-5 text-gray-400 group-hover:text-dblue" />
                  <span>Security Settings</span>
                </a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 space-y-10">
          {/* Profile Information Section */}
          <section
            id="profile-information"
            className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile Information
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your personal and professional details.
                </p>
              </div>
              <button
                onClick={() => setState({ isOpen: true })}
                className="flex items-center gap-2 rounded-lg bg-dblue px-4 py-2 text-sm font-medium text-white transition hover:bg-dblue/90"
              >
                <IconEdit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            <div className="space-y-8">
              {/* Personal Information Section */}
              <div>
                <h4 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <InfoCard
                    icon={<IconUser className="h-5 w-5 text-dblue" />}
                    label="Username"
                    value={capitalizeFLetter(state.profile?.username)}
                  />
                  <InfoCard
                    icon={<IconMail className="h-5 w-5 text-dblue" />}
                    label="Email"
                    value={state.profile?.email}
                  />
                  <InfoCard
                    icon={<UserCheck className="h-5 w-5 text-dblue" />}
                    label="Role"
                    value={state.profile?.role?.replace("_", " ").toUpperCase()}
                  />
                </div>
              </div>

              {/* Academic Information Section */}
              {(state.profile?.institution?.name ||
                state.profile?.department?.department_name ||
                state.profile?.college?.length > 0) && (
                <div>
                  <h4 className="mb-4 border-b border-gray-200 pb-2 text-lg font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {state.profile?.institution?.name && (
                      <InfoCard
                        icon={<Building2 className="h-5 w-5 text-dblue" />}
                        label="Institution"
                        value={capitalizeFLetter(
                          state.profile?.institution?.name
                        )}
                      />
                    )}
                    {state.profile?.department?.department_name && (
                      <InfoCard
                        icon={<BookOpen className="h-5 w-5 text-dblue" />}
                        label="Department"
                        value={capitalizeFLetter(
                          state.profile?.department?.department_name
                        )}
                      />
                    )}
                    {state.profile?.college?.length > 0 && (
                      <InfoCard
                        icon={<GraduationCap className="h-5 w-5 text-dblue" />}
                        label="College"
                        value={state.profile?.college
                          ?.map((c: any) => capitalizeFLetter(c.college_name))
                          .join(", ")}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Security Settings Section */}
          <section
            id="security-settings"
            className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Security Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your password for enhanced security.
              </p>
            </div>

            <form className="max-w-xl space-y-6" onSubmit={submitForm}>
              <TextInput
                title="Current Password"
                type={state.showCurrentPassword ? "text" : "password"}
                value={state.current_password}
                onChange={(e) =>
                  setState({ current_password: e.target.value })
                }
                error={state.error?.current_password}
                icon={<IconLockDots fill />}
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
                title="New Password"
                type={state.showPassword ? "text" : "password"}
                value={state.new_password}
                onChange={(e) => setState({ new_password: e.target.value })}
                error={state.error?.new_password}
                icon={<IconLockDots fill />}
                rightIcon={state.showPassword ? <IconEyeOff /> : <IconEye />}
                rightIconOnlick={() =>
                  setState({ showPassword: !state.showPassword })
                }
                required
              />

              <TextInput
                title="Confirm Password"
                type={state.showPassword1 ? "text" : "password"}
                value={state.confirm_password}
                onChange={(e) =>
                  setState({ confirm_password: e.target.value })
                }
                error={state.error?.confirm_password}
                icon={<IconLockDots fill />}
                rightIcon={state.showPassword1 ? <IconEyeOff /> : <IconEye />}
                rightIconOnlick={() =>
                  setState({ showPassword1: !state.showPassword1 })
                }
                required
              />

              <div className="flex justify-end">
                <PrimaryButton
                  type="submit"
                  text="Update Password"
                  loading={state.btnLoading}
                />
              </div>
            </form>
          </section>
        </main>
      </div>

      {/* MODAL */}

      <Modal
        open={state.isOpen}
        close={() => setState({ isOpen: false })}
        renderComponent={() => (
          <div className="w-full  p-6">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dblue dark:from-blue-900 dark:to-purple-900">
                <IconUser className="h-6 w-6 text-white dark:text-blue-400" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Update Profile
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modify your username and email
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <TextInput
                title="User Name"
                placeholder="Enter your username"
                value={state.username}
                onChange={(e) => setState({ username: e.target.value })}
                error={state.error?.username}
                icon={<IconUser fill />}
              />

              <TextInput
                title="Email Address"
                placeholder="Enter your email"
                value={state.email}
                onChange={(e) => setState({ email: e.target.value })}
                error={state.error?.email}
                icon={<IconMail fill />}
              />
            </div>

            {/* Footer */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setState({ isOpen: false })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={updateProfile}
                disabled={state.btnLoading}
                className="flex-1 rounded-lg items-center flex justify-center bg-dblue px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-dblue/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.btnLoading ? (
                  <IconLoader className="animate-spin" />
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function InfoCard({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-dblue/10 text-dblue dark:bg-dblue/20 dark:text-white">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="mt-1 font-semibold text-gray-800 dark:text-white break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
