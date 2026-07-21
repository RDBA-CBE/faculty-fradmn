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
    showJobApprovalConfirm: false,
    showContactAdminConfirm: false,
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

  const updateJobApprovalStatus = async () => {
    try {
      setState({ btnLoading: true, showJobApprovalConfirm: false });
      const userString = localStorage.getItem("userId");
      if (!userString) return;

      const newValue = !state.profile?.job_approval_permission;
      const body = { job_approval_permission: newValue };

      await Models.auth.updateUser(userString, body);

      setState({
        btnLoading: false,
        profile: { ...state.profile, job_approval_permission: newValue },
      });

      Success("Job approval status updated successfully");
    } catch (error) {
      setState({ btnLoading: false });
      Failure(error?.error);
    }
  };

  const contactAdmin = async () => {
    try {
      setState({ btnLoading: true, showContactAdminConfirm: false });

      const body = {
        institution_id : state?.profile?.institution?.id,
        hr_id : state?.profile?.id
      }

       await Models.auth.contact_hr( body);

       Success("Your Request has been sent successfully to admin");

      setState({
        showContactAdminConfirm: false,
        btnLoading:false
      });


    } catch (error) {
      setState({ btnLoading:false });

        Failure(error?.error);
    }
  }

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
                Manage your password and account preferences.
              </p>
            </div>

            {/* Change Password */}
            <div className="mb-8">
              <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-200">
                Change Password
              </h4>
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
            </div>

            {/* Divider + Job Approval Toggle — HR & Institution Admin only */}
            {(state.profile?.role === "hr" || state.profile?.role === "institution_admin") && (
              <>
                <div className="my-8 border-t border-gray-200 dark:border-gray-700" />

                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Handle Job Approval Status
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {state.profile?.role === "hr" ? (
                        state.profile.job_approval_permission
                          ? "You have permission to manage the job statuses (Approve/Unapprove) the job postings."
                          : "You don't have permission to manage the job statuses (Approve/Unapprove) the job postings. Request your institution admin to provide permission to manage status."
                      ) : (
                        "When enabled, you'll have permission to manage the job statuses (Approve/Unapprove) the job postings. If disabled, ensure that your HR's have the necessary permissions to manage the job posting statuses."
                      )}

                      {state.profile?.role === "hr" && (
                        !state.profile.job_approval_permission && (
                          <button 
                          onClick={()=>setState({showContactAdminConfirm:true})}
                          disabled={state.btnLoading}
                          className="flex-1 rounded-lg items-center flex justify-center underline text-sm font-medium text-dblue">
                            Contact Admin

                          </button>
                        ))}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={state.profile?.role === "hr"}
                    onClick={() =>
                      setState({ showJobApprovalConfirm: true })
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      state.profile?.role === "hr"
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    } ${
                      state.profile.job_approval_permission ? "bg-dblue" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        state.profile.job_approval_permission ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </>
            )}
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

      {/* Job Approval Confirmation Modal */}
      <Modal
        open={state.showJobApprovalConfirm}
        close={() => setState({ showJobApprovalConfirm: false })}
        renderComponent={() => (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <IconLockDots className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Change
              </h2>
            </div>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to{" "}
              <span className="font-semibold">
                {state.profile?.job_approval_permission ? "disable" : "enable"}
              </span>{" "}
              job approval status? This will affect how job postings are published.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setState({ showJobApprovalConfirm: false })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>{
                  updateJobApprovalStatus()
                }}
                className="flex-1 rounded-lg bg-dblue px-4 py-2 text-sm font-medium text-white hover:bg-dblue/90"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        open={state.showContactAdminConfirm}
        close={() => setState({ showContactAdminConfirm: false })}
        renderComponent={() => (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <IconLockDots className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Request Access from Admin
              </h2>
            </div>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to request  <span className="text-black font-semibold">Handle Job Approval Status</span> permission from admin? 
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setState({ showContactAdminConfirm: false })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>{
                  contactAdmin()
                }}
                className="flex-1 rounded-lg bg-dblue px-4 py-2 text-sm font-medium text-white hover:bg-dblue/90"
              >
                Confirm
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
