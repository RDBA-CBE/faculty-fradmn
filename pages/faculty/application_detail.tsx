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
  Printer,
} from "lucide-react";
import {
  CALENDAR_CLIENT_ID,
  FRONTEND_URL,
  ROLES,
} from "@/utils/constant.utils";
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
    googleAuthCode: "",
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
    profile();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchApplicationDetail();
    applicationStatusList();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const savedForm = sessionStorage.getItem("interviewFormState");
      const restored = savedForm ? JSON.parse(savedForm) : {};
      setState({ googleAuthCode: code, showInterviewModal: true, ...restored });
      sessionStorage.removeItem("interviewFormState");
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?id=${id}`
      );
    }
  }, [id]);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (fetchApplicationDetail && id && role == "hr") {
      readApplicationNotification();
    }
  }, []);

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
      setState({
        profileUserLoading: true,
        isOpenProfile: true,
        profileActiveTab: "profile",
        profileActiveSection: "summary",
      });
      const res: any = await Models.auth.getUser(state.application?.applicant);
      setState({ userProfile: res, profileUserLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState({ profileUserLoading: false });
    }
  };

  const readApplicationNotification = async () => {
    try {
      const body = {
        user_id: id,
        notification_type: "application",
      };

      const res = await Models.notification.mark_view(body);
      console.log("notification res", res);
    } catch (error) {
      console.log("error", error);
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

      const body: any = {
        position_ids: [state.application?.job_detail?.id],
        department_id: state.selectedDepartments?.value,
        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        panel_ids: state.panelMembers.map((p) => p.value),
        application_ids: [state.application?.id],
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link,
        // ...(state.googleAuthCode && { code: state.googleAuthCode }),
        // google_hr_id:state.profile?.id
      };
      if (!state.google_calendar_connected_at && state.googleAuthCode) {
        body.code = state.googleAuthCode;
      }

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
        googleAuthCode: "",
      });
      sessionStorage.removeItem("interviewFormState");
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

      const body: any = {
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
      if (!state.google_calendar_connected_at && state.googleAuthCode) {
        body.code = state.googleAuthCode;
      }
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
        googleAuthCode: false,
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

  const generateApplicationPrintHTML = (data: any) => {
    const {
      applicant = {},
      application = {},
      job = {},
      qualifications = [],
      experiences = [],
      projects = [],
      publications = [],
      skills = [],
      achievements = [],
      academicResponsibilities = [],
      panelMembers = [],
    } = data;
    console.log("✌️data --->", data);

    const escapeHtml = (value: any) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safe = (value: any) => {
      if (value === null || value === undefined || value === "") {
        return "-";
      }

      return escapeHtml(value);
    };

    const hasValue = (value: any) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      String(value).trim() !== "-";

    const arrayValue = (value: any[]) => {
      if (!value || value.length === 0) {
        return "-";
      }

      return value
        .map((item: any) => safe(item?.name || item?.city || item))
        .join(", ");
    };

    const statusClass = (status: any) => {
      const normalized = String(status || "").toLowerCase();

      if (
        ["approved", "selected", "completed", "joined", "offer released"].some(
          (item) => normalized.includes(item)
        )
      ) {
        return "status-positive";
      }

      if (
        ["rejected", "withdrawn", "declined"].some((item) =>
          normalized.includes(item)
        )
      ) {
        return "status-negative";
      }

      if (
        ["interview", "scheduled", "shortlisted"].some((item) =>
          normalized.includes(item)
        )
      ) {
        return "status-info";
      }

      if (
        ["pending", "review", "hold"].some((item) => normalized.includes(item))
      ) {
        return "status-warning";
      }

      return "status-neutral";
    };

    const sectionTitle = (title: string) => `
      <div class="section-title">
        ${title}
      </div>
    `;

    const infoItem = (label: string, value: any) => `
      <div class="info-item">
        <div class="label">${label}</div>
        <div class="value">${safe(value)}</div>
      </div>
    `;

    const eligibilityItem = (label: string, value: any) => `
      <div class="eligibility-item">
        <div class="label">${label}</div>
        <div class="eligibility-value">${safe(value)}</div>
      </div>
    `;

    const metaPill = (value: any) =>
      hasValue(value) ? `<span class="meta-pill">${safe(value)}</span>` : "";

// Body/content: 10.5px
// Labels: 9px
// Section heading: 14px
// Report title: 20px
// Profile name: 18px
// Card heading: 12px
// Decision: 15px
// Table content: 10px
// Feedback: 10.5px
// Footer: 8.5px

    const feedbackItem = (label: string, value: any, isWide = false) => `
      ${
        hasValue(value)
          ? `
            <div class="feedback-item ${isWide ? "feedback-item-wide" : ""}">
              <div class="feedback-label">${label}</div>
              <div class="feedback-value">${safe(value)}</div>
            </div>
          `
          : ""
      }
    `;

    return `
  <!DOCTYPE html>

  <html>
  <head>

  <meta charset="UTF-8" />

  <title>
    Job Application - ${safe(applicant.name)}
  </title>

  <style>

  @page {
    size: A4;
    margin: 12mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 10.5px;
    line-height: 1.5;
  }

  .print-container {
    width: 100%;
    max-width: 210mm;
    margin: auto;
  }

  /* ================= HEADER ================= */

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding-bottom: 15px;
    margin-bottom: 18px;

    border-bottom: 2px solid #1e3a8a;
  }

  .logo {
    font-size: 25px;
    font-weight: 800;
    color: #111827;
  }

  .logo span {
    color: #1e3a8a;
  }

  .header-right {
    text-align: right;
    font-size: 11px;
    color: #64748b;
  }

  /* ================= TITLE ================= */

  .report-title {
    margin-bottom: 18px;
  }

  .report-title h1 {
    margin: 0;
    font-size: 20px;
    color: #172554;
  }

  .report-title p {
    margin: 3px 0 0;
    color: #64748b;
  }

  /* ================= STATUS ================= */

  .status-box {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    padding: 12px 15px;
    border: 1px solid #dbeafe;
    background: #f8fafc;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .status-label {
    color: #64748b;
  }

  .status-value {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 9px;
    border: 1px solid transparent;
  }

  .status-positive {
    background: #dcfce7;
    color: #166534;
    border-color: #bbf7d0;
  }

  .status-warning {
    background: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }

  .status-negative {
    background: #fee2e2;
    color: #991b1b;
    border-color: #fecaca;
  }

  .status-info {
    background: #dbeafe;
    color: #1e40af;
    border-color: #bfdbfe;
  }

  .status-neutral {
    background: #f1f5f9;
    color: #334155;
    border-color: #e2e8f0;
  }

  /* ================= SECTIONS ================= */

  .section {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;

    color: #172554;

    padding-bottom: 7px;

    margin-bottom: 10px;

    border-bottom: 1px solid #cbd5e1;

    break-after: avoid;
  }

  /* ================= INFO GRID ================= */

  .info-grid {
    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 6px 18px;
  }

  .info-item {
    padding: 5px 0;

    border-bottom: 1px solid #f1f5f9;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .label {
    font-size: 9px;

    color: #64748b;

    margin-bottom: 2px;

    text-transform: uppercase;
  }

  .value {
    font-size: 10.5px;
    font-weight: 500;
    color: #1e293b;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ================= PROFILE ================= */

  .profile-header {
    display: flex;

    gap: 12px;

    padding: 11px;

    background: #f8fafc;

    border: 1px solid #e2e8f0;

    border-radius: 7px;

    margin-bottom: 10px;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .profile-avatar {
    width: 65px;
    height: 65px;

    border-radius: 50%;

    object-fit: cover;

    border: 1px solid #cbd5e1;
  }

  .profile-name {
    font-size: 18px;

    font-weight: 700;

    color: #172554;
  }

  .profile-email {
    color: #64748b;

    margin-top: 2px;
  }

  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .meta-pill {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 999px;
    background: #e0f2fe;
    color: #075985;
    font-size: 9px;
    font-weight: 600;
  }

  .eligibility-grid {
    display: grid;

    grid-template-columns: repeat(3, minmax(0, 1fr));

    gap: 8px;

    margin-top: 8px;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .eligibility-item {
    padding: 7px 9px;

    border: 1px solid #e2e8f0;

    border-radius: 5px;

    background: #f8fafc;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  .eligibility-value {
    color: #172554;

    font-size: 10.5px;

    font-weight: 700;
  }

  /* ================= ABOUT ================= */

  .about-box {
    padding: 12px 14px;

    background: #f8fafc;

    border: 1px solid #e2e8f0;

    border-radius: 6px;

    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ================= TABLE ================= */

  .data-table {
    width: 100%;

    border-collapse: collapse;

    margin-top: 8px;
  }

  .data-table th {
    background: #1e3a8a;

    color: white;

    font-weight: 600;

    text-align: left;

    padding: 8px;

    font-size: 9px;
  }

  .data-table td {
    padding: 8px;

    border: 1px solid #e2e8f0;

    vertical-align: top;

    font-size: 10px;
  }

  .data-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  /* ================= CARDS ================= */

  .card-grid {
    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;
  }

  .card {
    border: 1px solid #e2e8f0;

    border-radius: 6px;

    padding: 11px;

    page-break-inside: avoid;
  }

  .card-title {
    font-size: 12px;

    font-weight: 700;

    color: #172554;

    margin-bottom: 5px;
  }

  .card-subtitle {
    color: #64748b;

    font-size: 9px;

    margin-bottom: 6px;
  }

  .card-description {
    font-size: 10.5px;

    color: #334155;

    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ================= TAGS ================= */

  .tags {
    display: flex;

    flex-wrap: wrap;

    gap: 5px;
  }

  .tag {
    padding: 4px 8px;

    border-radius: 4px;

    background: #eff6ff;

    color: #1e40af;

    font-size: 9px;

    border: 1px solid #dbeafe;
  }

  /* ================= PANEL ================= */

  .panel-card {
    border: 1px solid #e2e8f0;

    border-radius: 7px;

    padding: 14px;

    margin-bottom: 12px;

    background: #ffffff;

    page-break-inside: avoid;
  }

  .panel-card-decision-maker {
    border-color: #86efac;

    background: #f0fdf4;
  }

  .panel-header {
    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    gap: 12px;

    padding-bottom: 10px;

    margin-bottom: 12px;

    border-bottom: 1px solid #e2e8f0;
  }

  .panel-name {
    font-size: 12px;

    font-weight: 700;

    color: #172554;
  }

  .panel-member {
    min-width: 0;
  }

  .panel-role {
    color: #64748b;

    font-size: 9px;

    margin-top: 2px;

    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .rating {
    display: inline-block;

    padding: 3px 8px;

    border-radius: 999px;

    background: #eff6ff;

    border: 1px solid #dbeafe;

    font-weight: 700;

    color: #1e3a8a;

    font-size: 9px;
  }

  .panel-badges {
    display: flex;

    flex-wrap: wrap;

    justify-content: flex-end;

    gap: 6px;
  }

  .decision-maker-badge {
    display: inline-block;

    padding: 3px 8px;

    border-radius: 999px;

    background: #dcfce7;

    border: 1px solid #86efac;

    color: #166534;

    font-size: 9px;

    font-weight: 700;
  }

  .panel-feedback-grid {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 8px;
  }

  .feedback-item {
    min-width: 0;

    padding: 8px 10px;

    background: #f8fafc;

    border: 1px solid #e2e8f0;

    border-radius: 5px;
  }

  .feedback-item-wide {
    grid-column: 1 / -1;
  }

  .feedback-label {
    margin-bottom: 3px;

    color: #64748b;

    font-size: 9px;

    font-weight: 700;

    text-transform: uppercase;
  }

  .feedback-value {
    color: #1e293b;

    font-size: 10.5px;

    font-weight: 600;

    overflow-wrap: anywhere;

    word-break: break-word;
  }

  .feedback {
    padding: 9px;

    background: #f8fafc;

    border-radius: 5px;

    color: #334155;

    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ================= DECISION ================= */

  .decision-box {
    padding: 15px;

    border: 2px solid #cbd5e1;

    border-radius: 7px;

    background: #f8fafc;
  }

  .decision {
    font-size: 15px;

    font-weight: 700;

    color: #172554;

    margin-bottom: 6px;
  }

  .remarks {
    color: #475569;

    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .link-text {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ================= FOOTER ================= */

  .footer {
    margin-top: 14px;

    padding-top: 8px;

    border-top: 1px solid #cbd5e1;

    display: flex;

    justify-content: space-between;

    color: #64748b;

    font-size: 8.5px;

    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ================= PRINT ================= */

  @media print {

    body {
      background: white;
    }

    .no-print {
      display: none !important;
    }

    table {
      page-break-inside: auto;
    }

    tr {
      page-break-inside: avoid;
    }

    thead {
      display: table-header-group;
    }

    .status-box,
    .info-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .eligibility-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .panel-feedback-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

  }

  </style>

  </head>

  <body>

  <div class="print-container">

    <!-- HEADER -->

    <div class="header">

      <div class="logo">
        Faculty<span>Pro</span>
      </div>

      <div class="header-right">
        Job Application Report<br />
        Generated on ${new Date().toLocaleDateString("en-IN")}
      </div>

    </div>


    <!-- TITLE -->

    <div class="report-title">

      <h1>
        Job Application Details
      </h1>

      <p>
        Complete Applicant & Recruitment Report
      </p>

    </div>

     <!-- 3. JOB DETAILS -->

    <div class="section">

      ${sectionTitle("1. Job Details")}

      <div class="info-grid">

        ${infoItem("Job Title", job.title)}
        ${infoItem("Institution", job.institution)}
        ${infoItem("College", job.college)}
        ${infoItem("Department", job.department)}
        ${infoItem("Category", arrayValue(job.categories))}
        ${infoItem("Location", arrayValue(job.locations))}
        ${infoItem("Experience", job.experience)}
        ${infoItem("Qualification", job.qualification)}
        ${infoItem("Salary Range", job.salary_range)}
      
       
        ${infoItem("Immediate Hiring", job.immediate_join ? "Yes" : "No")}

      </div>

    </div>


    <!-- 1. APPLICATION SUMMARY -->

    <div class="section">

      ${sectionTitle("2. Application Summary")}

      <div class="status-box">

        <div>
          <div class="status-label">Application ID</div>
          <strong>${safe(application.id)}</strong>
        </div>

        <div>
          <div class="status-label">Applied Date</div>
          <strong>${safe(application.applied_date)}</strong>
        </div>

        <div>
          <div class="status-label">Status</div>
          <span class="status-value ${statusClass(application.status)}">
            ${safe(application.status)}
          </span>
        </div>

        <div>
          <div class="status-label">Current Stage</div>
          <strong>${safe(application.current_stage)}</strong>
        </div>

      </div>

    </div>


    <!-- 2. APPLICANT SNAPSHOT -->

    <div class="section">

      ${sectionTitle("3. Applicant Snapshot")}

      <div class="profile-header">

        ${
          applicant.profile_image
            ? `
              <img
                src="${safe(applicant.profile_image)}"
                class="profile-avatar"
              />
            `
            : ""
        }

        <div>
          <div class="profile-name">${safe(applicant.name)}</div>
          <div class="profile-email">${safe(applicant.email)}</div>

          <div class="profile-meta">
            ${metaPill(applicant.experience)}
            ${metaPill(applicant.location)}
            
          </div>
        </div>

      </div>

      <div class="info-grid">

        ${infoItem("Email", applicant.email)}
        ${infoItem("Phone", applicant.phone)}
        ${infoItem("Location", applicant.location)}
        ${infoItem("Gender", applicant.gender)}
        ${infoItem("Experience", applicant.experience)}
        ${infoItem("Company", applicant.company)}

      </div>

      <div class="eligibility-grid">
        ${eligibilityItem("PhD Completed", applicant.phd_completed)}
        ${eligibilityItem("NET Cleared", applicant.net_cleared)}
        ${eligibilityItem("SET / SLET Cleared", applicant.set_slet_cleared)}
      </div>

    </div>


   


    <!-- 4. Applicant About -->

    


    <!-- 5. PROFESSIONAL SUMMARY -->

    <div class="section">

      ${sectionTitle("4. Professional Summary")}

      <div class="card">
        <div class="card-title">About Applicant</div>
        <div class="card-description">${safe(applicant.about)}</div>
      </div>

      ${
        academicResponsibilities?.length
          ? `
            <div class="card" style="margin-top: 10px;">
              <div class="card-title">Academic Responsibilities</div>
              <div class="tags">
                ${academicResponsibilities
                  .map(
                    (item: any) => `
                      <span class="tag">
                        ${safe(
                          item?.responsibility_title || item?.title || item
                        )}
                      </span>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `
          : ""
      }

      <div class="card" style="margin-top: 10px;">
        <div class="card-title">Resume</div>
        <div class="info-grid">
          ${infoItem("Resume File Name", applicant.resume_name)}
          <div class="info-item">
            <div class="label">Resume URL</div>
            <div class="value link-text">${safe(applicant.resume_url)}</div>
          </div>
        </div>
      </div>

    </div>


    <!-- 6. ACADEMIC QUALIFICATIONS -->

    <div class="section">

      ${sectionTitle("5. Academic Qualifications")}

      ${
        qualifications.length
          ? `
            <table class="data-table">

              <thead>

                <tr>
                  <th>Degree</th>
                  <th>Institution</th>
                  <th>Specialization</th>
                  <th>Year</th>
                  <th>Percentage / CGPA</th>
                </tr>

              </thead>

              <tbody>

                ${qualifications
                  .map(
                    (item: any) => `
                      <tr>

                        <td>${safe(item.degree)}</td>

                        <td>${safe(item.institution)}</td>

                        <td>${safe(item.specialization)}</td>

                        <td>${safe(item.year)}</td>

                        <td>${safe(item.score)}</td>

                      </tr>
                    `
                  )
                  .join("")}

              </tbody>

            </table>
          `
          : `<div class="about-box">No qualification details available.</div>`
      }

    </div>


    <!-- 7. EXPERIENCE -->

    <div class="section">

      ${sectionTitle("6. Experience")}

      ${
        experiences.length
          ? `
            <div class="card-grid">

              ${experiences
                .map(
                  (item: any) => `
                    <div class="card">

                      <div class="card-title">
                        ${safe(item.designation)}
                      </div>

                      <div class="card-subtitle">
                        ${safe(item.company)}
                        |
                        ${safe(item.duration)}
                      </div>

                      <div class="card-description">
                        ${safe(item.description)}
                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
          : `<div class="about-box">No experience details available.</div>`
      }

    </div>


    ${
      skills?.length
        ? `
    <!-- 8. SKILLS -->

    <div class="section">

      ${sectionTitle("7. Skills")}

      <div class="tags">

        ${skills
          .map(
            (skill: any) => `
                    <span class="tag">
                      ${safe(skill?.name || skill)}
                    </span>
                  `
          )
          .join("")}

      </div>

    </div>
        `
        : ""
    }


    ${
      projects.length
        ? `
    <!-- 9. PROJECTS -->

    <div class="section">

      ${sectionTitle("8. Projects")}

            <div class="card-grid">

              ${projects
                .map(
                  (item: any) => `
                    <div class="card">

                      <div class="card-title">
                        ${safe(item.title)}
                      </div>

                      <div class="card-description">
                        ${safe(item.description)}
                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>

    </div>
        `
        : ""
    }


    ${
      publications.length
        ? `
    <!-- 10. PUBLICATIONS -->

    <div class="section">

      ${sectionTitle("9. Publications")}

            <table class="data-table">

              <thead>

                <tr>
                  <th>Title</th>
                  <th>Journal / Conference</th>
                  <th>Year</th>
                  <th>Link</th>
                </tr>

              </thead>

              <tbody>

                ${publications
                  .map(
                    (item: any) => `
                      <tr>

                        <td>${safe(item.title)}</td>

                        <td>${safe(item.publisher)}</td>

                        <td>${safe(item.year)}</td>

                        <td>${safe(item.url)}</td>

                      </tr>
                    `
                  )
                  .join("")}

              </tbody>

            </table>

    </div>
        `
        : ""
    }


    ${
      achievements.length
        ? `
    <!-- 11. ACHIEVEMENTS -->

    <div class="section">

      ${sectionTitle("10. Achievements")}

            <div class="card-grid">

              ${achievements
                .map(
                  (item: any) => `
                    <div class="card">

                      <div class="card-title">
                        ${safe(item.title)}
                      </div>

                      <div class="card-description">
                        ${safe(item.description)}
                      </div>

                    </div>
                  `
                )
                .join("")}

            </div>

    </div>
        `
        : ""
    }


    


    <!-- 13. PANEL FEEDBACK -->

    <div class="section">

      ${sectionTitle("11. Panel Member Feedback")}

      ${
        panelMembers.length
          ? panelMembers
              .map(
                (panel: any) => `
                  <div class="panel-card ${
                    panel.decision_maker ? "panel-card-decision-maker" : ""
                  }">

                    <div class="panel-header">

                      <div class="panel-member">

                        <div class="panel-name">
                          ${safe(panel.name)}
                        </div>

                        <div class="panel-role">
                          ${safe(panel.role)}
                        </div>

                      </div>

                      <div class="panel-badges">
                        ${
                          panel.decision_maker
                            ? `<div class="decision-maker-badge">Decision Maker</div>`
                            : ""
                        }
                        ${
                          panel.rating
                            ? `<div class="rating">${safe(panel.rating)}</div>`
                            : ""
                        }
                      </div>
                    </div>

                    <div class="panel-feedback-grid">
                      ${feedbackItem(
                        "Knowledge Rating",
                        panel.knowledge_rating
                      )}
                      ${feedbackItem(
                        "Knowledge Detail",
                        panel.knowledge_detail
                      )}
                      ${feedbackItem(
                        "Communication Rating",
                        panel.communication_skills_rating
                      )}
                      ${feedbackItem(
                        "Communication Comment",
                        panel.communication_skills_comment
                      )}
                      ${feedbackItem("Attitude Rating", panel.attitude_rating)}
                      ${feedbackItem(
                        "Attitude Comment",
                        panel.attitude_comment
                      )}
                      ${feedbackItem(
                        "Overall Assessment",
                        panel.overall_assessment_rating
                      )}
                      ${feedbackItem(
                        "Overall Remark",
                        panel.overall_assessment_remark
                      )}
                      ${feedbackItem(
                        "Position Recommendation",
                        panel.position_recommendation
                      )}
                      ${feedbackItem(
                        "Recommendation Comment",
                        panel.recommendation_comments,
                        true
                      )}
                    </div>

                  </div>
                `
              )
              .join("")
          : `<div class="about-box">No panel feedback available.</div>`
      }

    </div>


   


    <!-- FOOTER -->

    <div class="footer">

      <div>
        FacultyPro
      </div>

      <div>
        Confidential - Job Application Report
      </div>

      <div>
        Printed on ${new Date().toLocaleDateString("en-IN")}
      </div>

    </div>

  </div>

  </body>

  </html>
  `;
  };

  const buildApplicationPrintData = (
    applicationDetail: any,
    applicantProfile?: any
  ) => {
    const jobDetail = applicationDetail?.job_detail || {};
    const profileData = applicantProfile || {};
    const fullName =
      profileData?.username ||
      [profileData?.first_name, profileData?.last_name]
        .filter(Boolean)
        .join(" ") ||
      applicationDetail?.applicant_name ||
      [applicationDetail?.first_name, applicationDetail?.last_name]
        .filter(Boolean)
        .join(" ");
    const formatDate = (value: any, format = "DD/MM/YYYY") =>
      value && moment(value).isValid() ? moment(value).format(format) : value;
    const getName = (item: any) =>
      item?.name ||
      item?.title ||
      item?.label ||
      item?.category_name ||
      item?.location_name ||
      item?.department_name ||
      item?.short_name ||
      item?.city ||
      item;
    const mapNames = (value: any) =>
      Array.isArray(value) ? value.map(getName).filter(Boolean) : [];
    const fileNameFromUrl = (url: string) => {
      if (!url) return "";
      const cleanUrl = url.split("?")[0];
      return decodeURIComponent(cleanUrl.split("/").pop() || "Resume");
    };
    const yesNo = (value: any) => (value ? "Yes" : "No");
    const departments = applicationDetail?.department_details?.length
      ? applicationDetail.department_details
      : applicationDetail?.department
      ? [applicationDetail.department]
      : [];
    const educationList =
      profileData?.educations || applicationDetail?.educations || [];
    const experienceList =
      profileData?.experiences || applicationDetail?.experiences || [];
    const projectList =
      profileData?.projects || applicationDetail?.projects || [];
    const publicationList =
      profileData?.publications || applicationDetail?.publications || [];
    const achievementList =
      profileData?.achievements || applicationDetail?.achievements || [];
    const skillList = profileData?.skills || applicationDetail?.skills || [];
    const responsibilityList =
      profileData?.additional_academic_responsibilities ||
      applicationDetail?.additional_academic_responsibilities ||
      [];
    const interviewSlots = applicationDetail?.interview_slots || [];
    const latestInterviewRound = interviewSlots.length
      ? interviewSlots[interviewSlots.length - 1]
      : null;
    const panelFeedback = interviewSlots.flatMap((round: any) =>
      (round?.panels || []).map((panel: any) => {
        const feedback = panel?.feedbacks?.[0] || {};
        return {
          name: panel?.name,
          decision_maker: panel?.decision_maker,
          role: [
            round?.round_name,
            panel?.designation,
            panel?.department?.department_name,
          ]
            .filter(Boolean)
            .join(" | "),
          rating:
            feedback?.overall_assessment_rating ||
            panel?.score ||
            feedback?.knowledge_rating,
          knowledge_rating: feedback?.knowledge_rating,
          knowledge_detail: feedback?.knowledge_detail,
          communication_skills_rating: feedback?.communication_skills_rating,
          communication_skills_comment:
            feedback?.communication_skills_comment,
          attitude_rating: feedback?.attitude_rating,
          attitude_comment: feedback?.attitude_comment,
          overall_assessment_rating: feedback?.overall_assessment_rating,
          overall_assessment_remark: feedback?.overall_assessment_remark,
          position_recommendation: feedback?.position_recommendation,
          recommendation_comments: feedback?.recommendation_comments,
          feedback:
            feedback?.overall_assessment_remark ||
            feedback?.recommendation_comments ||
            feedback?.knowledge_detail ||
            feedback?.academic_record_remark ||
            "No feedback submitted.",
        };
      })
    );

    return {
      applicant: {
        name: fullName,
        email: profileData?.email || applicationDetail?.email,
        phone: profileData?.phone || applicationDetail?.phone,
        location:
          profileData?.current_location ||
          profileData?.location ||
          applicationDetail?.current_location,
        gender: profileData?.gender || applicationDetail?.gender,
        experience: profileData?.experience || applicationDetail?.experience,
        company:
          profileData?.current_company || applicationDetail?.current_company,
        about:
          profileData?.about ||
          profileData?.profile_summary ||
          applicationDetail?.message,
        profile_image:
          profileData?.profile_logo_url ||
          profileData?.profile_image ||
          applicationDetail?.profile_logo_url,
        resume_name: fileNameFromUrl(
          profileData?.resume_url || applicationDetail?.resume
        ),
        resume_url: profileData?.resume_url || applicationDetail?.resume,
        qualification:
          profileData?.highest_qualification ||
          applicationDetail?.qualification ||
          jobDetail?.qualification,
        phd_completed: yesNo(profileData?.phd_completed),
        net_cleared: yesNo(profileData?.net_cleared),
        set_slet_cleared:
          profileData?.set_cleared || profileData?.slet_cleared ? "Yes" : "No",
      },
      application: {
        id: applicationDetail?.id,
        applied_date: formatDate(applicationDetail?.applied_date),
        status:
          applicationDetail?.application_status?.name ||
          applicationDetail?.status_display ||
          applicationDetail?.status,
        current_stage:
          applicationDetail?.current_stage || latestInterviewRound?.round_name,
        source: applicationDetail?.source || "FacultyPro",
        expected_salary: applicationDetail?.expected_salary,
        notice_period: applicationDetail?.notice_period,
        final_decision:
          applicationDetail?.final_decision ||
          applicationDetail?.status_display ||
          applicationDetail?.status,
        final_remarks: applicationDetail?.final_remarks,
        decision_date:
          formatDate(applicationDetail?.decision_date) ||
          formatDate(applicationDetail?.final_decision_date),
        decision_by:
          applicationDetail?.decision_by?.name ||
          applicationDetail?.decision_by?.username ||
          applicationDetail?.decision_by ||
          applicationDetail?.final_decision_by?.name ||
          applicationDetail?.final_decision_by?.username ||
          applicationDetail?.final_decision_by,
        cover_letter: applicationDetail?.message,
        interview_rounds: interviewSlots.length,
      },
      job: {
        title: jobDetail?.job_title,
        role: jobDetail?.short_title || jobDetail?.job_short_title,
        institution:
          jobDetail?.institution?.name ||
          jobDetail?.institution_name ||
          applicationDetail?.institution_name,
        college:
          jobDetail?.college?.name ||
          jobDetail?.college_name ||
          applicationDetail?.college_name,
        department: mapNames(departments).join(", "),
        job_type: jobDetail?.job_type,
        categories: mapNames(jobDetail?.categories),
        locations: mapNames(jobDetail?.locations),
        experience: jobDetail?.experiences?.name,
        qualification: jobDetail?.qualification,
        salary_range: jobDetail?.salary_range,
        last_date: formatDate(jobDetail?.last_date),
        urgency: jobDetail?.priority,
        immediate_join:
          jobDetail?.immediate_joining || jobDetail?.immediate_join,
        description: jobDetail?.job_description || jobDetail?.description,
      },
      qualifications: educationList.map((edu: any) => ({
        degree: edu?.degree,
        institution: edu?.institution,
        specialization: edu?.field || edu?.specialization,
        year: [edu?.start_year, edu?.end_year].filter(Boolean).join(" - "),
        score: edu?.cgpa || edu?.percentage || edu?.score,
      })),
      experiences: experienceList.map((exp: any) => ({
        designation: exp?.designation,
        company: exp?.company,
        duration:
          exp?.duration ||
          [
            formatDate(exp?.start_date, "MMM YYYY"),
            exp?.currently_working
              ? "Present"
              : formatDate(exp?.end_date, "MMM YYYY"),
          ]
            .filter(Boolean)
            .join(" - "),
        description: exp?.job_description || exp?.description,
      })),
      skills: skillList,
      academicResponsibilities: responsibilityList,
      projects: projectList.map((project: any) => ({
        title: project?.project_title || project?.title,
        description: [
          project?.project_description || project?.description,
          project?.technologies?.length
            ? `Technologies: ${project.technologies.join(", ")}`
            : "",
          project?.link ? `Link: ${project.link}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      })),
      publications: publicationList.map((publication: any) => ({
        title: publication?.publication_title || publication?.title,
        publisher:
          publication?.publication_journal ||
          publication?.publisher ||
          publication?.journal,
        year: publication?.publication_year || publication?.year,
        url: publication?.publication_url || publication?.url,
      })),
      achievements: achievementList.map((achievement: any) => ({
        title: achievement?.achievement_title || achievement?.title,
        description:
          achievement?.achievement_description ||
          achievement?.description ||
          achievement?.organization,
      })),
      panelMembers: panelFeedback,
    };
  };

  const handlePrintApplication = async () => {
    let applicantProfile = state.userProfile;

    // if (!applicantProfile && state.application?.applicant) {
    try {
      applicantProfile = await Models.auth.getUser(state.application.applicant);
      setState({ userProfile: applicantProfile });
    } catch (error) {
      console.error("Error fetching applicant profile for print:", error);
    }
    // }

    const html = generateApplicationPrintHTML(
      buildApplicationPrintData(state.application, applicantProfile)
    );

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    printFrame.style.visibility = "hidden";

    document.body.appendChild(printFrame);

    const frameWindow = printFrame.contentWindow;
    const frameDocument =
      printFrame.contentDocument || frameWindow?.document || null;

    if (!frameWindow || !frameDocument) {
      document.body.removeChild(printFrame);
      return;
    }

    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();

    printFrame.onload = () => {
      frameWindow.focus();
      frameWindow.print();

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
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

        

          <button
                                onClick={handlePrintApplication}

                      className="tour-detail-view-profile"
                    >
                      <div className="bg-dblue group flex cursor-pointer items-center gap-3 rounded-lg px-6 py-2 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl">
                        <Printer className="h-4 w-4 text-white" />
                        <p className=" text-white">Print Application</p>
                      </div>
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
            <div className="tour-detail-applicant rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
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
                    <button
                      onClick={() => getUser()}
                      className="tour-detail-view-profile"
                    >
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
            <div className=" tour-detail-rounds flex items-center justify-between">
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
              {state.profile?.role == ROLES.HR &&
                app?.status_display !== "Rejected" && (
                  <div className=" flex items-center justify-end">
                    <button
                      onClick={() => setState({ showInterviewModal: true })}
                      className="tour-detail-schedule bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
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
              <div className="tour-detail-rounds-list dark:border-gray-700">
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
                                round.scheduled_time
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
                                    {panel?.decision_maker && (
                                      <div
                                        className={`cursor-pointer rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 shadow-sm outline-none `}
                                      >
                                        Descision Maker
                                      </div>
                                    )}
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

            <div className="tour-detail-job rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
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
                {/* <div className="flex items-start gap-3">
                  <Users className="text-dyellow mt-1 h-5 w-5" />
                  <div>
                    <p className="text-xs text-gray-500">Openings</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {job?.number_of_openings || "N/A"}
                    </p>
                  </div>
                </div> */}
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
              <div className="tour-detail-status rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 text-xl text-gray-800 dark:text-white">
                  Application Status
                </h4>
                <span
                  className={`mb-4 inline-block rounded-full px-3 py-1 text-sm shadow-sm ${getStatusColor(
                    app?.status
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
                    className="tour-detail-resume bg-dblue flex w-full items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
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
            googleAuthCode: "",
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
                  (item: any) => ({ value: item?.id, label: item?.short_name })
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
              <div>
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
                    className="pt-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {/* Request for Change */}
                    Request the candidate to change the interview slot
                  </label>
                </div>
                {!state.profile?.google_calendar_connected_at && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="connectGoogleCalendar"
                      checked={!!state.googleAuthCode}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Save current form state before redirect
                          sessionStorage.setItem(
                            "interviewFormState",
                            JSON.stringify({
                              selectedDepartments: state.selectedDepartments,
                              panelMembers: state.panelMembers,
                              interviewSlot: state.interviewSlot,
                              roundName: state.roundName,
                              requestForChange: state.requestForChange,
                              interview_link: state.interview_link,
                            })
                          );
                          const url = new URL(window.location.href);
                          url.searchParams.delete("code");
                          const redirectUri = url.toString();
                          const googleAuthUrl =
                            `https://accounts.google.com/o/oauth2/v2/auth?` +
                            `client_id=${CALENDAR_CLIENT_ID}&` +
                            `redirect_uri=https://user-service.88.222.213.249.nip.io/auth/google/callback&` +
                            `response_type=code&` +
                            `scope=${encodeURIComponent(
                              "https://www.googleapis.com/auth/calendar.events"
                            )}&` +
                            `access_type=offline&` +
                            `prompt=consent&` +
                            `state=${encodeURIComponent(redirectUri)}`;
                          window.location.href = googleAuthUrl;
                        } else {
                          setState({ googleAuthCode: "" });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="connectGoogleCalendar"
                      className="pt-2  text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {`Connect Google Calendar (Optional)`}

                      {state.googleAuthCode && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ Connected
                        </span>
                      )}
                    </label>
                  </div>
                )}
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
                    googleAuthCode: "",
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
                  (item: any) => ({ value: item?.id, label: item?.short_name })
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
              <div>
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
                    className="pt-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Request the candidate to change the interview slot
                  </label>
                </div>
                {!state.profile?.google_calendar_connected_at && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="connectGoogleCalendar"
                      checked={!!state.googleAuthCode}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Save current form state before redirect
                          sessionStorage.setItem(
                            "interviewFormState",
                            JSON.stringify({
                              selectedDepartments: state.selectedDepartments,
                              panelMembers: state.panelMembers,
                              interviewSlot: state.interviewSlot,
                              roundName: state.roundName,
                              requestForChange: state.requestForChange,
                              interview_link: state.interview_link,
                            })
                          );
                          const url = new URL(window.location.href);
                          url.searchParams.delete("code");
                          const redirectUri = url.toString();
                          const googleAuthUrl =
                            `https://accounts.google.com/o/oauth2/v2/auth?` +
                            `client_id=${CALENDAR_CLIENT_ID}&` +
                            `redirect_uri=https://user-service.88.222.213.249.nip.io/auth/google/callback&` +
                            `response_type=code&` +
                            `scope=${encodeURIComponent(
                              "https://www.googleapis.com/auth/calendar.events"
                            )}&` +
                            `access_type=offline&` +
                            `prompt=consent&` +
                            `state=${encodeURIComponent(redirectUri)}`;
                          window.location.href = googleAuthUrl;
                        } else {
                          setState({ googleAuthCode: "" });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="connectGoogleCalendar"
                      className="pt-2  text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {`Connect Google Calendar (Optional)`}

                      {state.googleAuthCode && (
                        <span className="ml-2 text-xs text-green-600">
                          ✓ Connected
                        </span>
                      )}
                    </label>
                  </div>
                )}
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
              <div className="h-50 flex items-center justify-center">
                <IconLoader className="text-dblue h-8 w-8 animate-spin" />
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
                        <FileText className="text-dblue h-4 w-4 shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Resume
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">
                          ·
                        </span>
                        <a
                          href={u.resume_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-dblue flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
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
                        {
                          icon: <Mail className="h-4 w-4 text-blue-500" />,
                          label: "Email",
                          val: u?.email,
                        },
                        {
                          icon: <Phone className="h-4 w-4 text-green-500" />,
                          label: "Phone",
                          val: u?.phone,
                        },
                        {
                          icon: <MapPin className="h-4 w-4 text-red-500" />,
                          label: "Location",
                          val: u?.current_location,
                        },
                        {
                          icon: (
                            <Briefcase className="h-4 w-4 text-purple-500" />
                          ),
                          label: "Experience",
                          val: u?.experience,
                        },
                        {
                          icon: (
                            <Building className="h-4 w-4 text-orange-500" />
                          ),
                          label: "Company",
                          val: u?.current_company,
                        },
                        {
                          icon: <User className="h-4 w-4 text-indigo-500" />,
                          label: "Gender",
                          val: u?.gender,
                        },
                      ].map((item, i) =>
                        item.val ? (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40"
                          >
                            {item.icon}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                              </p>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {item.val}
                              </p>
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
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Academic Responsibilities
                    </h3>
                    {u?.additional_academic_responsibilities?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.additional_academic_responsibilities.map(
                          (resp: any, i: number) => (
                            <span
                              key={i}
                              className="bg-dblue  rounded-full px-3 py-1 text-sm font-medium text-white"
                            >
                              {resp.responsibility_title}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No academic responsibilities listed.
                      </p>
                    )}
                  </div>
                );

              case "experience":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Experience
                    </h3>
                    {u?.experiences?.length ? (
                      u.experiences.map((exp: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {exp.designation}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exp.company}
                              </p>
                            </div>
                            {/* {exp.currently_working && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Current
                            </span>
                          )} */}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {exp.start_date
                              ? moment(exp.start_date).format("MMM YYYY")
                              : ""}{" "}
                            {exp.end_date
                              ? `– ${moment(exp.end_date).format("MMM YYYY")}`
                              : exp.currently_working
                              ? "– Present"
                              : ""}
                          </p>
                          {exp.job_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {exp.job_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No experience records.
                      </p>
                    )}
                  </div>
                );

              case "education":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Education
                    </h3>
                    {u?.educations?.length ? (
                      u.educations.map((edu: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {edu.degree}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.field}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>
                              {edu.start_year} – {edu.end_year}
                            </span>
                            {edu.cgpa && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                                CGPA: {edu.cgpa}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No education records.
                      </p>
                    )}
                  </div>
                );

              case "projects":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Projects
                    </h3>
                    {u?.projects?.length ? (
                      u.projects.map((proj: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {proj.project_title}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                proj.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {proj.status}
                            </span>
                          </div>
                          {proj.duration && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {proj.duration}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {proj.project_description}
                          </p>
                          {proj.technologies?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {proj.technologies.map(
                                (tech: string, j: number) => (
                                  <span
                                    key={j}
                                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    {tech}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> {proj.link}
                            </a>
                          )}
                          {proj.funded && proj.funding_details && (
                            <p className="mt-1 text-xs text-gray-500">
                              Funded: {proj.funding_details}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No projects.</p>
                    )}
                  </div>
                );

              case "publications":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Publications
                    </h3>
                    {u?.publications?.length ? (
                      u.publications.map((pub: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {pub.publication_title}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {pub.publication_journal}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                            {pub.publication_year && (
                              <span>Year: {pub.publication_year}</span>
                            )}
                            {pub.publication_volume && (
                              <span>Vol: {pub.publication_volume}</span>
                            )}
                            {pub.publication_issue && (
                              <span>Issue: {pub.publication_issue}</span>
                            )}
                          </div>
                          {pub.publication_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {pub.publication_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No publications.</p>
                    )}
                  </div>
                );

              case "skills":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Skills
                    </h3>
                    {u?.skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.skills.map((skill: any, i: number) => (
                          <span
                            key={i}
                            className="bg-dblue  rounded-full px-3 py-1 text-sm font-medium text-white"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No skills listed.</p>
                    )}
                  </div>
                );

              case "achievements":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Achievements
                    </h3>
                    {u?.achievements?.length ? (
                      u.achievements.map((ach: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {ach.achievement_title}
                            </p>
                            {ach.achievement_file_url && (
                              <a
                                href={ach.achievement_file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-dblue flex items-center gap-1 text-xs hover:underline"
                              >
                                <ExternalLink className="text-dblue h-3 w-3" />{" "}
                                View
                              </a>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {ach.organization}
                          </p>
                          {ach.achievement_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {ach.achievement_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No achievements.</p>
                    )}
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
                    <img
                      src={u.profile_logo_url}
                      alt={u.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white ">
                      {u?.first_name?.[0]}
                      {u?.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {u?.username || `${u?.first_name} ${u?.last_name}`}
                  </p>
                  {u?.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {u.email}
                    </p>
                  )}
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
                        ? "text-dblue border-b-2 border-blue-600"
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
                        onClick={() =>
                          setState({ profileActiveSection: item.key })
                        }
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
                      {
                        label: "PhD Completed",
                        key: "phd_completed",
                        icon: <GraduationCap className="h-5 w-5" />,
                      },
                      {
                        label: "NET Cleared",
                        key: "net_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                      {
                        label: "SET Cleared",
                        key: "set_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                      {
                        label: "SLET Cleared",
                        key: "slet_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                    ].map((q) => (
                      <div
                        key={q.key}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-2 ${
                          u?.[q.key]
                            ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                      >
                        <div
                          className={
                            u?.[q.key]
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-400"
                          }
                        >
                          {q.icon}
                        </div>
                        <p
                          className={`text-center text-sm font-medium ${
                            u?.[q.key]
                              ? "text-green-700 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {q.label}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            u?.[q.key]
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
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
