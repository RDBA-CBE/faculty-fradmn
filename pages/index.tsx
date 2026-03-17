import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { setPageTitle } from "@/store/themeConfigSlice";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Models from "@/imports/models.import";
import { ROLES } from "@/utils/constant.utils";
import CustomeDatePicker from "@/components/datePicker";
import moment from "moment";
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
          legendClick: function (chartContext: any, seriesIndex: any, config: any) {
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

  const statCards = [
    {
      label: "Active Jobs",
      value: stats.activeJobs,
      color: "text-dblue",
      bg: "bg-primary-light",
      mainbg:"bg-blue-100",
      icon: <IconBriefcase className="h-7 w-7" />,
      href: "/faculty/dashboard/job",
      sub: null,
    },
    {
      label: "Applications",
      value: stats.applications,
      color: "text-orange-600",
      bg: "bg-info-light",
      mainbg:"bg-orange-100",
      icon: <IconUsers className="h-7 w-7" />,
      href: "/faculty/dashboard/applications",
      sub: null,
    },
    {
      label: "Colleges",
      value: stats.colleges,
      color: "text-[#dd22cc]",
      bg: "bg-indigo-100",
      mainbg:"bg-[#d2c1f7f2]",
      icon: <IconUser className="h-7 w-7" />,
      href: null,
      sub: null,
    },
    {
      label: "Interviews Scheduled",
      value: stats.interviews,
      color: "text-pink-600",
      bg: "bg-warning-light",
      mainbg:"bg-pink-100",
      icon: <IconCalendar className="h-7 w-7" />,
      href: "/faculty/dashboard/interview",
      sub: null,
    },
    {
      label: "Selected Faculties",
      value: stats.decisionsSelected,
      color: "text-green-600",
      bg: "bg-white/60",
      mainbg:"bg-green-100",
      icon: <IconChecks className="h-7 w-7" />,
      href: "/faculty/dashboard/selected-faculty",
      // sub: `✓ ${stats.decisionsSelected}  ✗ ${stats.decisionsRejected}`,
    },
  ];

  const filterLables = [
    { label: "Last 1 Year", value: "1y" },
    { label: "6 Months", value: "6m" },
    { label: "1 Month", value: "1m" },
    { label: "Last 7 Days", value: "7d" },
  ];

  console.log("activePeriod", activePeriod);

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`panel rounded-lg p-4 ${
              card.href
                ? "cursor-pointer transition-shadow hover:shadow-md"
                : ""
            } ${card.mainbg}`}
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
          <h5 className="mb-4 text-lg font-semibold">Jobs, Applications & Registrations Overview</h5>

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
            <div className="flex flex-col justify-center py-10 h-full">
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
             <div className="flex flex-col justify-center py-10 h-full">
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
              data={dashboard.application_funnel.map((f: any) => ({
                name:
                  f.selected !== undefined ? "Selected" : f.stage,
                value: f.selected !== undefined ? f.selected : f.value,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
