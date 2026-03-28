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
import { CreateUser } from "@/utils/validation.utils";
import Swal from "sweetalert2";
import {
  FRONTEND_URL,
  GENDER_OPTION,
  RECORDS_FOR_INS_ADMIN,
  ROLES,
} from "@/utils/constant.utils";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import {
  CalendarCheck,
  Clock,
  Heart,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import TextArea from "@/components/FormFields/TextArea.component";
import CustomeDatePicker from "@/components/datePicker";
import moment from "moment";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import * as Validation from "@/utils/validation.utils";

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
    password_confirm: "",
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

    // HOD dropdown states
    hodInstitutionList: [],
    hodInstitutionLoading: false,
    hodInstitutionPage: 1,
    hodInstitutionNext: null,
    selectedHODInstitution: null,
    hodCollegeList: [],
    hodCollegeLoading: false,
    hodCollegePage: 1,
    hodCollegeNext: null,
    selectedHODCollege: null,

    // HR dropdown states
    hrInstitutionList: [],
    hrInstitutionLoading: false,
    hrInstitutionPage: 1,
    hrInstitutionNext: null,
    selectedHRInstitution: null,

    errors: {},
    editId: null,
    selectedRecords: [],

    // Super admin filters
    superAdminInstitutionFilter: null,
    superAdminCollegeFilter: null,
    superAdminDepartmentFilter: null,
    superAdminDepartmentList: [],
    superAdminDepartmentLoading: false,
    superAdminDepartmentPage: 1,
    superAdminDepartmentNext: null,
    isOpenInterest: false,
    showInterviewModal: false,
    requestForChange: false,
    sortingFilter: {
      value: 1,
      label: "All Records",
    },
    isOpenRound: false,
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Users"));
    profile();
  }, [dispatch]);

  useEffect(() => {
    if (state.profile) {
      userList(1, state.profile?.institution?.id);
    }
  }, [
    debounceSearch,
    state.statusFilter,
    state.sortBy,
    state.collegeFilter,
    state.sortingFilter,
  ]);

  const profile = async (isTabChange = true) => {
    try {
      const res: any = await Models.auth.profile();
      console.log("profile --->", res);
      setState({ profile: res });
      userList(1, res?.institution?.id);
      collegeList(1, "", false, res?.institution?.id);
      hrCollegeList(1, "", false, res?.institution?.id);
      setState({
        profile_institution: res?.institution?.name,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const userList = async (page, insId) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      console.log("✌️body --->", body);
      body.role = ROLES.HR;
      if (insId) {
        body.institution_id = insId;
      }
      const res: any = await Models.auth.userList(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        // username: item?.username,
        username:
          item?.first_name && item?.last_name
            ? `${item.first_name} ${item.last_name}`
            : item?.username || "",
        email: item?.email,
        phone: item?.phone,
        college: item?.colleges?.map((item) => item?.short_name),
        collegeData: item?.colleges
          ? item?.colleges?.map((c) => ({
              label: c?.short_name,
              value: c?.id,
            }))
          : null,
        institution: item?.institution?.name,
        institutionData: item?.institution
          ? { label: item?.institution?.name, value: item?.institution?.id }
          : null,
        genderData: item?.gender
          ? { label: capitalizeFLetter(item?.gender), value: item?.gender }
          : null,
        job_count: item?.job_count,
        applications_count: item?.applications_count,
        interviews_scheduled_count: item?.interviews_scheduled_count,
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

    const userId = localStorage.getItem("userId");

    if (state.search) {
      body.search = state.search;
    }

    if (state.collegeFilter?.value) {
      body.college_id = state.collegeFilter?.value;
    }

    if (state.sortingFilter?.value) {
      if (state.sortingFilter?.value == 2) {
        body.team = "No";
        body.created_by = parseInt(userId);
      } else if (state.sortingFilter?.value == 3) {
        body.created_by = parseInt(userId);
        body.team = "Yes";
      }
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    console.log("✌️body --->", body);

    return body;
  };

  const collegeList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };

      if (institutionId) {
        body.institution = institutionId;
      } else if (state.profile?.role === ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.id;
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
      console.error("Error fetching colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const hrCollegeList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ dropcollegeLoading: true });
      const body: any = { search };
      if (institutionId) {
        body.institution = institutionId;
      }

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

      setState({
        dropcollegeLoading: false,
        dropcollegePage: page,
        dropcollegeList: loadMore
          ? [...state.dropcollegeList, ...dropdown]
          : dropdown,
        dropcollegeNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching HR colleges:", error);
      setState({ dropcollegeLoading: false });
    }
  };

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    userList(pageNumber, state.profile?.institution?.id);
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
      password_confirm: "",
      gender: null,
      education_qualification: "",
      institution: null,
      college: null,
      showPassword: false,
      showConfirmPassword: false,
      errors: {},
      editId: null,
      selectedHODInstitution: null,
      selectedHODCollege: null,
      selectedHRInstitution: null,
      isOpenInterest: false,
      applicantName: "",
      sendLoading: false,
      message: "",
      interestJob: "",
      dropCollege: [],
      submitting: false,
    });

    profile(false);
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
    console.log("row", row);

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
      institution: row?.institutionData,
      gender: row?.genderData,
    });

    if (row?.collegeData?.length > 0) {
      setState({
        dropCollege: row?.collegeData,
      });

      hrCollegeList(1, "", false, row?.institutionData?.value);
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
      userList(state.page, state.profile?.institution?.id);
    } catch (error) {
      Failure("Failed to delete record");
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
        await Models.auth.deleteUser(id);
      }
      Success(`${state.selectedRecords.length} users deleted successfully!`);
      setState({ selectedRecords: [] });
      userList(state.page, state.profile?.institution?.id);
    } catch (error) {
      Failure("Failed to delete users. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      const body: any = {
        username: capitalizeFLetter(state.username),
        email: state.email,
        password: state.password,
        password_confirm: state.password_confirm,
        phone: state.phone,
        role: ROLES.HR,
        status: "active",
        gender: state.gender?.value,
        profile_institution: state.profile_institution,
      };

      body.institution = state.profile?.institution?.id;
      if (state.dropCollege?.length > 0) {
        body.college = state.dropCollege?.map((item) => Number(item.value));
      }

      const formData = buildFormData(body);
      if (state.editId) {
        console.log("✌️if --->");
        await Validation.update_hr.validate(body, { abortEarly: false });

        await Models.auth.updateUser(state.editId, formData);
        Success("HR updated successfully!");
      } else {
        await Validation.create_hr.validate(body, { abortEarly: false });
        await Models.auth.createUser(formData);
        Success("HR created successfully!");
      }
      userList(state.page, state.profile?.institution?.id);
      handleCloseModal();
    } catch (error: any) {
      setState({ submitting: false });

      if (error?.response?.data?.error) {
        Failure(capitalizeFLetter(error?.response?.data?.error));
      } else {
        const errors = {};
        error?.inner?.forEach((error: any) => {
          errors[error?.path] = error.message;
        });
        console.log("✌️errors --->", errors);

        setState({ errors, submitting: false });
        return;
      }
    }
  };

  const getColumns = (): any[] => {
    const baseColumns = [
      {
        accessor: "username",
        title: "Name",
        sortable: true,
        render: (row: any) => (
          <div
            title={row?.username}
            onClick={() => handleEdit(row)}
            className={`cursor-pointer font-medium `}
          >
            {truncateText(row?.username)}
          </div>
        ),
      },
      {
        accessor: "college",
        title: "College",
        sortable: true,

        render: (row: any) => {
          const department = row?.college;
          if (!department || department?.length === 0) {
            return <span className="text-gray-400">-</span>;
          }

          const firstDept = department?.[0];
          const otherDept = department?.slice(1);
          const maxShow = 3;
          const remaining = otherDept?.length - maxShow;
          const visibleDept = otherDept?.slice(0, maxShow);
          const hiddenDept = otherDept?.slice(maxShow);

          return (
            <div className="flex max-w-[200px] items-center gap-2 overflow-hidden">
              {/* First department text */}
              <span
                title={firstDept}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {firstDept}
              </span>

              {/* Avatars */}
              <div className="flex items-center -space-x-2">
                {visibleDept?.map((dept: string, index: number) => (
                  <div
                    key={index}
                    className="group relative"
                    title={dept?.slice(0, 2)?.toUpperCase()}
                  >
                    <div className="bg-dblue flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white dark:border-gray-900">
                      {dept?.slice(0, 2)?.toUpperCase()}
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-10 left-1/2 z-[999] -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                      {capitalizeFLetter(dept)}
                    </div>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="group relative">
                    <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-semibold text-white dark:border-gray-900">
                      +{remaining}
                    </div>

                    {/* Remaining tooltip */}
                    <div className="absolute  bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
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
        accessor: "username",
        title: "Total Jobs",
        sortable: true,
        render: (row: any) => (
          <div title={row?.job_count} className={`cursor-pointer font-medium `}>
            {row?.job_count}
          </div>
        ),
      },
      {
        accessor: "username",
        title: "Total Applications",
        sortable: true,
        render: (row: any) => (
          <div
            title={row?.applications_count}
            className={`cursor-pointer font-medium `}
          >
            {row?.applications_count}
          </div>
        ),
      },

      {
        accessor: "username",
        title: "Interview Scheduled",
        sortable: true,
        render: (row: any) => (
          <div
            title={row?.interviews_scheduled_count}
            className={`cursor-pointer font-medium `}
          >
            {row?.interviews_scheduled_count}
          </div>
        ),
      },
      {
        accessor: "actions",
        title: "Actions",
        render: (row) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
              title="Edit"
            >
              <IconEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200"
              title="Delete"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];

    return baseColumns;
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">HR Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Hr users and their information
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add HR</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-4 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="group relative w-fit">
            <TextInput
              placeholder={`Search hr...`}
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>
          <CustomSelect
            options={state.collegeList}
            value={state.collegeFilter}
            onChange={(e) => setState({ collegeFilter: e })}
            placeholder="Select College"
            isClearable={true}
            onSearch={(e) =>
              collegeList(1, e, false, state.profile?.institution?.id)
            }
            loadMore={() =>
              state?.collegeNext &&
              collegeList(
                state.collegePage + 1,
                "",
                true,
                state.profile?.institution?.id
              )
            }
            loading={state.collegeLoading}
            className="!w-fit"
          />
          <CustomSelect
            options={RECORDS_FOR_INS_ADMIN}
            value={state.sortingFilter}
            className="!w-fit"
            onChange={(e) => setState({ sortingFilter: e })}
            placeholder={"Own Record"}
            isClearable={false}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              HR List
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords.length > 0 && (
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
              <div className="text-sm text-black">
                {state.userCount} records found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-aut border border-gray-200 bg-white">
          <DataTable
            noRecordsText={`No Hr found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.userList}
            fetching={state.loading}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading hr...
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
              userList(1, state.profile?.institution?.id);
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

      <Modal
        closeIcon
        subTitle={`${state.editId ? "Update HR" : "Add New HR"}`}
        open={state.showModal}
        close={handleCloseModal}
        isFullWidth={false}
        maxWidth="max-w-2xl"
        renderComponent={() => (
          <div className="relative">
            <div className="space-y-4">
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
                  name="new-email"
                  required
                />
              </div>

              {!state.editId && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <TextInput
                    title="Password"
                    type={state.showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={state.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    error={state.errors.password}
                    rightIcon={
                      state.showPassword ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )
                    }
                    rightIconOnlick={() =>
                      setState({ showPassword: !state.showPassword })
                    }
                    required
                  />
                  <TextInput
                    title="Confirm Password"
                    type={state.showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={state.password_confirm}
                    onChange={(e) =>
                      handleFormChange("password_confirm", e.target.value)
                    }
                    error={state.errors.password_confirm}
                    rightIcon={
                      state.showConfirmPassword ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )
                    }
                    rightIconOnlick={() =>
                      setState({
                        showConfirmPassword: !state.showConfirmPassword,
                      })
                    }
                    required
                  />
                </div>
              )}

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
                  onChange={(selectedOption) =>
                    handleFormChange("gender", selectedOption)
                  }
                  placeholder="Select Gender"
                  error={state.errors.gender}
                  required
                />
              </div>
              <TextInput
                title="Institution"
                placeholder="Institution"
                value={state.profile_institution}
                onChange={(e) => {}}
                error={state.errors.profile_institution}
                required
                disabled
              />

              <CustomSelect
                options={state.dropcollegeList}
                value={state.dropCollege}
                onChange={(selectedOption) =>
                  setState({
                    dropCollege: selectedOption,
                    errors: { ...state.errors, dropCollege: "" },
                  })
                }
                onSearch={(searchTerm) =>
                  hrCollegeList(
                    1,
                    searchTerm,
                    false,
                    state.profile?.institution?.id
                  )
                }
                placeholder="Select College"
                isClearable={true}
                isMulti={true}
                loadMore={() =>
                  state.dropcollegeNext &&
                  hrCollegeList(
                    state.dropcollegePage + 1,
                    "",
                    true,
                    state.profile?.institution?.id
                  )
                }
                loading={state.dropcollegeLoading}
                title="Select College"
                error={state.errors.college}
                position="top"
                disabled={!state.profile_institution}
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={state.submitting}
                className={`bg-dblue group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                {state.submitting ? (
                  <IconLoader className="relative z-10 mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconPlus className="relative z-10 mr-2 h-4 w-4" />
                )}
                <span className="relative z-10">
                  {state.submitting
                    ? "Loading..."
                    : state.editId
                    ? "Update"
                    : "Create"}
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
