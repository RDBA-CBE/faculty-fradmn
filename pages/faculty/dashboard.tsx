import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { setPageTitle } from "@/store/themeConfigSlice";
import dynamic from "next/dynamic";

import Models from "@/imports/models.import";
import {
  FRONTEND_URL,
  PREFERENCES,
  ROLES,
  STATUS_COLOR,
} from "@/utils/constant.utils";
import CustomeDatePicker from "@/components/datePicker";
import moment from "moment";
import IconBriefcase from "@/components/Icon/IconBolt";
import IconUsers from "@/components/Icon/IconUsers";
import IconUser from "@/components/Icon/IconUser";
import IconCalendar from "@/components/Icon/IconCalendar";
import IconChecks from "@/components/Icon/IconChecks";
import Funnel from "@/components/funnelChart";
import PrivateRouter from "@/hook/privateRouter";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  Failure,
  formatScheduleDateTime,
  showDeleteAlert,
  Success,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Pagination from "@/components/pagination/pagination";
import {
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  X,
  ExternalLink,
  GraduationCap,
  Hourglass,
  MapPin,
  UserPlus,
  User,
  Building,
  Briefcase,
  Phone,
  Mail,
  FileText,
  Send,
  UserCheck,
  Award,
} from "lucide-react";
import IconEye from "@/components/Icon/IconEye";
import IconLoader from "@/components/Icon/IconLoader";
import { DataTable } from "mantine-datatable";
import TextInput from "@/components/FormFields/TextInput.component";
import IconSearch from "@/components/Icon/IconSearch";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import useDebounce from "@/hook/useDebounce";
import IconEdit from "@/components/Icon/IconEdit";
import IconTrash from "@/components/Icon/IconTrash";
import Modal from "@/components/modal/modal.component";
import Swal from "sweetalert2";
import IconHistory from "@/components/Icon/IconHistory";
import TextArea from "@/components/FormFields/TextArea.component";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import IconPlus from "@/components/Icon/IconPlus";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const profileRef = useRef(null);
  const applicationStatusesRef = useRef<any[]>([]);

  const isDark = useSelector(
    (state: IRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode,
  );

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activePeriod, setActivePeriod] = useState("6m");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const isInitialMount = useRef(true);

  const [stats, setStats] = useState<any>({});

  const [state, setState] = useSetState({
    selectedRecords: [],
    activeCard: null,
    isOpenRound: false,
    showStatusModal: false,
    isOpenInterest: false,
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
    refFilter: [],
    cards: [],
    cardTableData: [],
    cardTableCount: 0,
    cardTableLoading: false,
    cardTablePage: 1,
    cardSearch: "",

    academicResponsibilityFilter: null,
    academicResponsibilityList: [],
    academicResponsibilityLoading: false,
    profileUserLoading: false,
    isOpenProfile: false,
    userProfile: null,
    profileActiveTab: "profile",
    profileActiveSection: "summary",
    isOpenInteresteds: false,

    // Overdue Follow-ups table
    overdueFollowups: [],
    overdueFollowupsLoading: false,
    overdueFollowupsTotal: 0,
    overdueFollowupsCount: 0,
    overdueFollowupsPage: 1,

    // Days to Fill Variance table
    daysToFillVariance: [],
    daysToFillVarianceLoading: false,
    daysToFillVarianceTotal: 0,
    daysToFillVarianceCount: 0,
    daysToFillVariancePage: 1,

    // Dashboard college filter
    dashboardCollegeFilter: null,
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Faculty Pro - Dashboard"));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    // fetchDashboard();
    profiles();
    applicationStatus();
    master_department();
  }, []);

  useEffect(() => {
    if (state.activeCard == 2) {
      applicationStatusList();
    }
    setState({
      search: "",
      sortBy: "",
      end_date: "",
      start_date: "",
      departmentFilter: "",
      collegeFilter: "",
    });
  }, [state.activeCard]);

  useEffect(() => {
    // Skip the very first render — profiles() handles the initial fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (activePeriod !== "custom") {
      setFromDate(null);
      setToDate(null);
      setState({ activeCard: null });
      fetchDashboard({ period: activePeriod }, state.profile);
    }
  }, [activePeriod]);

  useEffect(() => {
    if (fromDate && toDate) {
      setActivePeriod("custom");
      setState({ activeCard: null });
      fetchDashboard(
        {
          from: moment(fromDate).format("YYYY-MM-DD"),
          to: moment(toDate).format("YYYY-MM-DD"),
        },
        state.profile,
      );
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (profileRef.current) {
      if (
        state.activeCard === 1 ||
        state.activeCard === 2 ||
        state.activeCard === 3
      ) {
        callListByRole(1, fetchCardApplications);
      } else if (state.activeCard === 4) {
        callListByRole(1, userList);
      } else if (state.activeCard === 5) {
        callListByRole(1, jobList);
      }
    }
  }, [
    debounceSearch,
    state.selectedStatus,
    state.sortBy,
    state.institutionFilter,
    state.collegeFilter,
    state.departmentFilter,
    state.start_date,
    state.end_date,
    state.locationFilter,
    state.categoryFilter,
    state.priorityFilter,
    state.typeFilter,
    state.salaryFilter,
    state.refFilter,
    // state.activeCard,
  ]);

  useEffect(() => {
    if (state.activeCard === null) return;
    if (CARD_FETCH_MAP[state.activeCard]) {
      setState({ cardTableData: [], cardTablePage: 1, cardSearch: "" });
      CARD_FETCH_MAP[state.activeCard](1);
    }
  }, [state.activeCard, state.dashboardCollegeFilter]);

  const debounceCardSearch = useDebounce(state.cardSearch, 500);

  useEffect(() => {
    if (state.activeCard === null) return;
    if (CARD_FETCH_MAP[state.activeCard]) {
      CARD_FETCH_MAP[state.activeCard](state.cardTablePage);
    }
  }, [debounceCardSearch, state.cardTablePage]);

  // useEffect(() => {
  //   fetchDashboard();
  //   cards(state.profile?.role);
  // }, [state.profile]);

  const profiles = async () => {
    console.log("✌️profiles --->");
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      fetchDashboard({ period: activePeriod }, res);
      profileRef.current = true;
      if (res?.role == ROLES.SUPER_ADMIN) {
        collegeDropdownList(1, "", false, "", res.id);
        institutionDropdownList(1, "", false);
      } else if (res?.role == ROLES.INSTITUTION_ADMIN) {
        collegeDropdownList(1, "", false, res?.institution?.id, res.id);
      } else if (res?.role == ROLES.HR || res?.role == ROLES.HOD) {
        const dropdown = (res?.college ?? []).map((c: any) => ({
          value: c.college_id,
          label: c.short_name,
        }));
        setState({ collegeList: dropdown });
      }

      // List based on activeCard
      const colleges = res?.college?.map((c: any) => c.college_id);
      const instId = res?.institution?.id;
      const deptId = res?.department?.department_id;
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const cards = (role, tc: any) => {
    const CARDS: any[] = [
      {
        id: 1,
        label: "Total Applications",
        value: tc?.applications?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUsers className="h-7 w-7 text-[#324ca5]" />,
        clickable: tc?.applications?.clickable,
      },
      {
        id: 7,
        label: "Applications Awaiting Review",
        value: tc?.awaiting_review?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUsers className="h-7 w-7 text-purple-600" />,
        clickable: tc?.awaiting_review?.clickable,
      },
      {
        id: 4,
        label: "Active Jobs",
        value: tc?.approved_jobs?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconChecks className="h-7 w-7 text-green-700" />,
        clickable: tc?.approved_jobs?.clickable,
      },
      {
        id: 5,
        label: "Pending Jobs",
        value: tc?.pending_approvals?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconCalendar className="h-7 w-7 text-yellow-600" />,
        clickable: tc?.pending_approvals?.clickable,
      },
      {
        id: 2,
        label: "Interview Scheduled",
        value: tc?.interview_scheduled?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUsers className="h-7 w-7 text-[#5f16ff]" />,
        clickable: tc?.interview_scheduled?.clickable,
      },
      {
        id: 13,
        label: "Reschedule Request",
        value: tc?.interview_rescheduled?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconCalendar className="h-7 w-7 text-amber-600" />,
        clickable: tc?.interview_rescheduled?.clickable,
      },
      {
        id: 6,
        label: "Selected Applications",
        value: tc?.decisions?.selected ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconChecks className="h-7 w-7 text-green-600" />,
        clickable: tc?.decisions?.clickable,
      },
      {
        id: 10,
        label: "Rejected Applications",
        value: tc?.rejected_applications?.value ?? 0,
        color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUser className="h-7 w-7 text-red-600" />,
        clickable: tc?.rejected_applications?.clickable,
      },
      {
        id: 8,
        label: "Active Panel Members",
        value: tc?.active_panel_members?.value ?? 0,
       color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUsers className="h-7 w-7 text-indigo-600" />,
        clickable: tc?.active_panel_members?.clickable,
      },
      {
        id: 14,
        label: "Talents Identified",
        value: tc?.find_right_talents?.value ?? 0,
       color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconUser className="h-7 w-7 text-cyan-600" />,
        clickable: tc?.find_right_talents?.clickable,
      },
      // {
      //   id: 11,
      //   label: "Outreached",
      //   value: tc?.outreached?.value ?? 0,
      //   color: "text-pink-600",
      //   bg: "bg-white/70",
      //   mainbg: "bg-pink-100",
      //   borderColor: "border-pink-400",
      //   ringColor: "ring-pink-400",
      //   icon: <IconUser className="h-7 w-7 text-pink-600" />,
      //   clickable: tc?.outreached?.clickable,
      // },
      // {
      //   id: 9,
      //   label: "Talents Identified",
      //   value: tc?.talents_identified?.value ?? 0,
      //   color: "text-teal-600",
      //   bg: "bg-white/70",
      //   mainbg: "bg-teal-100",
      //   borderColor: "border-teal-400",
      //   ringColor: "ring-teal-400",
      //   icon: <IconUser className="h-7 w-7 text-teal-600" />,
      //   clickable: tc?.talents_identified?.clickable,
      // },
     
      // {
      //   id: 15,
      //   label: "Interest Sent",
      //   value: tc?.total_interest_sent?.value ?? 0,
      //   color: "text-blue-500",
      //   bg: "bg-white/70",
      //   mainbg: "bg-blue-50",
      //   borderColor: "border-blue-300",
      //   ringColor: "ring-blue-300",
      //   icon: <IconUsers className="h-7 w-7 text-blue-500" />,
      //   clickable: tc?.total_interest_sent?.clickable,
      // },
      {
        id: 16,
        label: "Avg Days to Schedule",
        value:
          tc?.avg_days_to_schedule_interview?.value != null
            ? Number(tc.avg_days_to_schedule_interview.value).toFixed(1)
            : "—",
       color: "text-dblue",
        bg: "bg-[#f4f9ff]",
        mainbg: "bg-[#f4f9ff]",
        accentColor: "#324ca5",
        icon: <IconCalendar className="h-7 w-7 text-orange-600" />,
        clickable: false,
      },
    ];
    setState({ cards: CARDS });
  };

  const userList = async (page, ins = null, college = null, dept = null) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      console.log("✌️body --->", body);
      body.role = ROLES.APPLICANT;
      body.active_job_seeker = "Yes";
      body.reveal_name = "Yes";
      // body.reveal_name = "Yes";

      // if (ins) {
      //   body.institution_id = ins;
      // }
      // if (college) {
      //   body.college_id = college;
      // }
      // if (dept) {
      //   body.department_id = dept;
      // }
      const res: any = await Models.auth.userList(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        // username: item?.username,
        username:
          item?.first_name && item?.last_name
            ? `${item.first_name} ${item.last_name}`
            : item?.username || "",
        email: item?.email,
        phone: item?.phone,
        department: item?.department?.name,
        position: item?.position,
        qualification: item?.education_qualification,
        experience: item?.experience,
        status: item?.status,
        college: item?.colleges?.map((item) => item?.name),
        institution: item?.institution?.name,
        institutionData: item?.institution
          ? { label: item?.institution?.name, value: item?.institution?.id }
          : null,
        genderData: item?.gender
          ? { label: capitalizeFLetter(item?.gender), value: item?.gender }
          : null,
        collegeData: item?.colleges
          ? item?.colleges?.map((c) => ({
              label: c?.name,
              value: c?.id,
            }))
          : null,
        deptData: item?.department
          ? { label: item?.department?.name, value: item?.department?.id }
          : null,
        reveal_name: item?.reveal_name,
        current_location: item?.current_location,
        current_position: item?.current_position,
        department_master: item?.department_master?.short_name,
        interesteds: item?.interesteds,
      }));

      setState({
        loading: false,
        userList: tableData || [],
        count: res?.count || 0,
      });
    } catch (error) {
      setState({ loading: false, userList: [], userCount: 0 });
    }
  };

  // const applicationList = async (
  //   page,
  //   institutionId = null,
  //   collegeId = null,
  //   deptId = null,
  //   profileId = null,
  //   statusId = null
  // ) => {
  //   try {
  //     setState({ loading: true });
  //     const body = bodyData();
  //     if (institutionId) {
  //       body.institution = institutionId;
  //     }
  //     if (state.collegeFilter?.value) {
  //       body.college = state.collegeFilter?.value;
  //     } else {
  //       if (collegeId) {
  //         body.college = collegeId;
  //       }
  //     }
  //     if (deptId) {
  //       body.department = deptId;
  //     }

  //     if (state.activeCard == 2) {
  //       body.exclude_applied_interview = "Yes";
  //     } else {
  //       if (statusId) {
  //         body.status = statusId;
  //       }
  //       if (state.activeCard == 3) {
  //         body.status = 6;
  //       }
  //     }

  //     // if (state.activeCard == 2) {
  //     //   body.exclude_applied_interview = "Yes";
  //     // }
  //     // body.team = "No";

  //     console.log("✌️body --->", body);

  //     const res: any = await Models.application.list(page, body);

  //     const tableData = res?.results?.map((item) => ({
  //       applicant_name: `${item?.first_name} ${item?.last_name}`,
  //       applicant_email: item?.email,
  //       applicant_phone: item?.phone,
  //       position_applied: item?.position_applied,
  //       qualification: item?.qualification,
  //       experience: item?.experience,
  //       status: item?.status,
  //       id: item?.id,
  //       applied_date: item?.created_at,
  //       job_title: item?.job_detail?.job_title,
  //       job_short_title: item?.job_detail?.short_name,
  //       resume: item?.resume,
  //       application_status: {
  //         value: item?.application_status?.id,
  //         label: item?.application_status?.name,
  //       },
  //       college_name: item?.job_detail?.college?.short_name,
  //       department_name:
  //         item?.department_details?.length > 0 &&
  //         item?.department_details?.map((item) => item?.short_name),
  //       interview_status:
  //         item?.interview_slots?.length > 0
  //           ? item?.interview_slots[item?.interview_slots.length - 1]?.status
  //           : "-",
  //       job_id: item?.job,
  //     }));
  //     setState({
  //       loading: false,
  //       page: page,
  //       count: res?.count,
  //       applicationList: tableData,
  //       next: res?.next,
  //       prev: res?.previous,
  //       applications_by_status: res?.applications_by_status,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching applications:", error);
  //     setState({
  //       recordsData: [],
  //       totalRecords: 0,
  //       loading: false,
  //     });
  //   }
  // };

  const jobList = async (page, insId = null, colId = null, deptId = null) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      if (insId) {
        body.institution_id = insId;
      }
      if (state.collegeFilter?.value) {
        body.college_id = state.collegeFilter?.value;
      } else {
        if (colId) {
          body.college_id = colId;
        }
      }
      if (state.departmentFilter?.value) {
        body.department_id = state.departmentFilter?.value;
      } else {
        if (deptId) {
          body.department_id = deptId;
        }
      }
      body.status = "approved";
      const res: any = await Models.job.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item.id,
        job_title: item.roles?.length > 0 ? item?.roles?.[0]?.role_name : "",
        job_short_title:
          item.roles?.length > 0 ? item?.roles?.[0]?.short_name : "",

        job_description: item.job_description,

        college_name: item?.college?.short_name,
        department:
          item?.department?.length > 0
            ? item?.department?.map((d) => d?.short_name)
            : [],
        // department_name:)  item?.department?.name || "-",

        job_type: item?.job_type,
        experiences: {
          value: item?.experiences?.id,
          label: item?.experiences?.name,
        },
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        number_of_openings: item?.number_of_openings,

        last_date: item?.last_date,
        priority: item?.priority,
        job_status: item?.job_status,
        is_approved: item?.is_approved,

        total_applications: item?.total_applications,

        college_id: item?.college?.id,
        department_id: item?.department?.id,
      }));

      setState({
        loading: false,
        page,
        count: res?.count,
        jobList: tableData,
        next: res?.next,
        prev: res?.previous,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const jobFilterList = async (page, search = "", colId = null) => {
    console.log("✌️colId --->", colId);
    try {
      setState({ loading: true });

      const body = bodyData();
      if (colId) body.college_id = colId;
      if (search) body.search = search;
      const res: any = await Models.job.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: item?.roles?.[0]?.role_name,
      }));

      setState({
        loading: false,
        jobPage: page,
        jobFiltercount: res?.count,
        jobFilterList: dropdown,
        jobFilternext: res?.next,
        jobFilterprev: res?.previous,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const collegeDropdownList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null,
    createdBy = null,
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };
      if (institutionId) {
        body.institution = institutionId;
      } else if (state.profile?.role === "institution_admin") {
        body.institution = state.profile?.institution?.id;
      }
      // if (createdBy) {
      //   body.created_by = createdBy;
      // }
      // body.team = "No";
      const res: any = await Models.college.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.short_name,
      }));
      setState({
        collegeLoading: false,
        collegePage: page,
        collegeList: loadMore ? [...state.collegeList, ...dropdown] : dropdown,
        collegeNext: res?.next,
      });
    } catch (error) {
      setState({ collegeLoading: false });
    }
  };

  const bodyData = () => {
    const body: any = {};
    if (state.search) {
      body.search = state.search;
    }
    if (state.institutionFilter?.value) {
      body.institution = state.institutionFilter.value;
    }

    if (state.collegeFilter?.value) {
      body.college = state.collegeFilter.value;
    }
    if (state.departmentFilter?.value) {
      body.department = state.departmentFilter.value;
      body.department_master_id = state.departmentFilter.value;
    }
    if (state.start_date) {
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    }
    if (state.end_date) {
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    }

    if (state.selectedStatus?.value) {
      body.status = state.selectedStatus.value;
    }

    if (state.refFilter?.length) {
      const values = state.refFilter.map((item) => item.value);

      body.phd_completed = values.includes(1);
      body.net_cleared = values.includes(2);
      body.set_cleared = values.includes(3);
      body.slet_cleared = values.includes(4);
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    return body;
  };

  const fetchDashboard = async (params?: any, profile?: any, collegeId?: any) => {
    try {
      const profileRes = await Models.auth.profile();
      const resolvedCollegeId = collegeId ?? state.dashboardCollegeFilter?.value;
      const dashRes: any = await Models.dashboard.dashboard({
        ...(params ?? {}),
        ...(resolvedCollegeId ? { college_id: resolvedCollegeId } : {}),
      });

      const data = dashRes?.data;

      setProfile(profileRes);
      setDashboard(data);
      setStats(data?.top_cards ?? {});
      cards(profile?.role, data?.top_cards);
      fetchOverdueFollowups(1, profileRes);
      fetchDaysToFillVariance(1, profileRes);
      upCommingInterviews(1, profileRes)
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverdueFollowups = async (page = 1, profileData?: any) => {
    try {
      setState({ overdueFollowupsLoading: true });

      const p = profileData ?? state.profile;
      const role = p?.role;
      const colleges = p?.college?.map((c: any) => c.college_id);
      const instId = p?.institution?.id;
      const deptId = p?.department?.department_id;

      const body: any = { status_new: "followup" };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;

      if (role === ROLES.INSTITUTION_ADMIN && instId) body.institution = instId;
      if (role === ROLES.HR && colleges?.length) body.college = colleges;
      if (role === ROLES.HOD && deptId) body.department = deptId;
      const res: any = await Models.application.list(page, body);
      const results = res?.results ?? [];
      const rows = results.map((item: any) => {
        const appliedDate = item?.created_at ? new Date(item.created_at) : null;

        return {
          id: item?.id,
          candidate: item?.first_name
            ? `${item.first_name} ${item.last_name}`
            : item?.username ?? "—",
          job: item?.job_detail?.short_name,

          college: item?.job_detail?.college?.short_name,
          status: item?.application_status?.name ?? item?.status,
          applied_date: moment(appliedDate).format("DD MMM YYYY, hh:mm A"),
          status_date: moment(item.status_changed_at).format(
            "DD MMM YYYY, hh:mm A",
          ),
          department_name:
            item?.department_details?.length > 0 &&
            item?.department_details?.map((item) => item?.short_name),
          resume: item?.resume,
        };
      });
      const total = rows.reduce(
        (sum: number, r: any) => sum + r.days_overdue,
        0,
      );
      setState({
        overdueFollowups: rows,
        overdueFollowupsTotal: total,
        overdueFollowupsCount: res?.count ?? 0,
        overdueFollowupsPage: page,
        overdueFollowupsLoading: false,
      });
    } catch {
      setState({ overdueFollowupsLoading: false });
    }
  };

  const fetchDaysToFillVariance = async (page = 1, profileData?: any) => {
    try {
      setState({ daysToFillVarianceLoading: true });

      const p = profileData ?? state.profile;
      const role = p?.role;
      const colleges = p?.college?.map((c: any) => c.college_id);
      const instId = p?.institution?.id;
      const deptId = p?.department?.department_id;

      const body: any = { variance_less_than: 10, is_approved: "Yes" };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;
      if (role === ROLES.INSTITUTION_ADMIN && instId)
        body.institution_id = instId;
      if (role === ROLES.HR && colleges?.length) body.college_id = colleges;
      if (role === ROLES.HOD && deptId) body.department_id = deptId;

      const res: any = await Models.job.list(page, body);
      const results = res?.results ?? [];
      const rows = results.map((item: any) => {
        return {
          id: item?.id,
          job_title: item?.roles?.[0]?.role_name,
          job_role: item.roles?.length > 0 ? item?.roles?.[0]?.short_name : "",

          college: item?.college?.short_name ?? "—",
          department:
            item?.department?.length > 0
              ? item?.department?.map((d) => d?.short_name)
              : [],
          total_applications: item?.total_applications,
          priority: item?.priority,
          days_to_fill: item.days_to_fill,
          variance: item.variance,
        };
      });
      const totalTarget = rows.reduce(
        (sum: number, r: any) => sum + r.target_days,
        0,
      );
      const totalVariance = rows.reduce(
        (sum: number, r: any) => sum + r.variance,
        0,
      );
      setState({
        daysToFillVariance: rows,
        daysToFillVarianceTotal: {
          target: totalTarget,
          variance: totalVariance,
        },
        daysToFillVarianceCount: res?.count ?? 0,
        daysToFillVariancePage: page,
        daysToFillVarianceLoading: false,
      });
    } catch {
      setState({ daysToFillVarianceLoading: false });
    }
  };

  

   const upCommingInterviews = async (page = 1, profileData?: any) => {
    try {
      setState({ upCommingInterviewsLoading: true });

      const p = profileData ?? state.profile;
      const userId = p.id;

      // Always filter: today → today + 5 days
      const today = moment().format("YYYY-MM-DD");
      const fiveDaysLater = moment().add(5, "days").format("YYYY-MM-DD");

      const body: any = {
        status_new: "followup",
        created_by: userId,
        schedule_date_from: today,
        schedule_date_to: fiveDaysLater,
      };


      const res: any = await Models.interview.list(page, body);
      const results = res?.results ?? [];
      const rows = results.map((item: any) => {
        const appliedDate = item?.created_at ? new Date(item.created_at) : null;

        console.log("item", item);
        

        return {
          id: item?.id,
          candidate: item?.applications[0]?.applicant_name,
          job_role: item?.applications[0]?.short_name || item?.applications[0]?.job_title,
        
          college: item?.applications[0]?.job_detail?.college?.name,
          applied_date: moment(appliedDate).format("DD MMM YYYY, hh:mm A"),
          status_date: moment(item.applications[0]?.status_changed_at).format(
            "DD MMM YYYY, hh:mm A",
          ),
          department_name: item?.applications[0]?.department_detail?.department_name,
          resume: item?.resume,
          status: item?.applications[0]?.application_status?.name ?? item?.status,
          scheduled_date: item?.scheduled_date,
          applications_id:item?.applications[0]?.id

        };
      });
      const total = rows.reduce(
        (sum: number, r: any) => sum + r.days_overdue,
        0,
      );
      setState({
        upCommingInterviewsList: rows,
        upCommingInterviewsTotal: total,
        upCommingInterviewsCount: res?.count ?? 0,
        upCommingInterviewsPage: page,
        upCommingInterviewsLoading: false,
      });
    } catch {
      setState({ overdueFollowupsLoading: false });
    }
  };

  const master_department = async (
    page = 1,
    search = "",
    loadMore = false,
    catId = null,
  ) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.is_approved = "Yes";
      body.pagination = "No";
      if (catId?.length > 0) {
        body.job_category_id = catId?.map((item) => item?.value || item);
      }

      const res: any = await Models.master.dept_list(body, page);
      const dropdown = Dropdown(res?.results, "short_name");
      setState({
        master_department: loadMore
          ? [...state.master_department, ...dropdown]
          : dropdown,
        masterNext: res?.next,
        masterPage: page,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const applicationStatusList = async () => {
    try {
      setState({ applicationStatusLoading: true });
      const res: any = await Models.master.application_status_list();
      const dropdown = res?.find((item) => item.name == "Interview Scheduled");
      const role = state.profile?.role;
      const colleges = state.profile?.college?.map((c: any) => c.college_id);
      const instId = state.profile?.institution?.id;
      const deptId = state.profile?.department?.department_id;
    } catch (error) {
      setState({ applicationStatusLoading: false });
    }
  };

  const applicationStatus = async () => {
    try {
      setState({ applicationStatusLoading: true });
      const res: any = await Models.master.application_status_list();
      const statuses = Array.isArray(res) ? res : res?.results || [];
      applicationStatusesRef.current = statuses;
      const dropdown = statuses.map((item) => ({
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

  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;

  /* ---------------- TREND DATA ---------------- */

  const formatBucketLabel = (bucket: string): string => {
    if (/^\d{4}-W\d{2}$/.test(bucket)) {
      // 1m: "2026-W10" → "Week 10"
      return `Week ${bucket.split("-W")[1]}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(bucket)) {
      // 7d: "2026-03-08" → "Mar 08"
      const d = new Date(bucket);
      return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(
        2,
        "0",
      )}`;
    }
    // 6m/1y: "September" → "September"
    const fullMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = fullMonths.findIndex(
      (m) => m.toLowerCase() === bucket.toLowerCase(),
    );
    if (monthIndex !== -1) {
      return MONTHS[monthIndex];
    }
    return bucket;
  };

  const wrapChartLabel = (value: unknown, maxCharacters = 18) => {
    const label = String(value ?? "");
    if (label.length <= maxCharacters) return label;

    const words = label.split(/\s+/);
    const lines: string[] = [];
    let line = "";

    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;
      if (line && nextLine.length > maxCharacters) {
        lines.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    });

    if (line) lines.push(line);
    return lines;
  };

  const trendLabels =
    dashboard?.trend?.map((t: any) => formatBucketLabel(t.bucket)) ?? [];

  const jobsTrend = dashboard?.trend?.map((t: any) => t.jobs) ?? [];
  const appsTrend = dashboard?.trend?.map((t: any) => t.applications) ?? [];
  const collegeTrend =
    dashboard?.trend?.map((t: any) => t.college_registrations) ?? [];
  const facultyTrend =
    dashboard?.trend?.map((t: any) => t.new_faculty_registrations ?? 0) ?? [];
  const interviewTrend =
    dashboard?.trend?.map((t: any) => t.interview_scheduled) ?? [];
  const decisionSelectedTrend =
    dashboard?.trend?.map((t: any) => t.selected ?? 0) ?? [];
  const decisionRejectedTrend =
    dashboard?.trend?.map((t: any) => t.rejected ?? 0) ?? [];

  const trendChart: any = {
    series: [
      { name: "Jobs", data: jobsTrend },
      { name: "Applications", data: appsTrend },
      { name: "College Registrations", data: collegeTrend },
      { name: "Interviews Scheduled", data: interviewTrend },
      { name: "Selected", data: decisionSelectedTrend },
      ...(isSuperAdmin
        ? [{ name: "Faculty Registrations", data: facultyTrend }]
        : []),
    ],
    options: {
      chart: {
        height: 300,
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        events: {
          legendClick: function (
            chartContext: any,
            seriesIndex: any,
            config: any,
          ) {
            const isSolo =
              config.globals.collapsedSeriesIndices.length ===
                config.globals.series.length - 1 &&
              !config.globals.collapsedSeriesIndices.includes(seriesIndex);

            if (isSolo) {
              config.globals.series.forEach((s: any, i: number) => {
                chartContext.showSeries(config.globals.seriesNames[i]);
              });
            } else {
              config.globals.series.forEach((s: any, i: number) => {
                if (i !== seriesIndex) {
                  chartContext.hideSeries(config.globals.seriesNames[i]);
                } else {
                  chartContext.showSeries(config.globals.seriesNames[i]);
                }
              });
            }
          },
        },
      },
      stroke: { curve: "smooth", width: 2 },
      colors: isDark
        ? ["#2196F3", "#E7515A", "#00ab55", "#e2a03f", "#d143ee", "#43eebb"]
        : ["#1B55E2", "#E7515A", "#00ab55", "#e2a03f", "#d143ee", "#43eebb"],
      labels: trendLabels,
      xaxis: {
        title: { text: "Period", style: { fontSize: "11px" } },
        labels: {
          formatter: (value: string) => wrapChartLabel(value),
          style: { fontSize: "11px" },
        },
      },
      yaxis: {
        title: { text: "Count", style: { fontSize: "11px" } },
        labels: { offsetX: isRtl ? -30 : -10, style: { fontSize: "11px" } },
        opposite: isRtl,
      },
      grid: { borderColor: isDark ? "#191E3A" : "#E0E6ED" },
      legend: { position: "top", horizontalAlign: "right" },
    },
  };

  /* ---------------- PIE CHART ---------------- */

  const pieLabels = dashboard?.pie_chart?.map((p: any) => p.label) ?? [];
  const pieSeries = dashboard?.pie_chart?.map((p: any) => p.value) ?? [];
  const hasPieChartData = pieSeries?.some((value: number) => Number(value) > 0);

  const funnelData =
    dashboard?.application_funnel?.map((f: any) => ({
      x: f.stage,
      y: f.value,
    })) ?? [];

  const funnelTotal = funnelData?.[0]?.y ?? 1;

  const funnelChart: any = {
    series: [{ name: "Count", data: funnelData }],
    options: {
      chart: { type: "bar", height: 350, toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: true,
          isFunnel: true,
          distributed: true,
        },
      },
      colors: ["#4361ee", "#2196f3", "#e2a03f", "#00ab55"],
      dataLabels: {
        enabled: true,
        formatter: (val: number, opt: any) => {
          const pct = Math.round((val / funnelTotal) * 100);
          return `${
            opt.w.globals.labels[opt.dataPointIndex]
          }: ${val} (${pct}%)`;
        },
      },
      xaxis: { labels: { show: false }, title: { text: "Stage" } },
      yaxis: { show: false, title: { text: "Count" } },
      legend: { show: false },
      grid: { show: false },
    },
  };

  /* ---------------- CARD TABLE FETCH FUNCTIONS ---------------- */

  // Converts the active dashboard period/date filter into start_date + end_date
  const dashboardDateFilter = () => {
    if (fromDate && toDate) {
      return {
        start_date: moment(fromDate).format("YYYY-MM-DD"),
        end_date: moment(toDate).format("YYYY-MM-DD"),
      };
    }
    if (activePeriod && activePeriod !== "custom") {
      const end = moment().format("YYYY-MM-DD");
      const periodMap: Record<string, string> = {
        "7d": moment().subtract(7, "days").format("YYYY-MM-DD"),
        "1m": moment().subtract(1, "months").format("YYYY-MM-DD"),
        Lm: moment()
          .subtract(1, "months")
          .startOf("month")
          .format("YYYY-MM-DD"),
        "3m": moment().subtract(3, "months").format("YYYY-MM-DD"),
        "6m": moment().subtract(6, "months").format("YYYY-MM-DD"),
        "1y": moment().subtract(1, "year").format("YYYY-MM-DD"),
      };
      const start = periodMap[activePeriod];
      if (start) return { start_date: start, end_date: end };
    }
    return {};
  };

  // Builds role-scoped + UI filter body for card tables (mirrors applicationList logic)
  const cardBodyData = () => {
    const body: any = { ...bodyData() };
    // override search with card-specific search
    if (state.cardSearch) body.search = state.cardSearch;
    else delete body.search;
    // apply dashboard college filter
    if (state.dashboardCollegeFilter?.value)
      body.college = state.dashboardCollegeFilter.value;
    const role = state.profile?.role;
    const colleges = state.profile?.college?.map((c: any) => c.college_id);
    const instId = state.profile?.institution?.id;
    const deptId = state.profile?.department?.department_id;
    if (role === ROLES.INSTITUTION_ADMIN && instId && !body.institution)
      body.institution = instId;
    if (role === ROLES.HR && colleges?.length && !body.college)
      body.college = colleges;
    if (role === ROLES.HOD && deptId && !body.department)
      body.department = deptId;
    return body;
  };

  // Builds role-scoped body for job-based card tables
  const cardJobBodyData = () => {
    const body: any = { ...bodyData() };
    if (state.cardSearch) body.search = state.cardSearch;
    else delete body.search;
    // apply dashboard college filter
    if (state.dashboardCollegeFilter?.value)
      body.college_id = state.dashboardCollegeFilter.value;
    const role = state.profile?.role;
    const colleges = state.profile?.college?.map((c: any) => c.college_id);
    const instId = state.profile?.institution?.id;
    const deptId = state.profile?.department?.department_id;
    if (role === ROLES.INSTITUTION_ADMIN && instId && !body.institution_id)
      body.institution_id = instId;
    if (role === ROLES.HR && colleges?.length && !body.college_id)
      body.college_id = colleges;
    if (role === ROLES.HOD && deptId && !body.department_id)
      body.department_id = deptId;
    return body;
  };

  // Builds role-scoped body for user-based card tables
  const cardUserBodyData = () => {
    const body: any = {};
    if (state.cardSearch) body.search = state.cardSearch;
    const role = state.profile?.role;
    const colleges = state.profile?.college?.map((c: any) => c.college_id);
    const instId = state.profile?.institution?.id;
    const deptId = state.profile?.department?.department_id;
    if (role === ROLES.INSTITUTION_ADMIN && instId) body.institution = instId;
    if (role === ROLES.HR && colleges?.length) body.college = colleges;
    if (role === ROLES.HOD && deptId) body.department = deptId;
    return body;
  };

  // card id=1 — Total Applications (filter: none extra)
  const fetchCardApplications = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {
        ...cardBodyData(),
        page,
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;
      if (state.cardSearch) body.search = state.cardSearch;
      const res: any = await Models.application.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        name: `${item?.first_name} ${item?.last_name}`,
        job: item?.job_detail?.short_name,
        college: item?.job_detail?.college?.short_name,
        status: item?.application_status?.name ?? item?.status,
        date: item?.created_at,
        department_name:
          item?.department_details?.length > 0 &&
          item?.department_details?.map((item) => item?.short_name),
        resume: item?.resume,
      }));
      setState({
        cardTableData: data,
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=2 — Interview Scheduled
  const fetchCardInterviewScheduled = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const statusId = await getApplicationStatusId("Interview Scheduled");
      if (!statusId) {
        setState({
          cardTableData: [],
          cardTableCount: 0,
          cardTableLoading: false,
        });
        return;
      }
      const body: any = {
        ...cardBodyData(),
        page,
        status: statusId,
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.schedule_date_from = df.start_date;
      if (df.end_date) body.scheduled_date_to = df.end_date;
      const res: any = await Models.application.list(page, body);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item?.id,
          name: `${item?.first_name} ${item?.last_name}`,
          job: item?.job_detail?.short_name,
          college: item?.job_detail?.college?.short_name,
          scheduled_date: item?.interview_slots?.slice(-1)?.[0]?.scheduled_date,
          status: item?.application_status?.name ?? item?.status,
          department_name:
            item?.department_details?.length > 0 &&
            item?.department_details?.map((item) => item?.short_name),
          resume: item?.resume,
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=4 — Active Jobs
  const fetchCardActiveJobs = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {
        ...cardJobBodyData(),
        page,
        is_approved: "Yes",
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;
      const res: any = await Models.job.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        job_title: item?.roles?.[0]?.role_name,
        job_short_title:
          item.roles?.length > 0 ? item?.roles?.[0]?.short_name : "",

        job_description: item.job_description,
        college_name: item?.college?.short_name,
        department:
          item?.department?.length > 0
            ? item?.department?.map((d) => d?.short_name)
            : [],
        priority: item?.priority,
        openings: item?.number_of_openings,
        applications: item?.total_applications,
        last_date: item?.last_date,
        job_type: item?.job_type,
        experiences: {
          value: item?.experiences?.id,
          label: item?.experiences?.name,
        },
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        number_of_openings: item?.number_of_openings,

        job_status: item?.job_status,
        is_approved: item?.is_approved,

        total_applications: item?.total_applications,

        college_id: item?.college?.id,
        department_id: item?.department?.id,
      }));
      setState({
        cardTableData: data,
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=5 — Pending Jobs
  const fetchCardPendingJobs = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {
        ...cardJobBodyData(),
        page,
        is_approved: "No",
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;
      const res: any = await Models.job.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        job_title: item?.roles?.[0]?.role_name,
        job_short_title:
          item.roles?.length > 0 ? item?.roles?.[0]?.short_name : "",

        job_description: item.job_description,
        college_name: item?.college?.short_name,
        department:
          item?.department?.length > 0
            ? item?.department?.map((d) => d?.short_name)
            : [],
        priority: item?.priority,
        openings: item?.number_of_openings,
        applications: item?.total_applications,
        last_date: item?.last_date,
        job_type: item?.job_type,
        experiences: {
          value: item?.experiences?.id,
          label: item?.experiences?.name,
        },
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        number_of_openings: item?.number_of_openings,

        job_status: item?.job_status,
        is_approved: item?.is_approved,

        total_applications: item?.total_applications,

        college_id: item?.college?.id,
        department_id: item?.department?.id,
      }));
      setState({
        cardTableData: data,
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=6 — Selected Applications
  const fetchCardSelected = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const statusId = await getApplicationStatusId("Selected");
      if (!statusId) {
        setState({
          cardTableData: [],
          cardTableCount: 0,
          cardTableLoading: false,
        });
        return;
      }
      const body: any = {
        ...cardBodyData(),
        page,
        status: statusId,
      };

      const df = dashboardDateFilter();
      if (df.start_date) body.status_changed_at_from = df.start_date;
      if (df.end_date) body.status_changed_at_to = df.end_date;
      const res: any = await Models.application.list(page, body);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item?.id,
          name: `${item?.first_name} ${item?.last_name}`,
          job: item?.job_detail?.short_name,
          college: item?.job_detail?.college?.short_name,
          status: item?.application_status?.name,
          date: item?.status_changed_at,
          department_name:
            item?.department_details?.length > 0 &&
            item?.department_details?.map((item) => item?.short_name),
          resume: item?.resume,
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({
        cardTableData: [],
        cardTableCount: 0,
        cardTableLoading: false,
      });
    }
  };

  const getApplicationStatusId = async (statusName: string) => {
    if (!applicationStatusesRef.current.length) {
      const res: any = await Models.master.application_status_list();
      applicationStatusesRef.current = Array.isArray(res)
        ? res
        : res?.results || [];
    }
    return applicationStatusesRef.current.find(
      (status: any) =>
        status?.name?.trim().toLowerCase() === statusName.trim().toLowerCase(),
    )?.id;
  };

  // card id=10 — Rejected Applications
  const fetchCardRejected = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const statusId = await getApplicationStatusId("Rejected");
      if (!statusId) {
        setState({
          cardTableData: [],
          cardTableCount: 0,
          cardTableLoading: false,
        });
        return;
      }
      const body: any = {
        ...cardBodyData(),
        page,
        status: statusId,
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.status_changed_at_from = df.start_date;
      if (df.end_date) body.status_changed_at_to = df.end_date;
      const res: any = await Models.application.list(page, body);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item?.id,
          name: `${item?.first_name} ${item?.last_name}`,
          job: item?.job_detail?.short_name,
          college: item?.job_detail?.college?.short_name,
          status: item?.application_status?.name,
          date: item?.created_at,
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=7 — Awaiting Review
  const fetchCardAwaitingReview = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {
        ...cardBodyData(),
        page,
        is_viewed: false,
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;
      const res: any = await Models.application.list(page, body);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item?.id,
          name: `${item?.first_name} ${item?.last_name}`,
          job: item?.job_detail?.short_name,
          college: item?.job_detail?.college?.short_name,
          status: item?.application_status?.name,
          date: item?.created_at,
          department_name:
            item?.department_details?.length > 0 &&
            item?.department_details?.map((item) => item?.short_name),
          resume: item?.resume,
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=8 — Active Panel Members (uses Models.master.panel_list, same as hr_panel page)
  const fetchCardPanelMembers = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {};
      if (state.cardSearch) body.search = state.cardSearch;
      const colleges = state.profile?.college?.map((c: any) => c.college_id);
      if (colleges?.length) body.college_id = colleges;
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;

      const res: any = await Models.master.panel_list(body, page);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          college: item?.department?.college?.short_name,
          department: item?.department?.short_name,
          designation: item.designation,
          decision_maker: item.decision_maker,
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // Shared mapper for job_seekers-style user rows
  const mapJobSeekerRow = (item: any) => ({
    id: item?.id,
    name:
      item?.first_name && item?.last_name
        ? `${item.first_name} ${item.last_name}`
        : item?.username || "",
    current_location: item?.current_location,
    experience: item?.experience,
    current_position: item?.current_position,
    department: item?.department_master?.short_name,
    publication_count: item?.publication_count,
    project_count: item?.project_count,
    hr_interview_status: item?.hr_interview_status,
  });

  // card id=14 — Find Right Talents (same as job_seekers page base list)
  const fetchCardFindRightTalents = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const body: any = { active_job_seeker: "Yes", role: ROLES.APPLICANT };
      if (userId) body.user_id = userId;
      if (state.cardSearch) body.search = state.cardSearch;
      const df = dashboardDateFilter();
      if (df.start_date) body.start_date = df.start_date;
      if (df.end_date) body.end_date = df.end_date;

      const res: any = await Models.auth.userList(page, body);
      setState({
        cardTableData: (res?.results ?? []).map(mapJobSeekerRow),
        cardTableCount: res?.count ?? 0,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=15 — Interest Sent (hr_interview_status = "Sent Interest")
  const fetchCardInterestSent = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const body: any = {
        active_job_seeker: "Yes",
        role: ROLES.APPLICANT,
        hr_interview_status: "Sent Interest",
      };
      if (userId) body.user_id = userId;
      if (state.cardSearch) body.search = state.cardSearch;
      const res: any = await Models.auth.userList(page, body);
      setState({
        cardTableData: (res?.results ?? []).map(mapJobSeekerRow),
        cardTableCount: res?.count ?? 0,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };
  const fetchCardTalents = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const body: any = {
        active_job_seeker: "Yes",
        role: ROLES.APPLICANT,
        interest_accepted: "Yes",
      };
      if (userId) body.user_id = userId;
      if (state.cardSearch) body.search = state.cardSearch;
      const res: any = await Models.auth.userList(page, body);
      setState({
        cardTableData: (res?.results ?? []).map(mapJobSeekerRow),
        cardTableCount: res?.count ?? 0,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=11 — Outreached
  const fetchCardOutreached = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const body: any = {
        active_job_seeker: "Yes",
        role: ROLES.APPLICANT,
        outreached: "Yes",
      };
      if (userId) body.user_id = userId;
      if (state.cardSearch) body.search = state.cardSearch;
      const res: any = await Models.auth.userList(page, body);
      setState({
        cardTableData: (res?.results ?? []).map(mapJobSeekerRow),
        cardTableCount: res?.count ?? 0,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  // card id=13 — Interview Rescheduled Request
  const fetchCardRescheduled = async (page = 1) => {
    try {
      setState({ cardTableLoading: true });
      const body: any = {
        ...cardBodyData(),
        page,
        reschedule : true
      };
      const df = dashboardDateFilter();
      if (df.start_date) body.schedule_date_from = df.start_date;
      if (df.end_date) body.scheduled_date_to = df.end_date;
      const res: any = await Models.application.list(page, body);
      setState({
        cardTableData: res?.results?.map((item: any) => ({
          id: item?.id,
          name: `${item?.first_name} ${item?.last_name}`,
          job: item?.job_detail?.short_name,
          college: item?.job_detail?.college?.short_name,
          scheduled_date: item?.interview_slots?.slice(-1)?.[0]?.scheduled_date,
          rescheduled_date: item?.interview_slots?.slice(-1)?.[0]?.rescheduled_date,
          status: item?.interview_slots?.slice(-1)?.[0]?.status ?? "-",
        })),
        cardTableCount: res?.count,
        cardTableLoading: false,
      });
    } catch {
      setState({ cardTableLoading: false });
    }
  };

  const CARD_FETCH_MAP: Record<number, (page?: number) => void> = {
    1: fetchCardApplications,
    2: fetchCardInterviewScheduled,
    4: fetchCardActiveJobs,
    5: fetchCardPendingJobs,
    6: fetchCardSelected,
    7: fetchCardAwaitingReview,
    8: fetchCardPanelMembers,
    9: fetchCardTalents,
    10: fetchCardRejected,
    11: fetchCardOutreached,
    13: fetchCardRescheduled,
    14: fetchCardFindRightTalents,
    15: fetchCardInterestSent,
  };

  const CARD_COLUMNS: Record<number, any[]> = {
    1: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "department_name",
        title: "Department",
        render: ({ department_name }) => {
          if (!department_name || department_name?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department_name?.[0];
          const otherDept = department_name?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm  text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative z-10">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: true,
      },

      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {r.status}
          </span>
        ),
      },
      {
        accessor: "date",
        title: "Applied",
        render: (r: any) => (
          <span className="text-xs text-black">
            {r.date ? moment(r.date).format("DD MMM YYYY") : "-"}
          </span>
        ),
      },
      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadResume(row)}
              className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Resume"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRound(row)}
              className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
              title="Interview Round"
            >
              <BriefcaseBusiness className="h-4 w-4" />
            </button>

            {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => {
                  setState({
                    showStatusModal: true,
                    selectedApplication: row,
                    selectedStatus: row.application_status,
                  });
                }}
                className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                title="Update Status"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
          </div>
        ),
      },
    ],
    2: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "department_name",
        title: "Department",
        render: ({ department_name }) => {
          if (!department_name || department_name?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department_name?.[0];
          const otherDept = department_name?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm  text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative z-10">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: true,
      },

      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
            {r.status}
          </span>
        ),
      },

      {
        accessor: "scheduled_date",
        title: "Scheduled",
        render: (r: any) => (
          <span className="text-xs">
            {r.scheduled_date
              ? moment(r.scheduled_date).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </span>
        ),
      },

      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadResume(row)}
              className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Resume"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRound(row)}
              className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
              title="Interview Round"
            >
              <BriefcaseBusiness className="h-4 w-4" />
            </button>

            {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => {
                  setState({
                    showStatusModal: true,
                    selectedApplication: row,
                    selectedStatus: row.application_status,
                  });
                }}
                className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                title="Update Status"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
          </div>
        ),
      },
    ],
    4: [
      {
        accessor: "job_short_title",
        title: "Job Title",
        sortable: true,
        render: (row: any) => (
          <div
            onClick={() => {
              router.push(`faculty/job_details?id=${row?.id}`);
            }}
            className="cursor-pointer text-gray-900 dark:text-white"
            title={row?.job_title}
          >
            {row?.job_short_title}
          </div>
        ),
      },
      {
        accessor: "department_name",
        title: "Dept",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ department }) => {
          if (!department || department?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department?.[0];
          const otherDept = department?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                className="text-sm  text-gray-700 dark:text-gray-300"
                title={firstDept}
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      title={dept}
                    >
                      {dept}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessor: "college_name",
        title: "College Name",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ college_name }) => (
          <span
            className="text-gray-600 dark:text-black"
            title={college_name}
          >
            {college_name || "-"}
          </span>
        ),
      },

      {
        accessor: "job_status",
        title: "Status",

        render: (row) => (
          <span
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs  ${
              (row as any).is_approved
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            {(row as any).is_approved ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {capitalizeFLetter(
              (row as any).is_approved ? "Approved" : "Pending",
            ) || "-"}
          </span>
        ),
      },
      {
        accessor: "priority",
        title: "Urgency",

        render: ({ priority }) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs  ${
              priority === "urgent"
                ? "bg-red-100 text-red-800"
                : priority === "high"
                ? "bg-orange-100 text-orange-800"
                : priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {priority || "N/A"}
          </span>
        ),
      },

      {
        accessor: "total_applications",
        title: "Applications",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ total_applications }) => (
          <span className="text-gray-600 dark:text-black">
            {total_applications}
          </span>
        ),
      },

      // {
      //   accessor: "last_date",
      //   title: "Last Date",
      //   render: ({ last_date }) => (
      //     <span className="text-gray-600 dark:text-black">
      //       {last_date
      //         ? new Date(last_date).toLocaleDateString()
      //         : "-"}
      //     </span>
      //   ),
      // },
      {
        accessor: "actions",
        title: "Actions",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/faculty/job_details?id=${row.id}`)}
              className="flex  items-center justify-center rounded-lg  text-indigo-600 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            {/* {state.profile?.role == ROLES.HR && ( */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                // if (state.profile?.role == ROLES.HR) {
                handleApprove(row);
                // }
              }}
              // onClick={() => handleToggleStatus(row)}
              className={`flex items-center justify-center rounded-lg ${
                row?.job_status === "published"
                  ? "text-red-600 "
                  : " text-green-600 "
              }`}
              title={"Job Status"}
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            {/* )} */}
            {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLog(row);
                          }}
                          className="flex items-center justify-center rounded-lg  text-purple-600 "
                          title="Logs"
                        >
                          <IconHistory className="h-4 w-4" />
                        </button> */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/faculty/updatejob?id=${row.id}`);
              }}
              className="flex  items-center justify-center rounded-lg text-blue-600 "
              title="Edit"
            >
              <IconEdit className="h-4 w-4" />
            </button>

            <button
              // onClickCapture={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="flex  items-center justify-center rounded-lg  text-red-600 "
              title="Delete"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    5: [
      {
        accessor: "job_short_title",
        title: "Job Title",
        sortable: true,
        render: (row: any) => (
          <div
            onClick={() => {
              router.push(`faculty/job_details?id=${row?.id}`);
            }}
            className="cursor-pointer text-gray-900 dark:text-white"
            title={row?.job_title}
          >
            {row?.job_short_title}
          </div>
        ),
      },
      {
        accessor: "department_name",
        title: "Dept",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ department }) => {
          if (!department || department?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department?.[0];
          const otherDept = department?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                className="text-sm  text-gray-700 dark:text-gray-300"
                title={firstDept}
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                      title={dept}
                    >
                      {dept}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessor: "college_name",
        title: "College Name",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ college_name }) => (
          <span
            className="text-gray-600 dark:text-black"
            title={college_name}
          >
            {college_name || "-"}
          </span>
        ),
      },

      {
        accessor: "job_status",
        title: "Status",

        render: (row) => (
          <span
            className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs  ${
              (row as any).is_approved
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            {(row as any).is_approved ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {capitalizeFLetter(
              (row as any).is_approved ? "Approved" : "Pending",
            ) || "-"}
          </span>
        ),
      },
      {
        accessor: "priority",
        title: "Urgency",

        render: ({ priority }) => (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs  ${
              priority === "urgent"
                ? "bg-red-100 text-red-800"
                : priority === "high"
                ? "bg-orange-100 text-orange-800"
                : priority === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {priority || "N/A"}
          </span>
        ),
      },

      {
        accessor: "total_applications",
        title: "Applications",
        sortable: true,
        cellsStyle: {
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        render: ({ total_applications }) => (
          <span className="text-gray-600 dark:text-black">
            {total_applications}
          </span>
        ),
      },

      // {
      //   accessor: "last_date",
      //   title: "Last Date",
      //   render: ({ last_date }) => (
      //     <span className="text-gray-600 dark:text-black">
      //       {last_date
      //         ? new Date(last_date).toLocaleDateString()
      //         : "-"}
      //     </span>
      //   ),
      // },
      {
        accessor: "actions",
        title: "Actions",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/faculty/job_details?id=${row.id}`)}
              className="flex  items-center justify-center rounded-lg  text-indigo-600 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            {/* {state.profile?.role == ROLES.HR && ( */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                // if (state.profile?.role == ROLES.HR) {
                handleApprove(row);
                // }
              }}
              // onClick={() => handleToggleStatus(row)}
              className={`flex items-center justify-center rounded-lg ${
                row?.job_status === "published"
                  ? "text-red-600 "
                  : " text-green-600 "
              }`}
              title={"Job Status"}
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            {/* )} */}
            {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLog(row);
                          }}
                          className="flex items-center justify-center rounded-lg  text-purple-600 "
                          title="Logs"
                        >
                          <IconHistory className="h-4 w-4" />
                        </button> */}

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/faculty/updatejob?id=${row.id}`);
              }}
              className="flex  items-center justify-center rounded-lg text-blue-600 "
              title="Edit"
            >
              <IconEdit className="h-4 w-4" />
            </button>

            <button
              // onClickCapture={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="flex  items-center justify-center rounded-lg  text-red-600 "
              title="Delete"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    6: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "department_name",
        title: "Department",
        render: ({ department_name }) => {
          if (!department_name || department_name?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department_name?.[0];
          const otherDept = department_name?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm  text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative z-10">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: true,
      },
      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            {r.status}
          </span>
        ),
      },
      {
        accessor: "date",
        title: "Status Date",
        render: (r: any) => (
          <span className="text-xs">
            {r.date ? moment(r.date).format("DD MMM YYYY") : "-"}
          </span>
        ),
      },

      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadResume(row)}
              className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Resume"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRound(row)}
              className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
              title="Interview Round"
            >
              <BriefcaseBusiness className="h-4 w-4" />
            </button>

            {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => {
                  setState({
                    showStatusModal: true,
                    selectedApplication: row,
                    selectedStatus: row.application_status,
                  });
                }}
                className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                title="Update Status"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
          </div>
        ),
      },
    ],
    10: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "department_name",
        title: "Department",
        render: ({ department_name }) => {
          if (!department_name || department_name?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department_name?.[0];
          const otherDept = department_name?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm  text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative z-10">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: true,
      },
      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
            {r.status}
          </span>
        ),
      },

      {
        accessor: "date",
        title: "Status Date",
        render: (r: any) => (
          <span className="text-xs">
            {r.date ? moment(r.date).format("DD MMM YYYY") : "-"}
          </span>
        ),
      },

      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadResume(row)}
              className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Resume"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRound(row)}
              className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
              title="Interview Round"
            >
              <BriefcaseBusiness className="h-4 w-4" />
            </button>

            {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => {
                  setState({
                    showStatusModal: true,
                    selectedApplication: row,
                    selectedStatus: row.application_status,
                  });
                }}
                className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                title="Update Status"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
          </div>
        ),
      },
    ],
    7: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "department_name",
        title: "Department",
        render: ({ department_name }) => {
          if (!department_name || department_name?.length === 0) {
            return <span className="text-black">-</span>;
          }

          const firstDept = department_name?.[0];
          const otherDept = department_name?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm  text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div key={index} className="group relative z-10">
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {hiddenDept
                        ?.map((d: string) => capitalizeFLetter(d))
                        .join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        sortable: true,
      },

      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {r.status}
          </span>
        ),
      },
      {
        accessor: "date",
        title: "Applied",
        render: (r: any) => (
          <span className="text-xs text-black">
            {r.date ? moment(r.date).format("DD MMM YYYY") : "-"}
          </span>
        ),
      },
      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
              title="View"
            >
              <IconEye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDownloadResume(row)}
              className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Resume"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleRound(row)}
              className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
              title="Interview Round"
            >
              <BriefcaseBusiness className="h-4 w-4" />
            </button>

            {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => {
                  setState({
                    showStatusModal: true,
                    selectedApplication: row,
                    selectedStatus: row.application_status,
                  });
                }}
                className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                title="Update Status"
              >
                <UserCheck className="h-4 w-4" />
              </button>
            )}
            {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
          </div>
        ),
      },
    ],
    8: [
      { accessor: "name", title: "Name" },
      { accessor: "email", title: "Email" },
      { accessor: "phone", title: "Phone" },
      { accessor: "college", title: "College" },
      { accessor: "department", title: "Department" },
      { accessor: "designation", title: "Designation" },
      {
        accessor: "decision_maker",
        title: "Decision Maker",
        render: (r: any) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              r.decision_maker
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-black"
            }`}
          >
            {r.decision_maker ? "Yes" : "No"}
          </span>
        ),
      },
    ],
    9: [
      { accessor: "name", title: "Name" },
      { accessor: "current_location", title: "Location" },
      { accessor: "experience", title: "Experience" },
      { accessor: "current_position", title: "Current Position" },
      { accessor: "department", title: "Department" },
      { accessor: "publication_count", title: "Publications" },
      { accessor: "project_count", title: "Projects" },
    ],
    11: [
      { accessor: "name", title: "Name" },
      { accessor: "current_location", title: "Location" },
      { accessor: "experience", title: "Experience" },
      { accessor: "current_position", title: "Current Position" },
      { accessor: "department", title: "Department" },
      { accessor: "publication_count", title: "Publications" },
      { accessor: "project_count", title: "Projects" },
      // {
      //   accessor: "hr_interview_status",
      //   title: "Interest Status",
      //   render: (r: any) => r.hr_interview_status ? (
      //     <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">{r.hr_interview_status}</span>
      //   ) : <span className="text-black">-</span>,
      // },
    ],
    14: [
      { accessor: "name", title: "Name" },
      { accessor: "current_location", title: "Location" },
      { accessor: "experience", title: "Experience" },
      { accessor: "current_position", title: "Current Position" },
      { accessor: "department", title: "Department" },
      { accessor: "publication_count", title: "Publications" },
      { accessor: "project_count", title: "Projects" },
    ],
    15: [
      { accessor: "name", title: "Name" },
      { accessor: "current_location", title: "Location" },
      { accessor: "experience", title: "Experience" },
      { accessor: "current_position", title: "Current Position" },
      { accessor: "department", title: "Department" },
      { accessor: "publication_count", title: "Publications" },
      { accessor: "project_count", title: "Projects" },
      // {
      //   accessor: "hr_interview_status",
      //   title: "Interest Status",
      //   render: (r: any) => r.hr_interview_status ? (
      //     <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{r.hr_interview_status}</span>
      //   ) : <span className="text-black">-</span>,
      // },
    ],
    13: [
      {
        accessor: "name",
        title: "Applicant",
        render: (r: any) => (
          <Link
            href={`/faculty/application_detail?id=${r.id}`}
            className="text-dblue hover:underline"
          >
            {r.name}
          </Link>
        ),
      },
      { accessor: "job", title: "Job" },
      { accessor: "college", title: "College" },
      {
        accessor: "scheduled_date",
        title: "Scheduled",
        render: (r: any) => (
          <span className="text-xs">
            {r.scheduled_date
              ? moment(r.scheduled_date).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </span>
        ),
      },
      {
        accessor: "rescheduled_date",
        title: "Re-scheduled Req Date",
        render: (r: any) => (
          <span className="text-xs">
            {r.rescheduled_date
              ? moment(r.rescheduled_date).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </span>
        ),
      },
      {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
            {r.status}
          </span>
        ),
      },
    ],
  };

  const CARD_TITLES: Record<number, string> = {
    1: "Total Applications",
    2: "Interview Scheduled",
    4: "Active Jobs",
    5: "Pending Jobs",
    6: "Selected Applications",
    7: "Awaiting Review",
    8: "Active Panel Members",
    9: "Talents Identified (Interest Accepted)",
    10: "Rejected Applications",
    11: "Outreached",
    13: "Interview Rescheduled",
    14: "Find Right Talents",
    15: "Interest Sent",
  };

  /* ---------------- CHART CONFIG FUNCTIONS ---------------- */

  const getVolumeTrendChart = () => {
    const src = dashboard?.application_volume_trend ?? [];
    const labels = src.map((d: any) => d.month);
    return {
      series: [
        { name: "Applicants", data: src.map((d: any) => d.applications) },
        { name: "Selected", data: src.map((d: any) => d.selected) },
        { name: "Joined", data: src.map((d: any) => d.joined ?? 0) },
      ],
      options: {
        chart: {
          type: "area",
          height: 270,
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        stroke: { curve: "smooth", width: 2.5 },
        colors: ["#1f46b3", "#007550", "#d97706"],
        fill: {
          type: "gradient",
          gradient: {
  shadeIntensity: 0.1,
  opacityFrom: 0.15,
  opacityTo: 0.35,
  stops: [0, 100],
},
        },
        xaxis: {
          categories: labels,
          title: { text: "Month", style: { fontSize: "11px" } },
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "11px" },
          },
        },
        yaxis: {
          title: { text: "Count", style: { fontSize: "11px" } },
          labels: { style: { fontSize: "11px" } },
          opposite: isRtl,
        },
        grid: {
          borderColor: isDark ? "#191E3A" : "#E0E6ED",
          strokeDashArray: 4,
        },
        legend: { position: "top", horizontalAlign: "right", fontSize: "12px" },
        tooltip: { shared: true, intersect: false },
        markers: { size: 3, hover: { size: 5 } },
        noData: { text: "No data available" },
      },
    };
  };

  const getExperienceDonutChart = () => {
    const src = dashboard?.applications_by_experience ?? [];
    const labels = src.map((e: any) => e.experience_level);
    const values = src.map((e: any) => e.applications);
    const hasData = values.some((v: number) => v > 0);
    return {
      series: hasData ? values : [1],
      options: {
        chart: { type: "donut", height: 220 },
        labels: hasData ? labels : ["No data"],
        colors: hasData ? chartColors : ["#E5E7EB"],
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: "68%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isDark ? "#E5E7EB" : "#374151",
                  formatter: (w: any) =>
                    w.globals.seriesTotals.reduce(
                      (a: number, b: number) => a + b,
                      0,
                    ),
                },
              },
            },
          },
        },
        legend: {
          show: hasData,
          position: "bottom",
          fontSize: "11px",
          labels: { colors: isDark ? "#E5E7EB" : "#374151" },
        },
        tooltip: {
          enabled: hasData,
          y: { formatter: (v: number) => `${v} applications` },
        },
        stroke: { width: 2 },
      },
    };
  };

  const getUrgencyBarChart = () => {
    const src = dashboard?.urgency_job_postings ?? [];
    const hasData = src.some((d: any) => d.job_postings > 0);
    return {
      series: [{ name: "Jobs", data: src.map((d: any) => d.job_postings) }],
      options: {
        chart: { type: "bar", height: 240, toolbar: { show: false } },
        colors: ["#1f46b3"],
        plotOptions: {
          bar: { borderRadius: 12, columnWidth: "48%", distributed: true },
        },
        xaxis: {
          categories: src.map((d: any) => d.urgency),
          title: { text: "Urgency", style: { fontSize: "11px" } },
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "11px" },
          },
        },
        yaxis: {
          title: { text: "Jobs", style: { fontSize: "11px" } },
          labels: { style: { fontSize: "11px" } },
        },
        grid: {
          borderColor: isDark ? "#191E3A" : "#E0E6ED",
          strokeDashArray: 4,
        },
        legend: { show: false },
        dataLabels: {
          enabled: true,
          style: { fontSize: "11px", fontWeight: 600 },
        },
        tooltip: { y: { formatter: (v: number) => `${v} jobs` } },
        noData: { text: "No data available" },
      },
    };
  };

  const getDeadlineVarianceChart = () => {
    const src = (dashboard?.job_deadline_variance ?? []).slice(0, 10);
    return {
      series: [
        {
          name: "Days remaining",
          data: src.map((d: any) => d.deadline_variance),
        },
      ],
      options: {
        chart: { type: "bar", height: 240, toolbar: { show: false } },
        colors: ["#e7515a"],
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4, barHeight: "62%" },
        },
        xaxis: {
          categories: src.map((d: any) => `#${d.job_id} ${d.job_role}`),
          title: { text: "Days Remaining", style: { fontSize: "11px" } },
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "11px" },
          },
        },
        yaxis: {
          title: { text: "Job Role", style: { fontSize: "11px" } },
          labels: { style: { fontSize: "10px" }, maxWidth: 150 },
        },
        grid: {
          borderColor: isDark ? "#191E3A" : "#E0E6ED",
          strokeDashArray: 4,
        },
        dataLabels: {
          enabled: true,
          formatter: (v: number) => `${v} days`,
          style: { fontSize: "10px" },
        },
        tooltip: {
          y: {
            formatter: (v: number) =>
              `${Math.abs(v)} days ${v < 0 ? "overdue" : "remaining"}`,
          },
        },
        noData: { text: "No data available" },
      },
    };
  };

  const getApplyTypePieChart = () => {
    const src = dashboard?.applications_by_source ?? [];
    const internal =
      src.find((d: any) => d.source === "internal")?.applications ?? 68;
    const external =
      src.find((d: any) => d.source === "external")?.applications ?? 32;
    const total = internal + external || 1;
    return {
      series: [internal, external],
      options: {
        chart: { type: "pie", height: 200 },
        labels: [
          `Internal (${Math.round((internal / total) * 100)}%)`,
          `External (${Math.round((external / total) * 100)}%)`,
        ],
        colors: isDark ? ["#2d68b4", "#d97706"] : ["#3067ff", "#d97706"],
        dataLabels: {
          enabled: true,
          formatter: (_v: number, opts: any) =>
            `${opts.w.globals.series[opts.seriesIndex]}`,
        },
        legend: {
          position: "bottom",
          fontSize: "12px",
          labels: { colors: isDark ? "#E5E7EB" : "#374151" },
        },
        stroke: { width: 2 },
        tooltip: { y: { formatter: (v: number) => `${v} applications` } },
        noData: { text: "No data available" },
      },
    };
  };

  const getFunnelDummyChart = () => ({
    series: [
      {
        name: "Count",
        data: [
          { x: "Applied", y: 120 },
          { x: "Screened", y: 80 },
          { x: "Interview", y: 45 },
          { x: "Selected", y: 18 },
        ],
      },
    ],
    options: {
      chart: { type: "bar", height: 240, toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: true,
          isFunnel: true,
          distributed: true,
          borderRadius: 4,
        },
      },
      colors: chartColors,
      dataLabels: {
        enabled: true,
        formatter: (v: number, opt: any) =>
          `${opt.w.globals.labels[opt.dataPointIndex]}: ${v}`,
        style: { fontSize: "11px" },
      },
      xaxis: { labels: { show: false } },
      yaxis: { show: false },
      legend: { show: false },
      grid: { show: false },
    },
  });

  const getDepartmentBarChart = () => {
    const src = dashboard?.applications_by_department ?? [];
    return {
      series: [
        { name: "Applicants", type: "bar", data: src.map((d: any) => d.applications) },
        { name: "Selected", type: "line", data: src.map((d: any) => d.selected) },
      ],
      options: {
        chart: {
          type: "line",
          height: 360,
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: [isDark ? "#818cf8" : "#c7d7fa", isDark ? "#34d399" : "#007550"],
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: { bar: { columnWidth: "55%", borderRadius: 12 } },
        markers: { size: [0, 5], hover: { size: 7 } },
        xaxis: {
          categories: src.map((d: any) => d.department_name),
          title: { text: "Department", style: { fontSize: "11px" } },
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "10px", colors: isDark ? "#94a3b8" : "#374151" },
            rotate: 0,
            trim: false,
            hideOverlappingLabels: false,
            maxHeight: 120,
          },
        },
        yaxis: {
          title: { text: "Count", style: { fontSize: "11px" } },
          labels: { style: { fontSize: "11px", colors: isDark ? "#94a3b8" : "#374151" } },
        },
        grid: { borderColor: isDark ? "#1e293b" : "#E0E6ED", strokeDashArray: 4 },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          labels: { colors: isDark ? "#cbd5e1" : "#374151" },
        },
        dataLabels: { enabled: false },
        tooltip: { shared: true, intersect: false },
        noData: { text: "No data available" },
      },
    };
  };

  const getCollegeBarChart = () => {
    const src = dashboard?.applications_by_college ?? [];
    return {
      series: [
        { name: "Applicants", data: src.map((d: any) => d.applications) },
        { name: "Selected", data: src.map((d: any) => d.selected) },
      ],
      options: {
        chart: {
          type: "line",
          height: 360,
          toolbar: { show: false },
          zoom: { enabled: false },
        },
        colors: chartColors,
        stroke: { curve: "smooth", width: 2.5 },
        markers: { size: 4, hover: { size: 6 } },
        xaxis: {
          categories: src.map((d: any) => d.college_name?.trim()),
          title: { text: "College", style: { fontSize: "11px" } },
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "11px", colors: isDark ? "#94a3b8" : "#374151" },
            rotate: 0,
            trim: false,
            hideOverlappingLabels: false,
            maxHeight: 120,
          },
        },
        yaxis: {
          title: { text: "Count", style: { fontSize: "11px" } },
          labels: {
            style: { fontSize: "11px", colors: isDark ? "#94a3b8" : "#374151" },
          },
        },
        grid: {
          borderColor: isDark ? "#1e293b" : "#E0E6ED",
          strokeDashArray: 4,
        },
        dataLabels: { enabled: false },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "12px",
          labels: { colors: isDark ? "#cbd5e1" : "#374151" },
        },
        tooltip: { shared: true, intersect: false },
        noData: { text: "No data available" },
      },
    };
  };

  // Positions Filled vs Openings — by department (not month)
