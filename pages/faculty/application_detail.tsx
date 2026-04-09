import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import {
  buildFormData,
  capitalizeFLetter,
  Failure,
  formatScheduleDateTime,
  Success,
  useSetState,
} from "@/utils/function.utils";
import Models from "@/imports/models.import";
import IconLoader from "@/components/Icon/IconLoader";
import IconDownload from "@/components/Icon/IconDownload";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import {
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Building,
  GraduationCap,
  UserLock,
  UserCog,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Loader,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  ThumbsUp,
  Users,
  FileText,
  Send,
  ExternalLink,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { FRONTEND_URL, ROLES } from "@/utils/constant.utils";
import Link from "next/link";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import TextInput from "@/components/FormFields/TextInput.component";
import Modal from "@/components/modal/modal.component";
import moment from "moment";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import ReadMore from "@/components/readMore";

const ApplicationDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useSetState({
    loading: true,
    application: null,
    expandedRounds: {},
    showInterviewModal: false,

    selectedJobs: [],
    selectedDepartments: [],
    interviewSlot: "",
    panelMembers: [],
    selectedApplicants: [],
    requestForChange: false,
    roundName: "",
    interviewStatus: null,
    interviewStatusList: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
    ],
    isOpenReschedule: false,

    isOpenProfile: false,
    userProfile: null,
    profileUserLoading: false,
    profileActiveTab: "profile",
    profileActiveSection: "summary",
  });

  useEffect(() => {
    dispatch(setPageTitle("Application Details"));
    if (id) {
      fetchApplicationDetail();
      applicationStatusList();
    }
    profile();
  }, [id, dispatch]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getUser = async () => {
    try {
      setState({ profileUserLoading: true, isOpenProfile: true, profileActiveTab: "profile", profileActiveSection: "summary" });
      const res: any = await Models.auth.getUser(state.application?.applicant);
      setState({ userProfile: res, profileUserLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState({ profileUserLoading: false });
    }
  };

  const fetchApplicationDetail = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.application.details(id);
      console.log("✌️res --->", res);
      // await loadPanelMembers(1, "", false, res?.department?.id);
      setState({ application: res, loading: false });
      const statusList: any = await Models.master.application_status_list();
      const find = statusList?.find((item) => item?.name == res?.status);
      if (find) {
        setState({ appstatus: { value: find?.id, label: find?.name } });
      }
    } catch (error) {
      console.log("Error fetching application:", error);
      setState({ loading: false });
    }
  };

  console.log("✌️state?.application --->", state?.application);

  const applicationStatusList = async () => {
    try {
      setState({ applicationStatusLoading: true });
      const body = {
        rexclude_applied_interview: "Yes",
      };
      const res: any = await Models.master.application_status_list(body);
      const dropdown = res?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({
        applicationStatusLoading: false,
        applicationStatusList: dropdown,
      });
    } catch (error) {
      setState({ applicationStatusLoading: false });
    }
  };

  const handleDownloadResume = () => {
    if (state.application?.resume) {
      window.open(state.application.resume, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      reviewed:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      accepted:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const updateStatus = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        status: state.appstatus?.label,
      };
      await Models.application.update(body, id);
      Success("Application status updated successfully!");
      setState({ btnLoading: false });
      router.back();
    } catch (error) {
      setState({ btnLoading: false });

      console.log("✌️error --->", error);
    }
  };

  const loadPanelMembers = async (
    page = 1,
    search = "",
    loadMore = false,
    deptId = null,
  ) => {
    console.log("✌️loadPanelMembers --->");

    try {
      setState({ panelMemberLoading: true });
      const body: any = { search };
      if (deptId) body.department_id = deptId;
      console.log("✌️body --->", body);
      const res: any = await Models.master.panel_list(body, page);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({
        panelMemberLoading: false,
        panelMemberList: loadMore
          ? [...state.panelMemberList, ...dropdown]
          : dropdown,
        panelNext: res?.next,
        panelPage: page,
      });
    } catch (error) {
      setState({ panelMemberLoading: false });
    }
  };

  const handleInterviewScheduleSubmit = async () => {
    try {
      setState({ submitting: true });

      const validation = {
        selectedJobs: [state.application?.job_detail?.id],
        selectedDepartments: state?.selectedDepartments?.value,

        interviewSlot: state.interviewSlot
          ? moment(state.interviewSlot).format("YYYY-MM-DD HH:mm")
          : "",
        panelMembers: state.panelMembers.map((p) => p.value),
        selectedApplicants: [state.application?.id],
        request_for_change: state.requestForChange,
        roundName: state.roundName,
        interviewStatus: "Scheduled",

        response_from_applicant: state.requestForChange,
        interview_link: state.interview_link,
      };

      await Utils.Validation.single_interview.validate(validation, {
        abortEarly: false,
      });

      const body = {
        position_ids: [state.application?.job_detail?.id],
        // department_id: state.selectedDepartments?.map((item)=>item?.value),
        department_id: state.selectedDepartments?.value,
        // department_id: state?.selectedDepartments?.map((item) => item?.value),

        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        panel_ids: state.panelMembers.map((p) => p.value),
        application_ids: [state.application?.id],
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link,
      };
      console.log("✌️body --->", body);

      await Models.interview.create(body);
      Success("Interview schedule created successfully!");
      setState({
        showInterviewModal: false,
        errors: {},
        selectedJobs: [],
        selectedDepartments: [],
        selectedApplicants: [],
        panelMembers: [],
        interviewSlot: "",
        roundName: "",
        requestForChange: false,
        interviewStatus: null,
        submitting: false,
        interview_link: "",
      });
      setState({ submitting: false });
      fetchApplicationDetail();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors, submitting: false });
      } else {
        Failure(error?.error);
        setState({ submitting: false });
      }
    }
  };

  const handleRescheduleInterview = async () => {
    try {
      setState({ submitting: true });

      const validation = {
        selectedJobs: [state.application?.job_detail?.id],
        // selectedDepartments: state?.selectedDepartments?.map(
        //   (item) => item?.value
        // ),
        selectedDepartments: state?.selectedDepartments?.value,

        interviewSlot: state.interviewSlot
          ? moment(state.interviewSlot).format("YYYY-MM-DD HH:mm")
          : "",
        panelMembers: state.panelMembers.map((p) => p.value),
        selectedApplicants: [state.application?.id],
        request_for_change: state.requestForChange,
        roundName: state.roundName,
        interviewStatus: "Scheduled",

        response_from_applicant: state.requestForChange,
        interview_link: state.interview_link,
      };

      await Utils.Validation.single_interview.validate(validation, {
        abortEarly: false,
      });

      const body = {
        position_ids: [state.application?.job_detail?.id],
        // department_id: state.selectedDepartments?.map((item)=>item?.value),
        // department_id: state.application?.department?.id,
        department_id: state.selectedDepartments?.value,

        // department_id: state?.selectedDepartments?.map((item) => item?.value),

        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        panel_ids: state.panelMembers.map((p) => p.value),
        application_ids: [state.application?.id],
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "reschedule",
        interview_link: state.interview_link,
      };
      console.log("✌️body --->", body);

      await Models.interview.update(body, state.rescheduleId);
      Success("Interview schedule created successfully!");
      setState({
        isOpenReschedule: false,
        errors: {},
        selectedJobs: [],
        selectedDepartments: [],
        selectedApplicants: [],
        panelMembers: [],
        interviewSlot: "",
        roundName: "",
        requestForChange: false,
        interviewStatus: null,
        submitting: false,
        interview_link: "",
        rescheduleId: null,
      });

      fetchApplicationDetail();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors, submitting: false });
      } else {
        Failure(error?.error);
        setState({ submitting: false });
      }
    }
  };

  const rescheduleInterview = async (e, row) => {
    console.log("✌️row --->", row);
    try {
      e.stopPropagation();
      if (e?.target?.value == "rescheduled") {
        setState({ isOpenReschedule: true, rescheduleId: row?.id });
        if (row?.panels?.length > 0) {
          setState({
            panelMembers: row?.panels?.map((item) => ({
              value: item?.id,
              label: item?.name,
            })),
          });
        }
      } else {
        const body = {
          status: e?.target?.value,
        };
        await Models.interview.update(body, row?.id);

        // await Models.interview.update(body, state?.application?.interview?.id);
        Success("Interview status updated successfully!");
        // setState({ isOpenReschedule: false, interview_link: "" });
        fetchApplicationDetail();
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <IconLoader className="h-12 w-12 animate-spin text-blue-600" />
          <span className="text-xl text-gray-700 dark:text-gray-300">
            Loading application...
          </span>
        </div>
      </div>
    );
  }

  const app = state.application;
  const job = app?.job_detail;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-xl font-medium text-gray-700 transition-all dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>

          {/* <div className="flex items-start gap-3">
 <UserCog className="mt-1 h-5 w-5 text-purple-600" />
 <div>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 Profile
 </p>

 {app?.applicant ? (
 <Link href={`/profile/${app.applicant}`}>
 <p className="cursor-pointer text-sm font-medium text-gray-900 transition-colors hover:text-purple-600 dark:text-white">
 View Profile
 </p>
 </Link>
 ) : (
 <p className="text-sm font-medium text-gray-400">
 Applicant is not a registered User
 </p>
 )}
 </div>
 </div> */}
          {/* {app?.resume && (
 <button
 onClick={handleDownloadResume}
 className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
 >
 <IconDownload className="h-4 w-4" />
 Download Resume
 </button>
 )} */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Content (Left Column) */}
          <div className="space-y-4 lg:col-span-2">
            {/* Applicant Header */}
            <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              {/* Profile Header */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-dblue text-md flex h-8 w-8 items-center justify-center rounded-full text-white">
                    {app?.first_name?.[0]}
                    {app?.last_name?.[0]}
                  </div>
                  <div>
                    <h2 className="page-ti">
                      {app?.first_name} {app?.last_name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {app?.applicant ? (
                    <button onClick={() => getUser()}>
                      <div className="bg-dblue group flex cursor-pointer items-center gap-3 rounded-lg px-6 py-2 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                        <UserCog className="h-5 w-5 text-white" />
                        <p className=" text-white">View Profile</p>
                      </div>
                    </button>
                  ) : (
                    // <Link
                    //   href={`${FRONTEND_URL}profile/${app?.applicant}`}
                    //   target="_blank"
                    //   rel="noopener noreferrer"
                    // >
                    //   <div className="bg-dblue group flex cursor-pointer items-center gap-3 rounded-lg px-6 py-2 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                    //     <UserCog className="h-5 w-5 text-white" />
                    //     <p className=" text-white">View Profile</p>
                    //   </div>
                    // </Link>
                    <div className="rounded-xl bg-red-100 px-6 py-3 dark:bg-red-900/30">
                      <p className="font-medium text-red-600 dark:text-red-400">
                        Not a register user
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:grid-cols-2">
                <div className="flex items-start gap-4">
                  <Mail className="text-dyellow mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="break-all text-sm font-medium text-gray-900 dark:text-white">
                      {app?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-dyellow mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {app?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Briefcase className="text-dyellow mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Experience
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {app?.experience}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="text-dyellow mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Applied Date
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(app?.applied_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Calendar className="text-dyellow mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Departments
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {state.application?.department_details
                        ?.map((item) => item?.short_name)
                        ?.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <FileText className="text-dyellow mt-0.5 h-5 w-5 flex-shrink-0" />

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cover Letter
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-white">
                      <ReadMore charLimit={250}>
                        {capitalizeFLetter(app?.message)}
                      </ReadMore>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex items-center justify-between">
              <div className="page-ti  flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="flex items-center justify-center rounded-xl">
                  <Calendar className="text-dyellow h-5 w-5" />{" "}
                </div>
                Interview Rounds
                {state.profile?.role != ROLES.HR && (
                  <div className="bg-dblue flex h-7 w-7 items-center justify-center rounded-full text-sm text-white shadow-md">
                    {state.application?.interview_slots?.length || 0}
                  </div>
                )}
              </div>
              {state.profile?.role == ROLES.HR && (
                <div className=" flex items-center justify-end">
                  <button
                    onClick={() => setState({ showInterviewModal: true })}
                    className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                    <UserCheck className="relative z-10 h-5 w-5" />
                    <span className="relative z-10"> Interview Schedule</span>
                  </button>
                </div>
              )}
            </div>

            {/* Job Information */}

            {/* Interview Details */}
            {state.application?.interview_slots?.length > 0 && (
              <div className=" dark:border-gray-700">
                <div className="space-y-4">
                  {state.application?.interview_slots?.map((round, index) => (
                    <div
                      key={round.id}
                      className="overflow-hidden rounded-xl border transition-all hover:shadow-md dark:border-gray-700"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() =>
                          setState({
                            expandedRounds: {
                              ...state.expandedRounds,
                              [round.id]: !state.expandedRounds[round.id],
                            },
                          })
                        }
                        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-dblue text-md flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-lg text-gray-900 dark:text-white">
                              {round.round_name}
                            </h4>
                            <p className=" text-sm text-gray-500">
                              {formatScheduleDateTime(
                                round.scheduled_date,
                                round.scheduled_time,
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {state.profile?.role == ROLES.HR ? (
                            <select
                              value={round?.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                rescheduleInterview(e, round);
                              }}
                              className={`cursor-pointer rounded-full px-3 py-1 text-xs shadow-sm outline-none ${
                                round.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : round.status === "rescheduled"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              <option
                                disabled
                                value="Scheduled"
                                className="text-black"
                              >
                                Scheduled
                              </option>

                              <option
                                value="rescheduled"
                                className="text-black"
                              >
                                Rescheduled
                              </option>

                              <option value="completed" className="text-black">
                                Completed
                              </option>
                            </select>
                          ) : (
                            <div
                              className={`cursor-pointer rounded-full px-3 py-1 text-xs shadow-sm outline-none ${
                                round.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : round.status === "rescheduled"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {round?.status}
                            </div>
                          )}
                          {/* {round.decision && (
 <span className="bg-dblue rounded-full px-4 py-2 text-xs uppercase text-white shadow-sm">
 {round.decision}
 </span>
 )} */}

                          {state.expandedRounds[round.id] ? (
                            <ChevronUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                      </button>
                      <div className="mb-3 grid grid-cols-2 gap-4 px-4 md:grid-cols-2">
                        {round?.interview_link && (
                          <div className="hidden w-full">
                            <div className="grid grid-cols-[40px_1fr] gap-3 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/50 dark:to-emerald-950/50">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                                <ExternalLink className="h-4 w-4" />
                              </div>

                              <div>
                                <div className="flex flex-col justify-between">
                                  <p className="text-xs uppercase tracking-wide text-green-600 dark:text-green-400">
                                    Interview Link
                                  </p>
                                  <Link
                                    href={round?.interview_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline"
                                  >
                                    {round?.interview_link}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {round?.applicant_feedback && (
                          <div className="hidden w-full">
                            <div className="grid grid-cols-[40px_1fr] gap-3 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md">
                                <MessageCircle className="h-4 w-4" />
                              </div>

                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                    Faculty Response
                                  </p>

                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      round.applicant_feedback.submitted_at,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>

                                {round?.applicant_feedback?.is_available ? (
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    Faculty available for Interview
                                  </p>
                                ) : round?.response_from_applicant ? (
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    {capitalizeFLetter(
                                      round.applicant_feedback.feedback_text,
                                    )}
                                  </p>
                                ) : (
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    Faculty not available for Interview
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {state.expandedRounds?.[round?.id] && (
                        <div className="border-t border-gray-200 bg-gray-50/60 p-2 backdrop-blur dark:border-gray-700 dark:bg-gray-900/40">
                          <div className="text-md fond-medium py-2">
                            Pannel Members With Feedbacks :
                          </div>
                          <div className="grid gap-4 ">
                            {round.panels.map((panel, i) => {
                              const feedback = panel?.feedbacks?.[0];
                              return (
                                <div
                                  key={i}
                                  className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                  {/* Header */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-3 ">
                                      {/* Avatar */}
                                      <div className="bg-dblue flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                                        {panel.name?.charAt(0)}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        {/* Name + Email */}
                                        <p className="text-[15px] text-gray-900 dark:text-white">
                                          {panel.name}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Mail className="h-3 w-3" />
                                        {`${panel.email} (${panel.designation})`}
                                      </div>

                                      <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Building2 className="h-3 w-3" />
                                        {panel.department?.department_name}
                                      </div>
                                    </div>

                                    {panel.score && (
                                      <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                        <Star className="h-3 w-3" />
                                        {panel.score ?? "-"}
                                      </div>
                                    )}
                                  </div>

                                  {/* Divider */}
                                  <div className="my-3 h-px bg-gray-200 dark:bg-gray-700" />

                                  {/* Score Progress */}
                                  {feedback ? (
                                    <div className="mt-3 space-y-2 rounded-lg text-sm ">
                                      {feedback.is_same_as_applicant !==
                                        undefined && (
                                        <p>
                                          <span className="font-bold">
                                            Same As Applicant :
                                          </span>{" "}
                                          {feedback.is_same_as_applicant
                                            ? "Yes"
                                            : "No"}
                                        </p>
                                      )}

                                      {feedback.academic_record_remark && (
                                        <p>
                                          <span className="font-bold">
                                            Academic Record :
                                          </span>{" "}
                                          {feedback.academic_record_remark}
                                        </p>
                                      )}

                                      {feedback.experience_remark && (
                                        <p>
                                          <span className="font-bold">
                                            Experience :
                                          </span>{" "}
                                          {feedback.experience_remark}
                                        </p>
                                      )}

                                      {feedback.knowledge_rating && (
                                        <p>
                                          <span className="font-bold">
                                            Knowledge Rating :
                                          </span>{" "}
                                          {feedback.knowledge_rating}
                                        </p>
                                      )}

                                      {feedback.knowledge_detail && (
                                        <p>
                                          <span className="font-bold">
                                            Knowledge Detail :
                                          </span>{" "}
                                          {feedback.knowledge_detail}
                                        </p>
                                      )}

                                      {feedback.communication_skills_rating && (
                                        <p>
                                          <span className="font-bold">
                                            Communication Rating :
                                          </span>{" "}
                                          {feedback.communication_skills_rating}
                                        </p>
                                      )}

                                      {feedback.communication_skills_comment && (
                                        <p>
                                          <span className="font-bold">
                                            Communication Comment :
                                          </span>{" "}
                                          {
                                            feedback.communication_skills_comment
                                          }
                                        </p>
                                      )}

                                      {feedback.attitude_rating && (
                                        <p>
                                          <span className="font-bold">
                                            Attitude Rating :
                                          </span>{" "}
                                          {feedback.attitude_rating}
                                        </p>
                                      )}

                                      {feedback.attitude_comment && (
                                        <p>
                                          <span className="font-bold">
                                            Attitude Comment :
                                          </span>{" "}
                                          {feedback.attitude_comment}
                                        </p>
                                      )}

                                      {feedback.overall_assessment_rating && (
                                        <p>
                                          <span className="font-bold">
                                            Overall Assessment :
                                          </span>{" "}
                                          {feedback.overall_assessment_rating}
                                        </p>
                                      )}

                                      {feedback.overall_assessment_remark && (
                                        <p>
                                          <span className="font-bold">
                                            Overall Remark :
                                          </span>{" "}
                                          {feedback.overall_assessment_remark}
                                        </p>
                                      )}

                                      {feedback.position_recommendation && (
                                        <p>
                                          <span className="font-bold">
                                            Position Recommendation :
                                          </span>{" "}
                                          {feedback.position_recommendation}
                                        </p>
                                      )}

                                      {feedback.recommendation_comments && (
                                        <p>
                                          <span className="font-bold">
                                            Recommendation Comment :
                                          </span>{" "}
                                          {feedback.recommendation_comments}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center text-gray-500">
                                      No Feedbacks
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Final Decision */}
              </div>
            )}

            <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg text-gray-900 dark:text-white">
                Job Information
              </h3>

              <div className="">
                <h4 className="pb-2 text-lg">
                  <b>Job Title : </b>
                  {job?.job_title}
                </h4>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 gap-4 pt-2 dark:border-gray-700 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <MapPin className="text-dyellow mt-1 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {job?.locations?.map((item) => item?.city).join(", ") ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="text-dyellow mt-1 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {job?.experiences?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="text-dyellow mt-1 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {job?.qualification || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="text-dyellow mt-1 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Openings</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {job?.number_of_openings || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {job?.job_description && (
                <div className=" mt-4 border-t pt-4">
                  <h4 className="mb-2 text-lg text-gray-800 dark:text-white">
                    Job Description
                  </h4>
                  <p className="prose-sm max-w-none text-gray-700 dark:text-gray-300">
                    {job.job_description}
                  </p>
                </div>
              )}
              {(job?.start_date ||
                job?.last_date ||
                job?.is_deadline_passed) && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="mb-2 text-lg text-gray-800 dark:text-white">
                    Timeline
                  </h4>

                  <div className="flex gap-5">
                    {job?.start_date && (
                      <div className=" flex  items-center justify-between gap-2 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <span className=" text-gray-700 dark:text-gray-300">
                          Start Date :
                        </span>
                        <span className=" text-gray-900 dark:text-white">
                          {new Date(job?.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {job?.last_date && (
                      <div className=" flex items-center justify-between gap-2 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                        <span className=" text-gray-700 dark:text-gray-300">
                          Last Date to Apply :
                        </span>
                        <span className=" text-gray-900 dark:text-white">
                          {new Date(job?.last_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {job?.is_deadline_passed && (
                      <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                        <span className=" text-gray-700 dark:text-gray-300">
                          Deadline
                        </span>
                        <span
                          className={` ${
                            job?.is_deadline_passed
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {new Date(job?.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Final Decision Card */}
              <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-xl text-gray-800 dark:text-white">
                  Application Status
                </h4>
                <span
                  className={`mb-4 inline-block rounded-full px-3 py-1 text-sm shadow-sm ${getStatusColor(
                    app?.status,
                  )}`}
                >
                  {capitalizeFLetter(app?.status_display)}
                </span>
                {state.profile?.role == ROLES.HR && (
                  <CustomSelect
                    options={state.applicationStatusList}
                    value={state.appstatus}
                    onChange={(selectedOption) => {
                      setState({
                        appstatus: selectedOption,
                      });
                    }}
                    placeholder="Select Status"
                    isClearable={false}
                    required
                    className="w-full"
                  />
                )}
                {state.profile?.role == ROLES.HR && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => updateStatus()}
                      className="bg-dblue group flex items-center gap-2 rounded-lg px-4 py-2  text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      {state.btnLoading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        "Update Status"
                      )}
                    </button>
                  </div>
                )}
              </div>
              {/* Applicant Summary Card */}

              {/* Resume Card */}
              {app?.resume && (
                <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <h4 className="mb-4 text-xl text-gray-800 dark:text-white">
                    Resume
                  </h4>
                  <button
                    onClick={handleDownloadResume}
                    className="bg-dblue flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <IconDownload className="h-5 w-5" />
                    Download Resume
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        subTitle="Create Interview Schedule"
        closeIcon
        open={state.showInterviewModal}
        close={() =>
          setState({
            showInterviewModal: false,
            errors: {},
            selectedJobs: [],
            selectedDepartments: [],
            selectedApplicants: [],
            panelMembers: [],
            interviewSlot: "",
            roundName: "",
            requestForChange: false,
            interviewStatus: null,
          })
        }
        renderComponent={() => (
          <div className="">
            <div className="space-y-5">
              <TextInput
                title="Select Jobs"
                placeholder="Select Jobs"
                value={state.application?.job_detail?.job_title}
                onChange={(e) =>
                  setState({
                    selectedJobs: e.target.value,
                    errors: { ...state.errors, selectedJobs: "" },
                  })
                }
                required
                error={state.errors?.selectedJobs}
                disabled={true}
              />

              <CustomSelect
                title="Select Department"
                placeholder="Select Department"
                options={state?.application?.department_details?.map(
                  (item: any) => ({ value: item?.id, label: item?.short_name }),
                )}
                value={state.selectedDepartments}
                onChange={(e) => {
                  setState({
                    selectedDepartments: e,
                    errors: { ...state.errors, selectedDepartments: "" },
                  });
                  loadPanelMembers(1, "", false, e?.value);
                }}
                // isMulti
                loading={state.jobLoading}
                error={state.errors?.selectedDepartments}
                required
              />
              <TextInput
                title="Faculty"
                placeholder="Enter round name (e.g., Technical Round 1)"
                value={state.application?.applicant_name}
                onChange={(e) =>
                  setState({
                    selectedApplicants: e.target.value,
                    errors: { ...state.errors, selectedApplicants: "" },
                  })
                }
                error={state.errors?.selectedApplicants}
                required
                disabled
              />

              <CustomSelect
                title="Select Panel Members"
                placeholder="Select Panel Members"
                options={state.panelMemberList}
                value={state.panelMembers}
                onChange={(e) => {
                  setState({
                    panelMembers: e,
                    errors: { ...state.errors, panelMembers: "" },
                  });
                }}
                // onSearch={(searchTerm) => {
                //   loadPanelMembers(
                //     1,
                //     searchTerm,
                //     false,
                //     state.application?.department?.id
                //   );
                // }}
                // loadMore={() => {
                //   if (state.panelNext) {
                //     loadPanelMembers(
                //       state.panelPage + 1,
                //       "",
                //       false,
                //       state.application?.department?.id
                //     );
                //   }
                // }}
                isMulti
                loading={state.jobLoading}
                error={state.errors?.panelMembers}
                disabled={!state.selectedDepartments}
                required
              />

              <CustomeDatePicker
                title="Interview Slot"
                value={state.interviewSlot}
                placeholder="Choose From"
                onChange={(e) =>
                  setState({
                    interviewSlot: e,
                    errors: { ...state.errors, interviewSlot: "" },
                  })
                }
                showTimeSelect={true}
                required
                usePortal={false}
                minDate={new Date()}
                error={state.errors?.interviewSlot}
              />

              <TextInput
                title="Round Name"
                placeholder="Enter round name (e.g., Technical Round 1)"
                value={state.roundName}
                onChange={(e) =>
                  setState({
                    roundName: e.target.value,
                    errors: { ...state.errors, roundName: "" },
                  })
                }
                error={state.errors?.roundName}
                required
              />
              <TextInput
                title="Interview Link"
                placeholder="Enter interview link (e.g., https://example.com/interview)"
                value={state.interview_link}
                onChange={(e) =>
                  setState({
                    interview_link: e.target.value,
                    errors: { ...state.errors, interview_link: "" },
                  })
                }
                error={state.errors?.interview_link}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requestForChange"
                  checked={state.requestForChange}
                  onChange={(e) =>
                    setState({ requestForChange: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="requestForChange"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Request for Change
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setState({
                    showInterviewModal: false,
                    errors: {},
                    selectedJobs: [],
                    selectedDepartments: [],
                    selectedApplicants: [],
                    panelMembers: [],
                    interviewSlot: "",
                    roundName: "",
                    requestForChange: false,
                    interviewStatus: null,
                    interview_link: "",
                  })
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleInterviewScheduleSubmit}
                disabled={state.submitting}
                className="bg-dblue flex-1 rounded-lg px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Creating..." : "Create Schedule"}
              </button>
            </div>
          </div>
        )}
      />

      {/* // ReSchedule interview slot */}

      <Modal
        subTitle="Interview Schedule"
        closeIcon
        open={state.isOpenReschedule}
        close={() =>
          setState({
            isOpenReschedule: false,
            errors: {},
            selectedJobs: [],
            selectedDepartments: [],
            selectedApplicants: [],
            panelMembers: [],
            interviewSlot: "",
            roundName: "",
            requestForChange: false,
            interviewStatus: null,
            rescheduleId: null,
          })
        }
        renderComponent={() => (
          <div className="">
            <div className="space-y-5">
              <TextInput
                title="Select Job"
                placeholder="Select Job"
                value={state.application?.job_detail?.job_title}
                onChange={(e) =>
                  setState({
                    selectedJobs: e.target.value,
                    errors: { ...state.errors, selectedJobs: "" },
                  })
                }
                required
                error={state.errors?.selectedJobs}
                disabled={true}
              />

              {/* <TextInput
                title="Select Departments"
                placeholder="Select Departments"
                value={state.application?.department?.department_name}
                onChange={(e) =>
                  setState({
                    selectedDepartments: e.target.value,
                    errors: { ...state.errors, selectedDepartments: "" },
                  })
                }
                required
                error={state.errors?.selectedDepartments}
                // disabled={true}
              /> */}

              <CustomSelect
                title="Select Department"
                placeholder="Select Department"
                options={state?.application?.department_details?.map(
                  (item: any) => ({ value: item?.id, label: item?.short_name }),
                )}
                value={state.selectedDepartments}
                onChange={(e) => {
                  setState({
                    selectedDepartments: e,
                    errors: { ...state.errors, selectedDepartments: "" },
                  });
                }}
                // isMulti
                loading={state.jobLoading}
                error={state.errors?.selectedDepartments}
                required
              />
              <TextInput
                title="Faculty"
                placeholder="Enter round name (e.g., Technical Round 1)"
                value={state.application?.applicant_name}
                onChange={(e) =>
                  setState({
                    selectedApplicants: e.target.value,
                    errors: { ...state.errors, selectedApplicants: "" },
                  })
                }
                error={state.errors?.selectedApplicants}
                required
                disabled
              />

              <CustomSelect
                title="Select Panel Members"
                placeholder="Select Panel Members"
                options={state.panelMemberList}
                value={state.panelMembers}
                onChange={(e) => {
                  setState({
                    panelMembers: e,
                    errors: { ...state.errors, panelMembers: "" },
                  });
                }}
                onSearch={(searchTerm) => {
                  loadPanelMembers(
                    1,
                    searchTerm,
                    false,
                    state.application?.department?.id,
                  );
                }}
                loadMore={() => {
                  if (state.panelNext) {
                    loadPanelMembers(
                      state.panelPage + 1,
                      "",
                      false,
                      state.application?.department?.id,
                    );
                  }
                }}
                isMulti
                loading={state.jobLoading}
                error={state.errors?.panelMembers}
                disabled={!state.selectedDepartments}
                required
              />

              <CustomeDatePicker
                title="Interview Slot"
                value={state.interviewSlot}
                placeholder="Choose From"
                onChange={(e) =>
                  setState({
                    interviewSlot: e,
                    errors: { ...state.errors, interviewSlot: "" },
                  })
                }
                showTimeSelect={true}
                required
                usePortal={false}
                minDate={new Date()}
                error={state.errors?.interviewSlot}
              />

              <TextInput
                title="Round Name"
                placeholder="Enter round name (e.g., Technical Round 1)"
                value={state.roundName}
                onChange={(e) =>
                  setState({
                    roundName: e.target.value,
                    errors: { ...state.errors, roundName: "" },
                  })
                }
                error={state.errors?.roundName}
                required
              />
              <TextInput
                title="Interview Link"
                placeholder="Enter interview link (e.g., https://example.com/interview)"
                value={state.interview_link}
                onChange={(e) =>
                  setState({
                    interview_link: e.target.value,
                    errors: { ...state.errors, interview_link: "" },
                  })
                }
                error={state.errors?.interview_link}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requestForChange"
                  checked={state.requestForChange}
                  onChange={(e) =>
                    setState({ requestForChange: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="requestForChange"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Request for Change
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setState({
                    isOpenReschedule: false,
                    errors: {},
                    selectedJobs: [],
                    selectedDepartments: [],
                    selectedApplicants: [],
                    panelMembers: [],
                    interviewSlot: "",
                    roundName: "",
                    requestForChange: false,
                    interviewStatus: null,
                    interview_link: "",
                    rescheduleId: null,
                  })
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRescheduleInterview()}
                disabled={state.submitting}
                className="bg-dblue flex-1 rounded-lg px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Loading..." : "Reschedule"}
              </button>
            </div>
          </div>
        )}
      />

      {/* ── Candidate Profile Modal ── */}
      <Modal
        open={state.isOpenProfile}
        close={() => setState({ isOpenProfile: false, userProfile: null })}
        subTitle="Applicant Profile"
        closeIcon
        maxWidth="max-w-5xl"
        padding="p-0"
        renderComponent={() => {
          const u = state.userProfile;
          console.log("u --->", u);
          if (state.profileUserLoading) {
            return (
              <div className="flex h-50 items-center justify-center">
                <IconLoader className="h-8 w-8 animate-spin text-dblue" />
              </div>
            );
          }

          if (!u) return null;

          const sideMenuItems = [
            { key: "summary", label: "Profile Summary" },
            { key: "responsibility", label: "Academic Responsibilities" },
            { key: "experience", label: "Experience" },
            { key: "education", label: "Education" },
            { key: "projects", label: "Projects" },
            { key: "publications", label: "Publications" },
            { key: "skills", label: "Skills" },
            { key: "achievements", label: "Achievements" },
          ];

          const renderProfileSection = () => {
            switch (state.profileActiveSection) {
              case "summary":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Profile Summary
                    </h3>
                    {u?.resume_url && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <FileText className="h-4 w-4 shrink-0 text-dblue" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Resume</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <a
                          href={u.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md bg-dblue px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                      </div>
                    )}
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-sm font-semibold   tracking-wide text-gray-500 dark:text-gray-400">
                        About
                      </p>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {u?.about || "No summary provided."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <Mail className="h-4 w-4 text-blue-500" />, label: "Email", val: u?.email },
                        { icon: <Phone className="h-4 w-4 text-green-500" />, label: "Phone", val: u?.phone },
                        { icon: <MapPin className="h-4 w-4 text-red-500" />, label: "Location", val: u?.current_location },
                        { icon: <Briefcase className="h-4 w-4 text-purple-500" />, label: "Experience", val: u?.experience },
                        { icon: <Building className="h-4 w-4 text-orange-500" />, label: "Company", val: u?.current_company },
                        { icon: <User className="h-4 w-4 text-indigo-500" />, label: "Gender", val: u?.gender },
                      ].map((item, i) =>
                        item.val ? (
                          <div key={i} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40">
                            {item.icon}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">{item.val}</p>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                );

                case "responsibility":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Academic Responsibilities</h3>
                    {u?.additional_academic_responsibilities?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.additional_academic_responsibilities.map((resp: any, i: number) => (
                          <span key={i} className="rounded-full  bg-dblue px-3 py-1 text-sm font-medium text-white">
                            {resp.responsibility_title}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">No academic responsibilities listed.</p>}
                  </div>
                );

              case "experience":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Experience</h3>
                    {u?.experiences?.length ? u.experiences.map((exp: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white">{exp.designation}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                          </div>
                          {/* {exp.currently_working && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Current
                            </span>
                          )} */}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {exp.start_date ? moment(exp.start_date).format("MMM YYYY") : ""}{" "}
                          {exp.end_date ? `– ${moment(exp.end_date).format("MMM YYYY")}` : exp.currently_working ? "– Present" : ""}
                        </p>
                        {exp.job_description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{exp.job_description}</p>
                        )}
                      </div>
                    )) : <p className="text-sm text-gray-400">No experience records.</p>}
                  </div>
                );

              case "education":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Education</h3>
                    {u?.educations?.length ? u.educations.map((edu: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="font-semibold text-gray-800 dark:text-white">{edu.degree}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.field}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                          <span>{edu.start_year} – {edu.end_year}</span>
                          {edu.cgpa && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">CGPA: {edu.cgpa}</span>}
                        </div>
                      </div>
                    )) : <p className="text-sm text-gray-400">No education records.</p>}
                  </div>
                );

              case "projects":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Projects</h3>
                    {u?.projects?.length ? u.projects.map((proj: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-800 dark:text-white">{proj.project_title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${proj.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {proj.status}
                          </span>
                        </div>
                        {proj.duration && <p className="mt-0.5 text-xs text-gray-500">{proj.duration}</p>}
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{proj.project_description}</p>
                        {proj.technologies?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {proj.technologies.map((tech: string, j: number) => (
                              <span key={j} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <ExternalLink className="h-3 w-3" /> {proj.link}
                          </a>
                        )}
                        {proj.funded && proj.funding_details && (
                          <p className="mt-1 text-xs text-gray-500">Funded: {proj.funding_details}</p>
                        )}
                      </div>
                    )) : <p className="text-sm text-gray-400">No projects.</p>}
                  </div>
                );

              case "publications":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Publications</h3>
                    {u?.publications?.length ? u.publications.map((pub: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="font-semibold text-gray-800 dark:text-white">{pub.publication_title}</p>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{pub.publication_journal}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                          {pub.publication_year && <span>Year: {pub.publication_year}</span>}
                          {pub.publication_volume && <span>Vol: {pub.publication_volume}</span>}
                          {pub.publication_issue && <span>Issue: {pub.publication_issue}</span>}
                        </div>
                        {pub.publication_description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{pub.publication_description}</p>
                        )}
                      </div>
                    )) : <p className="text-sm text-gray-400">No publications.</p>}
                  </div>
                );

              case "skills":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Skills</h3>
                    {u?.skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.skills.map((skill: any, i: number) => (
                          <span key={i} className="rounded-full  bg-dblue px-3 py-1 text-sm font-medium text-white">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">No skills listed.</p>}
                  </div>
                );

              case "achievements":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">Achievements</h3>
                    {u?.achievements?.length ? u.achievements.map((ach: any, i: number) => (
                      <div key={i} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-800 dark:text-white">{ach.achievement_title}</p>
                          {ach.achievement_file_url && (
                            <a href={ach.achievement_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-dblue hover:underline">
                              <ExternalLink className="h-3 w-3 text-dblue" /> View
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{ach.organization}</p>
                        {ach.achievement_description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{ach.achievement_description}</p>
                        )}
                      </div>
                    )) : <p className="text-sm text-gray-400">No achievements.</p>}
                  </div>
                );

              default:
                return null;
            }
          };

          return (
            <div className="flex flex-col">
              {/* Profile Header */}
              <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
                  {u?.profile_logo_url ? (
                    <img src={u.profile_logo_url} alt={u.username} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white ">{u?.first_name?.[0]}{u?.last_name?.[0]}</span>
                  )}

                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{u?.username || `${u?.first_name} ${u?.last_name}`}</p>
                  {u?.email && <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>}
                 
                </div>
              </div>

              {/* Tabs: Profile | Qualifications */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {["profile", "qualifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setState({ profileActiveTab: tab })}
                    className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                      state.profileActiveTab === tab
                        ? "border-b-2 border-blue-600 text-dblue"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {state.profileActiveTab === "profile" ? (
                <div className="flex" style={{ minHeight: "420px" }}>
                  {/* Left Side Menu */}
                  <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                    {sideMenuItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setState({ profileActiveSection: item.key })}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          state.profileActiveSection === item.key
                            ? "bg-dblue font-semibold text-white"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {renderProfileSection()}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                    Academic Qualifications
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "PhD Completed", key: "phd_completed", icon: <GraduationCap className="h-5 w-5" /> },
                      { label: "NET Cleared", key: "net_cleared", icon: <Award className="h-5 w-5" /> },
                      { label: "SET Cleared", key: "set_cleared", icon: <Award className="h-5 w-5" /> },
                      { label: "SLET Cleared", key: "slet_cleared", icon: <Award className="h-5 w-5" /> },
                    ].map((q) => (
                      <div
                        key={q.key}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-2 ${
                          u?.[q.key]
                            ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                      >
                        <div className={u?.[q.key] ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                          {q.icon}
                        </div>
                        <p className={`text-center text-sm font-medium ${u?.[q.key] ? "text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                          {q.label}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u?.[q.key] ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
                          {u?.[q.key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ApplicationDetail;
