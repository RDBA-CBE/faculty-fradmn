import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconSearch from "@/components/Icon/IconSearch";
import IconPlus from "@/components/Icon/IconPlus";
import IconTrash from "@/components/Icon/IconTrash";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconLoader from "@/components/Icon/IconLoader";
import IconEdit from "@/components/Icon/IconEdit";
import IconHistory from "@/components/Icon/IconHistory";
import Pagination from "@/components/pagination/pagination";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  showDeleteAlert,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import { Models } from "@/imports/models.import";
import CustomeDatePicker from "@/components/datePicker";
import {
  Briefcase,
  Users,
  Building2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  CheckCircle,
  Clock,
  CheckCheckIcon,
} from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { ROLES } from "@/utils/constant.utils";
import LogCard from "@/components/logCard";
import { MdApproval } from "react-icons/md";

const Job = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    logData: [],
    // Log data

    isOpen: false,

    // Job data
    jobList: [],
    count: 0,
    next: null,
    prev: null,
    editId: null,

    // Form fields
    job_title: "",
    job_description: "",
    college: null,
    department: null,
    job_type: null,
    experience_required: "",
    qualification: "",
    salary_range: "",
    last_date: "",
    priority: null,

    // Dropdown data
    institutionList: [],
    institutionLoading: false,
    institutionPage: 1,
    institutionNext: null,
    institutionFilter: null,

    collegeList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,
    collegeFilter: null,

    departmentList: [],
    departmentLoading: false,
    departmentPage: 1,
    departmentNext: null,
    departmentFilter: null,

    errors: {},
    selectedRecords: [],
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Job Management"));
  }, [dispatch]);

  useEffect(() => {
    jobList(1);
    institutionDropdownList(1);
    profile();
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    jobStatusList();
    categoryList(1);
  }, []);

  useEffect(() => {
    jobList(1);
  }, [
    debounceSearch,
    state.statusFilter,
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
    state.statusFilter,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      console.log("✌️profile --->", res);
      if (res?.role == ROLES.SUPER_ADMIN) {
        collegeDropdownList(1, "", false, "", res.id);
      } else if (res?.role == ROLES.INSTITUTION_ADMIN) {
        collegeDropdownList(
          1,
          "",
          false,
          res?.institution?.institution_id,
          res.id,
        );
      } else if (res?.role == ROLES.HR) {
        departmentDropdownList(1, "", false, res?.college?.college_id, res.id);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const jobList = async (page) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      const res: any = await Models.job.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item.id,
        job_title: item.job_title,
        job_description: item.job_description,

        college_name: item?.college?.name,
        department_name: item?.department?.name || "-",

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

  const locationList = async (page = 1) => {
    try {
      setState({ locationLoading: true });
      const res: any = await Models.job.job_locations();
      const dropdown = Dropdown(res?.results, "city");
      setState({ locationLoading: false, locationList: dropdown });
    } catch (error) {
      setState({ locationLoading: false });
    }
  };

  const categoryList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_category();
      const dropdown = Dropdown(res?.results, "name");
      setState({ categoryLoading: false, categoryList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const salaryRangeList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_salary_ranges();
      const dropdown = Dropdown(res?.results, "name");
      setState({ salaryRangeLoading: false, salaryRangeList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };
  const priorityList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_priority();
      const dropdown = Dropdown(res?.results, "name");
      setState({ priorityLoading: false, priorityList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };
  const typeList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_types();
      const dropdown = Dropdown(res?.results, "name");
      setState({ typeLoading: false, typeList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const jobStatusList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_status();
      const dropdown = Dropdown(res?.results, "name");
      setState({ jobStatusLoading: false, jobStatusList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
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
      const dropdown = Dropdown(res?.results, "institution_name");

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
    createdBy = null,
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };

      if (institutionId) {
        body.institution = institutionId;
      } else if (state.profile?.role === "institution_admin") {
        body.institution = state.profile?.institution?.institution_id;
      }

      if (createdBy) {
        body.created_by = createdBy;
      }
      body.team = "No";

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

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
      body.team = "No";
      const res: any = await Models.department.list(page, body);
      const dropdown = Dropdown(res?.results, "department_name");

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
  const bodyData = () => {
    const body: any = {};
    const userId = localStorage.getItem("userId");
    if (state.search) {
      body.search = state.search;
    }

    if (state.institutionFilter?.value) {
      body.institution_id = state.institutionFilter.value;
    }
    body.created_by = parseInt(userId);

    if (state.collegeFilter?.value) {
      body.college_id = state.collegeFilter.value;
    }
    if (state.departmentFilter?.value) {
      body.department_id = state.departmentFilter.value;
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
    if (state.statusFilter?.value) {
      body.status = state.statusFilter.value;
    }
    body.team = "No";
    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    return body;
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    jobList(pageNumber);
  };

  const handleInstitutionChange = (selectedOption: any) => {
    setState({
      institutionFilter: selectedOption,
      collegeFilter: null,
      collegeList: [],
      page: 1,
    });

    if (selectedOption?.value) {
      collegeDropdownList(
        1,
        "",
        false,
        selectedOption.value,
        state.profile?.id,
      );
    }
  };

  const handleLog = async (row) => {
    console.log("✌️row --->", row);
    try {
      setState({ isOpen: true, editId: row.id });

      const res: any = await Models.job.log_list(row.id);
      console.log("✌️res --->", res);
      setState({ logData: res });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createJobLog = async (message) => {
    try {
      const body = {
        message,
        job_id: state.editId,
        created_by: parseInt(localStorage.getItem("userId")),
      };
      console.log("✌️body --->", body);

      await Models.job.create_log(body);
      const res: any = await Models.job.log_list(state.editId);
      setState({ logData: res });
      Success("Log created successfully!");
    } catch (error) {
      console.error("Failed to create log", error);
    }
  };

  const handleCollegeChange = (selectedOption: any) => {
    setState({
      collegeFilter: selectedOption,
      departmentFilter: null,
      departmentList: [],
      page: 1,
    });

    if (selectedOption?.value) {
      departmentDropdownList(
        1,
        "",
        false,
        selectedOption.value,
        state.profile?.id,
      );
    }
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setState({ departmentFilter: selectedOption, page: 1 });
  };

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      job_title: "",
      job_description: "",
      college: null,
      department: null,
      job_type: null,
      experience_required: "",
      qualification: "",
      salary_range: "",
      last_date: "",
      priority: null,
      departmentList: [],
      errors: {},
      editId: null,
    });
  };

  const handleApprove = async (row: any) => {
    const result = await Swal.fire({
      title: row.is_approved ? "Unapprove Job?" : "Approve Job?",
      text: row.is_approved
        ? "Are you sure you want to unapprove this job?"
        : "Are you sure you want to approve this job?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
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
        jobList(state.page);
      } catch (error) {
        Failure(
          row.is_approved ? "Failed to unapprove job" : "Failed to approve job",
        );
      }
    }
  };

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.job_status === "active" ? "inactive" : "active";
      const formData = buildFormData({ job_status_id: newStatus });
      await Models.job.update(formData, row?.id);
      Success(`Job ${newStatus} successfully!`);
      jobList(state.page);
    } catch (error) {
      Failure("Failed to update status");
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
      jobList(state.page);
    } catch (error) {
      Failure("Failed to delete job");
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
        await Models.job.delete(id);
      }
      Success(`${state.selectedRecords.length} jobs deleted successfully!`);
      setState({ selectedRecords: [] });
      jobList(state.page);
    } catch (error) {
      Failure("Failed to delete jobs. Please try again.");
    }
  };

  const handleEdit = (row) => {
    console.log("✌️row --->", row);
    router.push(`/faculty/updatejob?id=${row.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Job Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage job postings and opportunities
            </p>
          </div>
          <button
            onClick={() => router.push("newjob")}
            className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Job</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {state.count || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Jobs
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {state.jobList?.filter((job) => job.status === "active")
                  ?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
              <CheckCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Jobs
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {state.jobList?.filter((job) => job.job_type === "full_time")
                  ?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Urgent Priority
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {state.jobList?.filter((job) => job.priority === "urgent")
                  ?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative">
            <TextInput
              placeholder="Search jobs..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
            />
          </div>
          <>
            {(state.profile?.role == ROLES.SUPER_ADMIN ||
              state.profile?.role == ROLES.INSTITUTION_ADMIN) && (
              <>
                {state.profile?.role == ROLES.SUPER_ADMIN && (
                  <CustomSelect
                    options={state.institutionList}
                    value={state.institutionFilter}
                    onChange={handleInstitutionChange}
                    placeholder="Select institution"
                    isClearable={true}
                    onSearch={(searchTerm) =>
                      institutionDropdownList(1, searchTerm)
                    }
                    loadMore={() =>
                      state.institutionNext &&
                      institutionDropdownList(
                        state.institutionPage + 1,
                        "",
                        true,
                      )
                    }
                    loading={state.institutionLoading}
                  />
                )}
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
                      state.profile?.id,
                    );
                  }}
                  loadMore={() => {
                    const institutionId =
                      state.profile?.role === ROLES.SUPER_ADMIN
                        ? state.institutionFilter?.value
                        : state.profile?.institution?.institution_id;
                    state.collegeNext &&
                      collegeDropdownList(
                        state.collegePage + 1,
                        "",
                        true,
                        institutionId,
                        state.profile?.id,
                      );
                  }}
                  loading={state.collegeLoading}
                />

                <CustomSelect
                  options={state.departmentList}
                  value={state.departmentFilter}
                  onChange={handleDepartmentChange}
                  placeholder="Select department"
                  isClearable={true}
                  onSearch={(searchTerm) => {
                    const collegeId = state.collegeFilter?.value;
                    collegeId &&
                      departmentDropdownList(
                        1,
                        searchTerm,
                        false,
                        collegeId,
                        state.profile?.id,
                      );
                  }}
                  loadMore={() => {
                    const collegeId = state.collegeFilter?.value;
                    state.departmentNext &&
                      collegeId &&
                      departmentDropdownList(
                        state.departmentPage + 1,
                        "",
                        true,
                        collegeId,
                        state.profile?.id,
                      );
                  }}
                  loading={state.departmentLoading}
                  disabled={!state.collegeFilter}
                />
              </>
            )}
            {state.profile?.role == ROLES.HR && (
              <>
                {/* <CustomSelect
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
                        : state.profile?.institution?.institution_id;
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
                /> */}

                <CustomSelect
                  options={state.departmentList}
                  value={state.departmentFilter}
                  onChange={handleDepartmentChange}
                  placeholder="Select department"
                  isClearable={true}
                  onSearch={(searchTerm) => {
                    const collegeId = state.collegeFilter?.value;
                    collegeId &&
                      departmentDropdownList(
                        1,
                        searchTerm,
                        false,
                        collegeId,
                        state.profile?.id,
                      );
                  }}
                  loadMore={() => {
                    const collegeId = state.collegeFilter?.value;
                    state.departmentNext &&
                      collegeId &&
                      departmentDropdownList(
                        state.departmentPage + 1,
                        "",
                        true,
                        collegeId,
                        state.profile?.id,
                      );
                  }}
                  loading={state.departmentLoading}
                />
              </>
            )}

            <div className="group relative">
              <CustomeDatePicker
                value={state.start_date}
                placeholder="Choose From"
                onChange={(e) => setState({ start_date: e })}
                showTimeSelect={false}
              />
            </div>
            <div className="group relative">
              <CustomeDatePicker
                value={state.end_date}
                placeholder="Choose To "
                onChange={(e) => setState({ end_date: e })}
                showTimeSelect={false}
              />
            </div>
            <div className="group relative">
              <CustomSelect
                options={state.locationList}
                value={state.locationFilter}
                onChange={(e) => setState({ locationFilter: e })}
                placeholder="Select location"
                isClearable={true}
                loading={state.locationLoading}
              />
            </div>

            {/* <div className="group relative">
              <CustomSelect
                options={state.categoryList}
                value={state.categoryFilter}
                onChange={(e) => setState({ categoryFilter: e })}
                placeholder="Select category"
                isClearable={true}
                loading={state.categoryLoading}
              />
            </div> */}

            <div className="group relative">
              <CustomSelect
                options={state.jobStatusList}
                value={state.statusFilter}
                onChange={(e) => setState({ statusFilter: e })}
                placeholder="Filter by status"
                isClearable={true}
              />
            </div>
            <div className="group relative">
              <CustomSelect
                options={state.salaryRangeList}
                value={state.salaryFilter}
                onChange={(e) => setState({ salaryFilter: e })}
                placeholder="Select salary range"
                isClearable={true}
              />
            </div>
            {/* <div className="group relative">
              <CustomSelect
                options={state.typeList}
                value={state.typeFilter}
                onChange={(e) => setState({ typeFilter: e })}
                placeholder="Select job type"
                isClearable={true}
              />
            </div> */}

            <div className="group relative">
              <CustomSelect
                options={state.priorityList}
                value={state.priorityFilter}
                onChange={(e) => setState({ priorityFilter: e })}
                placeholder="Filter by priority"
                isClearable={true}
              />
            </div>
          </>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Jobs List
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  <IconTrash className="h-4 w-4" />
                  Delete ({state.selectedRecords.length})
                </button>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {state.count} jobs found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText="No jobs found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.jobList}
            fetching={state.loading}
            selectedRecords={state.jobList?.filter((record) =>
              state.selectedRecords.includes(record.id),
            )}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r: any) => r.id) })
            }
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading jobs...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: "job_title",
                title: "Job Title",
                sortable: true,
                render: ({ job_title }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {job_title}
                  </div>
                ),
              },
              {
                accessor: "department_name",
                title: "Dept",
                sortable: true,
                render: ({ department_name }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {department_name || "-"}
                  </span>
                ),
              },
              {
                accessor: "college_name",
                title: "College",
                sortable: true,
                render: ({ college_name }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {college_name || "-"}
                  </span>
                ),
              },

              // {
              //   accessor: "job_type",
              //   title: "Type",
              //   render: ({ job_type }) => (
              //     <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              //       {job_type?.replace("_", " ") || "-"}
              //     </span>
              //   ),
              // },
              {
                accessor: "experiences",
                title: "Experience",
                render: ({ experiences }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {experiences?.label || "-"}
                  </span>
                ),
              },
              {
                accessor: "number_of_openings",
                title: "Openings",
                render: ({ number_of_openings }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {number_of_openings || "-"}
                  </span>
                ),
              },
              {
                accessor: "job_status",
                title: "Status",
                render: (row) => (
                  <span
                    onClick={() => {
                      if (state.profile?.role == ROLES.HR) {
                        handleApprove(row);
                      }
                    }}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
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
                title: "Priority",
                render: ({ priority }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
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
                    {last_date ? new Date(last_date).toLocaleDateString() : "-"}
                  </span>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() =>
                        router.push(`/faculty/job_details?id=${row.id}`)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleLog(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200"
                      title="Logs"
                    >
                      <IconHistory className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(row)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        row?.job_status === "published"
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      title={
                        row?.job_status === "published"
                          ? "Unpublish"
                          : "Publish"
                      }
                    >
                      {row?.job_status === "published" ? (
                        <ToggleLeft className="h-4 w-4" />
                      ) : (
                        <ToggleRight className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
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
              jobList(1);
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
        open={state.isOpen}
        close={() => setState({ isOpen: false, editId: null })}
        padding="px-2"
        renderComponent={() => (
          <>
            <LogCard
              data={state.logData}
              title="Job Logs"
              onClose={() => setState({ isOpen: false })}
              onSendMessage={(e) => createJobLog(e)}
            />
          </>
        )}
      />
    </div>
  );
};

export default Job;
