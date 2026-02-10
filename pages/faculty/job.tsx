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
import Pagination from "@/components/pagination/pagination";
import {
  capitalizeFLetter,
  Dropdown,
  showDeleteAlert,
  useSetState,
} from "@/utils/function.utils";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import { Models } from "@/imports/models.import";
import CustomeDatePicker from "@/components/datePicker";
import { Briefcase, Users, Building2, AlertCircle } from "lucide-react";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  DROPDOWN_INSTITUTION_ADMIN,
  DROPDOWN_JOB_ROLES,
  ROLES,
} from "@/utils/constant.utils";

const Job = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    roleFilter: null,
    userFilter: null,
    institutionFilter: null,
    collegeFilter: null,
    departmentFilter: null,
    locationFilter: null,
    categoryFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",

    // Job data
    jobList: [],
    count: 0,
    next: null,
    prev: null,
    editId: null,
    selectedRecords: [],

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

    collegeList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    departmentList: [],
    departmentLoading: false,
    departmentPage: 1,
    departmentNext: null,

    userList: [],
    userLoading: false,
    userPage: 1,
    userNext: null,

    locationList: [],
    locationLoading: false,

    categoryList: [],
    categoryLoading: false,

    errors: {},
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const jobTypeOptions = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
  ];

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const experienceOptions = [
    { value: "0-1 years", label: "0-1 years" },
    { value: "1-3 years", label: "1-3 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "5-10 years", label: "5-10 years" },
    { value: "10+ years", label: "10+ years" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Job Management"));
  }, [dispatch]);

  useEffect(() => {
    profile();
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    jobStatusList();
    categoryList(1);
  }, []);

  useEffect(() => {
    jobList(1, "", "", "", state?.profile?.id);
  }, [
    debounceSearch,
    state.statusFilter,
    state.sortBy,
    state.institutionFilter,
    state.collegeFilter,
    state.departmentFilter,
    state.userFilter,
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
      if (res?.role == ROLES.SUPER_ADMIN) {
        institutionDropdownList(1, "", false, res?.id);
        collegeDropdownList(1, "", false, "", res?.id);
        departmentDropdownList(1, "", false, "", res?.id);
        jobList(1, "", "", "", res?.id);
      } else if (res?.role == ROLES.INSTITUTION_ADMIN) {
        collegeDropdownList(
          1,
          "",
          false,
          res?.institution?.institution_id,
          res?.id
        );
        departmentDropdownList(1, "", false, "", res?.id);
        jobList(1, res?.institution?.institution_id, "", "", res?.id);
      } else if (res?.role == ROLES.HR) {
        departmentDropdownList(1, "", false, res?.college?.college_id, res?.id);
        jobList(1, "", res?.college?.college_id, "", res?.id);
        userDropdownList(1, "", false, "hod", res?.college?.college_id);

      } else if (res?.role == ROLES.HOD) {
        jobList(1, "", "", res?.department?.id, res?.id);

      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const jobList = async (
    page,
    institutionId = null,
    collegeId = null,
    deptId = null,
    createdBy = null
  ) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      if (institutionId) {
        body.institution_id = institutionId;
      }
      if (collegeId) {
        body.college_id = collegeId;
      }
      if (deptId) {
        body.department_id = deptId;
      }

      if (state.userFilter?.value) {
        body.created_by = createdBy;
        body.team = "No";
      } else {
        body.created_by = createdBy;
        body.team = "Yes";
      }
      console.log("✌️body --->", body);

      const res: any = await Models.job.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item.id,
        job_title: item.job_title,
        job_description: item.job_description,

        college_name: item?.college?.name,
        department_name: item?.department?.name || "-",

        job_type: item?.job_type,
        experiences: item?.experiences,
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        number_of_openings: item?.number_of_openings,

        last_date: item?.last_date,
        priority: item?.priority,
        job_status: item?.job_status,

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
    page = 1,
    search = "",
    loadMore = false,
    institutionId = null,
    createdBy = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search, team: "Yes" };
      if (createdBy) {
        body.created_by = createdBy;
      }
      if (institutionId) {
        body.institution = institutionId;
      }
      body.team = "Yes";
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

  const bodyData = () => {
    const body: any = {};
    if (state.search) {
      body.search = state.search;
    }
    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    if (state.institutionFilter?.value) {
      body.institution_id = state.institutionFilter.value;
    }
    if (state.collegeFilter?.value) {
      body.college_id = state.collegeFilter.value;
    }
    if (state.departmentFilter?.value) {
      body.department_id = state.departmentFilter.value;
    }
    if (state.userFilter?.value) {
      body.created_by = state.userFilter.value;
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

    return body;
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    jobList(
      pageNumber,
      state.instiutionFilter,
      state.collegeFilter,
      state.departmentFilter,
      state?.profile?.id
    );
  };

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  const handleRoleChange = async (selectedOption: any) => {
    setState({
      roleFilter: selectedOption,
      userFilter: null,
      userList: [],
      page: 1,
    });
    if (selectedOption?.value) {
      await userDropdownList(1, "", false, selectedOption.value);
    }
  };

  const userDropdownList = async (
    page = 1,
    search = "",
    loadMore = false,
    role = null,
    collegeId = null
  ) => {
    try {
      setState({ userLoading: true });
      const body: any = { search, team: "Yes", created_by: state?.profile?.id };
      if (role) {
        body.role = role;
      }
      if (collegeId) {
        body.college_id = collegeId;
      }
      const res: any = await Models.auth.userList(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: `${item.username}`,
      }));
      setState({
        userLoading: false,
        userPage: page,
        userList: loadMore ? [...state.userList, ...dropdown] : dropdown,
        userNext: res?.next,
      });
    } catch (error) {
      setState({ userLoading: false });
    }
  };

  const institutionDropdownList = async (
    page = 1,
    search = "",
    loadMore = false,
    createdBy = null
  ) => {
    try {
      setState({ institutionLoading: true });
      const body: any = { search, team: "Yes" };
      if (createdBy) {
        body.created_by = createdBy;
      }
      console.log("✌️body --->", body);

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

  const departmentDropdownList = async (
    page = 1,
    search = "",
    loadMore = false,
    collegeId = null,
    createdBy = null
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search, team: "Yes" };
      if (collegeId) {
        body.college = collegeId;
      }
      if (createdBy) {
        body.created_by = createdBy;
      }
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

  const handleInstitutionChange = (selectedOption: any) => {
    setState({
      institutionFilter: selectedOption,
      page: 1,
      collegeFilter: null,
    });
    if (selectedOption) {
      collegeDropdownList(
        1,
        "",
        false,
        selectedOption?.value,
        state?.profile?.id
      );
    }
  };

  const handleCollegeChange = (selectedOption: any) => {
    setState({
      collegeFilter: selectedOption,
      page: 1,
      departmentFilter: null,
    });
    if (selectedOption) {
      departmentDropdownList(
        1,
        "",
        false,
        selectedOption?.value,
        state?.profile?.id
      );
    }
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setState({ departmentFilter: selectedOption, page: 1 });
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

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.status === "active" ? "inactive" : "active";
      await Models.job.update({ status: newStatus }, row?.id);
      Success(`Job ${newStatus} successfully!`);
      jobList(
        state.page,
        state.instiutionFilter,
        state.collegeFilter,
        state.departmentFilter,
        state?.profile?.id
      );
    } catch (error) {
      Failure("Failed to update status");
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row?.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this job?"
    );
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.job.delete(id);
      Success("Job deleted successfully!");
      jobList(
        state.page,
        state.instiutionFilter,
        state.collegeFilter,
        state.departmentFilter,
        state?.profile?.id
      );
    } catch (error) {
      Failure("Failed to delete job");
    }
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => bulkDeleteRecords(),
      () => Swal.fire("Cancelled", "Your Records are safe :)", "info"),
      `Are you sure want to delete ${state.selectedRecords.length} record(s)?`
    );
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.job.delete(id);
      }
      Success(`${state.selectedRecords.length} jobs deleted successfully!`);
      setState({ selectedRecords: [] });
      jobList(
        state.page,
        state.instiutionFilter,
        state.collegeFilter,
        state.departmentFilter,
        state?.profile?.id
      );
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
              Team Job Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage job postings and opportunities
            </p>
          </div>
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
                Active Jobs
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {state.jobList?.filter((job) => job.status === "active")
                  ?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
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

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Full Time
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
              state.profile?.role == ROLES.INSTITUTION_ADMIN ||
              state.profile?.role == ROLES.HR) && (
              <>
                {(state.profile?.role == ROLES.SUPER_ADMIN ||
                  state.profile?.role == ROLES.INSTITUTION_ADMIN) && (
                  <div className="group relative">
                    <CustomSelect
                      options={
                        state.profile?.role == ROLES.SUPER_ADMIN
                          ? DROPDOWN_JOB_ROLES
                          : state.profile?.role == ROLES.INSTITUTION_ADMIN
                          ? DROPDOWN_INSTITUTION_ADMIN
                          : null
                      }
                      value={state.roleFilter}
                      onChange={handleRoleChange}
                      placeholder="Select Role"
                      isClearable={true}
                    />
                  </div>
                )}
                <div className="group relative">
                  <CustomSelect
                    options={state.userList}
                    value={state.userFilter}
                    onChange={(selectedOption) =>
                      setState({ userFilter: selectedOption, page: 1 })
                    }
                    placeholder={`Select ${
                      state.roleFilter ? state.roleFilter.label : "user"
                    }`}
                    isClearable={true}
                    loading={state.userLoading}
                    disabled={
                      state.profile?.role != ROLES.HR && !state.roleFilter
                    }
                    onSearch={(searchTerm) =>
                      userDropdownList(
                        1,
                        searchTerm,
                        false,
                        state.roleFilter?.value,
                        state.collegeFilter?.value
                      )
                    }
                    loadMore={() =>
                      state.userNext &&
                      userDropdownList(
                        state.userPage + 1,
                        "",
                        true,
                        state.roleFilter?.value,
                        state.collegeFilter?.value
                      )
                    }
                  />
                </div>
              </>
            )}

            {(state.profile?.role == ROLES.SUPER_ADMIN ||
              state.profile?.role == ROLES.INSTITUTION_ADMIN) && (
              <>
                <div className="group relative">
                  <CustomSelect
                    options={state.institutionList}
                    value={state.institutionFilter}
                    onChange={handleInstitutionChange}
                    placeholder="Select institution"
                    isClearable={true}
                    onSearch={(searchTerm) =>
                      institutionDropdownList(
                        1,
                        searchTerm,
                        false,
                        state.profile?.id
                      )
                    }
                    loadMore={() =>
                      state.institutionNext &&
                      institutionDropdownList(
                        state.institutionPage + 1,
                        "",
                        true,
                        state.profile?.id
                      )
                    }
                    loading={state.institutionLoading}
                  />
                </div>
                <div className="group relative">
                  <CustomSelect
                    options={state.collegeList}
                    value={state.collegeFilter}
                    onChange={handleCollegeChange}
                    placeholder="Select college"
                    isClearable={true}
                    onSearch={(searchTerm) =>
                      collegeDropdownList(
                        1,
                        searchTerm,
                        false,
                        state.institutionFilter?.value,
                        state.profile?.id
                      )
                    }
                    loadMore={() =>
                      state.collegeNext &&
                      collegeDropdownList(
                        state.collegePage + 1,
                        "",
                        true,
                        state.institutionFilter?.value,
                        state.profile?.id
                      )
                    }
                    loading={state.collegeLoading}
                  />
                </div>
              </>
            )}
            {state.profile?.role != ROLES.HOD && (
              <div className="group relative">
                <CustomSelect
                  options={state.departmentList}
                  value={state.departmentFilter}
                  onChange={handleDepartmentChange}
                  placeholder="Select department"
                  isClearable={true}
                  onSearch={(searchTerm) =>
                    departmentDropdownList(
                      1,
                      searchTerm,
                      false,
                      state.collegeFilter?.value,
                      state.profile?.id
                    )
                  }
                  loadMore={() =>
                    state.departmentNext &&
                    departmentDropdownList(
                      state.departmentPage + 1,
                      "",
                      true,
                      state.collegeFilter?.value,
                      state.profile?.id
                    )
                  }
                  loading={state.departmentLoading}
                />
              </div>
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

            <div className="group relative">
              <CustomSelect
                options={state.categoryList}
                value={state.categoryFilter}
                onChange={(e) => setState({ categoryFilter: e })}
                placeholder="Select category"
                isClearable={true}
                loading={state.categoryLoading}
              />
            </div>

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
            <div className="group relative">
              <CustomSelect
                options={state.typeList}
                value={state.typeFilter}
                onChange={(e) => setState({ typeFilter: e })}
                placeholder="Select job type"
                isClearable={true}
              />
            </div>

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
            selectedRecords={state.jobList?.filter(record =>
              state.selectedRecords.includes(record.id)
            )}
            onSelectedRecordsChange={records =>
              setState({ selectedRecords: records.map((r:any) => r.id) })
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

              {
                accessor: "job_type",
                title: "Type",
                render: ({ job_type }) => (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {job_type?.replace("_", " ") || "-"}
                  </span>
                ),
              },
              {
                accessor: "experiences",
                title: "Experience",
                render: ({ experiences }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {experiences || "-"}
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
                render: ({ job_status }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      job_status === "published"
                        ? "bg-green-100 text-green-800"
                        : job_status === "draft"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {capitalizeFLetter(job_status) || "-"}
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
                      onClick={() => handleEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
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
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
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
              jobList(
                state.page,
                state.instiutionFilter,
                state.collegeFilter,
                state.departmentFilter,
                state?.profile?.id
              );
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
    </div>
  );
};

export default Job;