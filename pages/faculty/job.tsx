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
import { Dropdown, showDeleteAlert, useSetState } from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import { Models } from "@/imports/models.import";
import { CreateJob } from "@/utils/validation.utils";
import CustomeDatePicker from "@/components/datePicker";
import { Briefcase, Users, Building2, AlertCircle } from "lucide-react";
import moment from "moment";

const Job = () => {
  const dispatch = useDispatch();
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
    collegeList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    departmentList: [],
    departmentLoading: false,
    departmentPage: 1,
    departmentNext: null,

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
    jobList(1);
    collegeDropdownList(1);
  }, []);

  useEffect(() => {
    jobList(1);
  }, [debounceSearch, state.statusFilter, state.sortBy]);

  const jobList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      const res: any = await Models.job.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        job_title: item?.job_title,
        job_description: item?.job_description,
        college_name: item?.college_name,
        department_name: item?.department_name,
        job_type: item?.job_type,
        experience_required: item?.experience_required,
        qualification: item?.qualification,
        salary_range: item?.salary_range,
        last_date: item?.last_date,
        priority: item?.priority,
        status: item?.status,
        college_id: item?.college,
        department_id: item?.department,
      }));

      setState({
        loading: false,
        page: page,
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

  const collegeDropdownList = async (page, search = "", loadMore = false) => {
    try {
      setState({ collegeLoading: true });
      const body = { search };
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
    loadMore = false
  ) => {
    try {
      setState({ departmentLoading: true });
      const body = { search, college: state.college?.value };
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
    if (state.search) {
      body.search = state.search;
    }
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

  const handleFormChange = (field: string, value: any) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  const handleCollegeChange = (selectedOption) => {
    setState({
      college: selectedOption,
      department: null,
      departmentList: [],
      errors: { ...state.errors, college: "" },
    });
    if (selectedOption?.value) {
      getDeptListByCollegeId(1);
    }
  };

  const getDeptListByCollegeId = async (id) => {
    try {
      const body = {
        college: id,
      };
      const res = await Models.department.list(1, body);
      console.log("✌️res --->", res);
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleEdit = (row) => {
    setState({
      editId: row?.id,
      showModal: true,
      job_title: row?.job_title,
      job_description: row?.job_description,
      college: { value: row?.college_id, label: row?.college_name },
      department: { value: row?.department_id, label: row?.department_name },
      job_type: jobTypeOptions.find((opt) => opt.value === row?.job_type),
      experience_required: experienceOptions.find(
        (opt) => opt.value === row?.experience_required
      ),
      qualification: row?.qualification,
      salary_range: row?.salary_range,
      last_date: row?.last_date,
      priority: priorityOptions.find((opt) => opt.value === row?.priority),
    });
    if (row?.college_id) {
      departmentDropdownList(1);
    }
  };

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.status === "active" ? "inactive" : "active";
      await Models.job.update({ status: newStatus }, row?.id);
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
      "Are you sure you want to delete this job?"
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

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });
      
      const body = {
        job_title: state.job_title,
        job_description: state.job_description,
        college: state.college?.value,
        department: state.department?.value,
        job_type: state.job_type?.value,
        experience_required: state.experience_required?.value,
        qualification: state.qualification,
        salary_range: state.salary_range,
        last_date: moment(state.last_date).format("YYYY-MM-DD"),
        priority: state.priority?.value,
      };

      await CreateJob.validate(body, { abortEarly: false });

      if (state.editId) {
        await Models.job.update(body, state.editId);
        Success("Job updated successfully!");
      } else {
        await Models.job.create(body);
        Success("Job created successfully!");
      }

      jobList(state.page);
      handleCloseModal();
    } catch (error: any) {
      console.log("Job submit error:", error);
      if (error?.inner) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setState({ errors });
      } else if (error?.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach((field) => {
          if (Array.isArray(error.response.data[field])) {
            apiErrors[field] = error.response.data[field][0];
          } else {
            apiErrors[field] = error.response.data[field];
          }
        });
        setState({ errors: apiErrors });
      } else {
        Failure(error?.message || "Failed to save job");
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
              Job Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage job postings and opportunities
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{state.count || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
              <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {state.jobList?.filter(job => job.status === 'active')?.length || 0}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent Priority</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {state.jobList?.filter(job => job.priority === 'urgent')?.length || 0}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Time</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {state.jobList?.filter(job => job.job_type === 'full_time')?.length || 0}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="group relative">
            <TextInput
              placeholder="Search jobs..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
            />
          </div>
          <div className="group relative">
            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder="Filter by Status"
              isClearable={true}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Jobs List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.count} jobs found
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
                accessor: "college_name",
                title: "College",
                sortable: true,
                render: ({ college_name }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {college_name}
                  </span>
                ),
              },
              {
                accessor: "department_name",
                title: "Department",
                sortable: true,
                render: ({ department_name }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {department_name}
                  </span>
                ),
              },
              {
                accessor: "job_type",
                title: "Job Type",
                render: ({ job_type }) => (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {
                      jobTypeOptions.find((opt) => opt.value === job_type)
                        ?.label
                    }
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
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {
                      priorityOptions.find((opt) => opt.value === priority)
                        ?.label
                    }
                  </span>
                ),
              },
              {
                accessor: "last_date",
                title: "Last Date",
                render: ({ last_date }) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {last_date}
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(row)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                        row?.status === "active"
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      title={
                        row?.status === "active" ? "Deactivate" : "Activate"
                      }
                    >
                      {row?.status === "active" ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200"
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

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        maxWidth="max-w-4xl"
        renderComponent={() => (
          <div className="relative">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} Job
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to {state.editId ? "update" : "create"} a
                job posting
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TextInput
                  title="Job Title"
                  placeholder="Enter job title"
                  value={state.job_title}
                  onChange={(e) =>
                    handleFormChange("job_title", e.target.value)
                  }
                  error={state.errors.job_title}
                  required
                />

                <CustomSelect
                  options={jobTypeOptions}
                  value={state.job_type}
                  onChange={(selectedOption) =>
                    setState({
                      job_type: selectedOption,
                      errors: { ...state.errors, job_type: "" },
                    })
                  }
                  placeholder="Select Job Type"
                  title="Job Type"
                  error={state.errors.job_type}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CustomSelect
                  options={state.collegeList}
                  value={state.college}
                  onChange={handleCollegeChange}
                  onSearch={(searchTerm) => collegeDropdownList(1, searchTerm)}
                  placeholder="Select College"
                  isClearable={true}
                  loadMore={() =>
                    state.collegeNext &&
                    collegeDropdownList(state.collegePage + 1, "", true)
                  }
                  loading={state.collegeLoading}
                  title="College"
                  error={state.errors.college}
                  required
                />
                <CustomSelect
                  options={state.departmentList}
                  value={state.department}
                  onChange={(selectedOption) =>
                    setState({
                      department: selectedOption,
                      errors: { ...state.errors, department: "" },
                    })
                  }
                  onSearch={(searchTerm) =>
                    departmentDropdownList(1, searchTerm)
                  }
                  placeholder="Select Department"
                  isClearable={true}
                  loadMore={() =>
                    state.departmentNext &&
                    departmentDropdownList(state.departmentPage + 1, "", true)
                  }
                  loading={state.departmentLoading}
                  title="Department"
                  error={state.errors.department}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CustomSelect
                  options={experienceOptions}
                  value={state.experience_required}
                  onChange={(selectedOption) =>
                    setState({
                      experience_required: selectedOption,
                      errors: { ...state.errors, experience_required: "" },
                    })
                  }
                  placeholder="Select Experience"
                  title="Experience Required"
                  error={state.errors.experience_required}
                  required
                />
                <TextInput
                  title="Qualification"
                  placeholder="e.g., Bachelor's in Computer Science"
                  value={state.qualification}
                  onChange={(e) =>
                    handleFormChange("qualification", e.target.value)
                  }
                  error={state.errors.qualification}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <TextInput
                  title="Salary Range"
                  placeholder="e.g., 2 LPA - 5 LPA"
                  value={state.salary_range}
                  onChange={(e) =>
                    handleFormChange("salary_range", e.target.value)
                  }
                  error={state.errors.salary_range}
                  required
                />
                {/* <TextInput
                  title="Last Date"
                  type="date"
                  value={state.last_date}
                  onChange={(e) => handleFormChange("last_date", e.target.value)}
                  error={state.errors.last_date}
                  required
                /> */}

                <CustomeDatePicker
                  value={state.last_date}
                  placeholder="Last Date"
                  title="Last Date"
                  onChange={(e) => setState({ last_date: e })}
                  showTimeSelect={false}
                  minDate={new Date()}
                />
                <CustomSelect
                  options={priorityOptions}
                  value={state.priority}
                  onChange={(selectedOption) =>
                    setState({
                      priority: selectedOption,
                      errors: { ...state.errors, priority: "" },
                    })
                  }
                  placeholder="Select Priority"
                  title="Priority"
                  error={state.errors.priority}
                  required
                />
              </div>

              <TextArea
                title="Job Description"
                placeholder="Enter detailed job description"
                value={state.job_description}
                onChange={(e) =>
                  handleFormChange("job_description", e.target.value)
                }
                error={state.errors.job_description}
                rows={4}
                required
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
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
                    ? "Saving..."
                    : state.editId
                    ? "Update Job"
                    : "Create Job"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Job;
