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
  }, [state.page, debounceSearch, state.statusFilter]);

  const institutionList = async (page, search = "", loadMore = false) => {
    try {
      setState({ institutionLoading: true });
      const body = { search };
console.log('✌️body --->', body);

      const res: any = await Models.institution.list(page, body);
      console.log("✌️res --->", res);

      const dropdown = Dropdown(res?.results, "institution_name");
      console.log('✌️dropdown --->', dropdown);

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionList: loadMore ? [...state.institutionList, ...dropdown] : dropdown,
        institutionNext: res?.next,
        institutionPrev: res?.previous,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
      setState({ institutionLoading: false });
    }
  };

  const collegeList = async (page) => {
    try {
      setState({ loading: true });
      const body = {};
      const res: any = await Models.college.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        college_name: item?.college_name,
        college_code: item?.college_code,
        college_email: item?.college_email,
        college_phone: item?.college_phone,
        status: item?.status,
      }));

      setState({
        loading: false,
        collegeList: tableData,
        count: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch colleges");
    }
  };

  const deptList = async (page) => {
    try {
      setState({ loading: true });

      // Mock data - replace with actual API call
      const mockData = [
        {
          id: 1,
          department_name: "Computer Science",
          department_code: "CS001",
          department_email: "cs@dept.edu",
          department_phone: "1234567890",
          department_head: "Dr. Smith",
          status: "active",
        },
        {
          id: 2,
          department_name: "Mathematics",
          department_code: "MATH001",
          department_email: "math@dept.edu",
          department_phone: "1234567891",
          department_head: "Dr. Johnson",
          status: "active",
        },
      ];
      setState({
        loading: false,
        departmentList: mockData,
        departmentCount: mockData.length,
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
  };

  const handleStatusChange = (selectedOption) => {
    setState({ statusFilter: selectedOption, page: 1 });
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
      });
    } else {
      setState({
        editId: row.id,
        showModal: true,
        department_name: row.department_name,
        department_code: row.department_code,
        department_email: row.department_email,
        department_phone: row.department_phone,
        department_head: row.department_head,
      });
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      // API call would go here
      Success(`${state.activeTab.slice(0, -1)} ${newStatus} successfully!`);
      if (state.activeTab === "colleges") {
        collegeList(state.page);
      } else {
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
      // API call would go here
      Success(`${state.activeTab.slice(0, -1)} deleted successfully!`);
      if (state.activeTab === "colleges") {
        collegeList(state.page);
      } else {
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
          institution:state?.institution?.value
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
        console.log('✌️body --->', body);

        if (state.editId) {
          // Update college API call
          Success("College updated successfully!");
        } else {
          const res = await Models.college.create(body);

          // Create college API call
          Success("College created successfully!");
        }
        collegeList(state.page);
      } else {
        const body = {
          department_name: state.department_name,
          department_code: state.department_code,
          department_email: state.department_email,
          department_phone: state.department_phone,
          department_head: state.department_head,
        };

        if (state.editId) {
          // Update department API call
          Success("Department updated successfully!");
        } else {
          // Create department API call
          Success("Department created successfully!");
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomSelect
          options={state.institutionList}
          value={state.institution}
          onChange={(selectedOption) => setState({ institution: selectedOption, errors: { ...state.errors, institution: "" } })}
          onSearch={(searchTerm) => institutionList(1, searchTerm)}
          placeholder="Select Institution"
          isClearable={true}
          loadMore={() => state.institutionNext && institutionList(state.institutionPage + 1, "", true)}
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
        <TextInput
          title="Email Address"
          type="email"
          placeholder="college@example.com"
          value={state.college_email}
          onChange={(e) => handleFormChange("college_email", e.target.value)}
          error={state.errors.college_email}
          required
        />
        <CustomPhoneInput
          title="Phone Number"
          value={state.college_phone}
          onChange={(value) => handleFormChange("college_phone", value)}
          error={state.errors.college_phone}
          required
        />
      </div>
      <TextArea
        title="Address"
        placeholder="Enter college address"
        value={state.college_address}
        onChange={(e) => handleFormChange("college_address", e.target.value)}
        error={state.errors.college_address}
        rows={3}
      />
    </div>
  );

  const renderDepartmentForm = () => (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      </div>
      <TextInput
        title="Department Head"
        placeholder="Enter department head name"
        value={state.department_head}
        onChange={(e) => handleFormChange("department_head", e.target.value)}
        error={state.errors.department_head}
        required
      />
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
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
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
      accessor: "department_email",
      title: "Email",
      sortable: true,
      render: ({ department_email }) => (
        <span className="text-gray-600 dark:text-gray-400">
          {department_email}
        </span>
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
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
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
                : state.departmentList
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

export default CollegeAndDepartment;
