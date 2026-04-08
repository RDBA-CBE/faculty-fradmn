import { DataTable } from "mantine-datatable";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconSearch from "@/components/Icon/IconSearch";
import IconTrash from "@/components/Icon/IconTrash";
import IconEye from "@/components/Icon/IconEye";
import IconLoader from "@/components/Icon/IconLoader";
import Pagination from "@/components/pagination/pagination";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  formatScheduleDateTime,
  showDeleteAlert,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import {
  FileText,
  Clock,
  CheckCircle,
  UserCheck,
  ChevronLeft,
  SlidersHorizontal,
  X,
  BriefcaseBusiness,
  User,
  Mail,
  Phone,
} from "lucide-react";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import moment from "moment";
import { RECORDS, ROLES, STATUS_COLOR } from "@/utils/constant.utils";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Link from "next/link";

const HrApplication = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const profileRef = useRef(null);
  const { job_id } = router.query;

  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    showFilterModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    count: 0,
    applicationList: [],
    next: null,
    prev: null,
    editId: null,

    // Filter states
    collegeFilter: null,
    departmentFilter: null,
    start_date: "",
    end_date: "",
    selectedStatus: null,

    // Dropdown data
    institutionList: [],
    institutionLoading: false,
    institutionPage: 1,
    institutionNext: null,

    collegeList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    departmentList: [],
    departmentLoading: false,
    departmentPage: 1,
    departmentNext: null,

    applicationStatusList: [],
    applicationStatusLoading: false,

    profile: null,
    showStatusModal: false,

    // Interview Schedule Modal
    showInterviewModal: false,
    selectedJobs: [],
    selectedDepartments: [],
    interviewSlot: "",
    panelMembers: [],
    selectedApplicants: [],
    requestForChange: false,
    roundName: "",
    interviewStatus: null,

    jobList: [],
    jobLoading: false,
    panelMemberList: [],
    panelMemberLoading: false,
    applicantsList: [],
    applicantsLoading: false,
    isOpenRound: false,
    expandedRounds: {},
    selectedRecords: [],
    sortingFilter: {
      value: 1,
      label: "All Records",
    },
    applicationCount: null,
    jobTitle: "",
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Applications by Job"));
    applicationStatusList();
    applicationStatusExceptAppliedandInterList();
  }, []);

  useEffect(() => {
    if (job_id) {
      profile();
    }
  }, [job_id]);

  useEffect(() => {
    if (profileRef.current && job_id) {
      applicationList(1);
    }
  }, [
    debounceSearch,
    state.selectedStatus,
    state.sortBy,
    state.collegeFilter,
    state.departmentFilter,
    state.start_date,
    state.end_date,
    state.sortingFilter,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      profileRef.current = true;
      collegeDropdownList(1, "", false, "");
      applicationList(1, res);
      applicationCount(res?.college?.map((c) => c.college_id));
      loadJobList(1, null, false, null, null, null, res?.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const applicationCount = async (college) => {
    try {
      const body={
        job:job_id
      }
      const res: any = await Models.application.application_counts(body);
      setState({ applicationCount: res });
    } catch (error) {}
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

  const applicationStatusExceptAppliedandInterList = async () => {
    try {
      const body = { rexclude_applied_interview: "Yes" };
      const res: any = await Models.master.application_status_list(body);
      const dropdown = res?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ applicationStatusesList: dropdown });
    } catch (error) {}
  };

  const applicationList = async (page, profileData = null) => {
    try {
      setState({ loading: true });
      const body = bodyData();

      if (job_id) {
        body.jobId = job_id;
      }

      const p = profileData ?? state.profile;
      if (state.sortingFilter?.value === 2) {
        body.team = "No";
        body.created_by = p?.id;
      } else if (state.sortingFilter?.value === 3) {
        body.created_by = p?.id;
        body.team = "Yes";
      }

      if (state.collegeFilter?.value) {
        body.college = state.collegeFilter.value;
      }
      if (state.departmentFilter?.value) {
        body.department = state.departmentFilter.value;
      }

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
        college_name: item?.job_detail?.college?.short_name,
        department_name: item?.department_details?.map((d) => d?.short_name),
        interview_status:
          item?.interview_slots?.length > 0
            ? item?.interview_slots[item?.interview_slots.length - 1]?.status
            : "-",
        job_id: item?.job,
      }));

      if (tableData?.length > 0 && !state.jobTitle) {
        setState({ jobTitle: tableData[0]?.job_title || "" });
      }

      setState({
        loading: false,
        page,
        count: res?.count,
        applicationList: tableData,
        next: res?.next,
        prev: res?.previous,
        applications_by_status: res?.applications_by_status,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      setState({ loading: false });
    }
  };

  const bodyData = () => {
    const body: any = {};
    if (state.search) body.search = state.search;
    if (state.start_date)
      body.start_date = moment(state.start_date).format("YYYY-MM-DD");
    if (state.end_date)
      body.end_date = moment(state.end_date).format("YYYY-MM-DD");
    if (state.selectedStatus?.value) body.status = state.selectedStatus.value;
    if (state.sortBy)
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    return body;
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    applicationList(pageNumber);
  };

  const collegeDropdownList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null,
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };
      if (institutionId) body.institution = institutionId;
      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");
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

  const departmentDropdownList = async (
    page,
    search = "",
    loadMore = false,
    collegeIds = null,
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search };
      if (collegeIds) body.college = collegeIds;
      const res: any = await Models.department.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");
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

  const handleEdit = (row) => {
    router.push(`/faculty/application_detail?id=${row?.id}`);
  };

  const handleDownloadResume = (row) => {
    if (row?.resume) {
      window.open(row.resume, "_blank");
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row),
      () => Swal.fire("Cancelled", "Your Record is safe :)", "info"),
      "Are you sure want to delete record?",
    );
  };

  const deleteRecord = async (row: any) => {
    try {
      await Models.application.delete(row?.id);
      Success("Application deleted successfully!");
      applicationList(state.page);
      if (state.selectedRecords?.length > 0) {
        setState({
          selectedRecords: state.selectedRecords.filter((id) => id !== row?.id),
        });
      }
    } catch (error) {
      Failure("Failed to delete application. Please try again.");
    }
  };

  const handleStatusSubmit = async () => {
    try {
      if (!state.selectedStatus) {
        Failure("Please select a status");
        return;
      }
      const body = { status: state.selectedStatus.label };
      await Models.application.update(body, state.selectedApplication?.id);
      Success("Application status updated successfully!");
      setState({
        showStatusModal: false,
        selectedApplication: null,
        selectedStatus: null,
      });
      applicationList(state.page);
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => bulkDeleteRecords(),
      () => Swal.fire("Cancelled", "Your Records are safe :)", "info"),
      `Are you sure want to delete ${state.selectedRecords.length} record(s)?`,
    );
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.application.delete(id);
      }
      Success(
        `${state.selectedRecords.length} application(s) deleted successfully!`,
      );
      setState({ selectedRecords: [] });
      applicationList(state.page);
    } catch (error) {
      Failure("Failed to delete applications. Please try again.");
    }
  };

  const handleRound = async (row) => {
    try {
      const res: any = await Models.application.details(row?.id);
      setState({
        application: res,
        appstatus: row?.application_status,
        isOpenRound: true,
      });
    } catch (error) {
      console.log("error --->", error);
    }
  };

  const updateStatus = async () => {
    try {
      setState({ btnLoading: true });
      const body = { status: state.appstatus?.label };
      await Models.application.update(body, state.application?.id);
      Success("Application status updated successfully!");
      setState({ btnLoading: false, isOpenRound: false });
      applicationList(state.page);
      if (state.appstatus?.label === "Rejected") {
        setState({
          selectedRecords: state.selectedRecords.filter(
            (id) => id !== state.application?.id,
          ),
        });
      }
    } catch (error) {
      setState({ btnLoading: false, isOpenRound: false });
    }
  };

  const loadJobList = async (
    page = 1,
    search = "",
    loadMore = false,
    institutionId = null,
    collegeId = null,
    deptId = null,
    created_by = null,
  ) => {
    try {
      setState({ jobLoading: true });
      const body: any = { search };
      if (institutionId) body.institution = institutionId;
      if (collegeId) body.college = collegeId;
      if (deptId) body.department = deptId;
      if (created_by) body.created_by = created_by;
      body.team = "No";
      const res: any = await Models.job.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.job_title,
        department_id: item.department,
      }));
      setState({
        jobPage: page,
        jobLoading: false,
        jobList: loadMore ? [...state.jobList, ...dropdown] : dropdown,
        jobNext: res?.next,
      });
    } catch (error) {
      setState({ jobLoading: false });
    }
  };

  const loadDepartmentsByJobs = async (
    page = 1,
    search = "",
    loadMore = false,
    job = null,
  ) => {
    try {
      const body = { job_id: job?.map((item) => item?.value), search };
      const res: any = await Models.department.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.department_name,
      }));
      setState({
        interviewDeptList: loadMore
          ? [...state.interviewDeptList, ...dropdown]
          : dropdown,
        deptPage: page,
        deptNext: res?.next,
      });
    } catch (error) {}
  };

  const loadPanelMembers = async (
    page = 1,
    search = "",
    loadMore = false,
    deptId = null,
  ) => {
    try {
      setState({ panelMemberLoading: true });
      const body: any = { search };
      if (deptId) body.department_id = deptId?.map((item) => item?.value);
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

  const loadApplicantsByDept = async (
    page = 1,
    search = "",
    loadMore = false,
    deptIds,
  ) => {
    try {
      setState({ applicantsLoading: true });
      const body: any = { search };
      if (deptIds) body.department = deptIds?.map((item) => item?.value);
      body.created_by = state.profile?.id;
      body.team = "No";
      const res: any = await Models.application.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: `${item.first_name} ${item.last_name}`,
      }));
      setState({
        applicantsLoading: false,
        applicantsList: loadMore
          ? [...state.applicantsList, ...dropdown]
          : dropdown,
        appPage: page,
        appNext: res?.next,
      });
    } catch (error) {
      setState({ applicantsLoading: false });
    }
  };

  const handleInterviewScheduleSubmit = async () => {
    try {
      setState({ submitting: true });

      const validation = {
        selectedJobs: state.selectedJobs.map((j) => j.value),
        selectedDepartments: state.selectedDepartments?.map((d) => d?.value),
        interviewSlot: state.interviewSlot
          ? moment(state.interviewSlot).format("YYYY-MM-DD HH:mm")
          : "",
        panelMembers: state.panelMembers.map((p) => p.value),
        selectedApplicants: state.selectedApplicants.map((a) => a.value),
        request_for_change: state.requestForChange,
        roundName: state.roundName,
        interviewStatus: "Scheduled",
        response_from_applicant: state.requestForChange,
        interview_link: state.interview_link,
      };

      await Utils.Validation.interview.validate(validation, {
        abortEarly: false,
      });

      const body = {
        position_ids: state.selectedJobs.map((j) => j.value),
        department_id: state.selectedDepartments[0]?.value,
        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        panel_ids: state.panelMembers.map((p) => p.value),
        application_ids: state.selectedApplicants.map((a) => a.value),
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link ?? "",
      };

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
        selectedRecords: [],
      });
      applicationList(state.page);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        setState({ errors: validationErrors, submitting: false });
      } else {
        Failure(error?.error);
        setState({ submitting: false });
      }
    }
  };

  const bulkSelect = async () => {
    try {
      const responses = await Promise.all(
        state.selectedRecords.map((id) => Models.application.details(id)),
      );

      const jobMap = new Map();
      const deptMap = new Map();
      const applicantMap = new Map();

      responses.forEach((res) => {
        const job = res?.job_detail;
        const dept = res?.department_details;

        if (job && !jobMap.has(job.id)) {
          jobMap.set(job.id, {
            value: job.id,
            label: job.job_title?.trim() || "No Title",
          });
        }

        if (Array.isArray(dept)) {
          dept.forEach((d) => {
            if (d && !deptMap.has(d.id)) {
              deptMap.set(d.id, {
                value: d.id,
                label: d.short_name?.trim() || "No Department",
              });
            }
          });
        }

        if (res?.id && !applicantMap.has(res.id)) {
          applicantMap.set(res.id, {
            value: res.id,
            label: res.applicant_name?.trim() || "No Name",
          });
        }
      });

      const jobList = Array.from(jobMap.values());
      const departmentList = Array.from(deptMap.values());
      const applicantList = Array.from(applicantMap.values());

      if (departmentList?.length > 0) {
        loadPanelMembers(1, "", false, departmentList);
      }

      setState({
        selectedJobs: jobList,
        selectedDepartments: departmentList,
        selectedApplicants: applicantList,
        showInterviewModal: true,
      });
    } catch (error) {
      console.log("error --->", error);
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Jobs
              </button>
            </div>
            <h1 className="page-ti text-transparent">Applications</h1>
            {state.jobTitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Filtered by job:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {state.jobTitle}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 flex gap-4">
        <div
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
          className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <FileText className="text-dblue h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.applicationCount?.count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Applications
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setState({ selectedStatus: { value: 5, label: "Applied" } })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.applicationCount?.applications_by_status?.applied ||
                  state.applicationCount?.applications_by_status?.Applied ||
                  0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Applied
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setState({ selectedStatus: { value: 4, label: "Selected" } })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.applicationCount?.applications_by_status?.Selected || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selected
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setState({
              selectedStatus: { value: 6, label: "Interview Scheduled" },
            })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-indigo-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-indigo-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.applicationCount?.applications_by_status?.[
                  "Interview Scheduled"
                ] ||
                  state.applicationCount?.applications_by_status?.[
                    "interview scheduled"
                  ] ||
                  0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Interview Scheduled
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-5">
          <TextInput
            placeholder="Search applications..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
            icon={<IconSearch className="h-4 w-4" />}
          />

          <CustomSelect
            options={state.collegeList}
            value={state.collegeFilter}
            onChange={(e) => {
              if (e) {
                departmentDropdownList(1, "", false, e.value);
              } else {
                setState({ departmentFilter: null, departmentList: [] });
              }
              setState({ collegeFilter: e });
            }}
            placeholder={"Select College"}
            isClearable={true}
            loading={state.collegeLoading}
            onSearch={(search) => collegeDropdownList(1, search, false)}
            loadMore={() => {
              if (state.collegeNext) {
                collegeDropdownList(state.collegePage + 1, "", true);
              }
            }}
          />

          <CustomSelect
            options={state.departmentList}
            value={state.departmentFilter}
            onChange={(e) => setState({ departmentFilter: e })}
            placeholder="Select Department"
            isClearable={true}
            disabled={!state.collegeFilter?.value}
            onSearch={(searchTerm) => {
              departmentDropdownList(
                1,
                searchTerm,
                false,
                state.collegeFilter?.value,
              );
            }}
            loadMore={() => {
              if (state.departmentNext) {
                departmentDropdownList(
                  state.departmentPage + 1,
                  "",
                  true,
                  state.collegeFilter?.value,
                );
              }
            }}
            loading={state.departmentLoading}
          />

          <CustomSelect
            options={RECORDS}
            value={state.sortingFilter}
            onChange={(e) => setState({ sortingFilter: e })}
            placeholder={"All Records"}
            isClearable={false}
          />

          <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Active Filter Tags */}
        <div className="mt-4">
          {(() => {
            const activeFilters = [];
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
                  {/* Fixed job_id badge */}
                  <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    <span>Job ID: {job_id}</span>
                  </div>
                  {activeFilters.map((filter) => (
                    <div
                      key={filter.key}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      <span>{filter.label}</span>
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
                        collegeFilter: null,
                        departmentFilter: null,
                        start_date: null,
                        end_date: null,
                        selectedStatus: null,
                      })
                    }
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              );
            }
            return (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  <span>Job ID: {job_id}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Application List
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords?.length > 0 && (
                <>
                  <button
                    onClick={() => bulkSelect()}
                    className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-md border border-blue-500 px-3 py-1 text-blue-500 shadow-lg transition-all duration-200"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    <span className="relative z-10 text-[13px]">
                      Schedule Interview ({state.selectedRecords?.length})
                    </span>
                  </button>
                  <button
                    onClick={() => handleBulkDelete()}
                    className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-md border border-red-500 px-3 py-1 text-red-500 shadow-lg transition-all duration-200"
                  >
                    <IconTrash className="h-4 w-4" />
                    <span className="relative z-10 text-[13px]">
                      Delete ({state.selectedRecords?.length})
                    </span>
                  </button>
                </>
              )}
              <div className="text-sm text-black">
                {state.count} applications found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 bg-white">
          <DataTable
            noRecordsText="No applications found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.applicationList}
            fetching={state.loading}
            selectedRecords={state.applicationList?.filter((record) =>
              state.selectedRecords?.includes(record.id),
            )}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r) => r.id) })
            }
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
            columns={[
              {
                accessor: "applicant_name",
                title: "Faculty Name",
                sortable: true,
                render: (row) => (
                  <Link
                    href={`/faculty/application_detail?id=${row?.id}`}
                    title={row?.applicant_name}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {truncateText(row?.applicant_name)}
                  </Link>
                ),
              },
              {
                accessor: "job_title",
                title: "Job Title",
                sortable: true,
                render: (row) => (
                  <Link
                    href={`/faculty/job_details?id=${row?.job_id}`}
                    title={row?.job_title}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {truncateText(row?.job_title)}
                  </Link>
                ),
              },
              {
                accessor: "college",
                title: "College",
                sortable: true,
                render: ({ college_name }) => (
                  <div
                    title={college_name}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    {college_name}
                  </div>
                ),
              },
              {
                accessor: "department_name",
                title: "Department",
                sortable: true,
                render: ({ department_name }) => {
                  if (!department_name || department_name?.length === 0) {
                    return <span className="text-gray-400">-</span>;
                  }
                  const firstDept = department_name?.[0];
                  const otherDept = department_name?.slice(1);
                  const maxShow = 3;
                  const remaining = otherDept?.length - maxShow;
                  const visibleDept = otherDept?.slice(0, maxShow);
                  const hiddenDept = otherDept?.slice(maxShow);

                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        title={firstDept}
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        {firstDept}
                      </span>
                      <div className="flex items-center -space-x-2">
                        {visibleDept?.map((dept: string, index: number) => (
                          <div key={index} className="group relative z-10">
                            <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs text-white dark:border-gray-900">
                              {dept?.slice(0, 2)?.toUpperCase()}
                            </div>
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                              {capitalizeFLetter(dept)}
                            </div>
                          </div>
                        ))}
                        {remaining > 0 && (
                          <div className="group relative">
                            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs text-white dark:border-gray-900">
                              +{remaining}
                            </div>
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
                      onClick={() => handleEdit(row)}
                      className="flex items-center justify-center rounded-lg text-green-900 transition-all duration-200"
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadResume(row)}
                      className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200"
                      title="Resume"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRound(row)}
                      className="flex items-center justify-center rounded-lg text-pink-600 transition-all duration-200"
                      title="Interview Round"
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                    </button>
                    {state.profile?.role === ROLES.HR && (
                      <button
                        onClick={() => {
                          setState({
                            showStatusModal: true,
                            selectedApplication: row,
                            selectedStatus: row.application_status,
                          });
                        }}
                        className="flex items-center justify-center rounded-lg text-purple-600 transition-all duration-200"
                        title="Update Status"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex items-center justify-center rounded-lg text-red-600 transition-all duration-200"
                      title="Delete"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            sortStatus={{
              columnAccessor: state.sortBy,
              direction: state.sortOrder as "asc" | "desc",
            }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({ sortBy: columnAccessor, sortOrder: direction, page: 1 });
              applicationList(1);
            }}
            minHeight={200}
          />
        </div>

        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

      {/* Update Status Modal */}
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

      {/* Interview Schedule Modal */}
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
              <CustomSelect
                title="Select Jobs"
                options={state.jobList}
                value={state.selectedJobs}
                onChange={(e) => {
                  setState({
                    selectedJobs: e,
                    selectedDepartments: null,
                    selectedApplicants: [],
                    panelMemberList: [],
                    panelMembers: null,
                    errors: { ...state.errors, selectedJobs: "" },
                  });
                  if (e) loadDepartmentsByJobs(1, "", false, e);
                }}
                onSearch={(searchTerm) => loadJobList(1, searchTerm)}
                loadMore={() => {
                  state.jobNext && loadJobList(state.jobPage + 1, "", true);
                }}
                isMulti
                loading={state.jobLoading}
                error={state.errors?.selectedJobs}
                required
                disabled
              />

              <CustomSelect
                title="Select Departments"
                options={state.interviewDeptList}
                value={state.selectedDepartments}
                onChange={(e) => {
                  setState({
                    selectedDepartments: e,
                    selectedApplicants: [],
                    panelMemberList: [],
                    panelMembers: null,
                    applicantsList: [],
                    errors: { ...state.errors, selectedDepartments: "" },
                  });
                  if (e) {
                    loadPanelMembers(1, "", false, e);
                    loadApplicantsByDept(1, "", false, e);
                  }
                }}
                onSearch={(searchTerm) =>
                  loadDepartmentsByJobs(1, searchTerm, false, state.selectedJobs)
                }
                loadMore={() => {
                  state.deptNext &&
                    loadDepartmentsByJobs(
                      state.deptPage + 1,
                      "",
                      true,
                      state.selectedJobs,
                    );
                }}
                isMulti
                placeholder="Select Departments"
                error={state.errors?.selectedDepartments}
                required
                disabled
              />

              <CustomSelect
                title="Select Faculty"
                options={state.applicantsList}
                value={state.selectedApplicants}
                onChange={(e) =>
                  setState({
                    selectedApplicants: e,
                    errors: { ...state.errors, selectedApplicants: "" },
                  })
                }
                onSearch={(searchTerm) =>
                  loadApplicantsByDept(
                    1,
                    searchTerm,
                    false,
                    state.selectedDepartments,
                  )
                }
                loadMore={() => {
                  if (state.appNext)
                    loadApplicantsByDept(
                      state.appPage + 1,
                      "",
                      false,
                      state.selectedDepartments,
                    );
                }}
                placeholder="Select Faculty"
                isMulti
                loading={state.applicantsLoading}
                disabled
                error={state.errors?.selectedApplicants}
                required
              />

              <CustomSelect
                title="Select Panel Members"
                placeholder="Select Panel Members"
                options={state.panelMemberList}
                value={state.panelMembers}
                onChange={(e) =>
                  setState({
                    panelMembers: e,
                    errors: { ...state.errors, panelMembers: "" },
                  })
                }
                onSearch={(searchTerm) =>
                  loadPanelMembers(1, searchTerm, false, state.selectedDepartments)
                }
                loadMore={() => {
                  if (state.panelNext)
                    loadPanelMembers(
                      state.panelPage + 1,
                      "",
                      false,
                      state.selectedDepartments,
                    );
                }}
                isMulti
                loading={state.panelMemberLoading}
                error={state.errors?.panelMembers}
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

      {/* Interview Rounds Modal */}
      <Modal
        subTitle="Interview Rounds"
        open={state.isOpenRound}
        close={() => setState({ isOpenRound: false })}
        closeIcon={() => setState({ isOpenRound: false })}
        padding="px-0 py-4"
        renderComponent={() => (
          <div className="flex h-[75vh] flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto px-2">
              <div className="rounded-xl border bg-white px-2 py-2 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-gray-500">
                  Application Details
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold">
                    {capitalizeFLetter(state.application?.first_name)}{" "}
                    {state.application?.last_name}
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex min-w-[200px] items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">
                      {state.application?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{state.application?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {state.application?.interview_slots?.map((round) => {
                  const isRoundOpen = !!state.expandedRounds?.[round.id];
                  return (
                    <div
                      key={round.id}
                      className="rounded-lg border bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setState({
                            expandedRounds: {
                              ...state.expandedRounds,
                              [round.id]: !isRoundOpen,
                            },
                          })
                        }
                        className="flex w-full items-center justify-between p-4 text-left"
                      >
                        <p className="font-semibold">
                          {capitalizeFLetter(round.round_name)}
                        </p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded px-3 py-1 text-xs font-semibold ${
                              round.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {capitalizeFLetter(round.status)}
                          </span>
                          <p className="text-xs text-gray-500">
                            {formatScheduleDateTime(
                              round.scheduled_date,
                              round.scheduled_time,
                            )}
                          </p>
                          <svg
                            className={`h-4 w-4 text-gray-500 transition-transform ${
                              isRoundOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      {isRoundOpen && (
                        <div className="space-y-2 border-t px-4 pb-4 pt-3">
                          <div>Panel Members With Feedbacks:</div>
                          {round.panels?.map((panel) => {
                            const feedback = panel?.feedbacks?.[0];
                            const panelKey = `${round.id}-${panel.id}`;
                            const isPanelOpen =
                              !!state.expandedRounds?.[panelKey];
                            return (
                              <div
                                key={panel.id}
                                className="rounded border bg-gray-50"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setState({
                                      expandedRounds: {
                                        ...state.expandedRounds,
                                        [panelKey]: !isPanelOpen,
                                      },
                                    })
                                  }
                                  className={`flex w-full items-center justify-between p-3 text-left ${feedback ? "cursor-pointer" : "cursor-default"}`}
                                >
                                  <p className="text-sm font-medium">
                                    {panel.name}
                                  </p>
                                  {feedback && (
                                    <svg
                                      className={`h-4 w-4 text-gray-400 transition-transform ${
                                        isPanelOpen ? "rotate-180" : ""
                                      }`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  )}
                                </button>
                                {isPanelOpen && feedback && (
                                  <div className="border-t px-3 pb-3 pt-2">
                                    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                                      {feedback.is_same_as_applicant !==
                                        undefined && (
                                        <p>
                                          <span className="font-semibold">
                                            Same As Applicant:
                                          </span>{" "}
                                          {feedback.is_same_as_applicant
                                            ? "Yes"
                                            : "No"}
                                        </p>
                                      )}
                                      {feedback.academic_record_remark && (
                                        <p>
                                          <span className="font-semibold">
                                            Academic Record:
                                          </span>{" "}
                                          {feedback.academic_record_remark}
                                        </p>
                                      )}
                                      {feedback.experience_remark && (
                                        <p>
                                          <span className="font-semibold">
                                            Experience:
                                          </span>{" "}
                                          {feedback.experience_remark}
                                        </p>
                                      )}
                                      {feedback.knowledge_rating && (
                                        <p>
                                          <span className="font-semibold">
                                            Knowledge Rating:
                                          </span>{" "}
                                          {feedback.knowledge_rating}
                                        </p>
                                      )}
                                      {feedback.knowledge_detail && (
                                        <p>
                                          <span className="font-semibold">
                                            Knowledge Detail:
                                          </span>{" "}
                                          {feedback.knowledge_detail}
                                        </p>
                                      )}
                                      {feedback.communication_skills_rating && (
                                        <p>
                                          <span className="font-semibold">
                                            Communication Rating:
                                          </span>{" "}
                                          {feedback.communication_skills_rating}
                                        </p>
                                      )}
                                      {feedback.communication_skills_comment && (
                                        <p>
                                          <span className="font-semibold">
                                            Communication Comment:
                                          </span>{" "}
                                          {feedback.communication_skills_comment}
                                        </p>
                                      )}
                                      {feedback.attitude_rating && (
                                        <p>
                                          <span className="font-semibold">
                                            Attitude Rating:
                                          </span>{" "}
                                          {feedback.attitude_rating}
                                        </p>
                                      )}
                                      {feedback.attitude_comment && (
                                        <p>
                                          <span className="font-semibold">
                                            Attitude Comment:
                                          </span>{" "}
                                          {feedback.attitude_comment}
                                        </p>
                                      )}
                                      {feedback.overall_assessment_rating && (
                                        <p>
                                          <span className="font-semibold">
                                            Overall Assessment:
                                          </span>{" "}
                                          {feedback.overall_assessment_rating}
                                        </p>
                                      )}
                                      {feedback.overall_assessment_remark && (
                                        <p>
                                          <span className="font-semibold">
                                            Overall Remark:
                                          </span>{" "}
                                          {feedback.overall_assessment_remark}
                                        </p>
                                      )}
                                      {feedback.position_recommendation && (
                                        <p>
                                          <span className="font-semibold">
                                            Position Recommendation:
                                          </span>{" "}
                                          {feedback.position_recommendation}
                                        </p>
                                      )}
                                      {feedback.recommendation_comments && (
                                        <p>
                                          <span className="font-semibold">
                                            Recommendation Comment:
                                          </span>{" "}
                                          {feedback.recommendation_comments}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border bg-gray-50 p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Application Status</p>
                  <span className="mt-1 inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {capitalizeFLetter(state.application?.status || "Pending")}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setState({ isOpenRound: false });
                    router.push(
                      `/faculty/application_detail?id=${state.application?.id}`,
                    );
                  }}
                  className="flex items-center gap-2 rounded border border-blue-600 px-2 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  View Application
                </button>
              </div>
            </div>
          </div>
        )}
      />

      {/* Filter Modal */}
      <Modal
        open={state.showFilterModal}
        close={() => setState({ showFilterModal: false })}
        maxWidth="!w-[800px]"
        renderComponent={() => (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg">Filters</h2>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-3">
              <CustomeDatePicker
                value={state.start_date}
                placeholder="Choose From"
                onChange={(e) => setState({ start_date: e })}
                showTimeSelect={false}
              />
              <CustomeDatePicker
                value={state.end_date}
                placeholder="Choose To"
                onChange={(e) => setState({ end_date: e })}
                showTimeSelect={false}
              />
              <CustomSelect
                options={state.applicationStatusList}
                value={state.selectedStatus}
                onChange={(e) => setState({ selectedStatus: e })}
                placeholder="Select Status"
                loading={state.applicationStatusLoading}
                isClearable={true}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <button
                onClick={() => {
                  setState({
                    collegeFilter: null,
                    departmentFilter: null,
                    selectedStatus: null,
                    start_date: null,
                    end_date: null,
                  });
                }}
                className="text-sm text-red-500 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="bg-dblue rounded-lg px-4 py-2 text-sm text-white shadow-md transition-all hover:shadow-lg"
              >
                Show {state.count} Results
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(HrApplication);
