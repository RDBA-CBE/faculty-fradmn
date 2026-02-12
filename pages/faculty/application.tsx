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
  capitalizeFLetter,
  showDeleteAlert,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import moment from "moment";
import { ROLES } from "@/utils/constant.utils";

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
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    profile();
  }, [dispatch]);

  useEffect(() => {
    dispatch(setPageTitle("Applications"));
    profile();
    institutionDropdownList(1);
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    jobStatusList();
    categoryList(1);
  }, []);

  useEffect(() => {
    if (profileRef.current) {
      const role = state.profile?.role;
      if (role === ROLES.SUPER_ADMIN) {
        applicationList(1, null, null, null, state.profile?.id);
      } else if (role === ROLES.INSTITUTION_ADMIN) {
        applicationList(1, state.profile?.institution?.institution_id, null, null, state.profile?.id);
      } else if (role === ROLES.HR) {
        applicationList(1, null, state.profile?.college?.college_id, null, state.profile?.id);
      } else if (role === ROLES.HOD) {
        applicationList(1, null, null, state.profile?.department?.department_id, state.profile?.id);
      }
    }
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
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      profileRef.current = true;
      if (res?.role == ROLES.SUPER_ADMIN) {
        collegeDropdownList(1, "", false, "", res.id);
        applicationList(1, null, null, null, res?.id);
      } else if (res?.role == ROLES.INSTITUTION_ADMIN) {
        collegeDropdownList(1, "", false, res?.institution?.institution_id, res.id);
        applicationList(1, res?.institution?.institution_id, null, null, res?.id);
      } else if (res?.role == ROLES.HR) {
        departmentDropdownList(1, "", false, res?.college?.college_id, res.id);
        applicationList(1, null, res?.college?.college_id, null, res?.id);
      } else if (res?.role == ROLES.HOD) {
        applicationList(1, null, null, res?.department?.department_id, res?.id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const applicationList = async (
    page,
    institutionId = null,
    collegeId = null,
    deptId = null,
    profileId = null
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
      if (profileId) {
        body.created_by = profileId;
      }
      body.team = "Yes";
      console.log("✌️body --->", body);

      const res: any = await Models.application.list(page, body);
      console.log("✌️res --->", res);

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
      }));
      setState({
        loading: false,
        page: page,
        count: res?.count,
        applicationList: tableData,
        next: res?.next,
        prev: res?.previous,
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
      body.college= state.collegeFilter.value;
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
    if (state.statusFilter?.value) {
      body.status = state.statusFilter.value;
    }
    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    return body;
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    const role = state.profile?.role;
    if (role === ROLES.SUPER_ADMIN) {
      applicationList(pageNumber, null, null, null, state.profile?.id);
    } else if (role === ROLES.INSTITUTION_ADMIN) {
      applicationList(pageNumber, state.profile?.institution?.institution_id, null, null, state.profile?.id);
    } else if (role === ROLES.HR) {
      applicationList(pageNumber, null, state.profile?.college?.college_id, null, state.profile?.id);
    } else if (role === ROLES.HOD) {
      applicationList(pageNumber, null, null, state.profile?.department?.department_id, state.profile?.id);
    }
  };

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 });
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

  const handleEdit = (row) => {
    router.push(`/faculty/application_detail?id=${row?.id}`);
  };

  const handleUpdateStatus = async (row: any, newStatus: string) => {
    try {
      const body = {
        status: newStatus,
      };
      await Models.application.update(body, row?.id);
      Success(`Application ${newStatus.toLowerCase()} successfully!`);
      const role = state.profile?.role;
      if (role === ROLES.SUPER_ADMIN) {
        applicationList(state.page, null, null, null, state.profile?.id);
      } else if (role === ROLES.INSTITUTION_ADMIN) {
        applicationList(state.page, state.profile?.institution?.institution_id, null, null, state.profile?.id);
      } else if (role === ROLES.HR) {
        applicationList(state.page, null, state.profile?.college?.college_id, null, state.profile?.id);
      } else if (role === ROLES.HOD) {
        applicationList(state.page, null, null, state.profile?.department?.department_id, state.profile?.id);
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
      "Are you sure want to delete record?"
    );
  };

  const institutionDropdownList = async (
    page,
    search = "",
    loadMore = false
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
    createdBy = null
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

  const departmentDropdownList = async (
    page,
    search = "",
    loadMore = false,
    collegeId = null,
    createdBy = null
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
      const dropdown = res?.results?.map((item) => ({
        value: item.id,
        label: item.department_name,
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
        state.profile?.id
      );
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
        state.profile?.id
      );
    }
  };

  const handleDepartmentChange = (selectedOption: any) => {
    setState({ departmentFilter: selectedOption, page: 1 });
  };

  const deleteRecord = async (row: any) => {
    try {
      await Models.application.delete(row?.id);
      Success("Application deleted successfully!");
      applicationList(state.page);
    } catch (error) {
      Failure("Failed to delete application. Please try again.");
    }
  };

  const handleCreateSubmit = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Team Application Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and review job applications
            </p>
          </div>
          {/* <button
            onClick={() => setState({ showModal: true })}
            className='group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100'></div>
            <IconPlus className='relative z-10 h-5 w-5' />
            <span className='relative z-10'>Add Application</span>
          </button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {state.count || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {state.applicationList?.filter(
                  (app) => app.status === "Pending"
                )?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Accepted
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {state.applicationList?.filter(
                  (app) => app.status === "Accepted"
                )?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejected
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {state.applicationList?.filter(
                  (app) => app.status === "Rejected"
                )?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                        true
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
                        state.profile?.id
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
                        state.profile?.id
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
                        state.profile?.id
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
                        state.profile?.id
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
              Applications List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.count} applications found
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText="No applications found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.applicationList}
            fetching={state.loading}
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
                accessor: "Job Position",
                title: "Job Position",
                render: ({ job_title }) => (
                  <div className="text-gray-600 dark:text-gray-400">
                    {capitalizeFLetter(job_title)}
                  </div>
                ),
                sortable: true,
              },
              {
                accessor: "applicant_name",
                title: "Applicant Name",
                sortable: true,
                render: ({ applicant_name }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {applicant_name}
                  </div>
                ),
              },
              {
                accessor: "applicant_email",
                title: "Email",
                sortable: true,
                render: ({ applicant_email }) => (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {applicant_email}
                  </span>
                ),
              },
              {
                accessor: "applicant_phone",
                title: "Phone",
                render: ({ applicant_phone }) => (
                  <div className="text-gray-600 dark:text-gray-400">
                    {applicant_phone}
                  </div>
                ),
                sortable: true,
              },
              {
                accessor: "experience",
                title: "Experience",
                render: ({ experience }) => (
                  <div className="text-gray-600 dark:text-gray-400">
                    {experience}
                  </div>
                ),
                sortable: true,
              },

              {
                accessor: "status",
                title: "Status",
                render: ({ status }) => (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : status === "Reviewed"
                        ? "bg-blue-100 text-blue-800"
                        : status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {status}
                  </span>
                ),
                sortable: true,
              },
              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400"
                      title="Edit"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                    {row?.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(row, "Accepted")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-all duration-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-400"
                          title="Accept"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(row, "Rejected")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-400"
                          title="Reject"
                        >
                          <IconEyeOff className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-400"
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

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        renderComponent={() => (
          <div className="relative">
            {/* Header with gradient */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} Application
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new job application
              </p>
            </div>

            {/* Form with modern styling */}
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <TextInput
                    title="Applicant Name"
                    placeholder="Enter applicant name"
                    value={state.applicant_name}
                    onChange={(e) =>
                      handleFormChange("applicant_name", e.target.value)
                    }
                    error={state.errors.applicant_name}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
                <div className="group">
                  <TextInput
                    title="Email Address"
                    type="email"
                    placeholder="applicant@example.com"
                    value={state.applicant_email}
                    onChange={(e) =>
                      handleFormChange("applicant_email", e.target.value)
                    }
                    error={state.errors.applicant_email}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <CustomPhoneInput
                    title="Phone Number"
                    value={state.applicant_phone}
                    onChange={(value) =>
                      handleFormChange("applicant_phone", value)
                    }
                    error={state.errors.applicant_phone}
                    required
                  />
                </div>
                <div className="group">
                  <TextInput
                    title="Position Applied"
                    placeholder="Enter position"
                    value={state.position_applied}
                    onChange={(e) =>
                      handleFormChange("position_applied", e.target.value)
                    }
                    error={state.errors.position_applied}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <TextInput
                    title="Qualification"
                    placeholder="Enter qualification"
                    value={state.qualification}
                    onChange={(e) =>
                      handleFormChange("qualification", e.target.value)
                    }
                    error={state.errors.qualification}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
                <div className="group">
                  <TextInput
                    title="Experience"
                    placeholder="Enter experience"
                    value={state.experience}
                    onChange={(e) =>
                      handleFormChange("experience", e.target.value)
                    }
                    error={state.errors.experience}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Cover Letter - Full width */}
              <div className="group">
                <TextArea
                  title="Cover Letter"
                  placeholder="Enter cover letter"
                  value={state.cover_letter}
                  onChange={(e) =>
                    handleFormChange("cover_letter", e.target.value)
                  }
                  error={state.errors.cover_letter}
                  rows={4}
                  className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                />
              </div>
            </div>

            {/* Action buttons with modern styling */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={state.submitting}
                className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                {state.submitting ? (
                  <IconLoader className="relative z-10 mr-2 h-4 w-4 animate-spin" />
                ) : state.editId ? (
                  <IconEdit className="relative z-10 mr-2 h-4 w-4" />
                ) : (
                  <IconPlus className="relative z-10 mr-2 h-4 w-4" />
                )}
                <span className="relative z-10">
                  {state.submitting
                    ? "Loading..."
                    : state.editId
                    ? "Update Application"
                    : "Create Application"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(Application);
