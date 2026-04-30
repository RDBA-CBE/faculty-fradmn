import { DataTable } from "mantine-datatable";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomPhoneInput from "@/components/phoneInput";
import IconSearch from "@/components/Icon/IconSearch";
import IconPlus from "@/components/Icon/IconPlus";
import IconTrash from "@/components/Icon/IconTrash";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconLoader from "@/components/Icon/IconLoader";
import IconEdit from "@/components/Icon/IconEdit";
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
  XCircle,
  UserCheck,
  ClipboardList,
  UserCircle,
  Calendar,
  MessageSquare,
  Star,
  Building2,
  Mail,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  FilterIcon,
  SlidersHorizontal,
  Hourglass,
  Verified,
  VerifiedIcon,
  X,
  BriefcaseBusiness,
  User,
  Phone,
} from "lucide-react";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import moment from "moment";
import { RECORDS, ROLES, STATUS_COLOR } from "@/utils/constant.utils";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Link from "next/link";

const SESSION_KEY = "admin_application_page";

const Application = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const profileRef = useRef(null);

  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    recordsData: [],
    totalRecords: 0,
    search: "",
    statusFilter: null,
    showModal: false,
    showFilterModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    position_applied: "",
    qualification: "",
    experience: "",
    cover_letter: "",
    errors: {},
    count: 0,
    applicationList: [],
    next: null,
    prev: null,
    editId: null,

    // Filter states
    institutionFilter: null,
    collegeFilter: null,
    departmentFilter: null,
    start_date: "",
    end_date: "",
    locationFilter: null,
    categoryFilter: null,
    priorityFilter: null,
    typeFilter: null,
    salaryFilter: null,

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

    locationList: [],
    locationLoading: false,

    categoryList: [],
    categoryLoading: false,

    salaryRangeList: [],
    salaryRangeLoading: false,

    priorityList: [],
    priorityLoading: false,

    typeList: [],
    typeLoading: false,

    jobStatusList: [],
    jobStatusLoading: false,

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
    interviewStatusList: [
      { value: "scheduled", label: "Scheduled" },
      { value: "completed", label: "Completed" },
    ],
    isOpenRound: false,
    expandedRounds: {},
    selectedRecords: [],
    sortingFilter: {
      value: 1,
      label: "All Records",
    },
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Applications"));
    const savedPage = parseInt(sessionStorage.getItem(SESSION_KEY) || "1", 10);
    if (savedPage > 1) {
      setState({ page: savedPage });
    }
    profile(savedPage);
    institutionDropdownList(1);
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    jobStatusList();
    categoryList(1);
    applicationStatusList();
    applicationStatusExceptAppliedandInterList();
  }, []);

  useEffect(() => {
    if (profileRef.current) {
      sessionStorage.removeItem(SESSION_KEY);
      setState({ page: 1 });
      applicationList(1, null, null, null, state.profile?.id);
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
    state.sortingFilter,
    state.filterCollege,
  ]);

  console.log("✌️collegeList --->", state.collegeList);

  const profile = async (initialPage = 1) => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      profileRef.current = true;
      collegeDropdownList(1, "", false, "");
      applicationList(initialPage, null, null, null, res?.id);
      applicationCount();
      loadJobList(1, null, false, null, null, null, res?.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const applicationCount = async () => {
    try {
      setState({ applicationCountLoading: true });

      const res: any = await Models.application.application_counts();
      setState({ applicationCount: res });
    } catch (error) {
      setState({ applicationCountLoading: false });
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

  const applicationStatusExceptAppliedandInterList = async () => {
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
        applicationStatusesList: dropdown,
      });
    } catch (error) {
      setState({ applicationStatusLoading: false });
    }
  };
  console.log("✌️res --->", state.collegeList);

  const applicationList = async (
    page,
    institutionId = null,
    collegeId = null,
    deptId = null,
    profileId = null,
  ) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      console.log("✌️institutionId --->", institutionId);

      if (institutionId) {
        body.institution = institutionId;
      }
      if (collegeId) {
        body.college = collegeId;
      }

      if (deptId) {
        body.department = deptId;
      }

      if (state.departmentFilter) {
        body.department = state.departmentFilter?.value;
      }

      if (state.filterCollege) {
        body.college = state.filterCollege?.value;
      }

      // if (profileId) {
      //   body.created_by = profileId;
      // }
      if (state.sortingFilter?.value) {
        if (state.sortingFilter?.value == 2) {
          body.team = "No";
          body.created_by = profileId;
        } else if (state.sortingFilter?.value == 3) {
          body.created_by = profileId;
          body.team = "Yes";
        }
      }
      // body.team = "No";

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
        department_name: item?.department_details?.map(
          (item) => item?.short_name,
        ),
        interview_status:
          item?.interview_slots?.length > 0
            ? item?.interview_slots[item?.interview_slots.length - 1]?.status
            : "-",
        job_id: item?.job,
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
    if (state.locationFilter?.value) {
      body.location = state.locationFilter.value;
    }
    if (state.categoryFilter?.value) {
      body.category = state.categoryFilter.value;
    }
    if (state.priorityFilter?.value) {
      body.priority = state.priorityFilter.value;
    }
    if (state.typeFilter?.value) {
      body.job_type = state.typeFilter.value;
    }
    if (state.salaryFilter?.value) {
      body.salary_range = state.salaryFilter.value;
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

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    sessionStorage.setItem(SESSION_KEY, String(pageNumber));
    const role = state.profile?.role;
    if (role === ROLES.SUPER_ADMIN) {
      applicationList(pageNumber, null, null, null, state.profile?.id);
    } else if (role === ROLES.INSTITUTION_ADMIN) {
      applicationList(
        pageNumber,
        state.profile?.institution?.id,
        null,
        null,
        state.profile?.id,
      );
    } else if (role === ROLES.HR) {
      applicationList(
        pageNumber,
        null,
        state.profile?.college?.map((item) => item?.college_id),
        null,
        state.profile?.id,
      );
    } else if (role === ROLES.HOD) {
      applicationList(
        pageNumber,
        null,
        null,
        state.profile?.department?.department_id,
        state.profile?.id,
      );
    }
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      applicant_name: "",
      applicant_email: "",
      applicant_phone: "",
      position_applied: "",
      qualification: "",
      experience: "",
      cover_letter: "",
      errors: {},
      editId: null,
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
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
      const role = state.profile?.role;
      if (role === ROLES.SUPER_ADMIN) {
        applicationList(state.page, null, null, null, state.profile?.id);
      } else if (role === ROLES.INSTITUTION_ADMIN) {
        applicationList(
          state.page,
          state.profile?.institution?.id,
          null,
          null,
          state.profile?.id,
        );
      } else if (role === ROLES.HR) {
        applicationList(
          state.page,
          null,
          state.profile?.college?.map((item) => item?.college_id),
          null,
          state.profile?.id,
        );
      } else if (role === ROLES.HOD) {
        applicationList(
          state.page,
          null,
          null,
          state.profile?.department?.department_id,
          state.profile?.id,
        );
      }
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleEdit = (row) => {
    router.push(`/faculty/application_detail?id=${row?.id}`);
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
          state.profile?.id,
        );
      } else if (role === ROLES.HR) {
        applicationList(
          state.page,
          null,
          state.profile?.college?.map((item) => item?.college_id),
          null,
          state.profile?.id,
        );
      } else if (role === ROLES.HOD) {
        applicationList(
          state.page,
          null,
          null,
          state.profile?.department?.department_id,
          state.profile?.id,
        );
      }
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => {
        deleteRecord(row);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete record?",
    );
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

  const collegeDropdownList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null,
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };

      if (institutionId) {
        body.institution = institutionId;
      }

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
      if (collegeIds) {
        body.college = collegeIds;
      }
      console.log("✌️body --->", body);

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

  const locationList = async (page = 1) => {
    try {
      setState({ locationLoading: true });
      const res: any = await Models.job.job_locations();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.city,
      }));
      setState({ locationLoading: false, locationList: dropdown });
    } catch (error) {
      setState({ locationLoading: false });
    }
  };

  const categoryList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_category();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ categoryLoading: false, categoryList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const salaryRangeList = async (page = 1) => {
    try {
      setState({ salaryRangeLoading: true });
      const res: any = await Models.job.job_salary_ranges();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ salaryRangeLoading: false, salaryRangeList: dropdown });
    } catch (error) {
      setState({ salaryRangeLoading: false });
    }
  };

  const priorityList = async (page = 1) => {
    try {
      setState({ priorityLoading: true });
      const res: any = await Models.job.job_priority();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ priorityLoading: false, priorityList: dropdown });
    } catch (error) {
      setState({ priorityLoading: false });
    }
  };

  const typeList = async (page = 1) => {
    try {
      setState({ typeLoading: true });
      const res: any = await Models.job.job_types();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ typeLoading: false, typeList: dropdown });
    } catch (error) {
      setState({ typeLoading: false });
    }
  };

  const jobStatusList = async (page = 1) => {
    try {
      setState({ jobStatusLoading: true });
      const res: any = await Models.job.job_status();
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setState({ jobStatusLoading: false, jobStatusList: dropdown });
    } catch (error) {
      setState({ jobStatusLoading: false });
    }
  };

  const deleteRecord = async (row: any) => {
    try {
      await Models.application.delete(row?.id);
      Success("Application deleted successfully!");
      // applicationList(state.page);
      handleUpdateStatus("", "");
      if (state.selectedRecords?.length > 0) {
        const filter = state.selectedRecords?.filter((item) => item != row?.id);
        setState({ selectedRecords: filter });
      }
    } catch (error) {
      Failure("Failed to delete application. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });
      const body = {
        applicant_name: state.applicant_name,
        applicant_email: state.applicant_email,
        applicant_phone: state.applicant_phone,
        position_applied: state.position_applied,
        qualification: state.qualification,
        experience: state.experience,
        cover_letter: state.cover_letter,
        status: "Pending",
      };

      if (state.editId) {
        await Models.application.update(body, state.editId);
        Success("Application updated successfully!");
      } else {
        await Models.application.create(body);
        Success("Application created successfully!");
      }

      applicationList(state.page);
      handleCloseModal();
    } catch (error: any) {
      if (error?.inner) {
        const errors: any = {};
        error?.inner?.forEach((err: any) => {
          errors[err?.path] = err.message;
        });
        setState({ errors });
      } else {
        Failure("Failed to create application. Please try again.");
      }
    } finally {
      setState({ submitting: false });
    }
  };

  const handleDownloadResume = (row) => {
    if (row?.resume) {
      window.open(row.resume, "_blank");
    }
  };

  // Interview Schedule Functions
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
      body.created_by = state.profile?.id;
      if (created_by) {
        body.created_by = created_by;
      }
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
      const body = {
        job_id: job?.map((item) => item?.value),
        search,
      };

      const res: any = await Models.department.list(page, body);
      // const uniqueDeptIds = [...new Set(deptIds)];
      // const body: any = { ids: uniqueDeptIds.join(",") };
      // const res: any = await Models.department.list(1, body);
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
    } catch (error) {
      console.error("Error loading departments:", error);
    }
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
      const body: any = {
        search,
      };
      if (deptIds) {
        body.department = deptIds?.map((item) => item?.value);
      }
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
        selectedDepartments: state.selectedDepartments?.map(
          (item) => item?.value,
        ),
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
        // department_id: state.selectedDepartments?.map((item)=>item?.value),
        department_id: state.selectedDepartments[0]?.value,

        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        panel_ids: state.panelMembers.map((p) => p.value),
        application_ids: state.selectedApplicants.map((a) => a.value),
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link ?? "",
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
        selectedRecords: [],
      });
      profile();
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

  const handleRound = async (row) => {
    try {
      const res: any = await Models.application.details(row?.id);

      setState({
        application: res,
        loading: false,
        appstatus: row?.application_status,
        isOpenRound: true,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
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
      if (state.appstatus?.label == "Rejected") {
        const filter = state.selectedRecords?.filter(
          (item) => item != state.application?.id,
        );
        setState({ selectedRecords: filter });
      }
    } catch (error) {
      setState({ btnLoading: false, isOpenRound: false });

      console.log("✌️error --->", error);
    }
  };

  const bulkSelect = async () => {
    try {
      const responses = await Promise.all(
        state.selectedRecords.map((id) => Models.application.details(id)),
      );

      console.log("✌️responses --->", responses);

      const jobMap = new Map();
      const deptMap = new Map();
      const applicantMap = new Map();

      responses.forEach((res) => {
        const job = res?.job_detail;
        const dept = res?.department_details;
        console.log("✌️dept --->", dept);

        // Job
        if (job && !jobMap.has(job.id)) {
          jobMap.set(job.id, {
            value: job.id,
            label: job.job_title?.trim() || "No Title",
          });
        }

        // Department
        // if (dept && !deptMap.has(dept.id)) {
        //   deptMap.set(dept.id, {
        //     value: dept.id,
        //     label: dept.short_name?.trim() || "No Department",
        //   });
        // }

        if (Array.isArray(dept)) {
          dept.forEach((dept) => {
            console.log("abcd --->", dept);
            if (dept && !deptMap.has(dept.id)) {
              deptMap.set(dept.id, {
                value: dept.id,
                label: dept.short_name?.trim() || "No Department",
              });
            }
          });
        }

        // Applicant
        if (res?.id && !applicantMap.has(res.id)) {
          applicantMap.set(res.id, {
            value: res.id,
            label: res.applicant_name?.trim() || "No Name",
          });
        }
      });

      const jobList = Array.from(jobMap.values());
      console.log("✌️jobList --->", jobList);
      const departmentList = Array.from(deptMap.values());
      console.log("✌️departmentList --->", departmentList);
      const applicantList = Array.from(applicantMap.values());
      console.log("✌️applicantList --->", applicantList);

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
        `${state.selectedRecords.length} application deleted successfully!`,
      );
      setState({ selectedRecords: [] });
      applicationList(state.page);
    } catch (error) {
      Failure("Failed to delete jobs. Please try again.");
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti  text-transparent">
              Application Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review job applications
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="tour-myapp-stats mb-6 flex gap-4">
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

      {/* Filters Section */}
      <div className="tour-myapp-filters mb-5 rounded-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between gap-5">
          <TextInput
            placeholder="Search applications..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
            icon={<IconSearch className="h-4 w-4" />}
          />

          <CustomSelect
            options={state.institutionList}
            value={state.institutionFilter}
            onChange={(e) => {
              if (e) {
                collegeDropdownList(1, "", false, e.value);
              } else {
                setState({ collegeFilter: null, departmentFilter: null });
              }

              setState({ institutionFilter: e });
            }}
            placeholder={"Select Institution"}
            isClearable={true}
            loading={state.institutionLoading}
            onSearch={(search) => {
              institutionDropdownList(1, search, false);
            }}
            loadMore={() => {
              if (state.institutionNext) {
                institutionDropdownList(state.institutionPage + 1, "", true);
              }
            }}
          />

          <CustomSelect
            options={state.collegeList}
            value={state.collegeFilter}
            onChange={(e) => {
              if (e) {
                departmentDropdownList(1, "", false, e.value);
              }
              setState({ collegeFilter: e });
            }}
            placeholder={"Select College"}
            isClearable={true}
            loading={state.collegeLoading}
            onSearch={(search) => {
              collegeDropdownList(
                1,
                search,
                false,
                state.institutionFilter?.value,
              );
            }}
            loadMore={() => {
              if (state.collegeNext) {
                collegeDropdownList(
                  state.collegePage + 1,
                  "",
                  true,
                  state.institutionFilter?.value,
                );
              }
            }}
          />

          <CustomSelect
            options={state.departmentList}
            value={state.departmentFilter}
            onChange={(e) => {
              setState({ departmentFilter: e });
            }}
            // onChange={handleDepartmentChange}
            placeholder="Select department"
            isClearable={true}
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
                departmentDropdownList(1, "", true, state.collegeFilter?.value);
              }
            }}
            loading={state.departmentLoading}
            disabled={!state.collegeFilter?.value}
          />

          <CustomSelect
            options={[
              {
                value: 1,
                label: "All Records",
              },
              {
                value: 2,
                label: "Own Records",
              },
              {
                value: 3,
                label: "Not Own Records",
              },
            ]}
            value={state.sortingFilter}
            onChange={(e) => setState({ sortingFilter: e })}
            placeholder={"All Records"}
            isClearable={false}
          />
          <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
        <div className="mt-4">
          <div className="group relative"></div>
          {(() => {
            const activeFilters = [];
            if (state.sortingFilter?.value != 1 && state.sortingFilter)
              activeFilters.push({
                key: "sortingFilter",
                label: `Record: ${state.sortingFilter?.label}`,
              });
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
                        institutionFilter: null,
                        collegeFilter: null,
                        departmentFilter: null,
                        start_date: null,
                        end_date: null,
                        selectedStatus: null,
                        sortingFilter:null,
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

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Application List
            </h3>

            <div className="flex items-center gap-4">
              {state.selectedRecords?.length > 0 && (
                <button
                  onClick={() => handleBulkDelete()}
                  className=" group relative inline-flex transform items-center gap-2 overflow-hidden rounded-md border border-red-500  px-3 py-1 text-red-500 shadow-lg transition-all duration-200 "
                >
                  <div className=" absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  <IconTrash className="h-4 w-4" />
                  <span className="relative z-10 text-[13px]">
                    Delete ({state.selectedRecords?.length})
                  </span>
                </button>
              )}
              <div className="text-sm text-black ">
                {state.count} applications found
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border border-gray-200 bg-white tour-myapp-table">
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

              // {
              //   accessor: "applicant_email",
              //   title: "Email",
              //   sortable: true,

              //   render: ({ applicant_email }) => (
              //     <span
              //       title={applicant_email}
              //       className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              //     >
              //       {truncateText(applicant_email)}
              //     </span>
              //   ),
              // },
              // {
              //   accessor: "applicant_phone",
              //   title: "Phone",
              //   render: ({ applicant_phone }) => (
              //     <div className="text-gray-600 dark:text-gray-400">
              //       {applicant_phone}
              //     </div>
              //   ),
              // },
              // {
              //   accessor: "experience",
              //   title: "Experience",
              //   render: ({ experience }) => (
              //     <div className="text-gray-600 dark:text-gray-400">
              //       {experience}
              //     </div>
              //   ),
              // },

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
                  <div className="tour-myapp-actions flex items-center justify-center gap-3">
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
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
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

        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

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

                  if (e) {
                    loadDepartmentsByJobs(1, "", false, e);
                  }
                }}
                onSearch={(searchTerm) => {
                  loadJobList(1, searchTerm);
                }}
                loadMore={() => {
                  state.jobNext && loadJobList(state.jobPage + 1, "", true);
                }}
                isMulti
                loading={state.jobLoading}
                error={state.errors.selectedJobs}
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
                onSearch={(searchTerm) => {
                  loadDepartmentsByJobs(
                    1,
                    searchTerm,
                    false,
                    state.selectedJobs,
                  );
                }}
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
                error={state.errors.selectedDepartments}
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
                onSearch={(searchTerm) => {
                  loadApplicantsByDept(
                    1,
                    searchTerm,
                    false,
                    state.selectedDepartments,
                  );
                }}
                loadMore={() => {
                  if (state.appNext) {
                    loadApplicantsByDept(
                      state.appPage + 1,
                      "",
                      false,
                      state.selectedDepartments,
                    );
                  }
                }}
                placeholder="Select Faculty"
                isMulti
                loading={state.applicantsLoading}
                disabled
                error={state.errors.selectedApplicants}
                required
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
                    state.selectedDepartments,
                  );
                }}
                loadMore={() => {
                  if (state.panelNext) {
                    loadPanelMembers(
                      state.panelPage + 1,
                      "",
                      false,
                      state.selectedDepartments,
                    );
                  }
                }}
                isMulti
                loading={state.jobLoading}
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
                className="bg-dblue flex-1 rounded-lg  px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Creating..." : "Create Schedule"}
              </button>
            </div>
          </div>
        )}
      />

      {/* View Interview rounds and feedback */}

      <Modal
        subTitle="Interview Rounds"
        open={state.isOpenRound}
        close={() => setState({ isOpenRound: false })}
        closeIcon={() => setState({ isOpenRound: false })}
        padding="px-0 py-4"
        renderComponent={() => (
          <div className="flex h-[75vh] flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 space-y-2 overflow-y-auto px-2">
              {/* Candidate */}
              <div className="rounded-xl border bg-white px-2 py-2 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-gray-500">
                  Application Details
                </p>

                {/* Name */}
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold">
                    {capitalizeFLetter(state.application?.first_name)}{" "}
                    {state.application?.last_name}
                  </h3>
                </div>

                {/* Email + Phone in single row */}
                <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  {/* Email */}
                  <div className="flex min-w-[200px] items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">
                      {state.application?.email || "N/A"}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{state.application?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Rounds */}
              <div className="space-y-4  ">
                {state.application?.interview_slots?.map((round) => {
                  const isRoundOpen = !!state.expandedRounds?.[round.id];
                  return (
                    <div
                      key={round.id}
                      className="rounded-lg border bg-white shadow-sm"
                    >
                      {/* Round Header — clickable accordion toggle */}
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

                      {/* Feedback List */}
                      {isRoundOpen && (
                        <div className="space-y-2 border-t px-4 pb-4 pt-3">
                          <div>Pannel Members With Feedbacks :</div>
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
                                          {
                                            feedback.communication_skills_comment
                                          }
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
                {/* Status */}
                <div>
                  <p className="text-xs text-gray-500">Application Status</p>
                  <span className="mt-1 inline-block rounded bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {capitalizeFLetter(state.application?.status || "Pending")}
                  </span>
                </div>

                {/* View Application Button */}
                <button
                  onClick={() => {
                    setState({ isOpenRound: false });
                    router.push(
                      `/faculty/application_detail?id=${state.application?.id}`,
                    );
                    // navigate or open application
                    // viewApplication(state.application?.id);
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

      <Modal
        open={state.showFilterModal}
        close={() => setState({ showFilterModal: false })}
        // title="Filters"
        maxWidth="!w-[800px]"
        renderComponent={() => (
          <div>
            <div className="flex items-center justify-between ">
              <h2 className="text-lg ">Filters</h2>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-3">
              <CustomSelect
                options={state.applicationStatusList}
                value={state.selectedStatus}
                onChange={(e) => setState({ selectedStatus: e })}
                placeholder="Select status"
                loading={state.applicationStatusLoading}
              />
            </div>
            <div className="flex items-center justify-between py-3 ">
              <button
                onClick={() => {
                  setState({
                    institutionFilter: null,
                    collegeFilter: null,
                    departmentFilter: null,
                    selectedStatus: null,
                  });
                }}
                className=" text-sm text-red-500 transition-all hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="bg-dblue  rounded-lg px-4 py-2  text-sm text-white shadow-md transition-all hover:shadow-lg"
              >
                Show {state.count} Application Results
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(Application);
