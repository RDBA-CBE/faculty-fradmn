import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { setPageTitle } from "@/store/themeConfigSlice";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Models from "@/imports/models.import";
import { FRONTEND_URL, ROLES, STATUS_COLOR } from "@/utils/constant.utils";
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
  capitalizeFLetter,
  Failure,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Pagination from "@/components/pagination/pagination";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  MessageSquare,
  SlidersHorizontal,
  UserCheck,
  X,
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

  const isDark = useSelector(
    (state: IRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activePeriod, setActivePeriod] = useState("6m");
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);

  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    colleges: 0,
    interviews: 0,
    decisions: 0,
    decisionsSelected: 0,
    decisionsRejected: 0,
  });

  const [state, setState] = useSetState({
    selectedRecords: [],
    activeCard: 1,
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Faculty Pro - Dashboard"));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboard();
    profiles();
  }, []);

  useEffect(() => {
    if (state.activeCard == 2) {
      applicationStatusList();
    } else {
      profiles();
    }
    setState({
      search: "",
      sortBy: "",
      end_date: "",
      start_date: "",
    });
  }, [state.activeCard]);

  useEffect(() => {
    if (activePeriod !== "custom") {
      setFromDate(null);
      setToDate(null);
      fetchDashboard({ period: activePeriod });
    }
  }, [activePeriod]);

  useEffect(() => {
    if (fromDate && toDate) {
      setActivePeriod("custom");
      fetchDashboard({
        from: moment(fromDate).format("YYYY-MM-DD"),
        to: moment(toDate).format("YYYY-MM-DD"),
      });
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (profileRef.current) {
      if (state.activeCard === 1 || state.activeCard === 2) {
        callListByRole(1, applicationList);
      } else if (state.activeCard === 3) {
        callListByRole(1, userList);
      } else if (state.activeCard === 4) {
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
    // state.activeCard,
  ]);

  const card3 =
    state.profile?.role === ROLES.INSTITUTION_ADMIN ||
    state.profile?.role === ROLES.SUPER_ADMIN
      ? {
          id: 3,
          label: "Colleges",
          value: stats.colleges,
          color: "text-[#dd22cc]",
          bg: "bg-indigo-100",
          mainbg: "bg-[#d2c1f7f2]",
          icon: <IconUser className="h-7 w-7" />,
          href: null,
          sub: null,
        }
      : {
          id: 3,
          label: "Out Reached",
          value: stats.colleges,
          color: "text-[#dd22cc]",
          bg: "bg-indigo-100",
          mainbg: "bg-[#d2c1f7f2]",
          icon: <IconUser className="h-7 w-7" />,
          href: "/faculty/dashboard/job",
          sub: null,
        };

  const statCards = [
    {
      id: 1,
      label: "Applications",
      value: stats.applications,
      color: "text-orange-600",
      bg: "bg-info-light",
      mainbg: "bg-orange-100",
      icon: <IconUsers className="h-7 w-7" />,
      href: "/faculty/dashboard/applications",
      sub: null,
    },
    {
      id: 2,
      label: "Interviews Scheduled",
      value: stats.interviews,
      color: "text-pink-600",
      bg: "bg-warning-light",
      mainbg: "bg-pink-100",
      icon: <IconCalendar className="h-7 w-7" />,
      href: "/faculty/dashboard/interview",
      sub: null,
    },
    card3,
    {
      id: 4,
      label: "Active Jobs",
      value: stats.activeJobs,
      color: "text-dblue",
      bg: "bg-primary-light",
      mainbg: "bg-blue-100",
      icon: <IconBriefcase className="h-7 w-7" />,
      href: "/faculty/dashboard/job",
      sub: null,
    },
  ];

  const profiles = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      profileRef.current = true;
      if (res?.role == ROLES.SUPER_ADMIN) {
        collegeDropdownList(1, "", false, "", res.id);
      } else if (res?.role == ROLES.INSTITUTION_ADMIN) {
        collegeDropdownList(1, "", false, res?.institution?.id, res.id);
      }

      // List based on activeCard
      const colleges = res?.college?.map((c: any) => c.college_id);
      const instId = res?.institution?.id;
      const deptId = res?.department?.department_id;

      if (state.activeCard === 1 || state.activeCard === 2) {
        if (res?.role == ROLES.SUPER_ADMIN)
          applicationList(1, null, null, null, res?.id);
        else if (res?.role == ROLES.INSTITUTION_ADMIN)
          applicationList(1, instId, null, null, res?.id);
        else if (res?.role == ROLES.HR)
          applicationList(1, null, colleges, null, res?.id);
        else if (res?.role == ROLES.HOD)
          applicationList(1, null, null, deptId, res?.id);
      } else if (state.activeCard === 3) {
        if (res?.role == ROLES.SUPER_ADMIN) userList(1, null, null, null);
        else if (res?.role == ROLES.INSTITUTION_ADMIN)
          userList(1, instId, null, null);
        else if (res?.role == ROLES.HR) userList(1, colleges, null, null);
        else if (res?.role == ROLES.HOD) userList(1, null, null, deptId);
      } else if (state.activeCard === 4) {
        if (res?.role == ROLES.SUPER_ADMIN) jobList(1, null, null, null);
        else if (res?.role == ROLES.INSTITUTION_ADMIN)
          jobList(1, instId, null, null);
        else if (res?.role == ROLES.HR) jobList(1, null, colleges, null);
        else if (res?.role == ROLES.HOD) jobList(1, null, null, deptId);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const userList = async (page, ins = null, college = null, dept = null) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      console.log("✌️body --->", body);
      body.role = ROLES.APPLICANT;
      body.active_job_seeker = "Yes";
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

  const applicationList = async (
    page,
    institutionId = null,
    collegeId = null,
    deptId = null,
    profileId = null,
    statusId = null
  ) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      if (institutionId) {
        body.institution = institutionId;
      }
      if (collegeId) {
        body.college = collegeId;
      }
      if (deptId) {
        body.department = deptId;
      }
      if (statusId) {
        body.status = statusId;
      }
      if (state.activeCard == 2) {
        body.status = 6;
      }
      // body.team = "No";

      console.log("✌️body --->", body);

      const res: any = await Models.application.list(page, body);

      const tableData = res?.results?.map((item) => ({
        applicant_name: `${item?.first_name} ${item?.last_name}`,
        applicant_email: item?.email,
        applicant_phone: item?.phone,
        position_applied: item?.position_applied,
        qualification: item?.qualification,
        experience: item?.experience,
        status: item?.status,
        id: item?.id,
        applied_date: item?.created_at,
        job_title: item?.job_detail?.job_title,
        resume: item?.resume,
        application_status: {
          value: item?.application_status?.id,
          label: item?.application_status?.name,
        },
        college_name: item?.job_detail?.college?.name,
        department_name: item?.department?.department_name,
        interview_status:
          item?.interview_slots?.length > 0
            ? item?.interview_slots[item?.interview_slots.length - 1]?.status
            : "-",
      }));
      setState({
        loading: false,
        page: page,
        count: res?.count,
        applicationList: tableData,
        next: res?.next,
        prev: res?.previous,
        applications_by_status: res?.applications_by_status,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      setState({
        recordsData: [],
        totalRecords: 0,
        loading: false,
      });
    }
  };

  const jobList = async (page, insId = null, colId = null, deptId = null) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      if (insId) {
        body.institution_id = insId;
      }
      if (colId) {
        body.college_id = colId;
      }
      if (deptId) {
        body.department_id = deptId;
      }

      body.status = "approved";
      console.log("✌️body ssss--->", body);
      const res: any = await Models.job.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item.id,
        job_title: item.job_title,
        job_description: item.job_description,

        college_name: item?.college?.name,
        department:
          item?.department?.length > 0
            ? item?.department?.map((d) => d?.name)
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
      Failure("Failed to fetch jobs");
    }
  };

  const collegeDropdownList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null,
    createdBy = null
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
        label: item.college_name,
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

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    return body;
  };

  const fetchDashboard = async (params?: Record<string, string>) => {
    try {
      const profileRes = await Models.auth.profile();
      const dashRes: any = await Models.dashboard.list(params ?? {});

      const data = dashRes?.data;

      setProfile(profileRes);
      setDashboard(data);

      setStats({
        activeJobs: data?.top_cards?.active_jobs?.value ?? 0,
        applications: data?.top_cards?.applications?.value ?? 0,
        colleges: data?.top_cards?.colleges?.value ?? 0,
        interviews: data?.top_cards?.interview_scheduled?.value ?? 0,
        decisions: data?.top_cards?.decisions?.value ?? 0,
        decisionsSelected: data?.top_cards?.decisions?.selected ?? 0,
        decisionsRejected: data?.top_cards?.decisions?.rejected ?? 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const applicationStatusList = async () => {
    try {
      setState({ applicationStatusLoading: true });
      const res: any = await Models.master.application_status_list();
      const dropdown = res?.find((item) => item.name == "Interview Scheduled");
      applicationList(
        1,
        state.profile?.institution?.id,
        null,
        null,
        dropdown?.id
      );
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
        "0"
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
      (m) => m.toLowerCase() === bucket.toLowerCase()
    );
    if (monthIndex !== -1) {
      return MONTHS[monthIndex];
    }
    return bucket;
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
            config: any
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
      xaxis: { labels: { style: { fontSize: "11px" } } },
      yaxis: {
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

  const collegesPieChart: any = {
    series: pieSeries,
    options: {
      chart: { type: "donut", height: 260 },
      labels: pieLabels,
      colors: [
        "#1B55E2",
        "#e2a03f",
        "#e7515a",
        "#11380c",
        "#d143ee",
        "#43eebb",
      ],
      dataLabels: { enabled: false },
      legend: { position: "bottom" },
    },
  };

  /* ---------------- INTERVIEW CHART ---------------- */

  const interviewChart: any = {
    series: [{ name: "Interviews", data: interviewTrend }],
    options: {
      chart: { height: 160, type: "bar", toolbar: { show: false } },
      colors: ["#00ab55"],
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      labels: trendLabels,
      grid: { borderColor: isDark ? "#191E3A" : "#E0E6ED" },
    },
  };

  /* ---------------- DECISION CHART ---------------- */

  const decisionChart: any = {
    series: [
      { name: "Selected", data: decisionSelectedTrend },
      { name: "Rejected", data: decisionRejectedTrend },
    ],
    options: {
      chart: {
        height: 160,
        type: "bar",
        toolbar: { show: false },
        stacked: true,
      },
      colors: ["#00ab55", "#e7515a"],
      plotOptions: { bar: { borderRadius: 4, columnWidth: "50%" } },
      labels: trendLabels,
      grid: { borderColor: isDark ? "#191E3A" : "#E0E6ED" },
      legend: { position: "top" },
    },
  };

  /* ---------------- FUNNEL ---------------- */

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
      xaxis: { labels: { show: false } },
      yaxis: { show: false },
      legend: { show: false },
      grid: { show: false },
    },
  };

  /* ---------------- STAT CARDS ---------------- */

  const filterLables = [
    { label: "Last 1 Year", value: "1y" },
    { label: "6 Months", value: "6m" },
    { label: "1 Month", value: "1m" },
    { label: "Last 7 Days", value: "7d" },
  ];

  const callListByRole = (
    page: number,
    listFn: (
      page: number,
      ins?: any,
      college?: any,
      dept?: any,
      profileId?: any
    ) => void
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
        state.profile?.id
      );
    } else if (role === ROLES.HR) {
      listFn(
        page,
        null,
        state.profile?.college?.map((c: any) => c?.college_id),
        null,
        state.profile?.id
      );
    } else if (role === ROLES.HOD) {
      listFn(
        page,
        null,
        null,
        state.profile?.department?.department_id,
        state.profile?.id
      );
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    if (state.activeCard === 1 || state.activeCard === 2) {
      callListByRole(pageNumber, applicationList);
    } else if (state.activeCard === 3) {
      callListByRole(pageNumber, userList);
    } else if (state.activeCard === 4) {
      jobList(pageNumber);
    }
  };

  const handleUpdateStatus = async (row: any, newStatus: string) => {
    try {
      const role = state.profile?.role;
      if (role === ROLES.SUPER_ADMIN) {
        applicationList(state.page, null, null, null, state.profile?.id);
      } else if (role === ROLES.INSTITUTION_ADMIN) {
        applicationList(
          state.page,
          state.profile?.institution?.id,
          null,
          null,
          state.profile?.id
        );
      } else if (role === ROLES.HR) {
        applicationList(
          state.page,
          null,
          state.profile?.college?.college_id,
          null,
          state.profile?.id
        );
      } else if (role === ROLES.HOD) {
        applicationList(
          state.page,
          null,
          null,
          state.profile?.department?.department_id,
          state.profile?.id
        );
      }
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
      const res: any = await Models.application.details(row?.id);

      setState({
        application: res,
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
      title = "Interview Scheduled List";
    } else if (state.activeCard == 3) {
      title = "Out reached List";
    } else if (state.activeCard == 4) {
      title = "Active Jobs";
    }
    return title;
  };

  const isAnonymous = (row: any) => !row?.reveal_name;

  const safeUser = (row: any) => {
    if (!isAnonymous(row)) return row;

    return {
      ...row,
      username: "Anonymous Faculty",
      email: null,
      phone: null,
    };
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Stat Cards */}
      <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`panel rounded-lg p-4 ${
              card.href
                ? "cursor-pointer transition-shadow hover:shadow-md"
                : ""
            } ${card.mainbg}`}
            onClick={() => {
              setState({ activeCard: card?.id });
              // card.href && router.push(card.href);
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`${card.bg} rounded-lg p-2 ${card.color}`}>
                {card.icon}
              </div>

              <div>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-xs text-gray-500">{card.label}</div>
                {card.sub && (
                  <div className="mt-0.5 text-xs text-gray-400">{card.sub}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="mb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className=" text-lg">{getTitile()}</h1>
            </div>
          </div>
        </div>
        <div className="mb-5 rounded-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-5">
            <TextInput
              placeholder={
                state.activeCard == 1 || state.activeCard == 2
                  ? "Search applications..."
                  : state.activeCard == 3
                  ? "Search faculty..."
                  : "Search jobs..."
              }
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
            />
            {state.profile?.role != ROLES.HR &&
              state.profile?.role != ROLES.HOD && (
                <CustomSelect
                  options={state.collegeList}
                  value={state.collegeFilter}
                  onChange={handleCollegeChange}
                  placeholder="Select college"
                  isClearable={true}
                  onSearch={(searchTerm) => {
                    const institutionId =
                      state.profile?.role === ROLES.SUPER_ADMIN
                        ? state.institutionFilter?.value
                        : null;
                    collegeDropdownList(
                      1,
                      searchTerm,
                      false,
                      institutionId,
                      state.profile?.id
                    );
                  }}
                  loadMore={() => {
                    const institutionId =
                      state.profile?.role === ROLES.SUPER_ADMIN
                        ? state.institutionFilter?.value
                        : state.profile?.institution?.id;
                    state.collegeNext &&
                      collegeDropdownList(
                        state.collegePage + 1,
                        "",
                        true,
                        institutionId,
                        state.profile?.id
                      );
                  }}
                  loading={state.collegeLoading}
                />
              )}
            <CustomeDatePicker
              value={state.start_date}
              placeholder="Choose From"
              onChange={(e) => setState({ start_date: e })}
              showTimeSelect={false}
            />
            <CustomeDatePicker
              value={state.end_date}
              placeholder="Choose To "
              onChange={(e) => setState({ end_date: e })}
              showTimeSelect={false}
            />

            {/* <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button> */}
          </div>
          <div className="mt-4">
            <div className="group relative"></div>
            {(() => {
              const activeFilters = [];
              if (state.institutionFilter)
                activeFilters.push({
                  key: "institutionFilter",
                  label: `Inst: ${state.institutionFilter.label}`,
                });
              if (state.collegeFilter)
                activeFilters.push({
                  key: "collegeFilter",
                  label: `College: ${state.collegeFilter.label}`,
                });
              if (state.departmentFilter)
                activeFilters.push({
                  key: "departmentFilter",
                  label: `Dept: ${state.departmentFilter.label}`,
                });
              if (state.start_date)
                activeFilters.push({
                  key: "start_date",
                  label: `From: ${moment(state.start_date).format("DD/MM/YY")}`,
                });
              if (state.end_date)
                activeFilters.push({
                  key: "end_date",
                  label: `To: ${moment(state.end_date).format("DD/MM/YY")}`,
                });
              if (state.selectedStatus)
                activeFilters.push({
                  key: "selectedStatus",
                  label: `Status: ${state.selectedStatus.label}`,
                });

              if (activeFilters.length > 0) {
                return (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {activeFilters.map((filter) => (
                      <div
                        key={filter.key}
                        className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <div>{filter.label}</div>
                        <button
                          onClick={() => setState({ [filter.key]: null })}
                          className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setState({
                          institutionFilter: null,
                          collegeFilter: null,
                          departmentFilter: null,
                          start_date: null,
                          end_date: null,
                          selectedStatus: null,
                        })
                      }
                      className="text-xs  text-red-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
        <DataTable
          noRecordsText="No applications found"
          highlightOnHover
          className="table-hover mb-4 whitespace-nowrap"
          records={
            state.activeCard == 1 || state.activeCard == 2
              ? state.applicationList
              : state.activeCard == 3
              ? state.userList
              : state.jobList
          }
          fetching={state.loading}
          selectedRecords={state.applicationList?.filter((record) =>
            state.selectedRecords.includes(record.id)
          )}
          onSelectedRecordsChange={(records) => {
            const currentPageIds = state.applicationList?.map((r: any) => r.id);
            const otherPageSelections = state.selectedRecords?.filter(
              (id) => !currentPageIds.includes(id)
            );
            const newSelections = records?.map((r: any) => r.id);
            setState({
              selectedRecords: [...otherPageSelections, ...newSelections],
            });
          }}
          customLoader={
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Loading applications...
                </span>
              </div>
            </div>
          }
          columns={
            state.activeCard == 1 || state.activeCard == 2
              ? [
                  {
                    accessor: "job_title",
                    title: "Title",
                    sortable: true,
                    render: (row: any) => (
                      <div
                        onClick={() => {
                          router.push(
                            `faculty/application_detail?id=${row?.id}`
                          );
                        }}
                        className="cursor-pointer text-gray-600 dark:text-gray-400"
                        title={row?.job_title}
                      >
                        {truncateText(row?.job_title)}
                      </div>
                    ),
                  },

                  {
                    accessor: "college",
                    title: "College",
                    sortable: true,
                    render: ({ college_name }) => (
                      <div
                        className="text-gray-600 dark:text-gray-400"
                        title={college_name}
                      >
                        {truncateText(college_name)}
                      </div>
                    ),
                  },
                  {
                    accessor: "department_name",
                    title: "Department",
                    render: ({ department_name }) => (
                      <div
                        className="text-gray-600 dark:text-gray-400"
                        title={department_name}
                      >
                        {truncateText(department_name)}
                      </div>
                    ),
                    sortable: true,
                  },
                  {
                    accessor: "applicant_name",
                    title: "Faculty",
                    sortable: true,
                    render: ({ applicant_name }) => (
                      <div
                        className="font-medium text-gray-900 dark:text-white"
                        title={applicant_name}
                      >
                        {truncateText(applicant_name)}
                      </div>
                    ),
                  },
                  {
                    accessor: "applicant_email",
                    title: "Email",
                    sortable: true,

                    render: ({ applicant_email }) => (
                      <span
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        title={applicant_email}
                      >
                        {truncateText(applicant_email)}
                      </span>
                    ),
                  },
                  {
                    accessor: "status",
                    title: "Status",
                    sortable: true,

                    render: ({ status }) => (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_COLOR[status] || "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {capitalizeFLetter(status)}
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
                          onClick={() => handleRound(row)}
                          className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
                          title="Interview Round"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDownloadResume(row)}
                          className="flex  items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                          title="Resume"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(row)}
                          className="flex  items-center justify-center rounded-lg  text-green-600 transition-all duration-200 "
                          title="View"
                        >
                          <IconEye className="h-4 w-4" />
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
                ]
              : state.activeCard == 3
              ? [
                  {
                    accessor: "username",
                    title: "Name",
                    sortable: true,
                    render: (row: any) => {
                      const user = safeUser(row);
                      console.log("✌️isAnonymous --->", isAnonymous(row));

                      return (
                        <div
                          title={user.username}
                          className={`font-medium ${
                            isAnonymous(row)
                              ? "italic text-gray-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {truncateText(user.username)}
                        </div>
                      );
                    },
                  },
                  {
                    accessor: "email",
                    title: "Email",
                    sortable: true,
                    render: (row: any) => {
                      const user = safeUser(row);

                      return (
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.email ? truncateText(user.email) : "Hidden"}
                        </span>
                      );
                    },
                  },
                  {
                    accessor: "phone",
                    title: "Phone",
                    render: (row: any) => {
                      const user = safeUser(row);

                      return (
                        <div className="text-gray-600 dark:text-gray-400">
                          {user.phone || "Hidden"}
                        </div>
                      );
                    },
                  },
                  {
                    accessor: "actions",
                    title: "Actions",
                    render: (row) => (
                      <div className="flex items-center justify-center gap-3">
                        <a
                          href={`${FRONTEND_URL}profile/${row?.id}`}
                          target="_blank"
                          className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
                            row.status === "active"
                              ? " text-green-600 "
                              : "text-red-600 "
                          }`}
                          title={"View"}
                        >
                          <IconEye className="h-4 w-4" />
                        </a>

                        {row?.reveal_name ? (
                          <button
                            // onClick={() => handleSheduleInterview(row)}
                            className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                            title="Interview schedule"
                          >
                            <CalendarCheck className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setState({
                                isOpenInterest: true,
                                message: "",
                                applicantName: row?.username,
                                applicantId: row?.id,
                              })
                            }
                            className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                            title="send interest"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          // onClick={() => handleDelete(row)}
                          className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200"
                          title="Delete"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  },
                ]
              : [
                  {
                    accessor: "job_title",
                    title: "Title",
                    sortable: true,
                    render: (row:any) => (
                      <div
                      onClick={() => {
                        router.push(
                          `faculty/job_details?id=${row?.id}`
                        );
                      }}
                        className="cursor-pointer text-gray-900 dark:text-white"
                        title={row?.job_title}
                      >
                        {truncateText(row?.job_title)}
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
                        return <span className="text-gray-400">-</span>;
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
                            {truncateText(firstDept)}
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
                                  {truncateText(dept)}
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
                        className="text-gray-600 dark:text-gray-400"
                        title={college_name}
                      >
                        {truncateText(college_name || "-")}
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
                          (row as any).is_approved ? "Approved" : "Pending"
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
                      <span className="text-gray-600 dark:text-gray-400">
                        {total_applications}
                      </span>
                    ),
                  },

                  {
                    accessor: "last_date",
                    title: "Last Date",
                    render: ({ last_date }) => (
                      <span className="text-gray-600 dark:text-gray-400">
                        {last_date
                          ? new Date(last_date).toLocaleDateString()
                          : "-"}
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
                      </div>
                    ),
                  },
                ]
          }
          sortStatus={{
            columnAccessor: state.sortBy,
            direction: state.sortOrder as "asc" | "desc",
          }}
          onSortStatusChange={({ columnAccessor, direction }) => {
            setState({
              sortBy: columnAccessor,
              sortOrder: direction,
              page: 1,
            });
            handleUpdateStatus(columnAccessor, direction);
          }}
          minHeight={200}
        />
      </div>
      {state.count > 10 && (
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      )}
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
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
            onChange={(e) => setFromDate(e)}
            showTimeSelect={false}
          />
          <CustomeDatePicker
            value={toDate}
            placeholder="To Date"
            onChange={(e) => setToDate(e)}
            showTimeSelect={false}
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate(null);
                setToDate(null);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel xl:col-span-2">
          <h5 className="mb-4 text-lg font-semibold">
            Jobs, Applications & Registrations Overview
          </h5>

          {isMounted && (
            <ReactApexChart
              series={trendChart.series}
              options={trendChart.options}
              type="area"
              height={300}
            />
          )}
        </div>

        <div className="panel xl:col-span-1">
          <h5 className="mb-4 text-lg font-semibold">
            Applications by Experience
          </h5>

          {isMounted && (
            <ReactApexChart
              series={collegesPieChart.series}
              options={collegesPieChart.options}
              type="donut"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="panel">
          <h5 className="mb-3 text-lg font-semibold">Interviews Scheduled</h5>

          {isMounted && (
            <div className="flex h-full flex-col justify-center py-10">
              <ReactApexChart
                series={interviewChart.series}
                options={interviewChart.options}
                type="bar"
                height={300}
              />
            </div>
          )}
        </div>

        <div className="panel">
          <h5 className="mb-3 text-lg font-semibold">Decisions</h5>

          {isMounted && (
            <div className="flex h-full flex-col justify-center py-10">
              <ReactApexChart
                series={decisionChart.series}
                options={decisionChart.options}
                type="bar"
                height={300}
              />
            </div>
          )}
        </div>

        <div className="panel">
          <h5
            className="mb-6 text-lg font-semibold"
            style={{ wordWrap: "break-word" }}
          >
            Application Funnel
          </h5>

          {/* {isMounted && dashboard?.application_funnel?.length > 0 && (
            <Funnel
              data={
                dashboard.application_funnel.map((f: any, index: any) => ({
                  name: f.stage,
                  value: f.value,
                  fill: [
                    "#f9741673",
                    "#defb3c70",
                    "#f3b0abdb",
                    "#14b8a57e",
                  ][index % 4],
                }))
              }
            />
          )} */}

          {isMounted && dashboard?.application_funnel?.length > 0 && (
            <Funnel
              data={dashboard.application_funnel.reduce(
                (acc: any[], f: any) => {
                  if (f.selected !== undefined || f.rejected !== undefined) {
                    if (f.selected !== undefined) {
                      acc.push({
                        name: "Selected",
                        value: f.selected,
                        fill: "#00ab55",
                      });
                    }
                    if (f.rejected !== undefined) {
                      acc.push({
                        name: "Rejected",
                        value: f.rejected,
                        fill: "#e7515a",
                      });
                    }
                  } else {
                    acc.push({
                      name: f.stage,
                      value: f.value,
                      fill: ["#4361ee", "#2196f3", "#e2a03f"][acc.length % 3],
                    });
                  }
                  return acc;
                },
                []
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateRouter(Dashboard);
