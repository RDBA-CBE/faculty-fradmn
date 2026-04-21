import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconSearch from "@/components/Icon/IconSearch";
import IconTrash from "@/components/Icon/IconTrash";
import IconEye from "@/components/Icon/IconEye";
import IconLoader from "@/components/Icon/IconLoader";
import Pagination from "@/components/pagination/pagination";
import {
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
import { FRONTEND_URL, PREFERENCES, ROLES } from "@/utils/constant.utils";
import {
  Award,
  Briefcase,
  BriefcaseBusiness,
  Building,
  CalendarCheck,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  Heart,
  Hourglass,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import TextArea from "@/components/FormFields/TextArea.component";
import CustomeDatePicker from "@/components/datePicker";
import moment from "moment";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";

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
    isOpenInteresteds: false,
    interestedsRow: null,
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
      label: "Own Record",
    },
    isOpenRound: false,

    academicResponsibilityFilter: null,
    academicResponsibilityList: [],
    academicResponsibilityLoading: false,
    profileUserLoading: false,
    isOpenProfile: false,
    userProfile: null,
    profileActiveTab: "profile",
    profileActiveSection: "summary",
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Users"));
    profile();
    master_department();
    master_experience();
    academicResponsibilityList();
  }, [dispatch]);

  useEffect(() => {
    if (state.profile) {
      userList(1);
    }
  }, [state.activeTab, state.profile, state.department]);

  useEffect(() => {
    setState({
      search: "",
      page: 1,
      ownRecord: false,
      superAdminCollegeFilter: null,
      superAdminInstitutionFilter: null,
      superAdminDepartmentFilter: null,
    });
  }, [state.activeTab]);

  useEffect(() => {
    if (state.profile) {
      userList(1);
    }
  }, [
    debounceSearch,
    state.statusFilter,
    state.sortBy,
    state.sortingFilter,
    state.refFilter,
    state.experience,
    state.academicResponsibilityFilter,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      console.log("profile --->", res);
      setState({ profile: res });
      jobList(
        1,
        "",
        false,
        res?.college?.map((item) => item?.college_id),
      );
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const userList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      const res: any = await Models.auth.userList(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        username:
          item?.first_name && item?.last_name
            ? `${item.first_name} ${item.last_name}`
            : item?.username || "",
        email: item?.email,
        phone: item?.phone,
        department: item?.department?.name,
        position: item?.position,
        experience: item?.experience,
        reveal_name: item?.reveal_name,
        current_location: item?.current_location,
        current_position: item?.current_position,
        department_master: item?.department_master?.short_name,
        publication_count: item?.publication_count,
        project_count: item?.project_count,
        hr_interview_status: item?.hr_interview_status,
        interesteds: item?.interesteds,
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

  const academicResponsibilityList = async () => {
    try {
      setState({ academicResponsibilityLoading: true });
      const res: any =
        await Models.master.additional_academic_responsibilities_list(
          { pagination: "No" },
          1,
        );
      const dropdown = res?.map((item: any) => ({
        value: item.id,
        label: item.responsibility_title,
      }));
      setState({
        academicResponsibilityList: dropdown || [],
        academicResponsibilityLoading: false,
      });
    } catch (error) {
      setState({ academicResponsibilityLoading: false });
    }
  };

  const master_department = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.is_approved = "Yes";
      body.pagination = "No";
      const res: any = await Models.master.dept_list(body, page);
      const dropdown = Dropdown(res?.results, "short_name");
      setState({
        master_department: loadMore
          ? [...state.master_department, ...dropdown]
          : dropdown,
        masterNext: res?.next,
        masterPage: page,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const master_experience = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.pagination = "No";
      const res: any = await Models.master.experience_list(body, page);
      console.log("master_experience --->", res);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        master_experience: loadMore
          ? [...state.master_experience, ...dropdown]
          : dropdown,
        masterNext: res?.next,
        masterPage: page,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const bodyData = () => {
    const body: any = {};

    body.active_job_seeker = "Yes";
    const user_id = localStorage.getItem("userId");
    if (user_id) {
      body.user_id = user_id;
    }

    body.role = ROLES.APPLICANT;

    if (state.search) {
      body.search = state.search;
      body.reveal_name = "Yes";
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    if (state.refFilter?.length) {
      const values = state.refFilter.map((item) => item.value);

      body.phd_completed = values.includes(1);
      body.net_cleared = values.includes(2);
      body.set_cleared = values.includes(3);
      body.slet_cleared = values.includes(4);
    }

    if (state.department?.value) {
      body.department_master_id = state.department?.value;
    }

    if (state.experience?.value) {
      body.experience_id = state.experience?.label;
    }

    if (state.academicResponsibilityFilter?.length > 0) {
      body.additional_academic_responsibility_ids =
        state.academicResponsibilityFilter.map((item: any) => item.value);
    }

    return body;
  };

  const jobList = async (page, search = "", loadMore = false, colId = null) => {
    try {
      setState({ loading: true });

      const body = bodyData();
      if (colId) body.college_id = colId;
      if (search) body.search = search;
      body.is_approved = "Yes";
      const res: any = await Models.job.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: item?.roles?.[0]?.role_name,
      }));

      setState({
        loading: false,
        jobPage: page,
        count: res?.count,
        jobList: loadMore ? [...state.jobList, ...dropdown] : dropdown,
        jobNext: res?.next,
        prev: res?.previous,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch jobs");
    }
  };

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    userList(pageNumber);
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
    });
    profile();
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

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this record?",
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

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => bulkDeleteRecords(),
      () => Swal.fire("Cancelled", "Your Records are safe :)", "info"),
      `Are you sure want to delete ${state.selectedRecords.length} record(s)?`,
    );
  };

  const getUser = async (row) => {
    try {
      setState({
        profileUserLoading: true,
        isOpenProfile: true,
        profileActiveTab: "profile",
        profileActiveSection: "summary",
      });
      const res: any = await Models.auth.getUser(row?.id);
      setState({ userProfile: res, profileUserLoading: false });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setState({ profileUserLoading: false });
    }
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.auth.deleteUser(id);
      }
      Success(`${state.selectedRecords.length} users deleted successfully!`);
      setState({ selectedRecords: [] });
      userList(state.page);
    } catch (error) {
      Failure("Failed to delete users. Please try again.");
    }
  };

  const getColumns = (): any[] => {
    const isAnonymous = (row: any) => {
      if (!row?.reveal_name) {
        const is_responses = row?.interesteds?.some((item: any) => item?.is_status == "Accepted");
        return is_responses? false : true;
      }
      return false;
    };

    const safeUser = (row: any) => {
      if (!isAnonymous(row)) return row;

      return {
        ...row,
        username: "Anonymous Faculty",
        email: null,
        phone: null,
      };
    };

    const baseColumns = [
      {
        accessor: "username",
        title: "Name",
        sortable: true,
        render: (row: any) => {
          const user = safeUser(row);
          const showFullActions = row?.reveal_name;
          const is_responses = row?.interesteds?.some((item: any) => item?.is_status == "Accepted");
          return showFullActions || is_responses ? (
            <div
              onClick={() => getUser(row)}
              title={user.username}
              className={`cursor-pointer font-medium ${
                isAnonymous(row)
                  ? "italic text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {truncateText(user.username)}
            </div>
          ) : (
            <span
            onClick={() => getUser(row)}

              title={user.username}
              className={`cursor-pointer font-medium ${
                isAnonymous(row)
                  ? "italic text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {truncateText(user.username)}
            </span>
          );
        },
      },

      {
        accessor: "current_location",
        title: "Location",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.current_location || "-"}
          </div>
        ),
      },
      {
        accessor: "experience",
        title: "Experience",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.experience || "-"}
          </div>
        ),
      },
      {
        accessor: "current_position",
        title: "Current Position",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.current_position || "-"}
          </div>
        ),
      },

      {
        accessor: "Department",
        title: "Department",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.department_master || "-"}
          </div>
        ),
      },

      {
        accessor: "publication_count",
        title: "Publications ",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.publication_count || "-"}
          </div>
        ),
      },

      {
        accessor: "project_count",
        title: "Projects ",
        render: (row: any) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row?.project_count || "-"}
          </div>
        ),
      },

      {
        accessor: "actions",
        title: "Actions",
        render: (row) => {
          const showFullActions = row?.reveal_name;

          let is_responses = false;
          if (row?.interesteds?.length > 0) {
            const is_response = row?.interesteds?.some(
              (item: any) => item?.is_status === "Accepted",
            );
            if (is_response) {
              is_responses = true;
            }
          }
          console.log("is_responses --->", is_responses);

          return (
            <div className="flex items-center justify-center gap-3">
              <div
                onClick={() => getUser(row)}
                className="flex cursor-pointer items-center justify-center rounded-lg text-green-600 transition-all duration-200"
                title="View Profile"
              >
                <IconEye className="h-4 w-4" />
              </div>
              {/* {(showFullActions || is_responses) && ( */}
                <button
                  onClick={() =>
                    setState({
                      isOpenInterest: true,
                      message: "",
                      applicantName: row?.username,
                      applicantId: row?.id,
                    })
                  }
                  className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200"
                  title="Send Interest"
                >
                  <Send className="h-4 w-4" />
                </button>
              {/* )} */}
              {row?.interesteds?.length > 0 && (
                <button
                  onClick={() =>
                    setState({ isOpenInteresteds: true, interestedsRow: row })
                  }
                  className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200"
                  title="Interested status"
                >
                  <Mail className="h-4 w-4" />
                </button>
              )}

              {(showFullActions ||
                is_responses) && (
                  <>
                    <button
                      onClick={() => handleSheduleInterview(row)}
                      className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200"
                      title="Interview Schedule"
                    >
                      <CalendarCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRound(row)}
                      className="flex items-center justify-center rounded-lg text-pink-600 transition-all duration-200"
                      title="Interview Round"
                    >
                      <BriefcaseBusiness className="h-4 w-4" />
                    </button>
                  </>
                )}

              {/* <button
                onClick={() => handleDelete(row)}
                className="flex items-center justify-center rounded-lg text-red-600 transition-all duration-200"
                title="Delete"
              >
                <IconTrash className="h-4 w-4" />
              </button> */}
            </div>
          );
        },
      },
    ];

    return baseColumns;
  };

  const sendInterest = async () => {
    try {
      setState({ sendLoading: true });

      const body = {
        message: capitalizeFLetter(state.message),
        applicant_id: state.applicantId,
        sender_id: state.profile?.id,
        job_id: state.interestJob?.value,
        hr_interview_status: "Sent Interest",
      };

      const res = await Models.application.send_interest(body);
      Success("Interest sent successfully!");
      handleCloseModal();
      setState({ sendLoading: false });
    } catch (error) {
      if (error?.data?.error) {
        Failure(error?.data?.error);
      }
      console.log("✌️error --->", error);
      setState({ sendLoading: false });

      console.log("✌️error --->", error);
    }
  };

  const handleSheduleInterview = (row) => {
    setState({
      showInterviewModal: true,
      applicant: {
        label: row?.username,
        value: row.id,
      },
    });
    console.log("✌️row --->", row);
  };

  const createInterview = async () => {
    try {
      setState({ submitting: true });

      const validation = {
        interviewSlot: state.interviewSlot
          ? moment(state.interviewSlot).format("YYYY-MM-DD HH:mm")
          : "",
        roundName: state.roundName,
      };

      await Utils.Validation.user_interview.validate(validation, {
        abortEarly: false,
      });

      const body = {
        scheduled_date: moment(state.interviewSlot).format("YYYY-MM-DD HH:mm"),
        applicant_id: state.applicant?.value,
        response_from_applicant: state.requestForChange,
        round_name: state.roundName,
        status: "Scheduled",
        interview_link: state.interview_link ?? "",
        sender_id: state.profile?.id,
      };
      console.log("✌️body --->", body);

      const res = await Models.interview.create_user_interview(body);
      Success("Interview schedule created successfully!");
      setState({
        showInterviewModal: false,
        errors: {},
        selectedApplicants: [],
        interviewSlot: "",
        roundName: "",
        requestForChange: false,
        interviewStatus: null,
        submitting: false,
        interview_link: "",
        selectedRecords: [],
      });
      // profile();
    } catch (error) {
      console.log("✌️error --->", error);
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️errors --->", validationErrors);

        setState({ errors: validationErrors, submitting: false });
      } else {
        Failure(error?.error);
        setState({ submitting: false });
      }
    }
  };

  const handleRound = async (row) => {
    console.log("✌️row --->", row);
    try {
      const body = {
        applicant_id: row?.id,
      };
      const res: any = await Models.interview.user_interview_list(body);
      console.log("handleRound --->", res);

      setState({
        interview_round_list: res?.items,
        loading: false,
        appstatus: row?.application_status,
        isOpenRound: true,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">Find Right Talents</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find and Manage right talents and their information
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="group relative w-fit">
            <TextInput
              placeholder={`Search job seekers ...`}
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>

          <div className="group relative">
            <CustomSelect
              options={PREFERENCES}
              value={state.refFilter}
              onChange={(e) => setState({ refFilter: e })}
              placeholder="Education Qualification"
              isClearable={true}
              isMulti
            />
          </div>
          <div className="group relative">
            <CustomSelect
              options={state.master_department}
              value={state.department}
              onChange={(e) => setState({ department: e })}
              placeholder="Select department"
              isClearable={true}
            />
          </div>
          <div className="group relative">
            <CustomSelect
              options={state.master_experience}
              value={state.experience}
              onChange={(e) => setState({ experience: e })}
              placeholder="Select experience"
              isClearable={true}
            />
          </div>
          <div className="group relative">
            <CustomSelect
              options={state.academicResponsibilityList}
              value={state.academicResponsibilityFilter}
              onChange={(e) => setState({ academicResponsibilityFilter: e })}
              placeholder="Academic Responsibility"
              isClearable={true}
              isMulti={true}
              loading={state.academicResponsibilityLoading}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Right Talents List
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
            noRecordsText={`No job seeker found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.userList}
            fetching={state.loading}
            // selectedRecords={state.userList.filter((record) =>
            //   state.selectedRecords.includes(record.id)
            // )}
            // onSelectedRecordsChange={(records) =>
            //   setState({ selectedRecords: records.map((r: any) => r.id) })
            // }
            // isRecordSelectable={(record: any) =>
            //   state.activeTab === ROLES.APPLICANT ? record.is_interested : true
            // }

            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading job seekers...
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

      {state.selectedRecords?.length > 0 && (
        <div className="fixed bottom-6 right-9 z-50">
          <button
            // onClick={bulkSelect}
            className="bg-dblue group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

            <UserCheck className="relative z-10 h-5 w-5" />

            <span className="relative z-10">
              Interview Schedule ({state.selectedRecords.length})
            </span>
          </button>
        </div>
      )}

      <Modal
        subTitle={`Send Interest (${state.applicantName})`}
        closeIcon
        open={state.isOpenInterest}
        close={handleCloseModal}
        isFullWidth={false}
        maxWidth="max-w-2xl"
        renderComponent={() => (
          <div className="relative">
            <TextArea
              title="Message"
              placeholder="Enter message"
              value={state.message}
              onChange={(e) => handleFormChange("message", e.target.value)}
            />

            <CustomSelect
              title="Select Job"
              options={state.jobList}
              value={state.interestJob}
              onChange={(e) => setState({ interestJob: e })}
              placeholder="Select job"
              isClearable={true}
              onSearch={(searchTerm) => {
                jobList(
                  1,
                  searchTerm,
                  false,
                  state.profile?.college?.map((item) => item?.college_id),
                );
              }}
              loadMore={() => {
                state.jobNext &&
                  jobList(
                    state.jobPage + 1,
                    "",
                    true,
                    state.profile?.college?.map((item) => item?.college_id),
                  );
              }}
              loading={state.jobLoading}
            />

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => sendInterest()}
                disabled={state.sendLoading}
                className={`bg-dblue group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <div className="bg-dblue absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                {state.sendLoading ? (
                  <IconLoader className="relative z-10 mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Send"
                )}
                <span className="relative z-10"></span>
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        subTitle={`Create Interview Schedule (${state.applicant?.label})`}
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
                onClick={() => createInterview()}
                disabled={state.submitting}
                className="bg-dblue  flex-1 rounded-lg px-4 py-2 text-white hover:shadow-lg disabled:opacity-50"
              >
                {state.submitting ? "Creating..." : "Create Schedule"}
              </button>

              {/* <button
                onClick={() => createInterview()}
                className="bg-dblue group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium text-white shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <div 
                className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>

                <UserCheck className="relative z-10 h-5 w-5" />

                <span className="relative z-10">
                  {state.submitting ? "Creating..." : "Create Schedule"}
                </span>
              </button> */}
            </div>
          </div>
        )}
      />

      <Modal
        subTitle="Interview Rounds"
        open={state.isOpenRound}
        close={() => setState({ isOpenRound: false })}
        closeIcon={() => setState({ isOpenRound: false })}
        padding="px-0 py-5"
        renderComponent={() => (
          <div className="flex h-[75vh] flex-col">
            {/* Scrollable Content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-4">
              {/* Candidate */}
              {/* <div className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-lg font-semibold">
                  {state.application?.first_name} {state.application?.last_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {state.application?.email} • {state.application?.phone}
                </p>
              </div> */}

              {/* Rounds */}
              <div className="space-y-4 pb-6">
                {state.interview_round_list?.map((round) => (
                  <div
                    key={round.id}
                    className="rounded-lg border bg-white px-3 py-2 shadow-sm"
                  >
                    {/* Round Header */}
                    <div className=" flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {capitalizeFLetter(round.round_name)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatScheduleDateTime(
                            round.scheduled_date,
                            round.scheduled_time,
                          )}
                        </p>
                      </div>

                      <span
                        className={`rounded px-3 py-1 text-xs font-semibold ${
                          round.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {capitalizeFLetter(round.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fixed Bottom Section */}
            {/* <div className="sticky bottom-0 border-t bg-white p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <CustomSelect
                    options={state.applicationStatusList}
                    value={state.appstatus}
                    onChange={(e) => setState({ appstatus: e })}
                    placeholder="Select final status"
                  />
                </div>

                <button
                  // onClick={() => updateStatus()}
                  className="bg-dblue rounded px-5 py-2 text-white"
                >
                  Update Status
                </button>
              </div>
            </div> */}
          </div>
        )}
      />

      {/* Interesteds Modal */}
      <Modal
        open={state.isOpenInteresteds}
        close={() =>
          setState({ isOpenInteresteds: false, interestedsRow: null })
        }
        subTitle="Interest Details"
        closeIcon
        maxWidth="max-w-2xl"
        renderComponent={() => {
          const interesteds = state.interestedsRow?.interesteds || [];
          return (
            <div>
              {interesteds.length === 0 ? (
                <p className="py-2 text-center text-sm text-gray-400">
                  No interest records found.
                </p>
              ) : (
                <div className="space-y-3">
                  {interesteds.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item?.job?.job_title || "—"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {item?.created_at
                            ? moment(item.created_at).format(
                                "DD MMM YYYY, hh:mm A",
                              )
                            : "—"}
                        </p>
                      </div>
                      <span
                        className={`ml-4 rounded-full px-3 py-1 text-xs font-semibold ${
                          item?.is_status === "Accepted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : item?.is_status === "Rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {item?.is_status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }}
      />

      <Modal
        open={state.isOpenProfile}
        close={() => setState({ isOpenProfile: false, userProfile: null })}
        subTitle="Faculty Profile"
        closeIcon
        maxWidth="max-w-5xl"
        padding="p-0"
        renderComponent={() => {
          const u = state.userProfile;
          console.log("u --->", u);
          const user_id =
            typeof window !== "undefined"
              ? localStorage.getItem("userId")
              : null;
          if (state.profileUserLoading) {
            return (
              <div className="h-50 flex items-center justify-center">
                <IconLoader className="text-dblue h-8 w-8 animate-spin" />
              </div>
            );
          }

          if (!u) return null;

          const canViewProfile =
            u?.reveal_name === true ||
            u?.interesteds?.some(
              (i: any) =>
                String(i?.sender?.id) === String(user_id) &&
                i?.is_status === "Accepted",
            );

          const sideMenuItems = [
            { key: "summary", label: "Profile Summary" },
            { key: "responsibility", label: "Academic Responsibilities" },
            { key: "experience", label: "Experience" },
            { key: "education", label: "Education" },
            { key: "projects", label: "Projects" },
            { key: "publications", label: "Publications" },
            { key: "skills", label: "Skills" },
            { key: "achievements", label: "Achievements" },
          ];

          const renderProfileSection = () => {
            switch (state.profileActiveSection) {
              case "summary":
                return (
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Profile Summary
                    </h3>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resume
                    </h4>
                    {canViewProfile ? (
                      u?.resume_url ? (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <FileText className="text-dblue h-4 w-4 shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Resume
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">
                            ·
                          </span>
                          <a
                            href={u.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-dblue flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                          >
                            <ExternalLink className="h-3 w-3" /> View
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            No resume provided
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <FileText className="h-4 w-4 shrink-0 text-gray-300" />
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="ml-auto h-6 w-12 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
                      </div>
                    )}
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-sm font-semibold   tracking-wide text-gray-500 dark:text-gray-400">
                        Profile Summary
                      </p>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {u?.about || "No summary provided."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          icon: <Mail className="h-4 w-4 text-blue-500" />,
                          label: "Email",
                          val: canViewProfile ? u?.email : null,
                          skeleton: !canViewProfile,
                        },
                        {
                          icon: <Phone className="h-4 w-4 text-green-500" />,
                          label: "Phone",
                          val: canViewProfile ? u?.phone : null,
                          skeleton: !canViewProfile,
                        },
                        {
                          icon: <MapPin className="h-4 w-4 text-red-500" />,
                          label: "Location",
                          val: u?.current_location,
                          skeleton: false,
                        },
                        {
                          icon: (
                            <Briefcase className="h-4 w-4 text-purple-500" />
                          ),
                          label: "Experience",
                          val: u?.experience,
                          skeleton: false,
                        },
                        {
                          icon: (
                            <Building className="h-4 w-4 text-orange-500" />
                          ),
                          label: "Company",
                          val: u?.current_company,
                          skeleton: false,
                        },
                        {
                          icon: <User className="h-4 w-4 text-indigo-500" />,
                          label: "Gender",
                          val: u?.gender,
                          skeleton: false,
                        },
                      ].map((item, i) =>
                        item.skeleton ? (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40"
                          >
                            {item.icon}
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                              </p>
                              <div className="h-3 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                            </div>
                          </div>
                        ) : item.val ? (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/40"
                          >
                            {item.icon}
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.label}
                              </p>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">
                                {item.val}
                              </p>
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                );

              case "responsibility":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Academic Responsibilities
                    </h3>
                    {u?.additional_academic_responsibilities?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.additional_academic_responsibilities.map(
                          (resp: any, i: number) => (
                            <span
                              key={i}
                              className="bg-dblue  rounded-full px-3 py-1 text-sm font-medium text-white"
                            >
                              {resp.responsibility_title}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">
                        No academic responsibilities listed.
                      </p>
                    )}
                  </div>
                );

              case "experience":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Experience
                    </h3>
                    {u?.experiences?.length ? (
                      u.experiences.map((exp: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {exp.designation}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exp.company}
                              </p>
                            </div>
                            {/* {exp.currently_working && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Current
                            </span>
                          )} */}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {exp.start_date
                              ? moment(exp.start_date).format("MMM YYYY")
                              : ""}{" "}
                            {exp.end_date
                              ? `– ${moment(exp.end_date).format("MMM YYYY")}`
                              : exp.currently_working
                              ? "– Present"
                              : ""}
                          </p>
                          {exp.job_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {exp.job_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No experience records.
                      </p>
                    )}
                  </div>
                );

              case "education":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Education
                    </h3>
                    {u?.educations?.length ? (
                      u.educations.map((edu: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {edu.degree}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.field}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>
                              {edu.start_year} – {edu.end_year}
                            </span>
                            {edu.cgpa && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                                CGPA: {edu.cgpa}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No education records.
                      </p>
                    )}
                  </div>
                );

              case "projects":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Projects
                    </h3>
                    {u?.projects?.length ? (
                      u.projects.map((proj: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {proj.project_title}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs ${
                                proj.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {proj.status}
                            </span>
                          </div>
                          {proj.duration && (
                            <p className="mt-0.5 text-xs text-gray-500">
                              {proj.duration}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {proj.project_description}
                          </p>
                          {proj.technologies?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {proj.technologies.map(
                                (tech: string, j: number) => (
                                  <span
                                    key={j}
                                    className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    {tech}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> {proj.link}
                            </a>
                          )}
                          {proj.funded && proj.funding_details && (
                            <p className="mt-1 text-xs text-gray-500">
                              Funded: {proj.funding_details}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No projects.</p>
                    )}
                  </div>
                );

              case "publications":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Publications
                    </h3>
                    {u?.publications?.length ? (
                      u.publications.map((pub: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {pub.publication_title}
                          </p>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {pub.publication_journal}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                            {pub.publication_year && (
                              <span>Year: {pub.publication_year}</span>
                            )}
                            {pub.publication_volume && (
                              <span>Vol: {pub.publication_volume}</span>
                            )}
                            {pub.publication_issue && (
                              <span>Issue: {pub.publication_issue}</span>
                            )}
                          </div>
                          {pub.publication_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {pub.publication_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No publications.</p>
                    )}
                  </div>
                );

              case "skills":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Skills
                    </h3>
                    {u?.skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {u.skills.map((skill: any, i: number) => (
                          <span
                            key={i}
                            className="bg-dblue  rounded-full px-3 py-1 text-sm font-medium text-white"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No skills listed.</p>
                    )}
                  </div>
                );

              case "achievements":
                return (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                      Achievements
                    </h3>
                    {u?.achievements?.length ? (
                      u.achievements.map((ach: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-gray-800 dark:text-white">
                              {ach.achievement_title}
                            </p>
                            {ach.achievement_file_url && (
                              <a
                                href={ach.achievement_file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-dblue flex items-center gap-1 text-xs hover:underline"
                              >
                                <ExternalLink className="text-dblue h-3 w-3" />{" "}
                                View
                              </a>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                            {ach.organization}
                          </p>
                          {ach.achievement_description && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                              {ach.achievement_description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No achievements.</p>
                    )}
                  </div>
                );

              default:
                return null;
            }
          };

          return (
            <div className="flex flex-col">
              {/* Profile Header */}
              <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                {canViewProfile ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-lg font-bold text-white">
                      {u?.profile_logo_url ? (
                        <img
                          src={u.profile_logo_url}
                          alt={u.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {u?.first_name?.[0]}
                          {u?.last_name?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {u?.username || `${u?.first_name} ${u?.last_name}`}
                      </p>
                      {u?.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {u.email}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                      <div className="h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </>
                )}
              </div>

              {/* Tabs: Profile | Qualifications */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {["profile", "qualifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setState({ profileActiveTab: tab })}
                    className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                      state.profileActiveTab === tab
                        ? "text-dblue border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {state.profileActiveTab === "profile" ? (
                <div className="flex" style={{ minHeight: "420px" }}>
                  {/* Left Side Menu */}
                  <div className="w-48 shrink-0 border-r border-gray-200 bg-gray-50 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                    {sideMenuItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() =>
                          setState({ profileActiveSection: item.key })
                        }
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          state.profileActiveSection === item.key
                            ? "bg-dblue font-semibold text-white"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {renderProfileSection()}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                    Academic Qualifications
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "PhD Completed",
                        key: "phd_completed",
                        icon: <GraduationCap className="h-5 w-5" />,
                      },
                      {
                        label: "NET Cleared",
                        key: "net_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                      {
                        label: "SET Cleared",
                        key: "set_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                      {
                        label: "SLET Cleared",
                        key: "slet_cleared",
                        icon: <Award className="h-5 w-5" />,
                      },
                    ].map((q) => (
                      <div
                        key={q.key}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-2 ${
                          u?.[q.key]
                            ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
                        }`}
                      >
                        <div
                          className={
                            u?.[q.key]
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-400"
                          }
                        >
                          {q.icon}
                        </div>
                        <p
                          className={`text-center text-sm font-medium ${
                            u?.[q.key]
                              ? "text-green-700 dark:text-green-400"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {q.label}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            u?.[q.key]
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {u?.[q.key] ? "Yes" : "No"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default Users;
