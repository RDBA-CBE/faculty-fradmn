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
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Pagination from "@/components/pagination/pagination";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  showDeleteAlert,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import Models from "@/imports/models.import";
import {
  CreateCollege,
  CreateDepartment,
  CreateHOD,
} from "@/utils/validation.utils";
import PrivateRouter from "@/hook/privateRouter";
import IconEdit from "@/components/Icon/IconEdit";
import UpdatePropertyImagePreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import NumberInput from "@/components/FormFields/NumberInputs.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import DynamicAchievementInput from "@/components/DynamicAchievementInput";

const CollegeAndDepartment = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    // Wizard state
    currentStep: 1,
    completedSteps: [],
    createdCollegeId: null,
    createdDepartmentId: null,

    // Selection state
    selectedRecords: [],

    activeTab: "colleges",
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    institutionFilter: null,
    showModal: false,
    showEditModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",

    // Institution data for filter dropdown
    institutionOptions: [],
    institutionLoading: false,
    institutionPage: 1,
    institutionNext: null,

    // College filter data for departments tab
    collegeFilterOptions: [],
    collegeFilter: null,
    collegeFilterLoading: false,
    collegeFilterPage: 1,
    collegeFilterNext: null,

    // College data
    collegeList: [],
    collegeCount: 0,
    college_name: "",
    college_code: "",
    college_email: "",
    college_phone: "",
    college_address: "",
    institution: null,
    images: [],
    newImages: [],

    // Department data
    departmentList: [],
    departmentCount: 0,
    department_name: "",
    // department_code: "",
    department_email: "",
    department_phone: "",
    department_head: "",
    college: null,
    collegeDropdownList: [],
    collegeLoading: false,
    collegePage: 1,
    collegeNext: null,

    // HOD fields
    hod_username: "",
    hod_email: "",
    hod_phone: "",
    hod_password: "",
    hod_confirm_password: "",
    hod_gender: null,
    hod_qualification: "",
    showHODPassword: false,
    showHODConfirmPassword: false,

    errors: {},
    editId: null,
    college_type_list: [],
    naac_accreditation_list: [],
    college_type: [],
    naac_accreditation: "",
    nirf_band: "",
    nirf_category: "",
    intake_per_year: "",
    total_strength: "",
    recent_achievements: [],
    recent_dept_achievements: [],
  });

  const steps = [
    { id: 1, name: "College", icon: GraduationCap, required: true },
    { id: 2, name: "Department", icon: BookOpen, required: true },
    { id: 3, name: "Department HOD", icon: UserCheck, required: true },
  ];

  const isStepCompleted = (stepId: number) =>
    state.completedSteps.includes(stepId);
  const isStepAccessible = (stepId: number) =>
    stepId === 1 || isStepCompleted(stepId - 1);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Colleges & Departments"));
    institutionList(1);
    loadInstitutionOptions(1); // Load institutions for filter dropdown
    college_type();
    naac_accreditations();
    nirf_band(), nirf_category();
  }, [dispatch]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeTableList(1);
    } else {
      deptList(1);
      loadCollegeFilterOptions(1); // Load colleges for filter dropdown
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeTableList(1);
    } else {
      deptList(1);
    }
  }, [
    debounceSearch,
    state.statusFilter,
    state.institutionFilter,
    state.collegeFilter,
    state.sortBy,
  ]);

  const collegeTableList = async (page, institutionId = null) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();

      if (institutionId || state.institutionFilter) {
        body.institution =
          institutionId?.value || state.institutionFilter?.value;
      }

      const res: any = await Models.college.list(page, body);

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
        college_address: item?.college_address,
        college_hr: item?.college_hr,
        college_logo: item?.college_logo,
        college_type: item?.college_types,

        naac_accreditation: item?.naac_accreditations,
        nirf_band: item?.nirf_band,
        nirf_category: item?.nirf_categories,
        intake_per_year: item?.intake_per_year,
        total_strength: item?.total_strength,
        recent_achievements: item?.recent_achievements,
        summary: item?.summary,
      }));

      setState({
        loading: false,
        collegeList: tableData,
        collegeCount: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
      });
    } catch (error) {
      setState({ loading: false });
    }
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

  const HRList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ hrLoading: true });
      const body = {
        role: "hr",
        search,
      };
      const res: any = await Models.auth.userList(page, body);
      const dropdown = Dropdown(res?.results, "username");
      setState({
        hrOptions: loadMore ? [...state.hrOptions, ...dropdown] : dropdown,
        hrLoading: false,
        hrPage: page,
        hrNext: res?.next,
      });
    } catch (error) {
      setState({ hrLoading: false });
      console.error("Error fetching HR users:", error);
    }
  };

  const collegeDropdownList = async (
    page,
    search = "",
    loadMore = false,
    seletedInstitution = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };
      if (seletedInstitution) {
        body.institution = seletedInstitution?.value;
      }

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

  const deptHodDropdownList = async (
    page,
    search = "",
    loadMore = false,
    selectedCollege = null
  ) => {
    try {
      setState({ deptHodLoading: true });
      const body: any = { search };
      if (selectedCollege) {
        body.college_id = selectedCollege;
      }

      const res: any = await Models.auth.userList(page, body);
      const dropdown = Dropdown(res?.results, "username");

      setState({
        deptHodLoading: false,
        deptHodPage: page,
        deptHodDropdownList: loadMore
          ? [...state.deptHodDropdownList, ...dropdown]
          : dropdown,
        deptHodNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setState({ deptHodLoading: false });
    }
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
      const dropdown = Dropdown(res?.results, "institution_name");

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionDropdownList: loadMore
          ? [...state.institutionDropdownList, ...dropdown]
          : dropdown,
        institutionNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
      setState({ institutionLoading: false });
    }
  };

  const collegeList = async (page, institutionId = null) => {
    try {
      setState({ loading: true });
      const body: any = {};
      const userid = localStorage.getItem("userId");

      if (institutionId || state.institutionFilter) {
        body.institution =
          institutionId?.value || state.institutionFilter?.value;
      }

      body.created_by = userid;
      body.team = "No";

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

      setState({
        loading: false,
        collegeCount: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
        collegeDropdownList: dropdown,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const deptList = async (page) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      if (state.institutionFilter) {
        body.institution = state.institutionFilter?.value;
      }
      if (state.collegeFilter) {
        body.college = state.collegeFilter?.value;
      }
      const res: any = await Models.department.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        department_name: item?.department_name,
        // department_code: item?.department_code,
        department_email: item?.department_email,
        department_phone: item?.department_phone,
        status: item?.status,
        college_name: item?.college_name,
        college_id: item?.college,
        total_jobs: item?.total_jobs,
        institution_name: item?.college_name,
        institution_id: item?.institution,
        department_head: item?.hod?.name,
        hod_id: item?.hod?.id,

        dept_intake_per_year: item?.intake_per_year,
        dept_summary: item?.summary,
        recent_dept_achievements: item?.recent_achievements,
        isNBAAccreditation: item?.nba_accreditation,
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

  const college_type = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      const res: any = await Models.master.college_type(page, body);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        college_type_list: dropdown,
        college_type_count: res?.count,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const naac_accreditations = async (
    page = 1,
    search = "",
    loadMore = false
  ) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      const res: any = await Models.master.NAAC_Accereditation(page, body);
      const dropdown = Dropdown(res?.results, "grade");
      setState({
        naac_accreditation_list: dropdown,
        college_type_count: res?.count,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const nirf_band = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      const res: any = await Models.master.NIRF_Band(page, body);
      const dropdown = Dropdown(res?.results, "band");
      setState({
        nirf_band_list: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const nirf_category = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      const res: any = await Models.master.NIRF_Category(page, body);
      const dropdown = Dropdown(res?.results, "category");
      setState({
        nirf_category_list: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleTabChange = (tab) => {
    setState({
      activeTab: tab,
      page: 1,
      search: "",
      statusFilter: null,
      institutionFilter: null,
      collegeFilter: null,
    });
  };

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    collegeTableList(pageNumber);
  };

  const handleStatusChange = (selectedOption) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  // Institution filter handlers
  const loadInstitutionOptions = async (
    page,
    search = "",
    loadMore = false
  ) => {
    try {
      setState({ institutionLoading: true });
      const body = { search };
      const res: any = await Models.institution.list(page, body);
      const dropdown = Dropdown(res?.results, "institution_name");

      setState({
        institutionLoading: false,
        institutionPage: page,
        institutionOptions: loadMore
          ? [...state.institutionOptions, ...dropdown]
          : dropdown,
        institutionNext: res?.next,
      });
    } catch (error) {
      console.error("Error loading institution options:", error);
      setState({ institutionLoading: false });
    }
  };

  const handleInstitutionChange = (selectedOption) => {
    setState({
      institutionFilter: selectedOption,
      page: 1,
      collegeFilter: null,
    });
    if (state.activeTab === "departments") {
      loadCollegeFilterOptions(1, "", false, selectedOption);
    }
  };

  const handleInstitutionSearch = (searchTerm) => {
    loadInstitutionOptions(1, searchTerm);
  };

  const handleLoadMoreInstitutions = () => {
    if (state.institutionNext) {
      loadInstitutionOptions(state.institutionPage + 1, "", true);
    }
  };

  // College filter handlers
  const loadCollegeFilterOptions = async (
    page,
    search = "",
    loadMore = false,
    institutionOption = null
  ) => {
    try {
      setState({ collegeFilterLoading: true });
      const body: any = { search };
      const selectedInstitution = institutionOption || state.institutionFilter;
      // const userId = localStorage.getItem("userId");
      // body.created_by = userId;
      // body.team = "No";

      if (selectedInstitution) {
        body.institution = selectedInstitution.value;
      }
      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

      setState({
        collegeFilterLoading: false,
        collegeFilterPage: page,
        collegeFilterOptions: loadMore
          ? [...state.collegeFilterOptions, ...dropdown]
          : dropdown,
        collegeFilterNext: res?.next,
      });
    } catch (error) {
      console.error("Error loading college filter options:", error);
      setState({ collegeFilterLoading: false });
    }
  };

  const handleCollegeFilterChange = (selectedOption) => {
    setState({ collegeFilter: selectedOption, page: 1 });
  };

  const handleCollegeFilterSearch = (searchTerm) => {
    loadCollegeFilterOptions(1, searchTerm);
  };

  const handleLoadMoreColleges = () => {
    if (state.collegeFilterNext) {
      loadCollegeFilterOptions(state.collegeFilterPage + 1, "", true);
    }
  };

  const handleSortStatusChange = ({ columnAccessor, direction }) => {
    setState({
      sortBy: columnAccessor,
      sortOrder: direction === "desc" ? "desc" : "asc",
    });
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      showEditModal: false,
      currentStep: 1,
      completedSteps: [],
      createdCollegeId: null,
      createdDepartmentId: null,
      college_name: "",
      college_code: "",
      college_email: "",
      college_phone: "",
      college_address: "",
      college_hr: null,
      college_logo: null,
      institution: null,
      department_name: "",
      // department_code: "",
      department_email: "",
      department_phone: "",
      department_head: "",
      college: null,
      hod_username: "",
      hod_email: "",
      hod_phone: "",
      hod_password: "",
      hod_confirm_password: "",
      hod_gender: null,
      hod_qualification: "",
      showHODPassword: false,
      showHODConfirmPassword: false,
      errors: {},
      editId: null,
      submitting: false,
      selectedRecords: [],
      college_type: [],
      naac_accreditation: [],
      nirf_band: null,
      nirf_category: null,
      intake_per_year: "",
      total_strength: "",
      summary: "",
      recent_achievements: [],
      clgLoading: false,

      dept_intake_per_year: null,
      dept_summary: "",
      recent_dept_achievements: [],
      isNBAAccreditation: false,
      newImages: [],
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
    const userId = localStorage.getItem("userId");

    if (state.search) {
      body.search = state.search;
    }
    body.team = "No";

    if (userId) {
      body.created_by = userId;
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }
    return body;
  };

  const handleEdit = (row) => {
    console.log("✌️row --->", row);
    if (state.activeTab === "colleges") {
      setState({
        editId: row.id,
        showModal: false,
        college_name: row.college_name,
        college_code: row.college_code,
        college_email: row.college_email,
        college_phone: row.college_phone,
        college_address: row.college_address || "",
        institution: {
          value: row?.institution_id,
          label: row.institution_name,
        },
        college_hr: {
          value: row?.college_hr?.id,
          label: row.college_hr?.username,
        },
        college_logo: row.college_logo ? [row.college_logo] : [],
        showEditModal: true,
        intake_per_year: row.intake_per_year,
        total_strength: row.total_strength,
        summary: row.summary,
        recent_achievements: row.recent_achievements,
      });

      if (row?.nirf_band) {
        setState({
          nirf_band: {
            value: row.nirf_band?.id,
            label: row.nirf_band?.band,
          },
        });
      }

      if (row.college_type?.length > 0) {
        setState({
          college_type: row.college_type?.map((item) => ({
            value: item?.id,
            label: item?.name,
          })),
        });
      } else {
        setState({ college_type: [] });
      }

      if (row.nirf_category?.length > 0) {
        setState({
          nirf_category: row.nirf_category?.map((item) => ({
            value: item?.id,
            label: item?.category,
          })),
        });
      } else {
        setState({ nirf_category: [] });
      }

      if (row.naac_accreditation?.length > 0) {
        setState({
          naac_accreditation: row.naac_accreditation?.map((item) => ({
            value: item?.id,
            label: item?.grade,
          })),
        });
      } else {
        setState({ naac_accreditation: [] });
      }
    } else {
      setState({
        editId: row.id,
        showModal: true,
        department_name: row.department_name,
        // department_code: row.department_code,
        institution: {
          value: row?.institution_id,
          label: row.institution_name,
        },
        // department_email: row.department_email,
        // department_phone: row.department_phone,
        // department_head: row.department_head,
        college: {
          value: row?.college_id,
          label: row.college_name,
        },

        dept_intake_per_year: row?.dept_intake_per_year,
        dept_summary: row?.dept_summary,
        recent_dept_achievements: row?.recent_dept_achievements,
        isNBAAccreditation: row?.isNBAAccreditation,
      });

      if (row?.hod_id) {
        setState({
          deptHod: { value: row?.hod_id, label: row.department_head },
        });
      }

      if (row?.institution_id) {
        collegeDropdownList(1, "", false, {
          value: row?.institution_id,
          label: row.institution_name,
        });
      }

      if (row?.college_id) {
        deptHodDropdownList(1, "", false, row?.college_id);
      }
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      if (state.activeTab === "colleges") {
        await Models.college.update({ status: newStatus }, row.id);
        Success(`College ${newStatus} successfully!`);

        collegeTableList(state.page);
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

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => {
        bulkDeleteRecords();
      },
      () => {
        Swal.fire("Cancelled", "Your Records are safe :)", "info");
      },
      `Are you sure want to delete ${state.selectedRecords.length} record(s)?`
    );
  };

  const deleteRecord = async (id) => {
    try {
      if (state.activeTab === "colleges") {
        await Models.college.delete(id);
        Success("College deleted successfully!");
        collegeTableList(state.page);
      } else {
        await Models.department.delete(id);
        Success("Department deleted successfully!");
        deptList(state.page);
      }
    } catch (error) {
      Failure(
        `Failed to delete ${state.activeTab.slice(0, -1)}. Please try again.`
      );
    }
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        if (state.activeTab === "colleges") {
          await Models.college.delete(id);
        } else {
          await Models.department.delete(id);
        }
      }
      Success(
        `${state.selectedRecords.length} ${state.activeTab} deleted successfully!`
      );
      setState({ selectedRecords: [] });
      if (state.activeTab === "colleges") {
        collegeTableList(state.page);
      } else {
        deptList(state.page);
      }
    } catch (error) {
      Failure(`Failed to delete ${state.activeTab}. Please try again.`);
    }
  };

  const rollbackCreatedRecords = async (records: any) => {
    try {
      if (records.hodId) {
        await Models.auth.deleteUser(records.hodId);
      }
      if (records.departmentId) {
        await Models.department.delete(records.departmentId);
      }
      if (records.collegeId) {
        await Models.college.delete(records.collegeId);
      }
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
      Failure(
        "Failed to cleanup created records. Please contact administrator."
      );
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setState({ submitting: true });

      if (state.currentStep === 1) {
        // Step 1: Create College only
        const collegeBody: any = {
          college_name: capitalizeFLetter(state.college_name),
          college_code: capitalizeFLetter(state.college_code),
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: capitalizeFLetter(state.college_address),
          // college_hr: state.college_hr?.value,
          institution: state?.institution?.value,
          nirf_band_id: state.nirf_band?.value ?? "",
          intake_per_year: Number(state.intake_per_year),
          total_strength: Number(state.total_strength),
          summary: state.summary,
          recent_achievements: state.recent_achievements,
        };

        if (state.college_type?.length > 0) {
          collegeBody.college_type_ids = state.college_type?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.college_type_ids = [];
        }

        if (state.nirf_category?.length > 0) {
          collegeBody.nirf_category_ids = state.nirf_category?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.college_type_ids = [];
        }

        if (state.naac_accreditation?.length > 0) {
          collegeBody.naac_accreditation_ids = state.naac_accreditation?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.naac_accreditation_ids = [];
        }
        if (state.newImages?.length > 0 && state.images?.length === 0) {
          collegeBody.college_logo = state.newImages[0];
        } else {
          collegeBody.college_logo = null;
        }
        if (state.college_hr?.value) {
          collegeBody.college_hr = state.college_hr?.value;
        }

        await CreateCollege.validate(collegeBody, { abortEarly: false });

        const formData = buildFormData(collegeBody);
        const collegeRes = await Models.college.create(formData);
        Success("College created successfully!");
        handleCloseModal();
        collegeTableList(state.page);
      } else if (state.currentStep === 2) {
        // Step 2: Create College and Department
        const collegeBody: any = {
          college_name: capitalizeFLetter(state.college_name),
          college_code: capitalizeFLetter(state.college_code),
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: capitalizeFLetter(state.college_address),
          institution: state?.institution?.value,
          college_hr: state.college_hr?.value,
          nirf_band_id: state.nirf_band?.value ?? "",
          // nirf_category_id: state.nirf_category?.value ?? "",
          intake_per_year: Number(state.intake_per_year),
          total_strength: Number(state.total_strength),
          summary: state.summary,
          recent_achievements: state.recent_achievements,
        };

        if (state.college_type?.length > 0) {
          collegeBody.college_type_ids = state.college_type?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.college_type_ids = [];
        }

        if (state.nirf_category?.length > 0) {
          collegeBody.nirf_category_ids = state.nirf_category?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.nirf_category_ids = [];
        }

        if (state.naac_accreditation?.length > 0) {
          collegeBody.naac_accreditation_ids = state.naac_accreditation?.map(
            (item) => item?.value
          );
        } else {
          collegeBody.naac_accreditation_ids = [];
        }

        if (state.newImages?.length > 0 && state.images?.length === 0) {
          collegeBody.college_logo = state.newImages[0];
        } else {
          collegeBody.college_logo = null;
        }

        await CreateCollege.validate(collegeBody, { abortEarly: false });

        if (!state.department_name) {
          Failure("Department name is required");
        }

        let createdRecords = { collegeId: null, departmentId: null };

        try {
          // Step 2.1: Create college first
          const formData = buildFormData(collegeBody);
          const collegeRes: any = await Models.college.create(formData);
          createdRecords.collegeId = collegeRes?.id;

          const deptBody = {
            department_name: state.department_name,
            // department_code: state.department_code,
            college: createdRecords.collegeId,
            institution: state?.institution?.value,
            intake_per_year: Number(state.dept_intake_per_year),
            summary: capitalizeFLetter(state.dept_summary),
            recent_achievements: state.recent_dept_achievements,
            nba_accreditation: state.isNBAAccreditation,
          };

          const deptRes: any = await Models.department.create(deptBody);
          createdRecords.departmentId = deptRes?.id;

          Success("College and Department created successfully!");
          handleCloseModal();
          collegeTableList(state.page);
        } catch (error) {
          console.error("Step 2 Error Details:", error);

          // Show step-specific error message
          if (createdRecords.collegeId && !createdRecords.departmentId) {
            Failure(
              "Step 2.2 failed: Department creation failed. College was created but removed due to error."
            );
          } else {
            Failure("Step 2.1 failed: College creation failed.");
          }

          await rollbackCreatedRecords(createdRecords);
        }
      }
    } catch (error: any) {
      console.log("✌️error --->", error);
      if (error?.inner) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setState({ errors });
        return;
      } else {
        // Handle API errors with specific field messages
        if (error?.response?.data) {
          const apiErrors = {};
          Object.keys(error.response.data).forEach((field) => {
            if (Array.isArray(error.response.data[field])) {
              apiErrors[field] = error.response.data[field][0];
            } else {
              apiErrors[field] = error.response.data[field];
            }
          });
          setState({ errors: apiErrors });
          return;
        }

        if (error?.data?.non_field_errors?.length > 0) {
          Failure(error?.response?.data?.non_field_errors?.[0]);
        } else {
          Failure(
            `Step ${state.currentStep} failed: ${
              error?.data?.error ||
              error?.message ||
              "Creation failed. Please try again."
            }`
          );
        }
      }
    } finally {
      setState({ submitting: false });
    }
  };

  console.log("✌️state.college_logo? --->", state.college_logo);

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      // If activeTab is departments, show single step department form
      if (state.activeTab === "departments") {
        const body: any = {
          department_name: capitalizeFLetter(state.department_name),
          // department_code: state.department_code,
          college: state.college?.value,
          intake_per_year: Number(state.dept_intake_per_year),
          summary: capitalizeFLetter(state.dept_summary),
          recent_achievements: state.recent_dept_achievements,
          nba_accreditation: state.isNBAAccreditation,
        };

        // Validate all department fields at once
        const validationBody = {
          college: state.college?.value,
          department_name: state.department_name,
          // deptHod: state.deptHod,
          // department_code: state.department_code,
        };

        const errors: any = {};

        // Check all required fields
        if (!validationBody.college) {
          errors.college = "Please select a college";
        }
        if (!validationBody.department_name) {
          errors.department_name = "Department name is required";
        }

        // if (!validationBody.deptHod) {
        //   errors.deptHod = "Department hod is required";
        // }
        // if (!validationBody.department_code) {
        //   errors.department_code = "Department code is required";
        // }

        // If any validation errors, show all at once
        if (Object.keys(errors).length > 0) {
          setState({ errors });
          return;
        }

        // Clear errors if validation passes
        setState({ errors: {} });

        if (state.college?.value) {
          const res: any = await Models.college.details(state.college?.value);
          body.institution = res?.institution;
        }
        if (state.deptHod?.value) {
          body.hod_id = state.deptHod?.value;
        } else {
          body.hod_id = null;
        }

        if (state.editId) {
          const res = await Models.department.update(body, state.editId);
          Success("Department updated successfully!");
        } else {
          const res = await Models.department.create(body);
          Success("Department created successfully!");
        }

        deptList(state.page);
        handleCloseModal();
        return;
      }

      // College wizard flow
      if (state.currentStep === 1) {
        const body: any = {
          college_name: capitalizeFLetter(state.college_name),
          college_code: capitalizeFLetter(state.college_code),
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: capitalizeFLetter(state.college_address),
          institution: state?.institution?.value,
          college_hr: state?.college_hr?.value,
          nirf_band_id: state.nirf_band?.value ?? "",
          // nirf_category_id: state.nirf_category?.value ?? "",
          intake_per_year: Number(state.intake_per_year),
          total_strength: Number(state.total_strength),
          summary: state.summary,
          recent_achievements: state.recent_achievements,
        };

        if (state.college_type?.length > 0) {
          body.college_type_ids = state.college_type?.map(
            (item) => item?.value
          );
        } else {
          body.college_type_ids = [];
        }

        if (state.nirf_category?.length > 0) {
          body.nirf_category_ids = state.nirf_category?.map(
            (item) => item?.value
          );
        } else {
          body.nirf_category_ids = [];
        }

        if (state.naac_accreditation?.length > 0) {
          body.naac_accreditation_ids = state.naac_accreditation?.map(
            (item) => item?.value
          );
        } else {
          body.naac_accreditation_ids = [];
        }

        if (state.newImages?.length > 0 && state.images?.length === 0) {
          body.college_logo = state.newImages[0];
        } else {
          body.college_logo = null;
        }

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
          const formData = buildFormData(body);
          const res = await Models.college.update(formData, state.editId);
          Success("College updated successfully!");
          handleCloseModal();
        } else {
          // Just validate and move to next step, don't create college yet
          // Success("College details saved!");

          // Move to next step without creating college
          setState({
            currentStep: 2,
            completedSteps: [1],
            errors: {},
          });
          return; // Don't close modal, move to step 2
        }
      } else if (state.currentStep === 2) {
        // Validate department details and move to step 3
        if (!state.department_name) {
          setState({
            errors: {
              department_name: "Department name is required",
              // department_code: "Department code is required",
            },
          });
          return;
        }

        // Success("Department details saved!");
        setState({
          currentStep: 3,
          completedSteps: [1, 2],
          errors: {},
        });
      } else if (state.currentStep === 3) {
        // Validate HOD details and create all entities
        const hodBody = {
          hod_username: capitalizeFLetter(state.hod_username),
          hod_email: state.hod_email,
          hod_password: state.hod_password,
          hod_confirm_password: state.hod_confirm_password,
          hod_phone: state.hod_phone,
          hod_gender: state.hod_gender?.value,
          hod_qualification: capitalizeFLetter(state.hod_qualification),
        };

        try {
          await CreateHOD.validate(hodBody, { abortEarly: false });
        } catch (validationError: any) {
          const errors = {};
          validationError.inner.forEach((error: any) => {
            errors[error.path] = error.message;
          });
          setState({ errors });
          return;
        }

        let createdRecords = {
          collegeId: null,
          departmentId: null,
          hodId: null,
        };

        try {
          // Step 3.1: Create college first
          const collegeBody: any = {
            college_name: capitalizeFLetter(state.college_name),
            college_code: capitalizeFLetter(state.college_code),
            college_email: state.college_email,
            college_phone: state.college_phone,
            college_address: capitalizeFLetter(state.college_address),
            institution: state?.institution?.value,
            college_hr: state?.college_hr?.value,

            nirf_band_id: state.nirf_band?.value ?? "",
            // nirf_category_id: state.nirf_category?.value ?? "",
            intake_per_year: Number(state.intake_per_year),
            total_strength: Number(state.total_strength),
            summary: state.summary,
            recent_achievements: state.recent_achievements,
          };

          if (state.college_type?.length > 0) {
            collegeBody.college_type_ids = state.college_type?.map(
              (item) => item?.value
            );
          } else {
            collegeBody.college_type_ids = [];
          }

          if (state.nirf_category?.length > 0) {
            collegeBody.nirf_category_ids = state.nirf_category?.map(
              (item) => item?.value
            );
          } else {
            collegeBody.nirf_category_ids = [];
          }

          if (state.naac_accreditation?.length > 0) {
            collegeBody.naac_accreditation_ids = state.naac_accreditation?.map(
              (item) => item?.value
            );
          } else {
            collegeBody.naac_accreditation_ids = [];
          }

          if (state.newImages?.length > 0 && state.images?.length === 0) {
            collegeBody.college_logo = state.newImages[0];
          } else {
            collegeBody.college_logo = null;
          }

          const collegeformData = buildFormData(collegeBody);

          const collegeRes: any = await Models.college.create(collegeformData);
          createdRecords.collegeId = collegeRes?.id;

          // Step 3.2: Create department with the created college ID
          const deptBody = {
            department_name: capitalizeFLetter(state.department_name),
            // department_code: state.department_code,
            college: collegeRes?.id,
            institution: state?.institution?.value,
            intake_per_year: Number(state.dept_intake_per_year),
            summary: capitalizeFLetter(state.dept_summary),
            recent_achievements: state.recent_dept_achievements,
            nba_accreditation: state.isNBAAccreditation,
          };

          const deptRes: any = await Models.department.create(deptBody);
          createdRecords.departmentId = deptRes?.id;

          // Step 3.3: Create HOD with the created department ID
          const finalHodBody = {
            username: capitalizeFLetter(state.hod_username),
            email: state.hod_email,
            password: state.hod_password,
            password_confirm: state.hod_confirm_password,
            phone: state.hod_phone,
            role: "hod",
            status: "active",
            gender: state.hod_gender?.value,
            education_qualification: capitalizeFLetter(state.hod_qualification),
            department: deptRes?.id,
          };
          const formData = buildFormData(finalHodBody);

          const hodRes: any = await Models.auth.createUser(formData);
          createdRecords.hodId = hodRes?.id;

          Success("College, Department and HOD created successfully!");
          handleCloseModal();
          collegeTableList(state.page);
        } catch (error: any) {
          console.error("Step 3 Error Details:", error);

          // Show step-specific error message based on what was created
          if (
            createdRecords.collegeId &&
            createdRecords.departmentId &&
            !createdRecords.hodId
          ) {
            if (error?.response?.data) {
              const apiErrors = error.response.data;
              let errorMessages = [];

              Object.keys(apiErrors).forEach((field) => {
                if (Array.isArray(apiErrors[field])) {
                  apiErrors[field].forEach((msg) => {
                    errorMessages.push(`${field}: ${msg}`);
                  });
                } else {
                  errorMessages.push(`${field}: ${apiErrors[field]}`);
                }
              });

              throw new Error(
                `Hod  creation failed:\n${errorMessages.join("\n")}`
              );
            }
            throw new Error(`hod  creation failed: ${error?.message}`);
          } else if (createdRecords.collegeId && !createdRecords.departmentId) {
            if (error?.response?.data) {
              const apiErrors = error.response.data;
              let errorMessages = [];

              Object.keys(apiErrors).forEach((field) => {
                if (Array.isArray(apiErrors[field])) {
                  apiErrors[field].forEach((msg) => {
                    errorMessages.push(`${field}: ${msg}`);
                  });
                } else {
                  errorMessages.push(`${field}: ${apiErrors[field]}`);
                }
              });

              throw new Error(
                `Department  creation failed:\n${errorMessages.join("\n")}`
              );
            }
            throw new Error(`Department  creation failed: ${error?.message}`);
          } else {
            if (error?.response?.data) {
              const apiErrors = error.response.data;
              let errorMessages = [];
              Object.keys(apiErrors).forEach((field) => {
                if (Array.isArray(apiErrors[field])) {
                  apiErrors[field].forEach((msg) => {
                    errorMessages.push(`${field}: ${msg}`);
                  });
                } else {
                  errorMessages.push(`${field}: ${apiErrors[field]}`);
                }
              });
              Failure(` College creation failed:\n${errorMessages.join("\n")}`);
            } else {
              Failure("College creation failed.");
            }
          }

          // Rollback created records on error
          await rollbackCreatedRecords(createdRecords);
        }
      }
    } catch (error: any) {
      if (error?.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach((field) => {
          if (Array.isArray(error.response.data[field])) {
            apiErrors[field] = error.response.data[field][0];
          } else {
            apiErrors[field] = error.response.data[field];
          }
        });
        setState({ errors: apiErrors });
        return;
      }
      Failure(error?.message || "Operation failed. Please try again.");
    } finally {
      setState({ submitting: false });
    }
  };

  const updateCollege = async () => {
    try {
      setState({ clgLoading: true });
      const body: any = {
        college_name: capitalizeFLetter(state.college_name),
        college_code: capitalizeFLetter(state.college_code),
        college_email: state.college_email,
        college_phone: state.college_phone,
        college_address: capitalizeFLetter(state.college_address),
        institution: state?.institution?.value,
        college_hr: state?.college_hr?.value,
        nirf_band_id: state.nirf_band?.value ?? "",
        // nirf_category_id: state.nirf_category?.value ?? "",
        intake_per_year: Number(state.intake_per_year),
        total_strength: Number(state.total_strength),
        summary: state.summary,
        recent_achievements: state.recent_achievements,
      };

      if (state.college_type?.length > 0) {
        body.college_type_ids = state.college_type?.map((item) => item?.value);
      } else {
        body.college_type_ids = [];
      }

      if (state.nirf_category?.length > 0) {
        body.nirf_category_ids = state.nirf_category?.map(
          (item) => item?.value
        );
      } else {
        body.nirf_category_ids = [];
      }

      if (state.naac_accreditation?.length > 0) {
        body.naac_accreditation_ids = state.naac_accreditation?.map(
          (item) => item?.value
        );
      } else {
        body.naac_accreditation_ids = [];
      }

      if (state.newImages?.length > 0 && state.images?.length === 0) {
        body.college_logo = state.newImages[0];
      } else if (state.college_logo?.length > 0) {
        body.college_logo = state.college_logo[0];
      } else {
        body.college_logo = null;
      }
      console.log("✌️body --->", body);

      await CreateCollege.validate(body, { abortEarly: false });
      const formData = buildFormData(body);
      const res = await Models.college.update(formData, state.editId);
      collegeTableList(1);
      handleCloseModal();
      Success("College updated successfully!");
    } catch (error) {
      setState({ clgLoading: false });
      if (error?.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach((field) => {
          if (Array.isArray(error.response.data[field])) {
            apiErrors[field] = error.response.data[field][0];
          } else {
            apiErrors[field] = error.response.data[field];
          }
        });
        setState({ errors: apiErrors });
        return;
      }
      Failure(error?.message || "Operation failed. Please try again.");
    }
  };

  const renderCollegeForm = () => (
    <div className="space-y-6">
      <CustomSelect
        options={state.institutionList}
        value={state.institution}
        onChange={(selectedOption) => {
          setState({
            institution: selectedOption,
            errors: { ...state.errors, institution: "" },
          });
        }}
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
      <CustomSelect
        title="College Type"
        options={state.college_type_list}
        value={state.college_type}
        onChange={(selectedOption) =>
          handleFormChange("college_type", selectedOption)
        }
        isMulti={true}
        placeholder="College Type"
        error={state.errors.college_type}
      />
      <UpdatePropertyImagePreview
        existingImages={
          state.college_logo?.length > 0 ? state.college_logo : []
        }
        onImagesChange={(newImages) => setState({ newImages })}
        onDeleteImage={(imageUrl) => {
          setState({
            college_logo: state.college_logo.filter((img) => img !== imageUrl),
          });
        }}
        maxFiles={1}
        title="College Logo"
        description="Upload college logo (JPEG or PNG)"
        validateDimensions={false}
        isSingleImage={true}
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

        <CustomSelect
          options={state.hrOptions}
          value={state.college_hr}
          onChange={(selectedOption) => {
            setState({
              college_hr: selectedOption,
            });
          }}
          onSearch={(searchTerm) => HRList(1, searchTerm)}
          placeholder="Assign HR"
          isClearable={true}
          loadMore={() => state.hrNext && HRList(state.hrPage + 1, "", true)}
          loading={state.hrLoading}
          title="Assign HR"
        />
      </div>
      <TextArea
        title="Address"
        placeholder="Enter college address"
        value={state.college_address}
        onChange={(e) => handleFormChange("college_address", e.target.value)}
        error={state.errors.college_address}
        rows={3}
        required
      />

      <CustomSelect
        title="NAAC Accreditation"
        options={state.naac_accreditation_list}
        value={state.naac_accreditation}
        onChange={(selectedOption) =>
          handleFormChange("naac_accreditation", selectedOption)
        }
        isMulti={true}
        placeholder="NAAC Accreditation"
      />

      <CustomSelect
        title="NIRF Band"
        options={state.nirf_band_list}
        value={state.nirf_band}
        onChange={(selectedOption) =>
          handleFormChange("nirf_band", selectedOption)
        }
        placeholder="NIRF Band"
      />

      <CustomSelect
        title="NIRF Category"
        options={state.nirf_category_list}
        value={state.nirf_category}
        onChange={(selectedOption) =>
          handleFormChange("nirf_category", selectedOption)
        }
        isMulti={true}
        placeholder="NIRF Category"
      />

      <NumberInput
        title="Intake Per Year"
        value={state.intake_per_year}
        onChange={(e) => handleFormChange("intake_per_year", e.target.value)}
        placeholder="Intake Per Year"
      />
      <NumberInput
        title="Total Strength"
        value={state.total_strength}
        onChange={(e) => handleFormChange("total_strength", e.target.value)}
        placeholder="Total Strength"
      />

      <DynamicAchievementInput
        title="Achivements"
        placeholder="Enter achivessments"
        defaultValue={state.recent_achievements}
        onChange={(data: any) => setState({ recent_achievements: data })}
      />
      <TextArea
        title="Summary"
        placeholder="Enter college summary"
        value={state.summary}
        onChange={(e) => handleFormChange("summary", e.target.value)}
        rows={3}
      />
    </div>
  );

  const renderDepartmentForm = () => (
    <div className="space-y-6">
      {state.activeTab === "departments" && (
        <>
          <CustomSelect
            options={state.institutionList}
            value={state.institution}
            onChange={(selectedOption) => {
              if (selectedOption) {
                setState({
                  institution: selectedOption,
                  errors: { ...state.errors, institution: "" },
                  seletedInstitution: selectedOption,
                  college: null,
                  depdHod: null,
                });
                collegeDropdownList(1, "", false, selectedOption);
              }
            }}
            onSearch={(searchTerm) => institutionDropdownList(1, searchTerm)}
            placeholder="Select Institution"
            loadMore={() =>
              state.institutionNext &&
              institutionDropdownList(state.instituitonPage + 1, "", true)
            }
            loading={state.instituitonLoading}
            title="Select Institution"
            error={state.errors.instituiton}
            required
          />
          <CustomSelect
            options={state.collegeDropdownList}
            value={state.college}
            onChange={(selectedOption) => {
              if (selectedOption) {
                deptHodDropdownList(1, "", false, selectedOption?.value);
                setState({
                  deptHod: null,
                });
              } else {
                setState({
                  deptHod: null,
                  errors: { ...state.errors, deptHod: "" },
                });
              }
              setState({
                college: selectedOption,
                errors: { ...state.errors, college: "" },
              });
            }}
            onSearch={(searchTerm) =>
              collegeDropdownList(
                1,
                searchTerm,
                false,
                state.seletedInstitution
              )
            }
            placeholder="Select College"
            isClearable={true}
            loadMore={() =>
              state.collegeNext &&
              collegeDropdownList(
                state.collegePage + 1,
                "",
                true,
                state.seletedInstitution
              )
            }
            loading={state.collegeLoading}
            title="Select College"
            error={state.errors.college}
            required
            disabled={!state.institution}
          />

          <CustomSelect
            options={state.deptHodDropdownList}
            value={state.deptHod}
            onChange={(selectedOption) =>
              setState({
                deptHod: selectedOption,
                errors: { ...state.errors, deptHod: "" },
              })
            }
            onSearch={(searchTerm) =>
              deptHodDropdownList(1, searchTerm, false, state.college?.value)
            }
            placeholder="Select HOD"
            isClearable={true}
            loadMore={() =>
              state.collegeNext &&
              deptHodDropdownList(
                state.deptHodPage + 1,
                "",
                true,
                state.college?.value
              )
            }
            loading={state.deptHodLoading}
            title="Select HOD"
            error={state.errors.deptHod}
            disabled={!state.college}
          />
        </>
      )}
      <div className="grid grid-cols-1 gap-6">
        <TextInput
          title="Department Name"
          placeholder="Enter department name"
          value={state.department_name}
          onChange={(e) => handleFormChange("department_name", e.target.value)}
          error={state.errors.department_name}
          required
        />
        <CheckboxInput
          checked={state.isNBAAccreditation}
          onChange={(e) =>
            setState({ isNBAAccreditation: !state.isNBAAccreditation })
          }
          label="NBA Accreditation"
        />

        <NumberInput
          title="Intake Per Year"
          value={state.dept_intake_per_year}
          onChange={(e) =>
            handleFormChange("dept_intake_per_year", e.target.value)
          }
          placeholder="Intake Per Year"
        />

        <DynamicAchievementInput
          title="Achivements"
          placeholder="Enter achivessments"
          defaultValue={state.recent_dept_achievements}
          onChange={(data: any) => setState({ recent_dept_achievements: data })}
        />
        <TextArea
          title="Summary"
          placeholder="Enter department summary"
          value={state.dept_summary}
          onChange={(e) => handleFormChange("dept_summary", e.target.value)}
          rows={3}
        />
        {/* <TextInput
          title="Department Code"
          placeholder="Enter department code"
          value={state.department_code}
          onChange={(e) => handleFormChange("department_code", e.target.value)}
          error={state.errors.department_code}
          required
        /> */}
      </div>
    </div>
  );

  const renderHODForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Department HOD</h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="HOD Name"
          placeholder="Enter HOD name"
          value={state.hod_username}
          onChange={(e) => handleFormChange("hod_username", e.target.value)}
          error={state.errors.hod_username}
          required
        />
        <TextInput
          title="HOD Email"
          type="email"
          placeholder="hod@example.com"
          value={state.hod_email}
          onChange={(e) => handleFormChange("hod_email", e.target.value)}
          error={state.errors.hod_email}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextInput
          title="HOD Password"
          type={state.showHODPassword ? "text" : "password"}
          placeholder="Enter password"
          value={state.hod_password}
          onChange={(e) => handleFormChange("hod_password", e.target.value)}
          error={state.errors.hod_password}
          rightIcon={
            state.showHODPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )
          }
          rightIconOnlick={() =>
            setState({ showHODPassword: !state.showHODPassword })
          }
          required
        />
        <TextInput
          title="HOD Confirm Password"
          type={state.showHODConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={state.hod_confirm_password}
          onChange={(e) =>
            handleFormChange("hod_confirm_password", e.target.value)
          }
          error={state.errors.hod_confirm_password}
          rightIcon={
            state.showHODConfirmPassword ? (
              <IconEyeOff className="h-4 w-4" />
            ) : (
              <IconEye className="h-4 w-4" />
            )
          }
          rightIconOnlick={() =>
            setState({ showHODConfirmPassword: !state.showHODConfirmPassword })
          }
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomPhoneInput
          title="Phone Number"
          value={state.hod_phone}
          onChange={(value) => handleFormChange("hod_phone", value)}
          error={state.errors.hod_phone}
          required
        />
        <CustomSelect
          title="Gender"
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
          ]}
          value={state.hod_gender}
          onChange={(selectedOption) =>
            handleFormChange("hod_gender", selectedOption)
          }
          placeholder="Select Gender"
          error={state.errors.hod_gender}
          required
        />
      </div>
      <TextInput
        title="Qualification"
        placeholder="Enter qualification"
        value={state.hod_qualification}
        onChange={(e) => handleFormChange("hod_qualification", e.target.value)}
        error={state.errors.hod_qualification}
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
        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {college_code}
        </span>
      ),
    },
    {
      accessor: "college_name",
      title: "College Name",
      sortable: true,
      render: ({ college_name }) => (
        <div
          className="font-medium text-gray-900 dark:text-white"
          title={college_name}
        >
          {truncateText(college_name)}
        </div>
      ),
    },

    {
      accessor: "institution_name",
      title: "Institution",
      sortable: true,
      render: ({ institution_name }) => (
        <div
          className="font-medium text-gray-900 dark:text-white"
          title={institution_name}
        >
          {truncateText(institution_name)}
        </div>
      ),
    },

    {
      accessor: "college_email",
      title: "Email",
      sortable: true,
      render: ({ college_email }) => (
        <span
          title={college_email}
          className="text-gray-600 dark:text-gray-400"
        >
          {truncateText(college_email)}
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
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handleEdit(row)}
            className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 "
            title="Edit"
          >
            <IconEdit className="h-4 w-4" />
          </button>
          {/* <button
            onClick={() => handleToggleStatus(row)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              row.status === "active"
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
          </button> */}
          <button
            onClick={() => handleDelete(row)}
            className="flex  items-center justify-center rounded-lg text-red-600 transition-all duration-200"
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
      accessor: "department_name",
      title: "Department Name",
      sortable: true,
      render: ({ department_name }) => (
        <div
          title={department_name}
          className="font-medium text-gray-900 dark:text-white"
        >
          {truncateText(department_name, 30)}
        </div>
      ),
    },

    {
      accessor: "institution_name",
      title: "Institution ",
      sortable: true,
      render: ({ institution_name }) => (
        <div
          title={institution_name}
          className="font-medium text-gray-900 dark:text-white"
        >
          {truncateText(institution_name, 25)}
        </div>
      ),
    },
    {
      accessor: "college_name",
      title: "College ",
      sortable: true,
      render: ({ college_name }) => (
        <div
          title={college_name}
          className="font-medium text-gray-900 dark:text-white"
        >
          {truncateText(college_name, 25)}
        </div>
      ),
    },
    {
      accessor: "hod",
      title: "Department Head",
      sortable: true,
      render: ({ department_head }) => (
        <div
          title={department_head}
          className="text-gray-600 dark:text-gray-400"
        >
          {truncateText(department_head)}
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
      accessor: "actions",
      title: "Actions",
      textAlign: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="flex  items-center justify-center rounded-lg  text-blue-600 transition-all duration-200"
            title="Edit"
          >
            <IconEdit className="h-4 w-4" />
          </button>
          {/* <button
            onClick={() => handleToggleStatus(row)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              row.status === "active"
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
            title={row.status === "active" ? "Deactivate" : "Activate"}
          >
            {row.status === "active" ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
          </button> */}
          <button
            onClick={() => handleDelete(row)}
            className="flex h-8 w-8 items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
            title="Delete"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">Colleges & Departments</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage colleges and departments
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">
              Add {state.activeTab === "colleges" ? "College" : "Department"}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="inline-flex rounded-lg bg-white p-1 dark:bg-gray-800">
          <button
            onClick={() => handleTabChange("colleges")}
            className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "colleges"
                ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Colleges
          </button>
          <button
            onClick={() => handleTabChange("departments")}
            className={`rounded-md px-2 py-1 text-sm font-medium transition-all duration-200 ${
              state.activeTab === "departments"
                ? "bg-lyellow text-black shadow-sm dark:bg-gray-700 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Departments
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        {/* <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div> */}
        <div className="flex gap-4">
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
              options={state.institutionOptions}
              value={state.institutionFilter}
              onChange={handleInstitutionChange}
              placeholder="Select Institution"
              isClearable={true}
              isSearchable={true}
              onSearch={handleInstitutionSearch}
              loadMore={handleLoadMoreInstitutions}
              loading={state.institutionLoading}
            />
          </div>
          {state.activeTab === "departments" && (
            <div className="group relative z-50">
              <CustomSelect
                options={state.collegeFilterOptions}
                value={state.collegeFilter}
                onChange={handleCollegeFilterChange}
                placeholder="Select College"
                isClearable={true}
                isSearchable={true}
                onSearch={handleCollegeFilterSearch}
                loadMore={handleLoadMoreColleges}
                loading={state.collegeFilterLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {state.activeTab === "colleges" ? "Colleges" : "Departments"} List
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
              <div className="text-sm text-black ">
                {state.activeTab === "colleges"
                  ? state.collegeCount
                  : state.departmentCount}{" "}
                records found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-aut border border-gray-200 bg-white">
          <DataTable
            noRecordsText={`No ${state.activeTab} found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={
              state.activeTab === "colleges"
                ? state.collegeList || []
                : state.deptList || []
            }
            fetching={state.loading}
            selectedRecords={(state.activeTab === "colleges"
              ? state.collegeList || []
              : state.deptList || []
            ).filter((record) => state.selectedRecords.includes(record.id))}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r) => r.id) })
            }
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
              if (state.activeTab === "colleges") {
                collegeTableList(1);
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
        // closeIcon={true}
        open={state.showModal}
        close={handleCloseModal}
        // subTitle={
        //   state.activeTab === "colleges"
        //     ? "College & Department Setup"
        //     : "Add Department"
        // }
        renderComponent={() => (
          <div className="w-full max-w-4xl">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Progress Header */}
            {state.activeTab === "colleges" && (
              <div className="border-b py-6">
                <div className="scrollbar-hide overflow-x-auto">
                  <div className="flex min-w-max items-center justify-center gap-24 px-4">
                    {steps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center"
                        data-step={step.id}
                      >
                        <div
                          className={`
                          flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium
                          ${
                            isStepCompleted(step.id)
                              ? "bg-green-500 text-white"
                              : state.currentStep === step.id
                              ? "bg-dblue text-white"
                              : isStepAccessible(step.id)
                              ? "bg-gray-200 text-gray-600"
                              : "bg-gray-100 text-gray-400"
                          }
                        `}
                        >
                          {isStepCompleted(step.id) ? (
                            "✓"
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <span className="ml-2 whitespace-nowrap text-sm font-medium">
                          {step.name}
                        </span>
                        {index < steps.length - 1 && (
                          <div
                            className={`mx-8 h-0.5 w-16 ${
                              isStepCompleted(step.id)
                                ? "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[300px]">
              {state.activeTab === "departments" ? (
                renderDepartmentForm()
              ) : (
                <>
                  {state.currentStep === 1 && renderCollegeForm()}
                  {state.currentStep === 2 && renderDepartmentForm()}
                  {state.currentStep === 3 && renderHODForm()}
                </>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between border-t p-6">
              {state.activeTab === "departments" ? (
                <div className="flex w-full justify-end gap-4">
                  <button
                    onClick={() => handleCloseModal()}
                    disabled={state.submitting}
                    className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={state.submitting}
                    className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                  >
                    {state.submitting
                      ? "Loading..."
                      : state.editId
                      ? "Update Department"
                      : "Create Department"}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setState({
                        currentStep: Math.max(1, state.currentStep - 1),
                      })
                    }
                    disabled={state.currentStep === 1}
                    className="px-4 py-2 text-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {state.currentStep !== steps.length && (
                      <button
                        onClick={handleFinalSubmit}
                        disabled={state.submitting}
                        className="bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                      >
                        {state.submitting ? "Creating..." : "Submit"}
                      </button>
                    )}
                    {/* {state.currentStep < steps.length && ( */}
                    <button
                      onClick={handleSubmit}
                      disabled={state.submitting}
                      className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                    >
                      {state.submitting
                        ? "Creating..."
                        : state.currentStep === 1
                        ? "Save & Next"
                        : state.currentStep === 2
                        ? "Save & Next"
                        : "Submit"}
                    </button>
                    {/* )} */}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      />
      <Modal
        open={state.showEditModal}
        close={handleCloseModal}
        addHeader={
          state.activeTab === "colleges"
            ? "College & Department Setup"
            : "Add Department"
        }
        renderComponent={() => (
          <div className="w-full max-w-4xl">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {/* Progress Header */}

            {/* Step Content */}
            <div className="min-h-[300px]">
              {renderCollegeForm()}
              {/* {state.activeTab === "departments" ? (
                renderDepartmentForm()
              ) : (
                <>
                  {state.currentStep === 1 && renderCollegeForm()}
                  {state.currentStep === 2 && renderDepartmentForm()}
                  {state.currentStep === 3 && renderHODForm()}
                </>
              )} */}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between  p-6">
              {/* {state.activeTab === "departments" ? ( */}
              <div className="flex w-full justify-end gap-4">
                <button
                  onClick={handleCloseModal}
                  disabled={state.submitting}
                  className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCollege()}
                  disabled={state.submitting}
                  className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                >
                  {state.clgLoading ? "Updating..." : "Update College"}
                </button>
              </div>
              {/* ) : (
                <>
                  <button
                    onClick={() =>
                      setState({
                        currentStep: Math.max(1, state.currentStep - 1),
                      })
                    }
                    disabled={state.currentStep === 1}
                    className="px-4 py-2 text-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {state.currentStep !== steps.length && (
                      <button
                        onClick={handleFinalSubmit}
                        disabled={state.submitting}
                        className="rounded-lg bg-dblue px-6 py-2 text-white disabled:opacity-50"
                      >
                        {state.submitting ? "Creating..." : "Submit"}
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={state.submitting}
                      className="rounded-lg bg-dblue px-6 py-2 text-white hover:bg-dblue disabled:opacity-50"
                    >
                      {state.submitting
                        ? "Creating..."
                        : state.currentStep === 1
                        ? "Save & Next"
                        : state.currentStep === 2
                        ? "Save & Next"
                        : "Submit"}
                    </button>
                  </div>
                </>
              )} */}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(CollegeAndDepartment);
