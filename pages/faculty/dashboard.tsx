import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { setPageTitle } from "@/store/themeConfigSlice";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Models from "@/imports/models.import";
import { ROLES } from "@/utils/constant.utils";
import IconBriefcase from "@/components/Icon/IconBolt";
import IconUsers from "@/components/Icon/IconUsers";
import IconUser from "@/components/Icon/IconUser";
import IconCalendar from "@/components/Icon/IconCalendar";
import IconChecks from "@/components/Icon/IconChecks";
import Funnel from "@/components/funnelChart";

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

  const isDark = useSelector(
    (state: IRootState) =>
      state.themeConfig.theme === "dark" || state.themeConfig.isDarkMode
  );

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);

  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    colleges: 0,
    interviews: 0,
    decisions: 0,
    decisionsSelected: 0,
    decisionsRejected: 0,
  });

  useEffect(() => {
    dispatch(setPageTitle("Faculty Pro - Dashboard"));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const profileRes = await Models.auth.profile();
      const dashRes: any = await Models.dashboard.list();

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

  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;

  /* ---------------- TREND DATA ---------------- */

  const trendLabels =
    dashboard?.trend?.map((t: any) => {
      const date = new Date(t.bucket + "-01");
      return MONTHS[date.getMonth()];
    }) ?? [];

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
      },
      stroke: { curve: "smooth", width: 2 },
      colors: isDark
        ? ["#2196F3", "#E7515A", "#00ab55"]
        : ["#1B55E2", "#E7515A", "#00ab55"],
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
      colors: ["#1B55E2", "#e2a03f", "#e7515a"],
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

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      color: "text-primary",
      bg: "bg-primary-light",
      icon: <IconBriefcase className="h-7 w-7" />,
      href: "/faculty/job",
      sub: null,
    },
    {
      label: "Applications",
      value: stats.applications,
      color: "text-info",
      bg: "bg-info-light",
      icon: <IconUsers className="h-7 w-7" />,
      href: "/faculty/application",
      sub: null,
    },
    {
      label: "Colleges",
      value: stats.colleges,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      icon: <IconUser className="h-7 w-7" />,
      href: null,
      sub: null,
    },
    {
      label: "Interviews Scheduled",
      value: stats.interviews,
      color: "text-warning",
      bg: "bg-warning-light",
      icon: <IconCalendar className="h-7 w-7" />,
      href: "/faculty/interview",
      sub: null,
    },
    {
      label: "Selected Faculties",
      value: stats.decisionsSelected,
      color: "text-success",
      bg: "bg-success-light",
      icon: <IconChecks className="h-7 w-7" />,
      href: "/faculty/application",
      // sub: `✓ ${stats.decisionsSelected}  ✗ ${stats.decisionsRejected}`,
    },
  ];

  return (
    <div className="pt-5">
      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`panel rounded-lg p-4 ${
              card.href
                ? "cursor-pointer transition-shadow hover:shadow-md"
                : ""
            }`}
            onClick={() => card.href && router.push(card.href)}
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

      {/* Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="panel">
          <h5 className="mb-4 text-lg font-semibold">Trends Overview</h5>

          {isMounted && (
            <ReactApexChart
              series={trendChart.series}
              options={trendChart.options}
              type="area"
              height={300}
            />
          )}
        </div>

        <div className="panel">
          <h5 className="mb-4 text-lg font-semibold">Colleges by Category</h5>

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
      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="panel">
          <h5 className="mb-3 text-lg font-semibold">Interviews Scheduled</h5>

          {isMounted && (
            <ReactApexChart
              series={interviewChart.series}
              options={interviewChart.options}
              type="bar"
              height={180}
            />
          )}
        </div>

        <div className="panel">
          <h5 className="mb-3 text-lg font-semibold">Decisions</h5>

          {isMounted && (
            <ReactApexChart
              series={decisionChart.series}
              options={decisionChart.options}
              type="bar"
              height={180}
            />
          )}
        </div>
      </div>

      {/* Super Admin Stats */}
      {isSuperAdmin && dashboard?.super_admin && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              {
                label: "Total Jobs",
                value: dashboard.super_admin.jobs,
                color: "text-primary",
              },
              {
                label: "Total Applications",
                value: dashboard.super_admin.applications,
                color: "text-info",
              },
              {
                label: "College Registrations",
                value: dashboard.super_admin.college_registrations,
                color: "text-success",
              },
              {
                label: "New Faculty Registrations",
                value: dashboard.super_admin.new_faculty_registrations,
                color: "text-warning",
              },
            ] as any[]
          ).map((item) => (
            <div key={item.label} className="panel rounded-lg p-4">
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Row 3 */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="panel">
          <h5 className="mb-3 text-lg font-semibold">Application Funnel</h5>

          {isMounted && (
            <Funnel
              data={[
                { name: "Awareness", value: 252 },
                { name: "Interest", value: 105 },
                { name: "Consideration", value: 84 },
                { name: "Evaluation", value: 72 },
                { name: "Commitment", value: 19 },
                { name: "Pre-sale", value: 0 },
                { name: "Sale", value: 10 },
              ]}
            />

            // <ReactApexChart
            //   series={funnelChart.series}
            //   options={funnelChart.options}
            //   type="bar"
            //   height={350}
            // />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
