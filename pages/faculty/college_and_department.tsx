import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
import { Dropdown, showDeleteAlert, useSetState } from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import Models from "@/imports/models.import";
import { CreateCollege } from "@/utils/validation.utils";
import PrivateRouter from "@/hook/privateRouter";

const CollegeAndDepartment = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    activeTab: "colleges",
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",

    // College data
    collegeList: [],
    collegeCount: 0,
    college_name: "",
    college_code: "",
    college_email: "",
    college_phone: "",
    college_address: "",
    institution: null,

    // Department data
    departmentList: [],
    departmentCount: 0,
    department_name: "",
    department_code: "",
    department_email: "",
    department_phone: "",
    department_head: "",
    college: null,
    collegeDropdownList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    errors: {},
    editId: null,
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Colleges & Departments"));
    institutionList(1);
  }, [dispatch]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeList(1);
    } else {
      deptList(1);
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeList(1);
    } else {
      deptList(1);
    }
  }, [debounceSearch, state.statusFilter,state.sortBy]);

  const institutionList = async (page, search = "", loadMore = false) => {
    try {
      setState({ institutionLoading: true });
      const body = { search };
      console.log("✌️body --->", body);

      const res: any = await Models.institution.list(page, body);
      console.log("✌️res --->", res);

      const dropdown = Dropdown(res?.results, "institution_name");
      console.log("✌️dropdown --->", dropdown);

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionList: loadMore
          ? [...state.institutionList, ...dropdown]
          : dropdown,
        institutionNext: res?.next,
        institutionPrev: res?.previous,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
      setState({ institutionLoading: false });
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
        collegeDropdownList: loadMore
          ? [...state.collegeDropdownList, ...dropdown]
          : dropdown,
        collegeNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const collegeList = async (page) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        college_name: item?.college_name,
        college_code: item?.college_code,
        college_email: item?.college_email,
        college_phone: item?.college_phone,
        status: item?.status,
        institution_name: item?.institution_name,
        institution_id: item?.institution,
        total_departments: item?.total_departments,
        total_jobs: item?.total_jobs,
      }));

      setState({
        loading: false,
        collegeList: tableData,
        collegeCount: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
        collegeDropdownList: dropdown,
      });
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch colleges");
    }
  };

  const deptList = async (page) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      const res: any = await Models.department.list(page, body);
      console.log("deptList --->", res);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        department_name: item?.department_name,
        department_code: item?.department_code,
        department_email: item?.department_email,
        department_phone: item?.department_phone,
        status: item?.status,
        college_name: item?.college_name,
        college_id: item?.college,
        total_jobs: item?.total_jobs,
      }));

      setState({
        loading: false,
        departmentNext: res?.next,
        departmentPrev: res?.prev,
        departmentCount: res?.count,
        deptList: tableData,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch departments");
    }
  };

  const handleTabChange = (tab) => {
    setState({ activeTab: tab, page: 1, search: "", statusFilter: null });
  };

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    collegeList(pageNumber);
  };

  const handleStatusChange = (selectedOption) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  const handleSortStatusChange = ({ columnAccessor, direction }) => {
    console.log('Sort:', columnAccessor, direction);
    setState({
      sortBy: columnAccessor,
      sortOrder: direction === 'desc' ? 'desc' : 'asc',
    });
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      college_name: "",
      college_code: "",
      college_email: "",
      college_phone: "",
      college_address: "",
      institution: null,
      department_name: "",
      department_code: "",
      department_email: "",
      department_phone: "",
      department_head: "",
      errors: {},
      editId: null,
    });
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

  const collegeBodyData = () => {
    const body: any = {};

    if (state.search) {
      body.search = state.search;
    }
    
    if (state.sortBy) {
      body.ordering = state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
      console.log('Ordering:', body.ordering);
    }
    
    return body;
  };

  const handleEdit = (row) => {
    if (state.activeTab === "colleges") {
      setState({
        editId: row.id,
        showModal: true,
        college_name: row.college_name,
        college_code: row.college_code,
        college_email: row.college_email,
        college_phone: row.college_phone,
        college_address: row.college_address || "",
        institution: {
          value: row?.institution_id,
          label: row.institution_name,
        },
      });
    } else {
      setState({
        editId: row.id,
        showModal: true,
        department_name: row.department_name,
        department_code: row.department_code,
        // department_email: row.department_email,
        // department_phone: row.department_phone,
        // department_head: row.department_head,
        college: {
          value: row?.college_id,
          label: row.college_name,
        },
      });
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      if (state.activeTab === "colleges") {
        await Models.college.update({ status: newStatus }, row.id);
        Success(`College ${newStatus} successfully!`);

        collegeList(state.page);
      } else {
        await Models.department.update({ status: newStatus }, row.id);
        Success(`Department ${newStatus} successfully!`);

        deptList(state.page);
      }
    } catch (error) {
      Failure("Failed to update status");
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this record?"
    );
  };

  const deleteRecord = async (id) => {
    try {
      if (state.activeTab === "colleges") {
        await Models.college.delete(id);
        Success(`College deleted successfully!`);
        collegeList(state.page);
      } else {
        await Models.department.delete(id);
        Success(`Department deleted successfully!`);
        deptList(state.page);
      }
    } catch (error) {
      Failure("Failed to delete record");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      if (state.activeTab === "colleges") {
        const body = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.institution?.value,
        };

        try {
          await CreateCollege.validate(body, { abortEarly: false });
          setState({ errors: {} });
        } catch (validationError: any) {
          const errors = {};
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message;
          });
          setState({ errors });
          return;
        }

        if (state.editId) {
          const res = await Models.college.update(body, state.editId);
          Success("College updated successfully!");
        } else {
          const res = await Models.college.create(body);
          Success("College created successfully!");
        }
        collegeList(state.page);
      } else {
        if (state.editId) {
          const body: any = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: state.college?.value,
            // department_email: state.department_email,
            // department_phone: state.department_phone,
            // department_head: state.department_head,
          };
          if (state.college?.value) {
            const res: any = await Models.college.details(state.college?.value);
            body.institution = res?.institution;
          }
          const res = await Models.department.update(body, state.editId);
          // Update department API call
          Success("Department updated successfully!");
          deptList(state.page);
        } else {
          const body: any = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: state.college?.value,

            // institution:
            // department_email: state.department_email,
            // department_phone: state.department_phone,
            // department_head: state.department_head,
          };
          if (state.college?.value) {
            const res: any = await Models.college.details(state.college?.value);
            body.institution = res?.institution;
          }
          console.log("✌️body --->", body);

          const res = await Models.department.create(body);
          console.log("✌️res --->", res);

          // Create department API call
          Success("Department created successfully!");
          deptList(1);
        }
        deptList(state.page);
      }

      handleCloseModal();
    } catch (error) {
      Failure("Operation failed. Please try again.");
    } finally {
      setState({ submitting: false });
    }
  };

  const renderCollegeForm = () => (
    <div className="space-y-6">
      <CustomSelect
        options={state.institutionList}
        value={state.institution}
        onChange={(selectedOption) =>
          setState({
            institution: selectedOption,
            errors: { ...state.errors, institution: "" },
          })
        }
        onSearch={(searchTerm) => institutionList(1, searchTerm)}
        placeholder="Select Institution"
        isClearable={true}
        loadMore={() =>
          state.institutionNext &&
          institutionList(state.institutionPage + 1, "", true)
        }
        loading={state.institutionLoading}
        title="Select Institution"
        error={state.errors.institution}
        required
      />
      <TextInput
        title="College Name"
        placeholder="Enter college name"
        value={state.college_name}
        onChange={(e) => handleFormChange("college_name", e.target.value)}
        error={state.errors.college_name}
        required
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="Email Address"
          type="email"
          placeholder="college@example.com"
          value={state.college_email}
          onChange={(e) => handleFormChange("college_email", e.target.value)}
          error={state.errors.college_email}
          required
        />
        <TextInput
          title="College Code"
          placeholder="Enter college code"
          value={state.college_code}
          onChange={(e) => handleFormChange("college_code", e.target.value)}
          error={state.errors.college_code}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomPhoneInput
          title="Phone Number"
          value={state.college_phone}
          onChange={(value) => handleFormChange("college_phone", value)}
          error={state.errors.college_phone}
          required
        />
        <TextArea
          title="Address"
          placeholder="Enter college address"
          value={state.college_address}
          onChange={(e) => handleFormChange("college_address", e.target.value)}
          error={state.errors.college_address}
          rows={3}
        />
      </div>
    </div>
  );

  const renderDepartmentForm = () => (
    <div className="space-y-6">
      <CustomSelect
        options={state.collegeDropdownList}
        value={state.college}
        onChange={(selectedOption) =>
          setState({
            college: selectedOption,
            errors: { ...state.errors, college: "" },
          })
        }
        onSearch={(searchTerm) => collegeDropdownList(1, searchTerm)}
        placeholder="Select College"
        isClearable={true}
        loadMore={() =>
          state.collegeNext &&
          collegeDropdownList(state.collegePage + 1, "", true)
        }
        loading={state.collegeLoading}
        title="Select College"
        error={state.errors.institution}
        required
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="Department Name"
          placeholder="Enter department name"
          value={state.department_name}
          onChange={(e) => handleFormChange("department_name", e.target.value)}
          error={state.errors.department_name}
          required
        />
        <TextInput
          title="Department Code"
          placeholder="Enter department code"
          value={state.department_code}
          onChange={(e) => handleFormChange("department_code", e.target.value)}
          error={state.errors.department_code}
          required
        />
      </div>
      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="Email Address"
          type="email"
          placeholder="dept@example.com"
          value={state.department_email}
          onChange={(e) => handleFormChange("department_email", e.target.value)}
          error={state.errors.department_email}
          required
        />
        <CustomPhoneInput
          title="Phone Number"
          value={state.department_phone}
          onChange={(value) => handleFormChange("department_phone", value)}
          error={state.errors.department_phone}
          required
        />
      </div> */}
      {/* <TextInput
        title="Department Head"
        placeholder="Enter department head name"
        value={state.department_head}
        onChange={(e) => handleFormChange("department_head", e.target.value)}
        error={state.errors.department_head}
        required
      /> */}
    </div>
  );

  const collegeColumns = [
    {
      accessor: "college_code",
      title: "College Code",
      sortable: true,
      render: ({ college_code }) => (
        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {college_code}
        </span>
      ),
    },
    {
      accessor: "college_name",
      title: "College Name",
      sortable: true,
      render: ({ college_name }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {college_name}
        </div>
      ),
    },

    {
      accessor: "institution_name",
      title: "Institution",
      sortable: true,
      render: ({ institution_name }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {institution_name}
        </div>
      ),
    },

    {
      accessor: "college_email",
      title: "Email",
      sortable: true,
      render: ({ college_email }) => (
        <span className="text-gray-600 dark:text-gray-400">
          {college_email}
        </span>
      ),
    },
    {
      accessor: "college_phone",
      title: "Phone",
      render: ({ college_phone }) => (
        <div className="text-gray-600 dark:text-gray-400">{college_phone}</div>
      ),
    },

    {
      accessor: "total_departments",
      title: "Total Departments",
      render: ({ total_departments }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {total_departments}
        </div>
      ),
      sortable: true,

    },
    {
      accessor: "total_jobs",
      title: "Total Jobs",
      render: ({ total_jobs }) => (
        <div className="text-gray-600 dark:text-gray-400">{total_jobs}</div>
      ),
      sortable: true,

    },

    {
      accessor: "actions",
      title: "Actions",
      textAlign: "center",
      render: (row) => (
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
              row.status === "active"
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
              <IconEye className="h-4 w-4" />
            ) : (
              <IconEyeOff className="h-4 w-4" />
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
  ];

  const departmentColumns = [
    {
      accessor: "department_code",
      title: "Department Code",
      sortable: true,
      render: ({ department_code }) => (
        <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          {department_code}
        </span>
      ),
    },
    {
      accessor: "department_name",
      title: "Department Name",
      sortable: true,
      render: ({ department_name }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {department_name}
        </div>
      ),
    },
    {
      accessor: "college_name",
      title: "College ",
      sortable: true,
      render: ({ college_name }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {college_name}
        </div>
      ),
    },

    {
      accessor: "total_jobs",
      title: "Total Jobs",
      sortable: true,
      render: ({ total_jobs }) => (
        <span className="text-gray-600 dark:text-gray-400">{total_jobs}</span>
      ),
    },
    {
      accessor: "department_head",
      title: "Department Head",
      render: ({ department_head }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {department_head}
        </div>
      ),
    },
    {
      accessor: "actions",
      title: "Actions",
      textAlign: "center",
      render: (row) => (
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
              row.status === "active"
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
              <IconEye className="h-4 w-4" />
            ) : (
              <IconEyeOff className="h-4 w-4" />
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Colleges & Departments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage colleges and departments
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">
              Add {state.activeTab === "colleges" ? "College" : "Department"}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => handleTabChange("colleges")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "colleges"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Colleges
          </button>
          <button
            onClick={() => handleTabChange("departments")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "departments"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Departments
          </button>
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
              placeholder={`Search ${state.activeTab}...`}
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>
          <div className="group relative z-50">
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
              {state.activeTab === "colleges" ? "Colleges" : "Departments"} List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.activeTab === "colleges"
                ? state.collegeCount
                : state.departmentCount}{" "}
              records found
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText={`No ${state.activeTab} found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={
              state.activeTab === "colleges"
                ? state.collegeList
                : state.deptList
            }
            fetching={state.loading}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading {state.activeTab}...
                  </span>
                </div>
              </div>
            }
            columns={
              state.activeTab === "colleges"
                ? collegeColumns
                : departmentColumns
            }
            sortStatus={{ columnAccessor: state.sortBy, direction: state.sortOrder }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({
                sortBy: columnAccessor,
                sortOrder: direction,
                page: 1,
              });
              if (state.activeTab === "colleges") {
                collegeList(1);
              } else {
                deptList(1);
              }
            }}
            minHeight={200}
          />
        </div>

        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={
              state.activeTab === "colleges"
                ? state.collegeCount
                : state.departmentCount
            }
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        isFullWidth={false}
        maxWidth="max-w-2xl"
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
                {state.editId ? "Update" : "Add New"}{" "}
                {state.activeTab === "colleges" ? "College" : "Department"}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to {state.editId ? "update" : "create"}{" "}
                {state.activeTab === "colleges" ? "college" : "department"}
              </p>
            </div>

            {state.activeTab === "colleges"
              ? renderCollegeForm()
              : renderDepartmentForm()}

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
                ) : (
                  <IconPlus className="relative z-10 mr-2 h-4 w-4" />
                )}
                <span className="relative z-10">
                  {state.submitting
                    ? "Saving..."
                    : state.editId
                    ? "Update"
                    : "Create"}{" "}
                  {state.activeTab === "colleges" ? "College" : "Department"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(CollegeAndDepartment);
