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
} from "lucide-react";
import { FRONTEND_URL } from "@/utils/constant.utils";
import Link from "next/link";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import TextInput from "@/components/FormFields/TextInput.component";
import Modal from "@/components/modal/modal.component";
import moment from "moment";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";

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
  });

  useEffect(() => {
    dispatch(setPageTitle("Application Details"));
    if (id) {
      fetchApplicationDetail();
      applicationStatusList();
    }
  }, [id, dispatch]);

  const fetchApplicationDetail = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.application.details(id);
      console.log("✌️res --->", res);
      await loadPanelMembers(1, "", false, res?.department?.id);
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

  const applicationStatusList = async () => {
    try {
      setState({ applicationStatusLoading: true });
      const res: any = await Models.master.application_status_list();
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
    deptId = null
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
        selectedDepartments: [state.application?.department?.id],
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
        department_id: state.application?.department?.id,

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
        selectedDepartments: [state.application?.department?.id],
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
        department_id: state.application?.department?.id,

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <IconLoader className="h-12 w-12 animate-spin text-blue-600" />
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading application...
          </span>
        </div>
      </div>
    );
  }

  const app = state.application;
  const job = app?.job_detail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800 dark:text-gray-300"
          >
            <IconArrowBackward className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <div className="flex items-center gap-3">
            {/* <button
              onClick={() => setState({ showInterviewModal: true })}
              className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
              <UserCheck className="relative z-10 h-5 w-5" />
              <span className="relative z-10"> Interview Schedule</span>
            </button> */}

            {app?.applicant ? (
              <Link
                href={`${FRONTEND_URL}profile/${app?.applicant}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="group flex cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <UserCog className="h-5 w-5 text-white" />
                  <p className="font-semibold text-white">View Profile</p>
                </div>
              </Link>
            ) : (
              <div className="rounded-xl bg-red-100 px-6 py-3 dark:bg-red-900/30">
                <p className="font-medium text-red-600 dark:text-red-400">
                  No Profile
                </p>
              </div>
            )}
          </div>
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Applicant Info */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              {/* Profile Header */}
              <div className="mb-8 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-2xl font-bold text-white shadow-xl ring-4 ring-white dark:ring-gray-800">
                  {app?.first_name?.[0]}
                  {app?.last_name?.[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {app?.first_name} {app?.last_name}
                </h2>
                <span
                  className={`mt-3 inline-block rounded-full px-5 py-1.5 text-sm font-semibold shadow-sm ${getStatusColor(
                    app?.status
                  )}`}
                >
                  {app?.status_display}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-5 border-t border-gray-200 pt-8 dark:border-gray-700">
                <div className="flex items-start gap-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="break-all text-sm font-medium text-gray-900 dark:text-white">
                      {app?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <Phone className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {app?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                  <Briefcase className="mt-0.5 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Experience
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {app?.experience}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                  <Calendar className="mt-0.5 h-5 w-5 text-orange-600" />
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

                <div className="flex items-start gap-4 rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
                  <ClipboardList className="mt-0.5 h-5 w-5 text-pink-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Applicant summary
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {capitalizeFLetter(app?.message)}
                    </p>
                  </div>
                </div>
                {app?.resume && (
                  <button
                    onClick={handleDownloadResume}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <IconDownload className="h-5 w-5" />
                    Download Resume
                  </button>
                )}

                {/* <div className="flex items-start gap-3">
                  <UserCog className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Profile
                    </p>
                    <a
                      href={`${FRONTEND_URL}profile/${app?.applicant}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {app?.applicant
                          ? "View Profile"
                          : "Applicant is not a registered User"}
                      </p>
                    </a>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Right Column - Job Details */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
              <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
                <Briefcase className="h-7 w-7 text-purple-600" />
                Job Details
              </h3>

              {/* Job Title */}
              <div className="mb-4 flex items-center rounded-2xl bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 p-4 shadow-lg">
                <h4 className="text-2xl font-bold text-white">
                  {job?.job_title}
                </h4>
                <p className="mt-3 text-lg text-blue-100">{job?.company}</p>
              </div>

              {/* Job Info Grid */}
              <div className="mb-8 grid gap-5 sm:grid-cols-2">
                <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-red-50 to-pink-50 p-5 transition-all hover:border-red-300 hover:shadow-lg dark:border-gray-700 dark:from-red-900/20 dark:to-pink-900/20">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/50">
                      <MapPin className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Location
                      </p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">
                        {job?.locations?.map((item) => (
                          <span key={item?.id}>{item?.city}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5 transition-all hover:border-purple-300 hover:shadow-lg dark:border-gray-700 dark:from-purple-900/20 dark:to-blue-900/20">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/50">
                      <Briefcase className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Experience Required
                      </p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">
                        {job?.experiences?.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/50">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Qualification
                      </p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">
                        {job?.qualification}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="group rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 transition-all hover:border-green-300 hover:shadow-lg dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/50">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Openings
                      </p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white">
                        {job?.number_of_openings} positions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {job?.job_description && job?.job_description !== "{}" && (
                <div className="mb-8">
                  <h5 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                    Job Description
                  </h5>
                  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-gray-700 shadow-inner dark:from-gray-900 dark:to-gray-800 dark:text-gray-300">
                    {job?.job_description}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job?.responsibility && job?.responsibility.length > 0 && (
                <div className="mb-6">
                  <h5 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Responsibilities
                  </h5>
                  <ul className="space-y-2">
                    {job?.responsibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t-2 border-gray-200 pt-8 dark:border-gray-700">
                <h5 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">
                  Timeline
                </h5>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Start Date
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(job?.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Last Date to Apply
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Date(job?.last_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Deadline
                    </span>
                    <span
                      className={`font-bold ${
                        job?.is_deadline_passed
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {new Date(job?.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Details */}
        </div>
      </div>

      {/* Interview Details */}
      {state.application?.interview_slots?.length > 0 && (
        <div className="mx-auto mt-8 max-w-6xl rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          {/* <h3 className="mb-10 flex items-center gap-3 text-3xl font-bold text-gray-900 dark:text-white">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <Calendar className="h-8 w-8 text-white" />
            </div>
         
          </h3> */}

          <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3">
              <Calendar className="h-7 w-7  text-white" />{" "}
            </div>
            Interview Process
          </h3>

          <div className="space-y-4 ">
            {state.application?.interview_slots?.map((round, index) => (
              <div
                key={round.id}
                className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900"
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
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        {round.round_name}
                      </h4>
                      <p className="mt-1 text-sm font-medium text-gray-500">
                        {formatScheduleDateTime(
                          round.scheduled_date,
                          round.scheduled_time
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={round?.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        rescheduleInterview(e, round);
                      }}
                      className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold shadow-sm outline-none ${
                        round.status === "completed"
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : round.status === "rescheduled"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      }`}
                    >
                      <option disabled value="Scheduled" className="text-black">
                        Scheduled
                      </option>

                      <option value="rescheduled" className="text-black">
                        Rescheduled
                      </option>

                      <option value="completed" className="text-black">
                        Completed
                      </option>
                    </select>

                    {/* {round.decision && (
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-bold uppercase text-white shadow-sm">
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
                    <div className="w-full">
                      <div className="grid grid-cols-[40px_1fr] gap-3 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/50 dark:to-emerald-950/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                          <ExternalLink className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="flex flex-col justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
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
                    <div className="w-full">
                      <div className="grid grid-cols-[40px_1fr] gap-3 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white shadow-md">
                          <MessageCircle className="h-4 w-4" />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                              Faculty Response
                            </p>

                            <span className="text-xs text-gray-500">
                              {new Date(
                                round.applicant_feedback.submitted_at
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
                                round.applicant_feedback.feedback_text
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
                  <div className="border-t border-gray-200 bg-gray-50/60 p-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/40">
                    <div className="grid gap-4 md:grid-cols-2">
                      {round.panels.map((panel, i) => {
                        const feedback = panel?.feedbacks?.[0];
                        return (
                          <div
                            key={i}
                            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-semibold text-white">
                                  {panel.name?.charAt(0)}
                                </div>

                                {/* Name + Email */}
                                <div className="space-y-2">
                                  <p className="text-[18px] font-semibold text-gray-900 dark:text-white">
                                    {panel.name}
                                  </p>

                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    {`${panel.email} (${panel.designation})`}
                                  </div>

                                  <div className="flex items-center gap-1 text-sm  text-gray-500">
                                    <Building2 className="h-3 w-3" />
                                    {panel.department?.department_name}
                                  </div>
                                </div>
                              </div>

                              {panel.score && (
                                <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  <Star className="h-3 w-3" />
                                  {panel.score ?? "-"}
                                </div>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="my-3 h-px bg-gray-200 dark:bg-gray-700" />

                            {/* Score Progress */}
                            {feedback && (
                              <div className="mt-3 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                                {feedback.is_same_as_applicant !==
                                  undefined && (
                                  <p>
                                    <span className="font-semibold">
                                      Same As Applicant :
                                    </span>{" "}
                                    {feedback.is_same_as_applicant
                                      ? "Yes"
                                      : "No"}
                                  </p>
                                )}

                                {feedback.academic_record_remark && (
                                  <p>
                                    <span className="font-semibold">
                                      Academic Record :
                                    </span>{" "}
                                    {feedback.academic_record_remark}
                                  </p>
                                )}

                                {feedback.experience_remark && (
                                  <p>
                                    <span className="font-semibold">
                                      Experience :
                                    </span>{" "}
                                    {feedback.experience_remark}
                                  </p>
                                )}

                                {feedback.knowledge_rating && (
                                  <p>
                                    <span className="font-semibold">
                                      Knowledge Rating :
                                    </span>{" "}
                                    {feedback.knowledge_rating}
                                  </p>
                                )}

                                {feedback.knowledge_detail && (
                                  <p>
                                    <span className="font-semibold">
                                      Knowledge Detail :
                                    </span>{" "}
                                    {feedback.knowledge_detail}
                                  </p>
                                )}

                                {feedback.communication_skills_rating && (
                                  <p>
                                    <span className="font-semibold">
                                      Communication Rating :
                                    </span>{" "}
                                    {feedback.communication_skills_rating}
                                  </p>
                                )}

                                {feedback.communication_skills_comment && (
                                  <p>
                                    <span className="font-semibold">
                                      Communication Comment :
                                    </span>{" "}
                                    {feedback.communication_skills_comment}
                                  </p>
                                )}

                                {feedback.attitude_rating && (
                                  <p>
                                    <span className="font-semibold">
                                      Attitude Rating :
                                    </span>{" "}
                                    {feedback.attitude_rating}
                                  </p>
                                )}

                                {feedback.attitude_comment && (
                                  <p>
                                    <span className="font-semibold">
                                      Attitude Comment :
                                    </span>{" "}
                                    {feedback.attitude_comment}
                                  </p>
                                )}

                                {feedback.overall_assessment_rating && (
                                  <p>
                                    <span className="font-semibold">
                                      Overall Assessment :
                                    </span>{" "}
                                    {feedback.overall_assessment_rating}
                                  </p>
                                )}

                                {feedback.overall_assessment_remark && (
                                  <p>
                                    <span className="font-semibold">
                                      Overall Remark :
                                    </span>{" "}
                                    {feedback.overall_assessment_remark}
                                  </p>
                                )}

                                {feedback.position_recommendation && (
                                  <p>
                                    <span className="font-semibold">
                                      Position Recommendation :
                                    </span>{" "}
                                    {feedback.position_recommendation}
                                  </p>
                                )}

                                {feedback.recommendation_comments && (
                                  <p>
                                    <span className="font-semibold">
                                      Recommendation Comment :
                                    </span>{" "}
                                    {feedback.recommendation_comments}
                                  </p>
                                )}
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
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setState({ showInterviewModal: true })}
              className=" group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
              <UserCheck className="relative z-10 h-5 w-5" />
              <span className="relative z-10"> Interview Schedule</span>
            </button>
          </div>
          {/* Final Decision */}
        </div>
      )}
      <div className="mt-12 rounded-2xl border-2 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 p-8 shadow-2xl">
        <h4 className="mb-5 flex items-center gap-2 text-2xl font-bold text-white">
          <span>✨</span> Final Decision
        </h4>

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
          className="w-full appearance-none rounded-xl  bg-white  text-lg font-semibold shadow-lg focus:ring-4 focus:ring-white/50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => updateStatus()}
            className="group flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-800 dark:text-gray-300"
          >
            {state.btnLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </div>

      <Modal
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
          <div className="p-6">
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

              <TextInput
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
                disabled={true}
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
                    state.application?.department?.id
                  );
                }}
                loadMore={() => {
                  if (state.panelNext) {
                    loadPanelMembers(
                      state.panelPage + 1,
                      "",
                      false,
                      state.application?.department?.id
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
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Creating..." : "Create Schedule"}
              </button>
            </div>
          </div>
        )}
      />

      {/* // ReSchedule interview slot */}

      <Modal
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
          <div className="p-6">
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

              <TextInput
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
                disabled={true}
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
                    state.application?.department?.id
                  );
                }}
                loadMore={() => {
                  if (state.panelNext) {
                    loadPanelMembers(
                      state.panelPage + 1,
                      "",
                      false,
                      state.application?.department?.id
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
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Loading..." : "Reschedule"}
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default ApplicationDetail;
