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
  RECORDS_FOR_ADMIN,
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
    hr_request: false,
  });

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Users"));
    institutionList(1);
    hrInstitutionList(1);
    hodInstitutionList(1);
    profile();
  }, [dispatch]);

  useEffect(() => {
    if (state.profile) {
      userList(1);
    }
  }, [state.activeTab, state.profile]);

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
    state.ownRecord,
    state.superAdminCollegeFilter,
    state.superAdminInstitutionFilter,
    state.superAdminDepartmentFilter,
    state.sortingFilter,
    state.hr_request,
  ]);

  const profile = async (isTabChange = true) => {
    try {
      const res: any = await Models.auth.profile();
      console.log("profile --->", res);
      setState({ profile: res });

      if (res?.role === ROLES.SUPER_ADMIN) {
        if (isTabChange) {
          setState({ activeTab: ROLES.INSTITUTION_ADMIN });
        }
      }

      if (res?.role === ROLES.INSTITUTION_ADMIN) {
        // if (res?.institution) {
        const dropdown = {
          value: res?.institution?.id,
          label: res?.institution?.name,
        };

        setState({
          profile_institution: res?.institution?.name,
          selectedHRInstitution: dropdown,
        });
        hrCollegeList(1, "", false, dropdown);

        setState({
          profile_institution: res?.institution?.name,
          selectedHODInstitution: dropdown,
        });
        hodCollegeList(1, "", false, dropdown);

        // }

        if (res?.college) {
          const dropdown = Dropdown(res?.institution, "institution_name");
          setState({
            profile_institution: res?.institution?.name,
            selectedHODInstitution: dropdown,
          });
          hodCollegeList(1, "", false, dropdown);
        }
        if (isTabChange) {
          setState({ activeTab: ROLES.HR });
        }
      }

      if (res?.role === ROLES.HOD) {
        if (isTabChange) {
          setState({ activeTab: ROLES.APPLICANT });
        }
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  console.log("college", state?.college);

  const userList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      console.log("✌️body --->", body);
      body.role = state.activeTab;
      let res: any;
      if (state.activeTab == ROLES.HR && state.hr_request) {
        res = await Models.auth.hr_request_list(page);
      } else {
        res = await Models.auth.userList(page, body);
      }
      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        // username: item?.username,
        username:
          item?.first_name && item?.last_name
            ? `${item.first_name} ${item.last_name}`
            : item?.username || "",
        email: item?.email,
        phone: item?.phone,
        department: item?.department?.name,
        position: item?.position,
        qualification: item?.education_qualification,
        experience: item?.experience,
        status: item?.status,
        college:
          state.activeTab == ROLES.HR && state.hr_request
            ? [item?.college]
            : item?.colleges?.map((item) => item?.short_name),
        institution:
          state.activeTab == ROLES.HR
            ? state.hr_request
              ? item?.institution
              : item?.institution?.name
            : item?.institution?.name,
        institutionData: state.hr_request
          ? item?.institution
          : item?.institution
          ? { label: item?.institution?.name, value: item?.institution?.id }
          : null,
        genderData: item?.gender
          ? { label: capitalizeFLetter(item?.gender), value: item?.gender }
          : null,
        collegeData: state.hr_request
          ? item?.college
          : item?.colleges
          ? item?.colleges?.map((c) => ({
              label: c?.short_name,
              value: c?.id,
            }))
          : null,
        deptData: item?.department
          ? { label: item?.department?.name, value: item?.department?.id }
          : null,
        reveal_name: item?.reveal_name,
        current_location: item?.current_location,
        current_position: item?.current_position,
        college_count: item?.college_count,
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

    if (state.activeTab == ROLES.HR) {
      if (state.sortingFilter?.value) {
        if (state.sortingFilter?.value == 2) {
          body.team = "No";
          body.created_by = parseInt(userId);
        } else if (state.sortingFilter?.value == 3) {
          body.created_by = parseInt(userId);
          body.team = "Yes";
        }
      }
    }

    // if (state.profile?.role === ROLES.SUPER_ADMIN) {
    //   if (
    //     state.activeTab == "hr" ||
    //     state.activeTab == "hod" ||
    //     state.activeTab == "applicant"
    //   ) {
    //     if (state.superAdminCollegeFilter?.value) {
    //       body.college_id = state.superAdminCollegeFilter.value;
    //     }

    //     if (state.superAdminInstitutionFilter?.value) {
    //       body.institution_id = state.superAdminInstitutionFilter.value;
    //     }

    //     if (state.superAdminDepartmentFilter?.value) {
    //       body.department_id = state.superAdminDepartmentFilter.value;
    //     }

    //     if (state.activeTab === ROLES.APPLICANT) {
    //       body.active_job_seeker = "Yes";
    //     } else {
    //       if (state.sortingFilter?.value) {
    //         if (state.sortingFilter?.value == 1) {
    //           body.team = "No";
    //           body.created_by = userId;
    //         } else {
    //           body.team = "Yes";
    //           body.created_by = userId;
    //         }
    //       }

    //       // if (state.ownRecord) {
    //       //   body.created_by = userId;
    //       //   body.team = "No";
    //       // } else {
    //       //   body.created_by = userId;
    //       //   body.team = "Yes";
    //       // }
    //     }
    //   }
    // }

    // if (state.profile?.role === ROLES.INSTITUTION_ADMIN) {
    //   if (
    //     // state.activeTab == "hr" ||
    //     state.activeTab == "hod"
    //   ) {
    //     if (state.superAdminCollegeFilter?.value) {
    //       body.college_id = state.superAdminCollegeFilter.value;
    //     }

    //     if (state.superAdminDepartmentFilter?.value) {
    //       body.department_id = state.superAdminDepartmentFilter.value;
    //     }

    //     if (state.sortingFilter?.value) {
    //       if (state.sortingFilter?.value == 1) {
    //         body.team = "No";
    //         body.created_by = userId;
    //         body.institution_id = state.profile?.institution?.id;
    //       } else {
    //         body.team = "Yes";
    //         body.institution_id = state.profile?.institution?.id;
    //         body.created_by = userId;
    //       }
    //     }
    //   } else {
    //     if (state.activeTab === ROLES.APPLICANT) {
    //       body.active_job_seeker = "Yes";
    //     } else {
    //       if (state.sortingFilter?.value) {
    //         if (state.sortingFilter?.value == 1) {
    //           body.team = "No";
    //           body.created_by = userId;
    //         } else {
    //           body.team = "Yes";
    //           body.created_by = userId;
    //         }
    //       }
    //       // body.created_by = userId;
    //       // body.team = "No";
    //     }
    //   }
    // }
    // console.log("✌️bodyDATATA --->", body);

    // if (state.profile?.role === ROLES.HR) {
    //   if (state.activeTab == "hod") {
    //     body.created_by = userId;
    //     body.team = "No";

    //     // body.college_id = state.profile?.college?.map((item)=> item?.college_id);
    //   }
    //   if (state.activeTab === ROLES.APPLICANT) {
    //     body.active_job_seeker = "Yes";
    //   }
    // }

    // if (state.profile?.role === ROLES.HOD) {
    //   if (state.ownRecord) {
    //     body.created_by = userId;
    //     body.team = "No";
    //   } else {
    //     body.team = "Yes";
    //     body.department_id = state.profile?.department?.department_id;
    //   }

    //   if (state.activeTab === ROLES.APPLICANT) {
    //     body.active_job_seeker = "Yes";
    //   }
    // }

    // if (userId) {
    //   body.created_by = userId;
    // }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    console.log("✌️body --->", body);

    return body;
  };

  const institutionList = async (page, search = "", loadMore = false) => {
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
        institutionPrev: res?.previous,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
      setState({ institutionLoading: false });
    }
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

  const handleCollegeSearch = (searchTerm) => {
    const institutionId =
      state.profile?.role === ROLES.SUPER_ADMIN
        ? state.superAdminInstitutionFilter?.value
        : null;
    collegeList(1, searchTerm, false, institutionId);
  };

  const handleLoadMoreCollege = () => {
    if (state.collegeNext) {
      const institutionId =
        state.profile?.role === ROLES.SUPER_ADMIN
          ? state.superAdminInstitutionFilter?.value
          : null;
      collegeList(state.collegePage + 1, "", true, institutionId);
    }
  };

  const handlesuperAdminInstitutionChange = (selectedInstitution) => {
    setState({
      superAdminInstitutionFilter: selectedInstitution,
      superAdminCollegeFilter: null,
      collegeList: [],
      ownRecord: null,
    });

    if (selectedInstitution?.value) {
      collegeList(1, "", false, selectedInstitution.value);
    }
  };

  const handlesuperAdminCollegeChange = (selectedCollege) => {
    setState({
      superAdminCollegeFilter: selectedCollege,
      superAdminDepartmentFilter: null,
      ownRecord: null,
    });

    if (selectedCollege?.value) {
      superAdminDepartmentList(1, "", false, selectedCollege.value);
    } else {
      setState({ superAdminDepartmentList: [] });
    }
  };

  const handlesuperAdminDepartmentChange = (selectedDepartment) => {
    setState({
      superAdminDepartmentFilter: selectedDepartment,
      ownRecord: null,
    });
  };

  const handleDepartmentSearch = (searchTerm) => {
    const collegeId = state.superAdminCollegeFilter?.value;
    if (collegeId) {
      superAdminDepartmentList(1, searchTerm, false, collegeId);
    }
  };

  const handleLoadMoreDepartment = () => {
    const collegeId = state.superAdminCollegeFilter?.value;
    if (state.superAdminDepartmentNext && collegeId) {
      superAdminDepartmentList(
        state.superAdminDepartmentPage + 1,
        "",
        true,
        collegeId
      );
    }
  };

  const superAdminDepartmentList = async (
    page,
    search = "",
    loadMore = false,
    collegeId
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search };

      if (collegeId) {
        body.college = collegeId;
      }

      const res: any = await Models.department.list(page, body);

      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: item?.short_name,
      }));
      console.log("✌️dropdown --->", dropdown);

      setState({
        departmentLoading: false,
        superAdminDepartmentPage: page,
        superAdminDepartmentList: loadMore
          ? [...state.superAdminDepartmentList, ...dropdown]
          : dropdown,
        superAdminDepartmentNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
      setState({ departmentLoading: false });
    }
  };

  const hrInstitutionList = async (page, search = "", loadMore = false) => {
    try {
      setState({ hrInstitutionLoading: true });
      const body = { search };
      const res: any = await Models.institution.list(page, body);
      const dropdown = Dropdown(res?.results, "institution_name");

      setState({
        hrInstitutionLoading: false,
        hrInstitutionPage: page,
        hrInstitutionList: loadMore
          ? [...state.hrInstitutionList, ...dropdown]
          : dropdown,
        hrInstitutionNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching HR institutions:", error);
      setState({ hrInstitutionLoading: false });
    }
  };

  const hrCollegeList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };
      if (institutionId) {
        body.institution = institutionId.value;
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
      console.error("Error fetching HR colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const jobList = async (page, search = "", colId = null) => {
    console.log("✌️colId --->", colId);
    try {
      setState({ loading: true });

      const body = bodyData();
      if (colId) body.college_id = colId;
      if (search) body.search = search;
      const res: any = await Models.job.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: item?.roles?.[0]?.role_name,
      }));

      setState({
        loading: false,
        page,
        count: res?.count,
        jobList: dropdown,
        next: res?.next,
        prev: res?.previous,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch jobs");
    }
  };

  const hodInstitutionList = async (page, search = "", loadMore = false) => {
    try {
      setState({ hodInstitutionLoading: true });
      const body = { search };
      const res: any = await Models.institution.list(page, body);
      const dropdown = Dropdown(res?.results, "institution_name");

      setState({
        hodInstitutionLoading: false,
        hodInstitutionPage: page,
        hodInstitutionList: loadMore
          ? [...state.hodInstitutionList, ...dropdown]
          : dropdown,
        hodInstitutionNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching HOD institutions:", error);
      setState({ hodInstitutionLoading: false });
    }
  };

  const hodCollegeList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ hodCollegeLoading: true });
      const body: any = { search };
      if (institutionId) {
        body.institution = institutionId.value;
      }

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");

      setState({
        hodCollegeLoading: false,
        hodCollegePage: page,
        hodCollegeList: loadMore
          ? [...state.hodCollegeList, ...dropdown]
          : dropdown,
        hodCollegeNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching HOD colleges:", error);
      setState({ hodCollegeLoading: false });
    }
  };

  const hodDepartmentList = async (
    page,
    search = "",
    loadMore = false,
    collegeId = null
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search };
      if (collegeId) {
        body.college = collegeId.value;
      }

      const res: any = await Models.department.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");

      setState({
        departmentLoading: false,
        departmentPage: page,
        departmentList: loadMore
          ? [...state.departmentList, ...dropdown]
          : dropdown,
        departmentNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching HOD departments:", error);
      setState({ departmentLoading: false });
    }
  };

  const departmentList = async (
    page,
    search = "",
    loadMore = false,
    collegeId = null
  ) => {
    try {
      setState({ departmentLoading: true });
      const body: any = { search };
      if (collegeId) {
        body.college = collegeId;
      }
      // if(state.profile?.role == ROLES.HR){
      //   body.created_by= state.profile?.id;
      //   body.team="No"
      // }

      console.log("✌️body --->", body);

      const res: any = await Models.department.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");

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
    if (state.activeTab === "hod") {
      if (row?.institutionData) {
        setState({ selectedHODInstitution: row?.institutionData });
      }
      if (row?.collegeData) {
        setState({
          selectedHODCollege:
            row?.collegeData?.length > 0 ? row?.collegeData[0] : null,
        });

        setState({
          college: row?.collegeData?.length > 0 ? row?.collegeData[0] : null,
        });
        hodCollegeList(1, "", false, row?.institutionData);
      }
      if (row?.collegeData) {
        setState({ department: row?.deptData });
        hodDepartmentList(
          1,
          "",
          false,
          row?.collegeData?.length > 0 ? row?.collegeData[0] : null
        );
      }
    }

    if (state.activeTab === "hr") {
      if (row?.institutionData) {
        setState({ selectedHRInstitution: row?.institutionData });
      }
      if (row?.collegeData) {
        setState({
          college: row?.collegeData,
        });
        hrCollegeList(1, "", false, row?.institutionData);
      }
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      await Models.auth.updateUser(row.id, { status: newStatus });
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

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      const body: any = {
        username: capitalizeFLetter(state.username),
        email: state.email,
        password: state.password,
        password_confirm: state.password_confirm,
        phone: state.phone,
        role: state.activeTab,
        status: "active",
        gender: state.gender?.value,
        education_qualification: capitalizeFLetter(
          state.education_qualification
        ),
      };

      if (state.activeTab === "institution_admin") {
        body.institution = state.institution?.value;
      }

      // Add department for hr and hod
      if (state.activeTab === "hod") {
        body.department = state.department?.value;
      }

      if (state.activeTab === "hr") {
        body.college = state.college?.map((item) => Number(item.value));
      }

      // Add qualification and experience for hod and applicant
      if (state.activeTab === "hod" || state.activeTab === "applicant") {
        body.qualification = capitalizeFLetter(state.education_qualification);
        body.experience = state.experience;
      }

      console.log("body", body);

      const formData = buildFormData(body);

      if (!state.editId) {
        try {
          await CreateUser.validate(body, { abortEarly: false });
          setState({ errors: {} });
        } catch (validationError: any) {
          const errors = {};
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message;
          });
          console.log("✌️errors --->", errors);

          setState({ errors });
          return;
        }
      }

      if (state.editId) {
        await Models.auth.updateUser(state.editId, formData);
        Success("User updated successfully!");
      } else {
        await Models.auth.createUser(formData);
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
            onChange={(e) => handleFormChange("password", e.target.value)}
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
              setState({ showConfirmPassword: !state.showConfirmPassword })
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="Education Qualification"
          placeholder="Enter education qualification"
          value={state.education_qualification}
          onChange={(e) =>
            handleFormChange("education_qualification", e.target.value)
          }
          error={state.errors.education_qualification}
          required
        />
      </div>

      {state.activeTab === "hr" && (
        <>
          {state.profile?.role === ROLES.SUPER_ADMIN ? (
            <CustomSelect
              options={state.hrInstitutionList}
              value={state.selectedHRInstitution}
              onChange={(selectedOption) => {
                setState({
                  selectedHRInstitution: selectedOption,
                  errors: { ...state.errors, institution: "" },
                  college: null,
                });
                if (selectedOption) {
                  hrCollegeList(1, "", false, selectedOption);
                } else {
                  setState({ collegeList: [] });
                }
              }}
              onSearch={(searchTerm) => hrInstitutionList(1, searchTerm)}
              placeholder="Select Institution"
              isClearable={true}
              loadMore={() =>
                state.hrInstitutionNext &&
                hrInstitutionList(state.hrInstitutionPage + 1, "", true)
              }
              loading={state.hrInstitutionLoading}
              title="Select Institution"
              error={state.errors.institution}
              required
            />
          ) : (
            <TextInput
              title="Institution"
              placeholder="Institution"
              value={state.profile_institution}
              onChange={(e) => {}}
              error={state.errors.education_qualification}
              required
              disabled
            />
          )}

          <CustomSelect
            options={state.collegeList}
            value={state.college}
            onChange={(selectedOption) =>
              setState({
                college: selectedOption,
                errors: { ...state.errors, college: "" },
              })
            }
            onSearch={(searchTerm) =>
              hrCollegeList(1, searchTerm, false, state.selectedHRInstitution)
            }
            placeholder="Select College"
            isClearable={true}
            isMulti={true}
            loadMore={() =>
              state.collegeNext &&
              hrCollegeList(
                state.collegePage + 1,
                "",
                true,
                state.selectedHRInstitution
              )
            }
            loading={state.collegeLoading}
            title="Select College"
            error={state.errors.college}
            required
            position="top"
            disabled={!state.selectedHRInstitution}
          />
        </>
      )}
      {state.activeTab === "hod" && (
        <>
          {state.profile?.role === ROLES.SUPER_ADMIN ? (
            <CustomSelect
              options={state.hodInstitutionList}
              value={state.selectedHODInstitution}
              onChange={(selectedOption) => {
                setState({
                  selectedHODInstitution: selectedOption,
                  errors: { ...state.errors, institution: "" },
                  selectedHODCollege: null,
                  department: null,
                });
                if (selectedOption) {
                  hodCollegeList(1, "", false, selectedOption);
                } else {
                  setState({ hodCollegeList: [], departmentList: [] });
                }
              }}
              onSearch={(searchTerm) => hodInstitutionList(1, searchTerm)}
              placeholder="Select Institution"
              isClearable={true}
              loadMore={() =>
                state.hodInstitutionNext &&
                hodInstitutionList(state.hodInstitutionPage + 1, "", true)
              }
              loading={state.hodInstitutionLoading}
              title="Select Institutions"
              error={state.errors.institution}
            />
          ) : (
            <TextInput
              title="Institution"
              placeholder="Institution"
              value={state.profile_institution}
              onChange={(e) => {}}
              error={state.errors.education_qualification}
              required
              disabled
            />
          )}
          {state.profile?.role == ROLES.HR ? (
            state.profile?.college?.length > 0 ? (
              <CustomSelect
                options={state.profile?.college?.map((c) => ({
                  value: c?.college_id,
                  label: c?.college_name,
                }))}
                value={state.college}
                onChange={(selectedOption) => {
                  setState({
                    college: selectedOption,
                    errors: { ...state.errors, college: "" },
                    department: null,
                  });
                  if (selectedOption) {
                    departmentList(1, "", false, selectedOption?.value);
                  }
                }}
                placeholder="Select College"
                isClearable={true}
                isMulti={false}
                title="Select College"
                error={state.errors.college}
                position="top"
              />
            ) : (
              <TextInput
                title="College"
                placeholder="College"
                value={state.profile?.college?.college_name}
                onChange={(e) => {}}
                required
                disabled
              />
            )
          ) : (
            <CustomSelect
              options={state.hodCollegeList}
              value={state.selectedHODCollege}
              onChange={(selectedOption) => {
                setState({
                  selectedHODCollege: selectedOption,
                  errors: { ...state.errors, college: "" },
                  department: null,
                });
                if (selectedOption) {
                  hodDepartmentList(1, "", false, selectedOption);
                } else {
                  setState({ departmentList: [] });
                }
              }}
              onSearch={(searchTerm) =>
                hodCollegeList(
                  1,
                  searchTerm,
                  false,
                  state.selectedHODInstitution
                )
              }
              placeholder="Select College"
              isClearable={true}
              loadMore={() =>
                state.hodCollegeNext &&
                hodCollegeList(
                  state.hodCollegePage + 1,
                  "",
                  true,
                  state.selectedHODInstitution
                )
              }
              loading={state.hodCollegeLoading}
              title="Select College"
              error={state.errors.college}
              required
              disabled={!state.selectedHODInstitution}
            />
          )}
          {state.profile?.college?.length > 0 ? (
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
                departmentList(1, searchTerm, false, state.college?.value)
              }
              placeholder="Select Department"
              isClearable={true}
              loadMore={() =>
                state.departmentNext &&
                departmentList(
                  state.departmentPage + 1,
                  "",
                  true,
                  state.college?.value
                )
              }
              loading={state.departmentLoading}
              title="Select Department"
              error={state.errors.department}
              required
              position="top"
              disabled={!state.college}
            />
          ) : (
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
                hodDepartmentList(
                  1,
                  searchTerm,
                  false,
                  state.selectedHODCollege
                )
              }
              placeholder="Select Department"
              isClearable={true}
              loadMore={() =>
                state.departmentNext &&
                hodDepartmentList(
                  state.departmentPage + 1,
                  "",
                  true,
                  state.selectedHODCollege
                )
              }
              loading={state.departmentLoading}
              title="Select Department"
              error={state.errors.department}
              required
              position="top"
              disabled={!state.selectedHODCollege}
            />
          )}
        </>
      )}

      {state.activeTab === "applicant" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* <TextInput
            title="Qualification"
            placeholder="Enter qualification"
            value={state.qualification}
            onChange={(e) => handleFormChange("qualification", e.target.value)}
            error={state.errors.qualification}
            required
          /> */}
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
    let baseColumns = [];
    if (state.activeTab === ROLES.INSTITUTION_ADMIN) {
      baseColumns = [
        {
          accessor: "username",
          title: "Name",
          sortable: true,
          render: (row: any) => (
            <div
              title={row.username}
              className={` font-medium ${"text-gray-900 dark:text-white"}`}
            >
              {truncateText(row?.username)}
            </div>
          ),
        },
        {
          accessor: "institution",
          title: "Institution",
          sortable: true,

          render: (row: any) => (
            <div
              title={row?.institution}
              className="text-gray-600 dark:text-gray-400"
            >
              {truncateText(row?.institution)}
            </div>
          ),
        },

        {
          accessor: "institution",
          title: "College Count",
          sortable: true,

          render: (row: any) => (
            <div
              title={row?.institution}
              className="text-gray-600 dark:text-gray-400"
            >
              {row?.college_count || 0}
            </div>
          ),
        },
        {
          accessor: "actions",
          title: "Actions",
          render: (row) => (
            <div className="flex items-center justify-center gap-3">
              {state.activeTab == "applicant" && (
                <a
                  href={`${FRONTEND_URL}profile/${row?.id}`}
                  target="_blank"
                  className={`flex cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ${
                    row.status === "active"
                      ? " text-green-600 "
                      : "text-red-600 "
                  }`}
                  title={"View"}
                >
                  <IconEye className="h-4 w-4" />
                </a>
              )}
              {state.activeTab == "applicant" && row?.is_interested && (
                <button
                  onClick={() => handleRound(row)}
                  className="flex  items-center justify-center rounded-lg  text-pink-600 transition-all duration-200 "
                  title="Interview Round"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}

              {state.activeTab == "applicant" && row?.reveal_name && (
                <button
                  onClick={() => handleSheduleInterview(row)}
                  className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                  title="Interview schedule"
                >
                  <CalendarCheck className="h-4 w-4" />
                </button>
              )}

              {state.activeTab == "applicant" && !row?.reveal_name && (
                <button
                  onClick={() =>
                    setState({
                      isOpenInterest: true,
                      message: "",
                      applicantName: row?.username,
                      applicantId: row?.id,
                    })
                  }
                  className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                  title="send interest"
                >
                  <Heart className="h-4 w-4" />
                </button>
              )}
              {state.activeTab !== "applicant" && (
                <>
                  <button
                    onClick={() => handleEdit(row)}
                    className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                    title="Edit"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
                </>
              )}
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
    } else {
      baseColumns = [
        {
          accessor: "username",
          title: "Name",
          sortable: true,
          render: (row: any) => (
            <div
              title={row.username}
              className={` font-medium ${"text-gray-900 dark:text-white"}`}
            >
              {truncateText(row?.username)}
            </div>
          ),
        },
        {
          accessor: "institution",
          title: "Institution",
          sortable: true,

          render: (row: any) => (
            <div
              title={row?.institution}
              className="text-gray-600 dark:text-gray-400"
            >
              {truncateText(row?.institution)}
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
              <div className="flex items-center gap-2">
                {/* First department text */}
                <span
                  title={firstDept}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {truncateText(firstDept)}
                </span>

                {/* Avatars */}
                <div className="flex items-center -space-x-2">
                  {visibleDept?.map((dept: string, index: number) => (
                    <div key={index} className="group relative">
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
          accessor: "actions",
          title: "Actions",
          render: (row) => (
            <div className="flex items-center justify-center gap-3">
              {state.activeTab == ROLES.HR && state.hr_request ? (
                <>
                  <button
                    onClick={() => handleEdit(row)}
                    className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
                    title="Edit"
                  >
                   Approve
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200"
                    title="Delete"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          ),
        },
      ];
    }

    if (state.activeTab === "hod") {
      baseColumns.splice(3, 0);

      baseColumns.splice(3, 0, {
        accessor: "department",
        title: "Department",
        sortable: true,
        render: (row: any) => (
          <div
            title={row?.department}
            className="text-gray-600 dark:text-gray-400"
          >
            {truncateText(row?.department)}
          </div>
        ),
      });
    }

    // if (state.activeTab === "hod" || state.activeTab === "applicant") {
    //   baseColumns.push(
    //     {
    //       accessor: "qualification",
    //       title: "Qualification",
    //       sortable: true,

    //       render: (row: any) => (
    //         <div className="text-gray-600 dark:text-gray-400">
    //           {row?.qualification}
    //         </div>
    //       ),
    //     }

    //   );
    // }

    // baseColumns.push();

    return baseColumns;
  };

  const getTabLabel = () => {
    if (
      state.activeTab === "institution_admin" &&
      state.profile?.role === ROLES.SUPER_ADMIN
    )
      return "Institution Admin";
    if (state.activeTab === "hr") return "HR";
    if (state.activeTab === "hod") return "HOD";
    return "Job Seeker";
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
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">
              {getTabLabel()} Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage {getTabLabel().toLowerCase()} users and their information
            </p>
          </div>
          {state.activeTab !== ROLES.APPLICANT && (
            <button
              onClick={() => setState({ showModal: true })}
              className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
              <IconPlus className="relative z-10 h-5 w-5" />
              <span className="relative z-10">Add {getTabLabel()}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {state.profile?.role != ROLES.HOD && (
        <div className="mb-4">
          <div className="inline-flex rounded-lg bg-white p-1 dark:bg-gray-800">
            {state.profile?.role === ROLES.SUPER_ADMIN && (
              <button
                onClick={() => handleTabChange("institution_admin")}
                className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
                  state.activeTab === "institution_admin"
                    ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Institution Admin
              </button>
            )}
            {(state.profile?.role == ROLES.SUPER_ADMIN ||
              state.profile?.role == ROLES.INSTITUTION_ADMIN) && (
              <button
                onClick={() => handleTabChange("hr")}
                className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
                  state.activeTab === "hr"
                    ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                HR
              </button>
            )}
            {/* {state.profile?.role != ROLES.HOD && (
              <button
                onClick={() => handleTabChange("hod")}
                className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
                  state.activeTab === "hod"
                    ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                HOD
              </button>
            )} */}
            {/* {state.profile?.role == ROLES.HR && (
              <button
                onClick={() => handleTabChange("applicant")}
                className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
                  state.activeTab === "applicant"
                    ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Job Seeker
              </button>
            )} */}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-4 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        {/* <div className="mb-2 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div> */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="group relative w-fit">
            <TextInput
              placeholder={`Search ${getTabLabel().toLowerCase()}...`}
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>

          {(state.profile?.role === ROLES.INSTITUTION_ADMIN ||
            state.profile?.role === ROLES.SUPER_ADMIN) && (
            <>
              {(state.activeTab == "hr" ||
                state.activeTab == "hod" ||
                state.activeTab == "applicant") && (
                <>
                  {state.profile?.role === ROLES.SUPER_ADMIN && (
                    <CustomSelect
                      className="!w-fit"
                      options={state.institutionList}
                      value={state.superAdminInstitutionFilter}
                      onChange={handlesuperAdminInstitutionChange}
                      placeholder="Select Institution"
                      isClearable={true}
                      onSearch={(searchTerm) => institutionList(1, searchTerm)}
                      loadMore={() =>
                        state.institutionNext &&
                        institutionList(state.institutionPage + 1, "", true)
                      }
                      loading={state.institutionLoading}
                    />
                  )}
                  <CustomSelect
                    options={state.collegeList}
                    value={state.superAdminCollegeFilter}
                    onChange={handlesuperAdminCollegeChange}
                    placeholder="Select College"
                    isClearable={true}
                    onSearch={handleCollegeSearch}
                    loadMore={handleLoadMoreCollege}
                    loading={state.collegeLoading}
                    className="!w-fit"
                  />
                  {state.activeTab == "hod" && (
                    <CustomSelect
                      className="!w-fit"
                      options={state.superAdminDepartmentList}
                      value={state.superAdminDepartmentFilter}
                      onChange={handlesuperAdminDepartmentChange}
                      placeholder="Select Department"
                      isClearable={true}
                      onSearch={handleDepartmentSearch}
                      loadMore={handleLoadMoreDepartment}
                      loading={state.departmentLoading}
                      disabled={!state.superAdminCollegeFilter}
                    />
                  )}
                  {/* {((state.profile?.role === ROLES.SUPER_ADMIN &&
                    state.activeTab != "institution_admin") ||
                    (state.profile?.role === ROLES.INSTITUTION_ADMIN &&
                      state.activeTab != "hr")) && (
                    <CheckboxInput
                      label="Own Record"
                      checked={state.ownRecord}
                      onChange={(e) =>
                        setState({
                          ownRecord: e,
                          superAdminInstitutionFilter: null,
                          superAdminCollegeFilter: null,
                          superAdminDepartmentFilter: null,
                        })
                      }
                    /> */}
                  {state.activeTab == ROLES.HR && (
                    <CustomSelect
                      options={RECORDS_FOR_ADMIN}
                      value={state.sortingFilter}
                      className="!w-fit"
                      onChange={(e) => setState({ sortingFilter: e })}
                      placeholder={"Own Record"}
                      isClearable={false}
                    />
                  )}
                  {state.activeTab == ROLES.HR && (
                    <CheckboxInput
                      checked={state.hr_request}
                      onChange={(e) =>
                        setState({ hr_request: !state.hr_request })
                      }
                      label="HR Request"
                    />
                  )}
                </>
              )}
              {/* {state.profile?.role === ROLES.HR &&
                state.activeTab == "applicant" && (
                  <CheckboxInput
                    label="Own Record"
                    checked={state.ownRecord}
                    onChange={(e) =>
                      setState({
                        ownRecord: e,
                        superAdminInstitutionFilter: null,
                        superAdminCollegeFilter: null,
                        superAdminDepartmentFilter: null,
                      })
                    }
                  />
                )} */}
            </>
          )}

          {/* {state.profile?.role === ROLES.HR &&
            state.activeTab == "applicant" && (
              <CheckboxInput
                label="Own Record"
                checked={state.ownRecord}
                onChange={(e) => setState({ ownRecord: e })}
              />
            )} */}

          {/* {state.profile?.role === ROLES.HOD && (
            <CheckboxInput
              label="Own Record"
              checked={state.ownRecord}
              onChange={(e) => setState({ ownRecord: e })}
            />
          )} */}

          {/* </div> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {getTabLabel()} List
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
            noRecordsText={`No ${getTabLabel().toLowerCase()} found`}
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

      {state.selectedRecords?.length > 0 &&
        state.activeTab == ROLES.APPLICANT && (
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

      {/* Modal */}
      <Modal
        closeIcon
        subTitle={`${state.editId ? "Update" : "Add New"} ${getTabLabel()}`}
        open={state.showModal}
        close={handleCloseModal}
        isFullWidth={false}
        maxWidth="max-w-2xl"
        renderComponent={() => (
          <div className="relative">
            {/* <div className="mb-8 text-center">
              <div className="bg-dblue mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-white dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-white dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} {getTabLabel()}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to {state.editId ? "update" : "create"}{" "}
                {getTabLabel().toLowerCase()}
              </p>
            </div> */}

            {renderForm()}

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
                className={`bg-dblue group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-2 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
                  state.profile?.college?.map((item) => item?.college_id)
                );
              }}
              loadMore={() => {
                state.jobNext &&
                  jobList(
                    state.jobPage + 1,
                    "",
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
