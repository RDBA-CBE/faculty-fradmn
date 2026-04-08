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
  BriefcaseBusiness,
  CalendarCheck,
  Clock,
  Heart,
  Mail,
  MessageSquare,
  UserCheck,
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
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Users"));
    profile();
    master_department();
    master_experience()
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
    state.experience
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      console.log("profile --->", res);
      setState({ profile: res });
      jobList(1,"",false,res?.college?.map((item) => item?.college_id));
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
        publication_count:item?.publication_count,
        project_count:item?.project_count,
        hr_interview_status:item?.hr_interview_status,
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

  const master_department = async (
    page = 1,
    search = "",
    loadMore = false,
  ) => {
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

  const master_experience = async (
    page = 1,
    search = "",
    loadMore = false,
  ) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.pagination = "No";
      const res: any = await Models.master.experience_list(body, page);
console.log('master_experience --->', res);
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
      userList(state.page);
    } catch (error) {
      Failure("Failed to delete users. Please try again.");
    }
  };

  const getColumns = (): any[] => {
    const isAnonymous = (row: any) => {
      if(!row?.reveal_name){
        return row?.hr_interview_status == "Accepted" ? false:true;
      }
      return false;
    }

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
          const showFullActions =
            row?.reveal_name || row?.hr_interview_status === "Accepted";
          return showFullActions ? (
            <a
              title={user.username}
              href={`${FRONTEND_URL}profile/${row?.id}`}
              target="_blank"
              className={`cursor-pointer font-medium ${
                isAnonymous(row)
                  ? "italic text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {truncateText(user.username)}
            </a>
          ) : (
            <span
              title={user.username}
              className={`cursor-default font-medium ${
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

          const showFullActions =
            row?.reveal_name || row?.hr_interview_status === "Accepted";

          return (
            <div className="flex items-center justify-center gap-3">
              {showFullActions ? (
                <a
                  href={`${FRONTEND_URL}profile/${row?.id}`}
                  target="_blank"
                  className="flex cursor-pointer items-center justify-center rounded-lg text-green-600 transition-all duration-200"
                  title="View Profile"
                >
                  <IconEye className="h-4 w-4" />
                </a>
              ) : (
                <span
                  className="flex cursor-not-allowed items-center justify-center rounded-lg text-gray-400 transition-all duration-200"
                  title="Profile not available"
                >
                  <IconEye className="h-4 w-4" />
                </span>
              )}

              {showFullActions ? (
                <>
                  <button
                    onClick={() => handleRound(row)}
                    className="flex items-center justify-center rounded-lg text-pink-600 transition-all duration-200"
                    title="Interview Round"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSheduleInterview(row)}
                    className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200"
                    title="Interview Schedule"
                  >
                    <CalendarCheck className="h-4 w-4" />
                  </button>
                </>
              ) : (
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
                  <Mail className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={() => handleDelete(row)}
                className="flex items-center justify-center rounded-lg text-red-600 transition-all duration-200"
                title="Delete"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          )
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
            <h1 className="page-ti text-transparent">Job Seeker Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage job seeker users and their information
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
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Job Seeker List
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
                  state.profile?.college?.map((item) => item?.college_id)
                );
              }}
              loadMore={() => {
                state.jobNext &&
                  jobList(
                    state.jobPage + 1,
                    "",
                    true,
                    state.profile?.college?.map((item) => item?.college_id)
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
                            round.scheduled_time
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
    </div>
  );
};

export default Users;