const getFilledVsOpeningsChart = () => {
  const src = dashboard?.position_fill_trend ?? [];

  return {
    series: [
      {
        name: "Job Postings",
        data: src.map((d: any) => d.job_postings),
      },
      {
        name: "Openings",
        data: src.map((d: any) => d.openings),
      },
      {
        name: "Positions Filled",
        data: src.map((d: any) => d.positions_filled),
      },
    ],

    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },

      // Very light gradient
      fill: {
          type: "gradient",
          gradient: {
  shadeIntensity: 0.1,
  opacityFrom: 0.15,
  opacityTo: 0.35,
  stops: [0, 100],
},
      },

      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "55%",
          borderRadius: 4,
        },
      },

      dataLabels: {
        enabled: false,
      },

      colors: isDark
        ? ["#818cf8", "#fbbf24", "#34d399"]
        : ["#1f46b3", "#d97706", "#007550"],

      xaxis: {
        categories: src.map(
          (d: any) => d.department_name
        ),

        title: {
          text: "Count",
          style: {
            fontSize: "11px",
            color: isDark ? "#94a3b8" : "#374151",
          },
        },

        labels: {
          formatter: (value: string) => wrapChartLabel(value),
          style: {
            fontSize: "11px",
            colors: isDark ? "#94a3b8" : "#374151",
          },
        },

        axisBorder: {
          show: true,
        },

        axisTicks: {
          show: true,
        },

        position: "bottom",
      },

      yaxis: {
        labels: {
          show: true,
          style: {
            fontSize: "10px",
            colors: isDark ? "#94a3b8" : "#374151",
          },
        },

        title: {
          text: "Department",
          style: {
            fontSize: "11px",
            color: isDark ? "#94a3b8" : "#374151",
          },
        },

        axisBorder: {
          show: false,
        },

        axisTicks: {
          show: false,
        },
      },

      grid: {
        borderColor: isDark ? "#1e293b" : "#E0E6ED",
        strokeDashArray: 0.2,
        strokeWidth: 0.5,

        xaxis: {
          lines: {
            show: true,
          },
        },

        yaxis: {
          lines: {
            show: false,
          },
        },
      },

      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        labels: {
          colors: isDark ? "#cbd5e1" : "#374151",
        },
      },

      tooltip: {
        shared: true,
        intersect: false,
      },

      noData: {
        text: "No data available",
      },
    },
  };
};

  // Selection Rate Trend — bars for applications/selected + line for rate on secondary axis
  const getSelectionRateChart = () => {
    const src = dashboard?.selection_rate_trend ?? [];
    return {
      series: [{ name: 'Selection Rate (%)', data: src.map((d) => d.selection_rate ?? 0) }],
      options: {
        chart: { type: 'area', height: 320, toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: 'smooth', width: 3 },
        colors: ['#1f46b3'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1,  stops: [0, 100] } },
        xaxis: {
          categories: src.map((d) => d.month),
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: '11px' },
          },
          title: { text: 'Month', style: { fontSize: '11px' } },
        },
        yaxis: { title: { text: 'Selection Rate (%)', style: { fontSize: '11px' } }, labels: { style: { fontSize: '11px' }, formatter: (v) => v + '%' }, min: 0 },
        grid: { borderColor: isDark ? '#191E3A' : '#E0E6ED', strokeDashArray: 5 },
        markers: { size: 5, colors: ['#007550'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 7 } },
        tooltip: { y: { formatter: (v) => v + '%' } },
        legend: { show: false },
        dataLabels: { enabled: false },
        noData: { text: 'No data available' },
      },
    };
  };

  // Immediate vs Regular Hiring — mixed: line for immediate, area for regular
  const getHiringTypeChart = () => {
    const src = dashboard?.immediate_vs_regular_job_postings ?? [];
    return {
      series: [
        {
          name: "Immediate",
          type: "line",
          data: src.map((d: any) => d.immediate_job_postings),
        },
        {
          name: "Regular",
          type: "area",
          data: src.map((d: any) => d.regular_job_postings),
        },
      ],
      options: {
        chart: { type: "line", height: 320, toolbar: { show: false } },
        stroke: { curve: "smooth", width: [3, 2] },
        colors: ["#007550", "#1f46b3"],
        fill: {
          type: ["solid", "gradient"],
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.25,
            opacityTo: 0.02,
            stops: [0, 100],
          },
        },
        xaxis: {
          categories: src.map((d: any) => d.month),
          labels: {
            formatter: (value: string) => wrapChartLabel(value),
            style: { fontSize: "12px" },
          },
          title: {
            text: "Month",
            style: { fontSize: "12px", fontWeight: 500 },
          },
        },
        yaxis: {
          title: {
            text: "Job Count",
            style: { fontSize: "12px", fontWeight: 500 },
          },
          labels: { style: { fontSize: "12px" } },
        },
        grid: {
          borderColor: isDark ? "#191E3A" : "#E0E6ED",
          strokeDashArray: 5,
        },
        markers: {
          size: [5, 0],
          strokeColors: "#fff",
          strokeWidth: 2,
          hover: { size: 7 },
        },
        legend: { position: "top", horizontalAlign: "right", fontSize: "12px" },
        tooltip: { shared: true, intersect: false },
        noData: { text: "No data available" },
      },
    };
  };

  /* ---------------- DUMMY CHART DATA ---------------- */

  const dummyVolumeTrend = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    applicants: [18, 32, 27, 45, 38, 52, 61, 47, 55, 70, 63, 80],
    selected: [4, 8, 6, 12, 9, 14, 18, 11, 15, 20, 17, 24],
  };

  const dummyUrgency = [
    { range: "0–30 days", count: 14 },
    { range: "31–60 days", count: 22 },
    { range: "61–90 days", count: 9 },
    { range: "90+ days", count: 5 },
  ];

  const dummyDepartment = [
    { name: "CS", applicants: 42, selected: 10 },
    { name: "ECE", applicants: 35, selected: 8 },
    { name: "Mech", applicants: 28, selected: 6 },
    { name: "Civil", applicants: 20, selected: 4 },
    { name: "MBA", applicants: 18, selected: 5 },
    { name: "Physics", applicants: 12, selected: 3 },
  ];

  const dummyCollege = [
    { name: "Arts College", applicants: 38, selected: 9 },
    { name: "Engg College", applicants: 55, selected: 14 },
    { name: "Science College", applicants: 30, selected: 7 },
    { name: "Law College", applicants: 18, selected: 4 },
    { name: "Med College", applicants: 22, selected: 6 },
  ];

  const dummyApplyType = { internal: 68, external: 32 };

  const dummyExperience = [
    { label: "Fresher (0–1 yr)", value: 34 },
    { label: "Junior (1–3 yrs)", value: 28 },
    { label: "Mid (3–6 yrs)", value: 22 },
    { label: "Senior (6–10 yrs)", value: 11 },
    { label: "Expert (10+ yrs)", value: 5 },
  ];

  // NEW: Positions Filled vs Openings per department
  const dummyFilledVsOpenings = [
    { dept: "CS", openings: 8, filled: 6 },
    { dept: "ECE", openings: 6, filled: 4 },
    { dept: "Mech", openings: 5, filled: 5 },
    { dept: "Civil", openings: 4, filled: 2 },
    { dept: "MBA", openings: 3, filled: 3 },
    { dept: "Physics", openings: 2, filled: 1 },
  ];

  // NEW: Selection Rate Trend (% selected per month)
  const dummySelectionRate = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    rate: [22, 25, 22, 27, 24, 27, 30, 23, 27, 29, 27, 30],
  };

  // NEW: Immediate vs Regular Hiring
  const dummyHiringType = [
    { month: "Jan", immediate: 5, regular: 13 },
    { month: "Feb", immediate: 8, regular: 24 },
    { month: "Mar", immediate: 6, regular: 21 },
    { month: "Apr", immediate: 10, regular: 35 },
    { month: "May", immediate: 9, regular: 29 },
    { month: "Jun", immediate: 12, regular: 40 },
  ];

  // NEW: Stage Drop-off Analysis — pipeline: Applied > Interview > Selected / Waitlist > Joined
  const dummyDropoff = {
    applied: { total: 200, dropped: 0 },
    interview: { total: 120, dropped: 80 },
    selected: { total: 45, dropped: 0 },
    waitlist: { total: 30, dropped: 0 },
    joined: { total: 38, dropped: 37 }, // selected(45) - joined(38) + waitlist who joined
  };

  const chartColors = isDark
    ? ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#c084fc", "#22d3ee"]
    : ["#1f46b3",  "#007550", "#d97706", "#dc2626", "#9333ea", "#0891b2", "#4f46e5", "#b20865", "#b20808"];

  const darkChartTheme = isDark
    ? {
        background: "transparent",
        foreColor: "#94a3b8",
      }
    : {};

  /* ---------------- STAT CARDS ---------------- */

  const filterLables = [
    { label: "Last 7 Days", value: "7d" },
    { label: "1 Month", value: "1m" },
    { label: "Last Month", value: "last_month" },
    { label: "Last 3 Months", value: "3m" },
    { label: "6 Months", value: "6m" },
    { label: "1 Year", value: "1y" },
  ];

  const callListByRole = (
    page: number,
    listFn: (
      page: number,
      ins?: any,
      college?: any,
      dept?: any,
      profileId?: any,
    ) => void,
  ) => {
    const role = state.profile?.role;
    if (role === ROLES.SUPER_ADMIN) {
      listFn(page, null, null, null, state.profile?.id);
    } else if (role === ROLES.INSTITUTION_ADMIN) {
      listFn(
        page,
        state.profile?.institution?.id,
        null,
        null,
        state.profile?.id,
      );
    } else if (role === ROLES.HR) {
      listFn(
        page,
        null,
        state.profile?.college?.map((c: any) => c?.college_id),
        null,
        state.profile?.id,
      );
    } else if (role === ROLES.HOD) {
      listFn(
        page,
        null,
        null,
        state.profile?.department?.department_id,
        state.profile?.id,
      );
    }
  };

  const handleUpdateStatus = async (row: any, newStatus: string) => {
    try {
      const role = state.profile?.role;
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleEdit = (row) => {
    router.push(`/faculty/application_detail?id=${row?.id}`);
  };

  const handleDownloadResume = (row) => {
    if (row?.resume) {
      window.open(row.resume, "_blank");
    }
  };

  const handleRound = async (row) => {
    try {
      const body = {
        applicant_id: row?.id,
      };
      const res: any = await Models.application.details(row?.id);
      console.log("res", res);

      // const res: any = await Models.interview.user_interview_list(body);
      // const res: any = await Models.application.details(row?.id);

      setState({
        interview_round_list: res?.interview_slots,
        loading: false,
        appstatus: row?.application_status,
      });

      setState({ isOpenRound: true });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleCollegeChange = (selectedOption: any) => {
    setState({
      collegeFilter: selectedOption,
      departmentFilter: null,
      departmentList: [],
      page: 1,
    });
    // if (selectedOption?.value) {
    //   departmentDropdownList(
    //     1,
    //     "",
    //     false,
    //     selectedOption.value,
    //     state.profile?.id
    //   );
    // }
  };
  console.log("✌️state.count --->", state.count);

  const getTitile = () => {
    let title = "";
    if (state.activeCard == 1) {
      title = "Application List";
    } else if (state.activeCard == 2) {
      title = "Application Updates";
    } else if (state.activeCard == 3) {
      title = "Interview Scheduled List";
    } else if (state.activeCard == 4) {
      title = "Talents Identified List";
    } else if (state.activeCard == 5) {
      title = "Job Postings";
    }
    return title;
  };

  const isAnonymous = (row: any) => {
    console.log("✌️row --->", row);
    if (!row?.reveal_name) {
      const is_responses = row?.interesteds?.some(
        (item: any) => item?.is_status == "Accepted",
      );
      return is_responses ? false : true;
    }
    return false;
  };

  const safeUser = (row: any) => {
    if (!isAnonymous(row)) return row;

    return {
      ...row,
      username: "Anonymous Faculty",
      email: null,
      phone: null,
    };
  };

  const updateStatus = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        status: state.appstatus?.label,
      };
      const res = await Models.application.update(body, state.application?.id);
      Success("Application status updated successfully!");
      setState({ btnLoading: false, isOpenRound: false });
      handleUpdateStatus("", "");
      fetchDashboard("", state.profile);
    } catch (error) {
      setState({ btnLoading: false, isOpenRound: false });

      console.log("✌️error --->", error);
    }
  };

  const handleStatusSubmit = async () => {
    try {
      if (!state.selectedStatus) {
        Failure("Please select a status");
        return;
      }
      const body = {
        status: state.selectedStatus.label,
      };
      await Models.application.update(body, state.selectedApplication?.id);
      Success("Application status updated successfully!");
      setState({
        showStatusModal: false,
        selectedApplication: null,
        selectedStatus: null,
      });
      handleUpdateStatus("", "");
      fetchDashboard("", state.profile);
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleApprove = async (row: any) => {
    const result = await Swal.fire({
      title: row.is_approved ? "Unapprove Job?" : "Approve Job?",
      text: row.is_approved
        ? "Are you sure you want to unapprove this job?"
        : "Are you sure you want to approve this job?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1E3786",
      cancelButtonColor: "#d33",
      confirmButtonText: row.is_approved
        ? "Yes, unapprove it!"
        : "Yes, approve it!",
    });

    if (result.isConfirmed) {
      try {
        const formData = buildFormData({ is_approved: !row.is_approved });
        await Models.job.update(formData, row?.id);
        Success(
          row.is_approved
            ? "Job unapproved successfully!"
            : "Job approved successfully!",
        );
        jobList(
          state.page,
          null,
          state.profile?.college?.map((c: any) => c.college_id),
          null,
        );
        fetchDashboard("", state.profile);
      } catch (error) {
        Failure(
          row.is_approved ? "Failed to unapprove job" : "Failed to approve job",
        );
      }
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row?.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this job?",
    );
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.job.delete(id);
      Success("Job deleted successfully!");
      jobList(
        state.page,
        null,
        state.profile?.college?.map((c: any) => c.college_id),
        null,
      );
      fetchDashboard("", state.profile);
    } catch (error) {
      Failure("Failed to delete job");
    }
  };

  const handleFormChange = (field, value) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  const sendInterest = async () => {
    try {
      setState({ sendLoading: true });

      const body = {
        message: capitalizeFLetter(state.message),
        applicant_id: state.applicantId,
        sender_id: state.profile?.id,
        job_id: state.interestJob?.value,
        hr_interview_status: "Sent Interest",
      };

      const res = await Models.application.send_interest(body);
      Success("Interest sent successfully!");
      setState({ sendLoading: false });
      setState({
        isOpenInterest: false,
        message: "",
        applicantName: "",
        applicantId: "",
        job_id: "",
        hr_interview_status: "",
      });
      userList(1, null, null, null);
    } catch (error) {
      if (error?.data?.error) {
        Failure(error?.data?.error);
      }
      console.log("✌️error --->", error);
      setState({ sendLoading: false });
      setState({
        isOpenInterest: false,
        message: "",
        applicantName: "",
        applicantId: "",
      });
      console.log("✌️error --->", error);
    }
  };

  const createInterview = async () => {
    try {
      setState({ submitting: true });

      const validation = {
        interviewSlot: state.interviewSlot
          ? moment(state.interviewSlot).format("YYYY-MM-DD HH:mm")
          : "",
        roundName: state.roundName,
      };

      await Utils.Validation.user_interview.validate(validation, {
        abortEarly: false,
      });

      const body = {
        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        applicant_id: state.applicant?.value,
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link ?? "",
        sender_id: state.profile?.id,
      };
      console.log("✌️body --->", body);

      const res = await Models.interview.create_user_interview(body);
      Success("Interview schedule created successfully!");
      setState({
        showInterviewModal: false,
        errors: {},
        selectedApplicants: [],
        interviewSlot: "",
        roundName: "",
        requestForChange: false,
        interviewStatus: null,
        submitting: false,
        interview_link: "",
        selectedRecords: [],
      });
      // profile();
    } catch (error) {
      console.log("✌️error --->", error);
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️errors --->", validationErrors);

        setState({ errors: validationErrors, submitting: false });
      } else {
        Failure(error?.error);
        setState({ submitting: false });
      }
    }
  };

  const institutionDropdownList = async (
    page,
    search = "",
    loadMore = false,
  ) => {
    try {
      setState({ institutionLoading: true });
      const body = { search };
      const res: any = await Models.institution.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.institution_name,
      }));
      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionList: loadMore
          ? [...state.institutionList, ...dropdown]
          : dropdown,
        institutionNext: res?.next,
      });
    } catch (error) {
      setState({ institutionLoading: false });
    }
  };

  const departmentDropdownList = async (
    page,
    search = "",
    loadMore = false,
    collegeId = null,
    createdBy = null,
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search };
      if (collegeId) {
        body.college = collegeId;
      } else if (state.profile?.role === "hr") {
        body.college = state.profile?.college?.college_id;
      }
      if (createdBy) {
        body.created_by = createdBy;
      }
      body.pagination = "No";
      // body.team = "No";
      const res: any = await Models.department.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.short_name,
      }));
      setState({
        departmentLoading: false,
        departmentPage: page,
        departmentList: loadMore
          ? [...state.departmentList, ...dropdown]
          : dropdown,
        departmentNext: res?.next,
      });
    } catch (error) {
      setState({ departmentLoading: false });
    }
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setState({ departmentFilter: selectedOption, page: 1 });
  };

  const getUser = async (row) => {
    try {
      setState({
        profileUserLoading: true,
        isOpenProfile: true,
        profileActiveTab: "profile",
        profileActiveSection: "summary",
      });
      const res: any = await Models.auth.getUser(row?.id);
      setState({ userProfile: res, profileUserLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState({ profileUserLoading: false });
    }
  };

  const handleSheduleInterview = (row) => {
    setState({
      showInterviewModal: true,
      applicant: {
        label: row?.username,
        value: row.id,
      },
    });
    console.log("✌️row --->", row);
  };

  return (
    <div className="dark:from-gray-900 dark:to-gray-800">
      <div className=" flex justify-between">
        {/* Filters */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {filterLables?.map((p) => (
            <button
              key={p.value}
              onClick={() => setActivePeriod(p.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                activePeriod === p.value
                  ? " bg-dblue text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-2">
            <CustomeDatePicker
              value={fromDate}
              placeholder="From Date"
              onChange={(e) => {
                setFromDate(e);
                setActivePeriod("custom");
              }}
              showTimeSelect={false}
            />
            <CustomeDatePicker
              value={toDate}
              placeholder="To Date"
              onChange={(e) => {
                setToDate(e);
                setActivePeriod("custom");
              }}
              showTimeSelect={false}
            />
          </div>
        </div>
        <button
          onClick={() => router.push("faculty/newjob")}
          className="tour-add-job bg-dblue group relative ms-auto inline-flex h-fit w-[150px] transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-white  shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl xl:w-[120px]"
        >
          <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
          <IconPlus className="relative z-10 h-5 w-5" />
          <span className="relative z-10 whitespace-nowrap">Add Jobs</span>
        </button>
      </div>

      {(fromDate || toDate || (activePeriod && activePeriod !== "custom")) && (
        <div className="mb-6 mt-1 flex flex-wrap items-center gap-2">
          {activePeriod && activePeriod !== "custom" && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-black dark:bg-blue-900 dark:text-blue-200">
              {filterLables.find((f) => f.value === activePeriod)?.label}
              <button
                onClick={() => {
                  setActivePeriod("6m");
                  setFromDate(null);
                  setToDate(null);
                }}
                className="rounded-full p-0.5 hover:bg-blue-200 "
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {fromDate && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-black dark:bg-blue-900 dark:text-blue-200">
              From: {moment(fromDate).format("DD MMM YYYY")}
              <button
                onClick={() => {
                  setFromDate(null);
                  if (!toDate) setActivePeriod("6m");
                }}
                className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {toDate && (
            <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-black dark:bg-blue-900 dark:text-blue-200">
              To: {moment(toDate).format("DD MMM YYYY")}
              <button
                onClick={() => {
                  setToDate(null);
                  if (!fromDate) setActivePeriod("6m");
                }}
                className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(activePeriod !== "6m" || fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate(null);
                setToDate(null);
                setActivePeriod("6m");
              }}
              className="flex items-center gap-1 text-xs text-red-500 hover:underline"
            >
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>
      )}

       {/* College filter above stat cards — only for roles with college list */}
      {state.collegeList?.length > 0 && (
        <div className="mb-5 w-56">
          <CustomSelect
            options={state.collegeList}
            value={state.dashboardCollegeFilter}
            onChange={(e) => {
              setState({ dashboardCollegeFilter: e });
              const params = activePeriod !== "custom"
                ? { period: activePeriod }
                : fromDate && toDate
                ? { from: moment(fromDate).format("YYYY-MM-DD"), to: moment(toDate).format("YYYY-MM-DD") }
                : { period: activePeriod };
              fetchDashboard(params, state.profile, e?.value ?? null);
            }}
            placeholder="Filter by College"
            isClearable
          />
        </div>
      )}

      {/* Stat Cards */}
      <div className="tour-stat-cards mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
        {state.cards?.map((card) => {
          const isActive = state.activeCard === card.id && CARD_FETCH_MAP[card.id] && state.activeCard !== null;
          return (
            <div
              key={card.label}
              className={`cursor-pointer rounded-xl p-3 transition-all duration-200 ${card.mainbg} ${
                isActive ? "ring-2 ring-offset-1 scale-[1] shadow-lg" : "shadow-md hover:shadow-md"
              }`}
              style={
                isActive
                  ? { "--tw-ring-color": card.accentColor } as React.CSSProperties
                  : { border: "1px solid #aebdf1" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.border = `1px solid ${card.accentColor}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLDivElement).style.border = "1px solid #aebdf1";
                }
              }}
              onClick={() => setState({ activeCard: state.activeCard === card.id ? null : card.id })}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`mt-0.5 shrink-0 rounded-full bg-white/60 p-1.5 ${card.color}`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xl font-bold leading-tight text-black`}
                  >
                    {card.value}
                  </div>
                  <div className="truncate text-xs text-black" title={card.label}>
                    {card.label}
                  </div>
                  {/* {isActive && (
                  <div className={`mt-1 h-0.5 w-full rounded-full opacity-60 ${card.color.replace('text-', 'bg-')}`} />
                )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card-driven table */}
      {CARD_FETCH_MAP[state.activeCard] && (
        <div className="panel shadow-md border-gray rounded-xl shadow-md border-gray rounded-xl mb-6 mt-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              {CARD_TITLES[state.activeCard]}
            </h2>
            {/* <TextInput
              placeholder="Search..."
              value={state.cardSearch}
              onChange={(e) =>
                setState({ cardSearch: e.target.value, cardTablePage: 1 })
              }
              icon={<IconSearch className="h-4 w-4" />}
            /> */}
          </div>
          <DataTable
            noRecordsText="No data found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.cardTableData}
            fetching={state.cardTableLoading}
            columns={CARD_COLUMNS[state.activeCard] ?? []}
            customLoader={
              <div className="flex items-center justify-center py-10">
                <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            }
            minHeight={160}
          />
          {state.cardTableCount > 10 && (
            <div className="mt-3">
              <Pagination
                activeNumber={(p) => setState({ cardTablePage: p })}
                totalPage={state.cardTableCount}
                currentPages={state.cardTablePage}
                pageSize={10}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Charts Section ── */}

      {/* Row 1: Application Volume Trend (area) 2/3 + Experience Level Donut 1/3 */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-2">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Application Volume Trend
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Monthly applicants vs selected — x: month/year · y: count
          </p> */}
          {isMounted &&
            (() => {
              const c = getVolumeTrendChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="area"
                  height={270}
                />
              );
            })()}
        </div>
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-1">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Applications by Experience Level
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Donut — share per experience band
          </p> */}
          {isMounted &&
            (() => {
              const c = getExperienceDonutChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="donut"
                  height={250}
                />
              );
            })()}
        </div>
      </div>

       <div className="mb-5 grid grid-cols-1">
        <div className="panel shadow-md border-gray rounded-xl col-span-1">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Applications by Department
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Horizontal bar — department · applicants vs selected
          </p> */}
          {isMounted &&
            (() => {
              const c = getDepartmentBarChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="bar"
                  height={360}
                />
              );
            })()}
        </div>
      </div>
   



      

      {/* Row 4: Full Overview Trend + Interviews & Decisions stacked */}
      {/* <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-2">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">Jobs, Applications & Registrations Overview</h5>
          <p className="mb-3 text-xs text-black">Full trend across all key metrics</p>
          {isMounted && <ReactApexChart series={trendChart.series} options={trendChart.options} type="area" height={270} />}
        </div>
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-1 flex flex-col gap-3">
          <div>
            <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">Interviews Scheduled</h5>
            <p className="mb-1 text-xs text-black">Monthly interview volume</p>
            {isMounted && <ReactApexChart series={interviewChart.series} options={{ ...interviewChart.options, chart: { ...interviewChart.options.chart, height: 120 }, xaxis: { labels: { style: { fontSize: "10px" } } } }} type="bar" height={120} />}
          </div>
          <div className="border-t border-gray-100 pt-2 dark:border-gray-700">
            <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">Decisions</h5>
            <p className="mb-1 text-xs text-black">Selected vs Rejected over time</p>
            {isMounted && <ReactApexChart series={decisionChart.series} options={{ ...decisionChart.options, chart: { ...decisionChart.options.chart, height: 120 }, xaxis: { labels: { style: { fontSize: "10px" } } } }} type="bar" height={120} />}
          </div>
        </div>
      </div> */}

      {/* Row 5: + Selection Rate (2/5) */}
      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
        
        
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-3">
          <h5 className="mb-4 !text-lg font-semibold text-black dark:text-white">
            Stage Drop-off Analysis
          </h5>
          {(() => {
            const d = dashboard?.stage_dropoff_analysis;
            const applied = d?.applied ?? 0;
            const interview = d?.interview ?? 0;
            const selected = d?.selected ?? 0;
            const waitlisted = d?.waitlisted ?? 0;
            const joined = d?.joined ?? 0;
            const a2i = d?.applied_to_interview ?? { moved: 0, not_moved: 0 };
            const i2s = d?.interview_to_selected ?? { moved: 0, not_moved: 0 };
            const i2w = d?.interview_to_waitlisted ?? { moved: 0, not_moved: 0 };
            const s2j = d?.selected_to_joined ?? { moved: 0, not_moved: 0 };

            const StageCard = ({ label, value, icon, borderColor, bgColor, iconBg, valueColor, moved, dropped }: {
              label: string; value: number; icon: React.ReactNode;
              borderColor: string; bgColor: string; iconBg: string; valueColor: string;
              moved?: number; dropped?: number;
            }) => (
              <div className="overflow-hidden rounded-2xl shadow-sm" style={{ border: `1.5px solid ${borderColor}`, minWidth: 180 }}>
                <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: bgColor }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
                    {icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: valueColor }}>{value}</div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{label}</div>
                  </div>
                </div>
                {(moved !== undefined || dropped !== undefined) && (
                  <div className="grid grid-cols-2 divide-x border-t" style={{ borderColor, borderTopColor: borderColor }}>
                    <div className="flex flex-col items-center py-2">
                      <span className="text-lg font-bold text-[#128639]">{moved ?? 0}</span>
                      <span className="text-[14px] text-black">Moved</span>
                    </div>
                    <div className="flex flex-col items-center py-2">
                      <span className="text-lg font-bold text-[#dc2626]">{dropped ?? 0}</span>
                      <span className="text-[14px] text-black">Dropped</span>
                    </div>
                  </div>
                )}
              </div>
            );

            const DropCard = ({ count }: { count: number }) => (
              <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#dc2626] bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-900/20" style={{ minWidth: 120 }}>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#dc2626] text-white text-[8px] font-bold">✕</span>
                  <span className="text-xl font-bold text-black">{count}</span>
                </div>
                <span className="text-xs text-black">Dropped off</span>
              </div>
            );

            const MovedCard = () => (
              <div className="flex flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-900/20" style={{ minWidth: 120 }}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-xs">✓</span>
                <span className="text-[11px] text-black">Moved to next stage</span>
              </div>
            );

            // Vertical connector with dot at bottom
            const VConn = ({ color = "#a5b4fc" }: { color?: string }) => (
              <div className="flex flex-col items-center" style={{ height: 32 }}>
                <div className="flex-1 w-px" style={{ backgroundColor: color }} />
                <div className="h-2.5 w-2.5 rounded-full border-2 bg-white dark:bg-gray-900" style={{ borderColor: color }} />
              </div>
            );

            // Horizontal fork: draws a T-shape connecting two children
            const HFork = ({ color = "#a5b4fc", leftPct = "25%", rightPct = "75%" }: { color?: string; leftPct?: string; rightPct?: string }) => (
              <div className="relative w-full" style={{ height: 32 }}>
                {/* vertical stem from top center */}
                <div className="absolute top-0 left-1/2 w-px" style={{ height: "50%", backgroundColor: color, transform: "translateX(-50%)" }} />
                {/* horizontal bar */}
                <div className="absolute" style={{ top: "50%", left: leftPct, right: `calc(100% - ${rightPct})`, height: 1, backgroundColor: color }} />
                {/* left drop */}
                <div className="absolute" style={{ top: "50%", left: leftPct, width: 1, height: "50%", backgroundColor: color }} />
                {/* right drop */}
                <div className="absolute" style={{ top: "50%", left: rightPct, width: 1, height: "50%", backgroundColor: color, transform: "translateX(-1px)" }} />
                {/* left dot */}
                <div className="absolute" style={{ bottom: 0, left: leftPct, transform: "translate(-50%, 50%)", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, backgroundColor: "white" }} />
                {/* right dot */}
                <div className="absolute" style={{ bottom: 0, left: rightPct, transform: "translate(-50%, 50%)", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, backgroundColor: "white" }} />
              </div>
            );

            // Small fork for leaf level (two children from one parent)
            const LeafFork = ({ color = "#a5b4fc" }: { color?: string }) => (
              <div className="relative w-full" style={{ height: 32 }}>
                <div className="absolute top-0 left-1/2 w-px" style={{ height: "50%", backgroundColor: color, transform: "translateX(-50%)" }} />
                <div className="absolute" style={{ top: "50%", left: "20%", right: "20%", height: 1, backgroundColor: color }} />
                <div className="absolute" style={{ top: "50%", left: "20%", width: 1, height: "50%", backgroundColor: color }} />
                <div className="absolute" style={{ top: "50%", right: "20%", width: 1, height: "50%", backgroundColor: color }} />
                <div className="absolute" style={{ bottom: 0, left: "20%", transform: "translate(-50%, 50%)", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, backgroundColor: "white" }} />
                <div className="absolute" style={{ bottom: 0, right: "20%", transform: "translate(50%, 50%)", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${color}`, backgroundColor: "white" }} />
              </div>
            );

            return (
              <div className="w-full overflow-x-auto">
                <div className="flex min-w-[520px] flex-col items-center pb-6">

                  {/* ── Applied ── */}
                  <StageCard label="Applied" value={applied}
                    borderColor="#537bd7" bgColor={isDark ? "#1e3a5f22" : "#dfe9ff"} iconBg="#fff" valueColor="#000"
                    icon={<IconUsers className="h-5 w-5 text-black" />}
                    moved={a2i.moved} dropped={a2i.not_moved}
                  />
                  <VConn color="#acabab" />

                  {/* ── Interview ── */}
                  <StageCard label="Interview" value={interview}
                    borderColor="#ffa339" bgColor={isDark ? "#3d2e0022" : "#ffe2c0"} iconBg="#fff" valueColor="#000"
                    icon={<IconUsers className="h-5 w-5 text-black" />}
                    moved={i2s.moved + i2w.moved} dropped={i2s.not_moved + i2w.not_moved}
                  />

                  {/* ── Fork: Interview → Selected + Waitlisted ── */}
                  <HFork color="#acabab" leftPct="25%" rightPct="75%" />

                  {/* ── Selected + Waitlisted row ── */}
                  <div className="flex w-full items-start justify-around gap-4 px-2">

                    {/* LEFT: Selected branch */}
                    <div className="flex flex-1 flex-col items-center">
                      <StageCard label="Selected" value={selected}
                        borderColor="#128639" bgColor={isDark ? "#06402022" : "#f0fdf4"} iconBg="#fff" valueColor="#000"
                        icon={<IconUsers className="h-5 w-5 text-black" />}
                        moved={s2j.moved} dropped={s2j.not_moved}
                      />
                      {/* Only show children if selected > 0 */}
                      {selected > 0 && (
                        <>
                          <LeafFork color="#acabab" />
                          <div className="flex w-full justify-around gap-2 px-2">
                            <StageCard label="Joined" value={joined}
                              borderColor="#128639" bgColor={isDark ? "#06402022" : "#f0fdf4"} iconBg="#fff" valueColor="#000"
                              icon={<IconUsers className="h-5 w-5 text-black" />}
                              moved={s2j.moved}
                            />
                            <DropCard count={s2j.not_moved} />
                          </div>
                        </>
                      )}
                    </div>

                    {/* RIGHT: Waitlisted branch */}
                    <div className="flex flex-1 flex-col items-center">
                      <StageCard label="Waitlisted" value={waitlisted}
                        borderColor="#537bd7" bgColor={isDark ? "#2e1a5522" : "#dfe9ff"} iconBg="#fff" valueColor="#000"
                        icon={<IconUsers className="h-5 w-5 text-black" />}
                        moved={i2w.moved} dropped={i2w.not_moved}
                      />
                      {/* Only show children if waitlisted > 0 */}
                      {waitlisted > 0 && (
                        <>
                          <LeafFork color="#acabab" />
                          <div className="flex w-full justify-around gap-2 px-2">
                            <MovedCard />
                            <DropCard count={i2w.not_moved} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mt-10 flex items-center gap-6 text-[12px] text-black">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#128639]" /> Moved to next stage</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" /> Dropped off</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>


        <div className=" xl:col-span-2 flex flex-col space-y-5">
          <div className="panel shadow-md border-gray rounded-xl">
          <h5 className="mb-5 !text-lg font-semibold text-black dark:text-white">
            Applications by Source
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Internal vs External applicants
          </p> */}
          {(() => {
            const src = dashboard?.applications_by_source ?? [];
            const internal = src.find((d: any) => d.source === "internal")?.applications ?? 0;
            const external = src.find((d: any) => d.source === "external")?.applications ?? 0;
            const total = internal + external || 1;
            const internalPct = Math.round((internal / total) * 100);
            const externalPct = 100 - internalPct;
            const r = 54;
            const circ = 2 * Math.PI * r;
            const internalDash = (internalPct / 100) * circ;
            const externalDash = (externalPct / 100) * circ;
            return (
              <div className="flex flex-col items-center gap-6 py-2">
                {/* Donut */}
                <div className="relative flex items-center justify-center">
                  <svg width="200" height="150" viewBox="0 0 140 140">
                    {/* bg track */}
                    <circle cx="70" cy="70" r={r} fill="none" stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth="18" />
                    {/* external arc (amber) — drawn first, full circle offset */}
                    <circle cx="70" cy="70" r={r} fill="none" stroke="#ffa339" strokeWidth="18"
                      strokeDasharray={`${externalDash} ${circ - externalDash}`}
                      strokeDashoffset={-(internalDash)}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
                    />
                    {/* internal arc (blue) */}
                    <circle cx="70" cy="70" r={r} fill="none" stroke="#1f46b3" strokeWidth="18"
                      strokeDasharray={`${internalDash} ${circ - internalDash}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">{total}</span>
                    <span className="text-[10px] text-black">Total</span>
                  </div>
                </div>
                {/* Stat rows */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-[#dfe9ff] px-4 py-3 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#1f46b3]" />
                      <span className="text-md font-medium text-black dark:text-gray-300">Internal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-black">{internal}</span>
                      {/* <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-800 dark:text-blue-200">{internalPct}%</span> */}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[#ffe2c0] px-4 py-3 dark:bg-amber-900/20">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#ffa339]" />
                      <span className="text-md font-medium text-black dark:text-gray-300">External</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-black">{external}</span>
                      {/* <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-800 dark:text-amber-200">{externalPct}%</span> */}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="panel shadow-md border-gray rounded-xl">
          <h5 className="mb-3 !text-lg font-semibold text-black dark:text-white">
            Application Funnel
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Stage-wise conversion pipeline
          </p> */}
          {isMounted &&
            (() => {
              if (dashboard?.application_funnel?.length > 0) {
                const funnelItems = dashboard.application_funnel.reduce(
                  (acc: any[], f: any) => {
                    if (f.selected !== undefined || f.rejected !== undefined) {
                      if (f.selected !== undefined)
                        acc.push({
                          name: "Selected",
                          value: f.selected,
                          fill: "#007550",
                        });
                      if (f.rejected !== undefined)
                        acc.push({
                          name: "Rejected",
                          value: f.rejected,
                          fill: "#dc2626",
                        });
                    } else {
                      acc.push({
                        name: f.stage,
                        value: f.value,
                        fill: ["#4361ee", "#2196f3", "#e2a03f"][acc.length % 3],
                      });
                    }
                    return acc;
                  },
                  [],
                );
                return <Funnel data={funnelItems} />;
              }
              const c = getFunnelDummyChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="bar"
                  height={240}
                />
              );
            })()}
        </div>
        </div>
      </div>

              {/* Positions Filled (3/5) */}
      <div className="mb-5 grid grid-cols-1">
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-3">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Positions Filled vs Openings
          </h5>
          {/* <p className="mb-4 text-xs text-black">
            Job postings, openings and positions filled per department
          </p> */}
          {isMounted &&
            (() => {
              const c = getFilledVsOpeningsChart();
              return (
                <>
                  <ReactApexChart
                    series={c.series}
                    options={c.options as any}
                    type="area"
                    height={400}
                  />
                </>
              );
            })()}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-6">
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-3">
            <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
              Selection Rate Trend
            </h5>
            {/* <p className="mb-4 text-xs text-black">
              Line chart — x: month · y: % selected · dashed line = average
            </p> */}
            {isMounted &&
              (() => {
                const c = getSelectionRateChart();
                return (
                  <ReactApexChart
                    series={c.series}
                    options={c.options as any}
                    type="line"
                    height={360}
                  />
                );
              })()}
        </div>
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-3">
          <h5 className="mb-5 !text-lg font-semibold text-black dark:text-white">
            Job Postings by Urgency
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            x: deadline range · y: job count
          </p> */}
          {isMounted &&
            (() => {
              const c = getUrgencyBarChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="bar"
                  height={300}
                />
              );
            })()}
        </div>
      </div>


      {/* Row 3: Applications by Department (horizontal bar, 3/5) + Applications by College (line, 2/5) */}
      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-3">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Immediate vs Regular Hiring
          </h5>
          {/* <p className="mb-4 text-xs text-black">
            Mixed chart — line (immediate) + area (regular) · x: month · y: job
            count
          </p> */}
          {isMounted &&
            (() => {
              const c = getHiringTypeChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="line"
                  height={320}
                />
              );
            })()}
        </div>
        <div className="panel shadow-md border-gray rounded-xl xl:col-span-2">
          <h5 className="mb-0.5 !text-lg font-semibold text-black dark:text-white">
            Applications by College
          </h5>
          {/* <p className="mb-3 text-xs text-black">
            Line — college · applicants vs selected trend
          </p> */}
          {isMounted &&
            (() => {
              const c = getCollegeBarChart();
              return (
                <ReactApexChart
                  series={c.series}
                  options={c.options as any}
                  type="line"
                  height={360}
                />
              );
            })()}
        </div>
      </div>

      

      {/* ── Bottom Tables Row ── */}
     
        {/* Days to Fill Variance */}
         {state.daysToFillVariance.length > 0 &&
         <div className="panel shadow-md border-gray rounded-xl mb-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Days to Fill Variance
              </h2>
              <p className="text-xs text-black">
                Jobs where actual days to fill is within 10 days of target
              </p>
            </div>
          </div>
          <DataTable
            noRecordsText="No data found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.daysToFillVariance}
            fetching={state.daysToFillVarianceLoading}
            minHeight={160}
            columns={[
              { accessor: "job_role", title: "Job Role" },
              {
                accessor: "department_name",
                title: "Dept",
                sortable: true,
                cellsStyle: {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
                render: ({ department }) => {
                  if (!department || department?.length === 0) {
                    return <span className="text-black">-</span>;
                  }

                  const firstDept = department?.[0];
                  const otherDept = department?.slice(1);
                  const maxShow = 3;
                  const remaining = otherDept?.length - maxShow;
                  const visibleDept = otherDept?.slice(0, maxShow);
                  const hiddenDept = otherDept?.slice(maxShow);

                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* First department text */}
                      <span
                        className="text-sm  text-gray-700 dark:text-gray-300"
                        title={firstDept}
                      >
                        {firstDept}
                      </span>

                      {/* Avatars */}
                      <div className="flex items-center -space-x-2">
                        {visibleDept?.map((dept: string, index: number) => (
                          <div key={index} className="group relative">
                            <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                              {dept?.slice(0, 2)?.toUpperCase()}
                            </div>

                            {/* Tooltip */}
                            <div
                              className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                              title={dept}
                            >
                              {dept}
                            </div>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="group relative">
                            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                              +{remaining}
                            </div>

                            {/* Remaining tooltip */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                              {hiddenDept
                                ?.map((d: string) => capitalizeFLetter(d))
                                .join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              },
              { accessor: "college", title: "College" },
              {
                accessor: "days_to_fill",
                title: "Days to fill",
                textAlignment: "right",
              },
              {
                accessor: "priority",
                title: "Expiration period",
                textAlignment: "right",
              },
              {
                accessor: "variance",
                title: "Variance",
                textAlignment: "right",
                render: (r: any) => (
                  <span
                    className={`font-medium ${
                      r.variance < 0
                        ? "text-green-600"
                        : r.variance <= 7
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.variance > 0 ? `+${r.variance}` : r.variance}
                  </span>
                ),
              },

              {
                accessor: "total_applications",
                title: "Applications",
                sortable: true,
                cellsStyle: {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
                render: ({ total_applications }) => (
                  <span className="text-gray-600 dark:text-black">
                    {total_applications}
                  </span>
                ),
              },

              {
                accessor: "actions",
                title: "Actions",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() =>
                        router.push(`/faculty/job_details?id=${row.id}`)
                      }
                      className="flex  items-center justify-center rounded-lg  text-indigo-600 "
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                    {/* {state.profile?.role == ROLES.HR && ( */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        // if (state.profile?.role == ROLES.HR) {
                        handleApprove(row);
                        // }
                      }}
                      // onClick={() => handleToggleStatus(row)}
                      className={`flex items-center justify-center rounded-lg ${
                        row?.job_status === "published"
                          ? "text-red-600 "
                          : " text-green-600 "
                      }`}
                      title={"Job Status"}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    {/* )} */}
                    {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLog(row);
                          }}
                          className="flex items-center justify-center rounded-lg  text-purple-600 "
                          title="Logs"
                        >
                          <IconHistory className="h-4 w-4" />
                        </button> */}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/faculty/updatejob?id=${row.id}`);
                      }}
                      className="flex  items-center justify-center rounded-lg text-blue-600 "
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>

                    {/* <button
              // onClickCapture={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="flex  items-center justify-center rounded-lg  text-red-600 "
              title="Delete"
            >
              <IconTrash className="h-4 w-4" />
            </button> */}
                  </div>
                ),
              },
            ]}
            customLoader={
              <div className="flex items-center justify-center py-10">
                <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            }
          />
          {state.daysToFillVarianceCount > 10 && (
            <div className="mt-3">
              <Pagination
                activeNumber={(p) => {
                  setState({ daysToFillVariancePage: p });
                  fetchDaysToFillVariance(p);
                }}
                totalPage={state.daysToFillVarianceCount}
                currentPages={state.daysToFillVariancePage}
                pageSize={10}
              />
            </div>
          )}
        </div> }
        
        <div className="panel shadow-md border-gray rounded-xl mb-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Upcomming interviews
              </h2>
             
            </div>
          </div>
          <DataTable
            noRecordsText="No data found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.upCommingInterviewsList}
            fetching={state.upCommingInterviewsLoading}
            minHeight={160}
            columns={[
              { accessor: "job_role", title: "Job Role" },
              { accessor: "candidate", title: "Candidate" },
              { accessor: "department_name", title: "Department" },
              
              { accessor: "college", title: "College" },
              // {
              //   accessor: "applied_date",
              //   title: "Applied date",
              //   // textAlignment: "right",
              // },
              {
        accessor: "status",
        title: "Status",
        render: (r: any) => (
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
            {r.status}
          </span>
        ),
      },
              {
                accessor: "scheduled_date",
                title: "Scheduled date",
                render: (r: any) => (
          <span className="text-xs">
            {r.scheduled_date
              ? moment(r.scheduled_date).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </span>
        ),
                // textAlignment: "right",
              },


           

           

              {
                accessor: "actions",
                title: "Actions",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-3">
                    <button
                       onClick={() => router.push(`/faculty/application_detail?id=${row.applications_id}`)}
                      className="flex  items-center justify-center rounded-lg  text-indigo-600 "
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                  

                   
                  </div>
                ),
              },
            ]}
            customLoader={
              <div className="flex items-center justify-center py-10">
                <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            }
          />
          {state.upCommingInterviewsCount > 10 && (
            <div className="mt-3">
              <Pagination
                activeNumber={(p) => {
                  setState({ upCommingInterviewsPage: p });
                  upCommingInterviews(p);
                }}
                totalPage={state.upCommingInterviewsCount}
                currentPages={state.upCommingInterviewsPage}
                pageSize={10}
              />
            </div>
          )}
        </div> 
     

        {/* Overdue Follow-ups */}
        <div className="panel shadow-md border-gray rounded-xl mb-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Overdue Follow-ups
              </h2>
              <p className="text-xs text-black">
                Applications who need HR follow-up
              </p>
            </div>
          </div>
          <DataTable
            noRecordsText="No data found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.overdueFollowups}
            fetching={state.overdueFollowupsLoading}
            minHeight={160}
            columns={[
              {
                accessor: "candidate",
                title: "Candidate",
                render: (r: any) => (
                  <Link
                    href={`/faculty/application_detail?id=${r.id}`}
                    className="text-dblue hover:underline"
                  >
                    {r.candidate}
                  </Link>
                ),
              },
              { accessor: "job", title: "Job Role" },
              { accessor: "college", title: "College" },
              {
                accessor: "department_name",
                title: "Department",
                render: ({ department_name }) => {
                  if (!department_name || department_name?.length === 0) {
                    return <span className="text-black">-</span>;
                  }

                  const firstDept = department_name?.[0];
                  const otherDept = department_name?.slice(1);
                  const maxShow = 3;
                  const remaining = otherDept?.length - maxShow;
                  const visibleDept = otherDept?.slice(0, maxShow);
                  const hiddenDept = otherDept?.slice(maxShow);

                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* First department text */}
                      <span
                        title={firstDept}
                        className="text-sm  text-gray-700 dark:text-gray-300"
                      >
                        {firstDept}
                      </span>

                      {/* Avatars */}
                      <div className="flex items-center -space-x-2">
                        {visibleDept?.map((dept: string, index: number) => (
                          <div key={index} className="group relative z-10">
                            <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs  text-white dark:border-gray-900">
                              {dept?.slice(0, 2)?.toUpperCase()}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                              {capitalizeFLetter(dept)}
                            </div>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="group relative">
                            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs  text-white dark:border-gray-900">
                              +{remaining}
                            </div>

                            {/* Remaining tooltip */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                              {hiddenDept
                                ?.map((d: string) => capitalizeFLetter(d))
                                .join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
                sortable: true,
              },
              {
                accessor: "status",
                title: "Status",
                render: (r: any) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {r.status}
                  </span>
                ),
              },
              { accessor: "applied_date", title: "Applied Date" },
              { accessor: "status_date", title: "Last Status Date" },
              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex  items-center justify-center rounded-lg  text-green-900 transition-all duration-200 "
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadResume(row)}
                      className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                      title="Resume"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRound(row)}
                      className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
                      title="Interview Round"
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                    </button>

                    {state.profile?.role == ROLES.HR && (
                      <button
                        onClick={() => {
                          setState({
                            showStatusModal: true,
                            selectedApplication: row,
                            selectedStatus: row.application_status,
                          });
                        }}
                        className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200 "
                        title="Update Status"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                    {/* <button
                            onClick={() => handleDelete(row)}
                            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
                            title="Delete"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button> */}
                  </div>
                ),
              },
            ]}
            customLoader={
              <div className="flex items-center justify-center py-10">
                <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            }
          />
          {state.overdueFollowupsCount > 10 && (
            <div className="mt-3">
              <Pagination
                activeNumber={(p) => {
                  setState({ overdueFollowupsPage: p });
                  fetchOverdueFollowups(p);
                }}
                totalPage={state.overdueFollowupsCount}
                currentPages={state.overdueFollowupsPage}
                pageSize={10}
              />
            </div>
          )}
        </div>
     

      <Modal
        subTitle="Interview Rounds"
        open={state.isOpenRound}
        close={() => setState({ isOpenRound: false })}
        closeIcon={() => setState({ isOpenRound: false })}
        padding="px-0 py-5"
        renderComponent={() => (
          <div className="flex h-[75vh] flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-4">
              {/* Candidate */}
              {/* <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-lg font-semibold">
                  {state.application?.first_name} {state.application?.last_name}
                </h3>
                <p className="text-sm text-black">
                  {state.application?.email} • {state.application?.phone}
                </p>
              </div> */}

              {/* Rounds */}
              <div className="space-y-4 pb-6">
                {state.interview_round_list?.length > 0 ? (
                  state.interview_round_list?.map((round) => (
                    <div
                      key={round.id}
                      className="rounded-lg border bg-white px-3 py-2 shadow-sm"
                    >
                      {/* Round Header */}
                      <div className=" flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {capitalizeFLetter(round.round_name)}
                          </p>
                          <p className="text-xs text-black">
                            {formatScheduleDateTime(
                              round.scheduled_date,
                              round.scheduled_time,
                            )}
                          </p>
                        </div>

                        <span
                          className={`rounded px-3 py-1 text-xs font-semibold ${
                            round.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {capitalizeFLetter(round.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center">
                    {" "}
                    No interview found
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Bottom Section */}
            {/* <div className="sticky bottom-0 border-t bg-white p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <CustomSelect
                    options={state.applicationStatusList}
                    value={state.appstatus}
                    onChange={(e) => setState({ appstatus: e })}
                    placeholder="Select final status"
                  />
                </div>

                <button
                  // onClick={() => updateStatus()}
                  className="bg-dblue rounded px-5 py-2 text-white"
                >
                  Update Status
                </button>
              </div>
            </div> */}
          </div>
        )}
      />

      <Modal
        subTitle="Update Application Status"
        closeIcon
        open={state.showStatusModal}
        close={() =>
          setState({
            showStatusModal: false,
            selectedApplication: null,
            selectedStatus: null,
          })
        }
        renderComponent={() => (
          <div className="p-6">
            <div className="mb-6">
              <CustomSelect
                options={state.applicationStatusList}
                value={state.selectedStatus}
                onChange={(e) => setState({ selectedStatus: e })}
                placeholder="Select status"
                loading={state.applicationStatusLoading}
                isClearable={false}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setState({
                    showStatusModal: false,
                    selectedApplication: null,
                    selectedStatus: null,
                  })
                }
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSubmit}
                className="bg-dblue flex-1 rounded-lg px-4 py-2 text-white hover:shadow-lg"
              >
                Update Status
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        subTitle={`Send Interest (${state.applicantName})`}
        closeIcon
        open={state.isOpenInterest}
        close={() => {
          setState({
            isOpenInterest: false,
            message: "",
            applicantName: "",
            applicantId: "",
          });
        }}
        isFullWidth={false}
        maxWidth="max-w-2xl"
        renderComponent={() => (
          <div className="relative">
            <TextArea
              title="Message"
              placeholder="Enter message"
              value={state.message}
              onChange={(e) => handleFormChange("message", e.target.value)}
            />
            <CustomSelect
              title="Select Job"
              options={state.jobFilterList}
              value={state.interestJob}
              onChange={(e) => setState({ interestJob: e })}
              placeholder="Select job"
              isClearable={true}
              onSearch={(searchTerm) => {
                jobFilterList(
                  1,
                  searchTerm,
                  state.profile?.college?.map((item) => item?.college_id),
                );
              }}
              loadMore={() => {
                state.jobFilternext &&
                  jobFilterList(
                    state.jobPage + 1,
                    "",
                    state.profile?.college?.map((item) => item?.college_id),
                  );
              }}
              loading={state.jobLoading}
            />

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setState({
                    isOpenInterest: false,
                    message: "",
                    applicantName: "",
                    applicantId: "",
                  });
                }}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => sendInterest()}
                disabled={state.sendLoading}
                className={`bg-dblue group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                {state.sendLoading ? (
                  <IconLoader className="relative z-10 mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
                <span className="relative z-10"></span>
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        subTitle={`Create Interview Schedule (${state.applicant?.label})`}
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
                onClick={() => createInterview()}
                disabled={state.submitting}
                className="bg-dblue  flex-1 rounded-lg px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Creating..." : "Create Schedule"}
              </button>

              {/* <button
                onClick={() => createInterview()}
                className="bg-dblue group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <div 
                className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

                <UserCheck className="relative z-10 h-5 w-5" />

                <span className="relative z-10">
                  {state.submitting ? "Creating..." : "Create Schedule"}
                </span>
              </button> */}
            </div>
          </div>
        )}
      />

      <Modal
        open={state.isOpenProfile}
        close={() => setState({ isOpenProfile: false, userProfile: null })}
        subTitle="Faculty Profile"
        closeIcon
        maxWidth="max-w-5xl"
        padding="p-0"
        renderComponent={() => {
          const u = state.userProfile;
          console.log("u --->", u);
          const user_id =
            typeof window !== "undefined"
              ? localStorage.getItem("userId")
              : null;
          if (state.profileUserLoading) {
            return (
              <div className="h-50 flex items-center justify-center">
                <IconLoader className="text-dblue h-8 w-8 animate-spin" />
              </div>
            );
          }

          if (!u) return null;

          const canViewProfile =
            u?.reveal_name === true ||
            u?.interesteds?.some(
              (i: any) =>
                String(i?.sender?.id) === String(user_id) &&
                i?.is_status === "Accepted",
            );

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
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      Profile Summary
                    </h3>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resume
                    </h4>
                    {canViewProfile ? (
                      u?.resume_url ? (
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
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <FileText className="h-4 w-4 shrink-0 text-black" />
                          <span className="text-sm text-black dark:text-black">
                            No resume provided
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <FileText className="h-4 w-4 shrink-0 text-gray-300" />
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="ml-auto h-6 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                      </div>
                    )}
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-sm font-semibold   tracking-wide text-black dark:text-black">
                        Profile Summary
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
                          val: canViewProfile ? u?.email : null,
                          skeleton: !canViewProfile,
                        },
                        {
                          icon: <Phone className="h-4 w-4 text-green-500" />,
                          label: "Phone",
                          val: canViewProfile ? u?.phone : null,
                          skeleton: !canViewProfile,
                        },
                        {
                          icon: <MapPin className="h-4 w-4 text-red-500" />,
                          label: "Location",
                          val: u?.current_location,
                          skeleton: false,
                        },
                        {
                          icon: (
                            <Briefcase className="h-4 w-4 text-purple-500" />
                          ),
                          label: "Experience",
                          val: u?.experience,
                          skeleton: false,
                        },
                        {
                          icon: (
                            <Building className="h-4 w-4 text-orange-500" />
                          ),
                          label: "Company",
                          val: u?.current_company,
                          skeleton: false,
                        },
                        {
                          icon: <User className="h-4 w-4 text-indigo-500" />,
                          label: "Gender",
                          val: u?.gender,
                          skeleton: false,
                        },
                      ].map((item, i) =>
                        item.skeleton ? (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40"
                          >
                            {item.icon}
                            <div className="space-y-1">
                              <p className="text-xs text-black dark:text-black">
                                {item.label}
                              </p>
                              <div className="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                            </div>
                          </div>
                        ) : item.val ? (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40"
                          >
                            {item.icon}
                            <div>
                              <p className="text-xs text-black dark:text-black">
                                {item.label}
                              </p>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {item.val}
                              </p>
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                );

              case "responsibility":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-black">
                        No academic responsibilities listed.
                      </p>
                    )}
                  </div>
                );

              case "experience":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                              <p className="text-sm text-gray-600 dark:text-black">
                                {exp.company}
                              </p>
                            </div>
                            {/* {exp.currently_working && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Current
                            </span>
                          )} */}
                          </div>
                          <p className="mt-1 text-xs text-black">
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
                      <p className="text-sm text-black">
                        No experience records.
                      </p>
                    )}
                  </div>
                );

              case "education":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                          <p className="text-sm text-gray-600 dark:text-black">
                            {edu.field}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-black">
                            {edu.institution}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-black">
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
                      <p className="text-sm text-black">
                        No education records.
                      </p>
                    )}
                  </div>
                );

              case "projects":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                            <p className="mt-0.5 text-xs text-black">
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
                                ),
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
                            <p className="mt-1 text-xs text-black">
                              Funded: {proj.funding_details}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-black">No projects.</p>
                    )}
                  </div>
                );

              case "publications":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-black">
                            {pub.publication_journal}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-black">
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
                      <p className="text-sm text-black">No publications.</p>
                    )}
                  </div>
                );

              case "skills":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                      <p className="text-sm text-black">No skills listed.</p>
                    )}
                  </div>
                );

              case "achievements":
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
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
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-black">
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
                      <p className="text-sm text-black">No achievements.</p>
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
                {canViewProfile ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
                      {u?.profile_logo_url ? (
                        <img
                          src={u.profile_logo_url}
                          alt={u.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
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
                        <p className="text-sm text-black dark:text-black">
                          {u.email}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                      <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </>
                )}
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
                        : "text-black hover:text-gray-700 dark:text-black dark:hover:text-gray-200"
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
                            : "text-gray-600 hover:bg-gray-100 dark:text-black dark:hover:bg-gray-700"
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
                  <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
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
                              : "text-black"
                          }
                        >
                          {q.icon}
                        </div>
                        <p
                          className={`text-center text-sm font-medium ${
                            u?.[q.key]
                              ? "text-green-700 dark:text-green-400"
                              : "text-black dark:text-black"
                          }`}
                        >
                          {q.label}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            u?.[q.key]
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-200 text-black dark:bg-gray-700 dark:text-black"
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

      <Modal
        open={state.isOpenInteresteds}
        close={() =>
          setState({ isOpenInteresteds: false, interestedsRow: null })
        }
        subTitle="Interest Details"
        closeIcon
        maxWidth="max-w-2xl"
        renderComponent={() => {
          const interesteds = state.interestedsRow?.interesteds || [];
          return (
            <div>
              {interesteds.length === 0 ? (
                <p className="py-2 text-center text-sm text-black">
                  No interest records found.
                </p>
              ) : (
                <div className="space-y-3">
                  {interesteds.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item?.job?.job_title || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-black dark:text-black">
                          {item?.created_at
                            ? moment(item.created_at).format(
                                "DD MMM YYYY, hh:mm A",
                              )
                            : "—"}
                        </p>
                      </div>
                      <span
                        className={`ml-4 rounded-full px-3 py-1 text-xs font-semibold ${
                          item?.is_status === "Accepted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : item?.is_status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {item?.is_status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default PrivateRouter(Dashboard);
