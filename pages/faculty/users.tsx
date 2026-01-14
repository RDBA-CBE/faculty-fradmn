import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
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
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import { CreateUser } from "@/utils/validation.utils";
import Swal from "sweetalert2";
import { GENDER_OPTION } from "@/utils/constant.utils";

const Users = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    activeTab: "institution_admin",
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",

    // Common data
    userList: [],
    userCount: 0,
    username: "",
    email: "",
    phone: "",
    department: null,
    position: "",
    qualification: "",
    experience: "",
    password: "",
    confirm_password: "",
    gender: null,
    education_qualification: "",
    showPassword: false,
    showConfirmPassword: false,
    institution: null,
    college: null,

    // Dropdown lists
    institutionList: [],
    collegeList: [],
    departmentList: [],
    institutionLoading: false,
    collegeLoading: false,
    departmentLoading: false,
    institutionPage: 1,
    collegePage: 1,
    departmentPage: 1,
    institutionNext: null,
    collegeNext: null,
    departmentNext: null,

    errors: {},
    editId: null,
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

 

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Users"));
    institutionList(1);
    collegeList(1);

    departmentList(1);

  }, [dispatch]);

  useEffect(() => {
    userList(1);
  }, [state.activeTab]);

  useEffect(() => {
    userList(1);
  }, [debounceSearch, state.statusFilter, state.sortBy]);

  const userList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      body.role = state.activeTab;
      const res: any = await Models.auth.userList(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        username: item?.username,
        email: item?.email,
        phone: item?.phone,
        department: item?.department?.name,
        position: item?.position,
        qualification: item?.qualification,
        experience: item?.experience,
        status: item?.status,
        college:item?.college?.name,
        institution:item?.institution?.name,

      }));

      setState({
        loading: false,
        userList: tableData || [],
        userCount: res?.count || 0,
      });
    } catch (error) {
      setState({ loading: false, userList: [], userCount: 0 });
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

  const collegeList = async (page, search = "", loadMore = false) => {
    try {
      setState({ collegeLoading: true });
      const body = { search };

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

      setState({
        collegeLoading: false,
        collegePage: page,
        collegeList: loadMore
          ? [...state.collegeList, ...dropdown]
          : dropdown,
        collegeNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const departmentList = async (page, search = "", loadMore = false) => {
    try {
      setState({ departmentLoading: true });
      const body = { search };

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
      console.error("Error fetching departments:", error);
      setState({ departmentLoading: false });
    }
  };

  const handleTabChange = (tab) => {
    setState({ activeTab: tab, page: 1, search: "", statusFilter: null });
  };

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    userList(pageNumber);
  };

  const handleStatusChange = (selectedOption) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      username: "",
      email: "",
      phone: "",
      department: null,
      position: "",
      qualification: "",
      experience: "",
      password: "",
      confirm_password: "",
      gender: null,
      education_qualification: "",
      institution: null,
      college: null,
      showPassword: false,
      showConfirmPassword: false,
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
console.log('✌️row --->', row);
    setState({
      editId: row.id,
      showModal: true,
      username: row.username,
      email: row.email,
      phone: row.phone,
      department: row.department,
      position: row.position,
      qualification: row.qualification,
      experience: row.experience,
    });
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      await Models.auth.updateUser(row.id,{ status: newStatus } );
      Success(`User ${newStatus} successfully!`);
      userList(state.page);
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
      await Models.auth.deleteUser(id);
      Success(`User deleted successfully!`);
      userList(state.page);
    } catch (error) {
      Failure("Failed to delete record");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });
      
      const body:any = {
        username: state.username,
        email: state.email,
        password: state.password,
        password_confirm: state.confirm_password,
        phone: state.phone,
        role: state.activeTab,
        status: "active",
        gender: state.gender?.value,
        education_qualification: state.education_qualification,
      };
      
      // Add institution for institution_admin
      if (state.activeTab === "institution_admin") {
        body.institution = state.institution?.value;
      }
      
      // Add department for hr and hod
      if (state.activeTab === "hod") {
        body.department = state.department?.value;
      }

      if (state.activeTab === "hr") {
        body.college = state.college?.value;
      }
      
      // Add qualification and experience for hod and applicant
      if (state.activeTab === "hod" || state.activeTab === "applicant") {
        body.qualification = state.qualification;
        body.experience = state.experience;
      }
      
      // Add position
      // if (state.position) {
      //   body.position = state.position;
      // }
      
      // Validate form data
      if (!state.editId) {
        try {
          await CreateUser.validate(body, { abortEarly: false });
          setState({ errors: {} });
        } catch (validationError: any) {
          const errors = {};
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message;
          });
          setState({ errors });
          return;
        }
      }

      if (state.editId) {
        await Models.auth.updateUser(state.editId,body);
        Success("User updated successfully!");
      } else {
        await Models.auth.createUser(body);
        Success("User created successfully!");
      }

      userList(state.page);
      handleCloseModal();
    } catch (error: any) {
      console.log("✌️error --->", error);
      
      // Handle API errors with specific field messages
      if (error?.data) {
        const apiErrors = {};
        Object.keys(error.data).forEach((field) => {
          if (Array.isArray(error.data[field])) {
            apiErrors[field] = error.data[field][0];
          } else {
            apiErrors[field] = error.data[field];
          }
        });
        setState({ errors: apiErrors });
        return;
      }
      
      // Handle validation errors
      if (error?.inner) {
        const errors = {};
        error.inner.forEach((err: any) => {
          errors[err.path] = err.message;
        });
        setState({ errors });
        return;
      }
      
      Failure("Operation failed. Please try again.");
    } finally {
      setState({ submitting: false });
    }
  };

  const renderForm = () => (
    <div className="space-y-6">
      {state.activeTab === "institution_admin" && (
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
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="Username"
          placeholder="Enter username"
          value={state.username}
          onChange={(e) => handleFormChange("username", e.target.value)}
          error={state.errors.username}
          required
        />
        <TextInput
          title="Email Address"
          type="email"
          placeholder="user@example.com"
          value={state.email}
          onChange={(e) => handleFormChange("email", e.target.value)}
          error={state.errors.email}
          required
        />
      </div>
      
      {/* {!state.editId && ( */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextInput
            title="Password"
            type={state.showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={state.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            error={state.errors.password}
            rightIcon={
              state.showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )
            }
            rightIconOnlick={() => setState({ showPassword: !state.showPassword })}
            required
          />
          <TextInput
            title="Confirm Password"
            type={state.showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={state.confirm_password}
            onChange={(e) => handleFormChange("confirm_password", e.target.value)}
            error={state.errors.confirm_password}
            rightIcon={
              state.showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )
            }
            rightIconOnlick={() => setState({ showConfirmPassword: !state.showConfirmPassword })}
            required
          />
        </div>
      {/* )} */}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomPhoneInput
          title="Phone Number"
          value={state.phone}
          onChange={(value) => handleFormChange("phone", value)}
          error={state.errors.phone}
          required
        />
        <CustomSelect
          title="Gender"
          options={GENDER_OPTION}
          value={state.gender}
          onChange={(selectedOption) => handleFormChange("gender", selectedOption)}
          placeholder="Select Gender"
          error={state.errors.gender}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* <TextInput
          title="Position"
          placeholder="Enter position"
          value={state.position}
          onChange={(e) => handleFormChange("position", e.target.value)}
          error={state.errors.position}
          required
        /> */}
        <TextInput
          title="Education Qualification"
          placeholder="Enter education qualification"
          value={state.education_qualification}
          onChange={(e) => handleFormChange("education_qualification", e.target.value)}
          error={state.errors.education_qualification}
          required
        />
      </div>

       {(state.activeTab === "hr" ) && (
        <CustomSelect
          options={state.collegeList}
          value={state.college}
          onChange={(selectedOption) =>
            setState({
              college: selectedOption,
              errors: { ...state.errors, college: "" },
            })
          }
          onSearch={(searchTerm) => collegeList(1, searchTerm)}
          placeholder="Select College"
          isClearable={true}
          loadMore={() =>
            state.collegeNext &&
            collegeList(state.collegePage + 1, "", true)
          }
          loading={state.collegeLoading}
          title="Select College"
          error={state.errors.college}
          required
          position="top"
        />
      )}
      {( state.activeTab === "hod") && (
        <CustomSelect
          options={state.departmentList}
          value={state.department}
          onChange={(selectedOption) =>
            setState({
              department: selectedOption,
              errors: { ...state.errors, department: "" },
            })
          }
          onSearch={(searchTerm) => departmentList(1, searchTerm)}
          placeholder="Select Department"
          isClearable={true}
          loadMore={() =>
            state.departmentNext &&
            departmentList(state.departmentPage + 1, "", true)
          }
          loading={state.departmentLoading}
          title="Select Department"
          error={state.errors.department}
          required
          position="top"

        />
      )}
      
      {( state.activeTab === "applicant") && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextInput
            title="Qualification"
            placeholder="Enter qualification"
            value={state.qualification}
            onChange={(e) => handleFormChange("qualification", e.target.value)}
            error={state.errors.qualification}
            required
          />
          <TextInput
            title="Experience"
            placeholder="Enter experience"
            value={state.experience}
            onChange={(e) => handleFormChange("experience", e.target.value)}
            error={state.errors.experience}
            required
          />
        </div>
      )}
    </div>
  );

  const getColumns = (): any[] => {
    const baseColumns = [
      {
        accessor: "username",
        title: "Name",
        sortable: true,
        render: ({ username }) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {username}
          </div>
        ),
      },
      {
        accessor: "email",
        title: "Email",
        sortable: true,
        render: ({ email }) => (
          <span className="text-gray-600 dark:text-gray-400">{email}</span>
        ),
      },
      {
        accessor: "phone",
        title: "Phone",
        render: ({ phone }) => (
          <div className="text-gray-600 dark:text-gray-400">{phone}</div>
        ),
      },
      {
        accessor: "institution",
        title: "Institution",
        render: ({ institution }) => (
          <div className="text-gray-600 dark:text-gray-400">{institution}</div>
        ),
      },
    ];
    if (state.activeTab === "hr") {
      baseColumns.splice(3, 0, {
        accessor: "college",
        title: "College",
        render: (row:any) => (
          <div className="text-gray-600 dark:text-gray-400">{row?.college}</div>
        ),
      });
    }

    if (state.activeTab === "hod") {
      baseColumns.splice(3, 0, {
        accessor: "department",
        title: "Department",
        render: (row:any) => (
          <div className="text-gray-600 dark:text-gray-400">{row?.department}</div>
        ),
      });
    }

    if (state.activeTab === "hod" || state.activeTab === "applicant") {
      baseColumns.push(
        {
          accessor: "qualification",
          title: "Qualification",
          render: (row:any) => (
            <div className="text-gray-600 dark:text-gray-400">
              {row?.qualification}
            </div>
          ),
        },
        {
          accessor: "experience",
          title: "Experience",
          render: (row:any) => (
            <div className="text-gray-600 dark:text-gray-400">{row?.experience}</div>
          ),
        }
      );
    }

    baseColumns.push({
      accessor: "actions",
      title: "Actions",
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
    });

    return baseColumns;
  };

  const getTabLabel = () => {
    if (state.activeTab === "institution_admin") return "Institution Admin";
    if (state.activeTab === "hr") return "HR";
    if (state.activeTab === "hod") return "HOD";
    return "Applicant";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              {getTabLabel()} Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage {getTabLabel().toLowerCase()} users and their information
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add {getTabLabel()}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            onClick={() => handleTabChange("institution_admin")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "institution_admin"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Institution Admin
          </button>
          <button
            onClick={() => handleTabChange("hr")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "hr"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            HR
          </button>
          <button
            onClick={() => handleTabChange("hod")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "hod"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            HOD
          </button>
          <button
            onClick={() => handleTabChange("applicant")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "applicant"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Applicant
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
              placeholder={`Search ${getTabLabel().toLowerCase()}...`}
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
              {getTabLabel()} List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.userCount} records found
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText={`No ${getTabLabel().toLowerCase()} found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.userList}
            fetching={state.loading}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading {getTabLabel().toLowerCase()}...
                  </span>
                </div>
              </div>
            }
            columns={getColumns()}
            sortStatus={{
              columnAccessor: state.sortBy,
              direction: state.sortOrder,
            }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({
                sortBy: columnAccessor,
                sortOrder: direction,
                page: 1,
              });
              userList(1);
            }}
            minHeight={200}
          />
        </div>

        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.userCount}
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
                {state.editId ? "Update" : "Add New"} {getTabLabel()}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to {state.editId ? "update" : "create"}{" "}
                {getTabLabel().toLowerCase()}
              </p>
            </div>

            {renderForm()}

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
                  {getTabLabel()}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Users;
