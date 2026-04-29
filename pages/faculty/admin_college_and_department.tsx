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
import * as Yup from "yup";

import {
  GraduationCap,
  BookOpen,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import Pagination from "@/components/pagination/pagination";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  objIsEmpty,
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
import IconUser from "@/components/Icon/IconUser";
import Link from "next/link";
import IconPencilPaper from "@/components/Icon/IconPencilPaper";
import * as Validation from "@/utils/validation.utils";
import { RECORDS_FOR_ADMIN } from "@/utils/constant.utils";
import ImageUpload from "@/components/ImageUploadWithPreview/imageUpload.component";

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
    master_department: [],
    deptMoreDetail: false,
    departmentData: [], // array of { dept, intake_per_year, isNBAAccreditation, summary, recent_achievements }
    oldDept: [],
    college_logo: [],
    isOpenLeadInfo: false,
    isOpenDeptInfo: false,
    sortingFilter: {
      value: 1,
      label: "All Records",
    },
  });

  const isStepCompleted = (stepId: number) =>
    state.completedSteps.includes(stepId);



  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Colleges & Departments"));
    institutionList(1);
    loadInstitutionOptions(1); // Load institutions for filter dropdown
    college_type();
    naac_accreditations();
    nirf_band(), nirf_category();
    // master_department();
    categoryList();
    HRList();
    locationList();
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
      collegeTableList(1);
  }, [
    debounceSearch,
    state.statusFilter,
    state.institutionFilter,
    state.collegeFilter,
    state.sortBy,
    state.sortingFilter,
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
        department: item?.department_extras,
        is_legacy: item.is_legacy,
        short_name: item?.short_name,
        category: item?.job_categories,
        location_id: item?.location_id &&
          item?.location_name && {
            value: item?.location_id,
            label: item?.location_name,
          },
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
      // console.error("Error fetching institutions:", error);
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
      // console.error("Error fetching HR users:", error);
    }
  };

  const locationList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ hrLoading: true });
      const body = {
        role: "hr",
        search,
      };
      const res: any = await Models.master.location_list(page, body);
      const dropdown = Dropdown(res?.results, "city");
      setState({
        locOptions: loadMore ? [...state.locOptions, ...dropdown] : dropdown,
        locLoading: false,
        locPage: page,
        locNext: res?.next,
      });
    } catch (error) {
      setState({ hrLoading: false });
      // console.error("Error fetching HR users:", error);
    }
  };

  const categoryList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ catLoading: true });
      const body = {
        search,
      };
      const res: any = await Models.master.category_list(body, page);

      const dropdown = Dropdown(res?.results, "name");
      setState({
        categoryOption: loadMore
          ? [...state.categoryOption, ...dropdown]
          : dropdown,
        catLoading: false,
        catPage: page,
        catNext: res?.next,
      });
    } catch (error) {
      setState({ hrLoading: false });
      // console.error("Error fetching HR users:", error);
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
      // console.error("Error fetching colleges:", error);
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
      // console.error("Error fetching colleges:", error);
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
      // console.error("Error fetching institutions:", error);
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
        college_short_name: item?.college_short_name,
        dept_intake_per_year: item?.intake_per_year,
        dept_summary: item?.summary,
        recent_dept_achievements: item?.recent_achievements,
        isNBAAccreditation: item?.nba_accreditation,
        department_extras:
          item?.department_extras?.length > 0
            ? [item.department_extras?.[0]]
            : null,
        short_name: item?.short_name,
      }));

      setState({
        loading: false,
        departmentNext: res?.next,
        departmentPrev: res?.prev,
        departmentCount: res?.count,
        deptList: tableData,
        deptPage: page,
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

  const master_department = async (
    page = 1,
    search = "",
    loadMore = false,
    catId = null
  ) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.is_approved = "Yes";
      body.pagination = "No";
      if (catId?.length > 0) {
        body.job_category_id = catId?.map((item) => item?.value || item);
      }

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
    setState({ page: pageNumber, deptPage: pageNumber });
    if (state.activeTab === "departments") {
      deptList(pageNumber);
    } else {
      collegeTableList(pageNumber);
    }
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
      // console.error("Error loading institution options:", error);
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
      // console.error("Error loading college filter options:", error);
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
      college_logo: [],
      institution: null,
      department_name: "",
      category: [],
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
      department: null,
      departmentData: [],
      newImages: [],
      is_legacy: false,
      short_name: "",
      departmentsData: [],
      departments: [],
      editDeptId: false,
      location_id: null,
      isOpenLeadInfo: false,
      isOpenDeptInfo: false,
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
    return body;
  };

  const handleEdit = (row) => {
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
      college_hr: row?.college_hr
        ? {
            value: row?.college_hr?.id,
            label: row.college_hr?.username,
          }
        : null,
      college_logo: row.college_logo ? [row.college_logo] : [],
      showEditModal: false,
      intake_per_year: row.intake_per_year,
      total_strength: row.total_strength,
      summary: row.summary,
      recent_achievements: row.recent_achievements,
      is_legacy: row.is_legacy,
      short_name: row.short_name,
      location_id: row?.location_id,
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

    if (row.category?.length > 0) {
      setState({
        category: row.category?.map((item) => ({
          value: item?.id,
          label: item?.name,
        })),
      });
    } else {
      setState({ category: [] });
    }

    if (row.category?.length > 0) {
      master_department(
        1,
        "",
        false,
        row?.category?.map((item) => item?.id)
      );
    }

    if (row?.department?.length > 0) {
      const departmentData = row.department.map((item, i) => ({
        dept: {
          value: item?.department_master?.id,
          label: item?.department_master?.short_name,
        },
        intake_per_year: item?.intake_per_year || "",
        isNBAAccreditation: item?.nba_accreditation || false,
        summary: item?.summary || "",
        recent_achievements: item?.recent_achievements || [],
        open: i == 0,
        id: item?.id,
      }));
      setState({
        department: departmentData.map((d) => d.dept),
        departmentData,
        isOpenDeptInfo: true,
        oldDept: row?.department?.filter((item) => item?.id),
      });
    }
  };

  console.log("oldDept --->", state.oldDept);

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

        deptList(state.deptPage);
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
        deptList(state.deptPage);
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
        deptList(state.deptPage);
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
      // console.error("Rollback error:", rollbackError);
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
          // console.error("Step 2 Error Details:", error);

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

        deptList(state.deptPage);
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
          // console.error("Step 3 Error Details:", error);

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

  const createCollege = async () => {
    try {
      setState({ submitting: true });
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
        is_legacy: state.is_legacy,
        short_name: state.short_name || "",
        location_id: state.location_id?.value,
        category: state.category,
      };
      console.log("✌️collegeBody --->", collegeBody);
      await Validation.CreateCollege.validate(collegeBody, {
        abortEarly: false,
      });

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

      if (state.departmentData?.length > 0) {
        collegeBody.department_master_ids = state.departmentData?.map(
          (item) => item?.dept?.value
        );
      } else {
        collegeBody.department_master_ids = [];
      }

      if (state.category?.length > 0) {
        collegeBody.job_category_ids = state.category?.map(
          (item) => item?.value
        );
      } else {
        collegeBody.job_category_ids = [];
      }

      const collegeformData = buildFormData(collegeBody);

      const collegeRes: any = await Models.college.create(collegeformData);
      await Promise.all(
        state.departmentData.map((item) => {
          const deptBody = {
            college_id: collegeRes?.id,
            department_master_id: item.dept.value,
            intake_per_year: Number(item.intake_per_year) || 0,
            summary: capitalizeFLetter(item.summary),
            recent_achievements: item.recent_achievements,
            nba_accreditation: item.isNBAAccreditation,
          };

          return Models.department.create_dept_extra_data_each_college(
            deptBody
          );
        })
      );
      collegeTableList(1);
      handleCloseModal();
      Success("College created successfully");
    } catch (error) {
      console.log("✌️error --->", error);
      if (error instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        console.log("✌️validationErrors --->", validationErrors);
        if (!objIsEmpty(validationErrors)) {
          Failure("Fill all details");
        }
        setState({ errors: validationErrors });
      } else if (error?.data?.error) {
        Failure(error?.data?.error || "Operation failed. Please try again.");
      }
      setState({ submitting: false });
    } finally {
      setState({ submitting: false });
    }
  };

  const updateCollege = async () => {
    try {
      setState({ submitting: true });
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
        is_legacy: state.is_legacy,
        short_name: state.short_name,
        location_id: state.location_id?.value,
        category: state.category,
      };

      await Validation.CreateCollege.validate(body, {
        abortEarly: false,
      });

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

      if (state.college_logo?.length > 0) {
        body.college_logo = state.college_logo[0];
      } else if (state.newImages?.length > 0) {
        body.college_logo = state.newImages?.[0];
      } else {
        body.college_logo = null;
      }

      if (state.departmentData?.length > 0) {
        body.department_master_ids = state.departmentData?.map(
          (item) => item?.dept?.value
        );
      } else {
        body.department_master_ids = [];
      }

      if (state.category?.length > 0) {
        body.job_category_ids = state.category?.map((item) => item?.value);
      } else {
        body.job_category_ids = [];
      }
      console.log("✌️body --->", body);

      await CreateCollege.validate(body, { abortEarly: false });
      const formData = buildFormData(body);
      const res: any = await Models.college.update(formData, state.editId);
      const newDept = state.departmentData?.filter((item) => !item?.id);
      const updateDept = state.departmentData?.filter((item) => item?.id);

      if (newDept?.length > 0) {
        await Promise.all(
          newDept.map((item) => {
            const deptBody = {
              college_id: res?.id,
              department_master_id: item.dept.value,
              intake_per_year: Number(item.intake_per_year) || 0,
              summary: capitalizeFLetter(item.summary),
              recent_achievements: item.recent_achievements,
              nba_accreditation: item.isNBAAccreditation,
            };

            return Models.department.create_dept_extra_data_each_college(
              deptBody
            );
          })
        );
      }
      if (updateDept?.length > 0) {
        await Promise.all(
          updateDept.map((item) => {
            const deptBody = {
              college_id: res?.id,
              department_master_id: item.dept.value,
              intake_per_year: Number(item.intake_per_year) || 0,
              summary: capitalizeFLetter(item.summary),
              recent_achievements: item.recent_achievements,
              nba_accreditation: item.isNBAAccreditation,
            };

            return Models.department.update_dept_extra_data_each_college(
              deptBody,
              item?.id
            );
          })
        );
      }

      const oldDeptIds = state.oldDept?.map((item) => item.id);
      const currentIds = state.departmentData
        ?.filter((item) => item?.id)
        .map((item) => item.id);

      const deleteDept = oldDeptIds.filter(
        (item) => !currentIds.includes(item)
      );
      if (deleteDept?.length > 0) {
        deleteDept?.map((item) =>
          Models.department.delete_dept_extra_data_each_college(item)
        );
      }

      collegeTableList(1);
      handleCloseModal();
      Success("College updated successfully!");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        console.log("✌️validationErrors --->", validationErrors);
        if (!objIsEmpty(validationErrors)) {
          Failure("Fill all details");
        }

        setState({ errors: validationErrors });
      } else if (error?.data?.error) {
        Failure(error?.data?.error || "Operation failed. Please try again.");
      }
      setState({ submitting: false });
    } finally {
      setState({ submitting: false });
    }
  };

  console.log("✌️state.departmentData --->", state.departmentData);

  const handleDeptSubmit = async () => {
    try {
      if (state.editDeptId) {
        await Promise.all(
          state.departmentsData.map((item) => {
            const deptBody = {
              college_id: state.college?.value,
              department_master_id: item.dept.value,
              intake_per_year: Number(item.intake_per_year) || 0,
              summary: capitalizeFLetter(item.summary),
              recent_achievements: item.recent_achievements,
              nba_accreditation: item.isNBAAccreditation,
            };
            console.log("✌️deptBody --->", deptBody);

            return Models.department.update_dept_extra_data_each_college(
              deptBody,
              item?.id
            );
          })
        );
        Success("Department updated successfully");
      } else {
        const body = {
          college_id: state.college?.value,
          master_ids: state.departmentsData?.map((item) => item?.dept?.value),
          institution_id: state.institution?.value,
        };

        console.log("✌️body --->", body);

        const res = await Models.department.create_new(body);
        console.log("✌️res --->", res);

        await Promise.all(
          state.departmentsData.map((item) => {
            const deptBody = {
              college_id: state.college?.value,
              department_master_id: item.dept.value,
              intake_per_year: Number(item.intake_per_year) || 0,
              summary: capitalizeFLetter(item.summary),
              recent_achievements: item.recent_achievements,
              nba_accreditation: item.isNBAAccreditation,
            };
            console.log("✌️deptBody --->", deptBody);

            return Models.department.create_dept_extra_data_each_college(
              deptBody
            );
          })
        );

        Success("Department created successfully");
      }
      deptList(1);
      handleCloseModal();
    } catch (error) {
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
      Failure(error?.data?.error || "Operation failed. Please try again.");
    } finally {
      setState({ submitting: false });
    }
  };

  const renderCollegeForm = () => (
    <>
      <div className=" grid grid-cols-1 gap-4 pb-3 lg:grid-cols-4">
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
          title="College Short Name"
          placeholder="Enter short name"
          value={state.short_name}
          onChange={(e) => handleFormChange("short_name", e.target.value)}
          error={state.errors.short_name}
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
        <TextInput
          title="Email Address"
          type="email"
          placeholder="college@example.com"
          value={state.college_email}
          onChange={(e) => handleFormChange("college_email", e.target.value)}
          error={state.errors.college_email}
          required
        />
        {/* <UpdatePropertyImagePreview
          existingImages={
            state.college_logo?.length > 0 ? state.college_logo : []
          }
          onImagesChange={(newImages) => setState({ newImages })}
          onDeleteImage={(imageUrl) => {
            setState({
              college_logo: state.college_logo.filter(
                (img) => img !== imageUrl
              ),
            });
          }}
          maxFiles={1}
          title="College Logo"
          description="Upload college logo (JPEG or PNG)"
          validateDimensions={false}
          isSingleImage={true}
        /> */}

        {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"> */}

        <TextInput
          title="College Code"
          placeholder="Enter college code"
          value={state.college_code}
          onChange={(e) => handleFormChange("college_code", e.target.value)}
          error={state.errors.college_code}
          required
        />
        {/* </div> */}

        {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"> */}
        <CustomPhoneInput
          title="Phone Number"
          value={state.college_phone}
          onChange={(value) => handleFormChange("college_phone", value)}
          error={state.errors.college_phone}
          required
        />

        {/* </div> */}

        {/* <CustomSelect
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
        /> */}
        <CustomSelect
          options={state.locOptions}
          value={state.location_id}
          onChange={(selectedOption) => {
            setState({
              location_id: selectedOption,
            });
          }}
          onSearch={(searchTerm) => locationList(1, searchTerm)}
          placeholder="Select Location"
          isClearable={true}
          loadMore={() =>
            state.locNext && locationList(state.locPage + 1, "", true)
          }
          loading={state.locLoading}
          title="Select Location"
          required
          error={state.errors?.location_id}
        />
        <CustomSelect
          options={state.categoryOption}
          value={state.category}
          onChange={(selectedOption) => {
            setState({
              category: selectedOption,
              department: [],
              master_department: [],
              departmentData: [],
            });
            if (selectedOption) {
              master_department(1, "", false, selectedOption);
            }
          }}
          onSearch={(searchTerm) => categoryList(1, searchTerm)}
          placeholder="Select category"
          isClearable={true}
          isMulti={true}
          loadMore={() =>
            state.catNext && categoryList(state.catPage + 1, "", true)
          }
          loading={state.catLoading}
          title="Select category"
          error={state.errors?.category}
          required
        />

        <TextArea
          title="Address"
          placeholder="Enter college address"
          value={state.college_address}
          onChange={(e) => handleFormChange("college_address", e.target.value)}
          error={state.errors.college_address}
          rows={3}
          required
        />
        <div className="mt-7">
          <CheckboxInput
            checked={state.is_legacy}
            onChange={(e) => setState({ is_legacy: !state.is_legacy })}
            label="Is Legacy"
          />
        </div>

        <ImageUpload
          existingImages={state.college_logo}
          onDeleteImage={() => setState({ college_logo: [] })}
          onImagesChange={(image) => {
            setState({ newImages: image });
            console.log("✌️image --->", image);
          }}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-1 ">
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div
            className="flex w-full cursor-pointer items-center justify-between gap-3 bg-blue-50 px-4 py-3 dark:bg-gray-700"
            onClick={() => setState({ isOpenLeadInfo: !state.isOpenLeadInfo })}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center  ">
                {state.isOpenLeadInfo ? (
                  <img src={"/assets/images/arrowDown.svg"} height={10} />
                ) : (
                  <img src={"/assets/images/arrowUp.png"} height={10} />
                )}
              </div>
              <div className="text-base font-semibold text-gray-800 dark:text-white">
                Additional Details
              </div>
            </div>
          </div>
          {state.isOpenLeadInfo && (
            <div className=" grid  grid-cols-1 gap-4 p-4 lg:grid-cols-3">
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
                onChange={(e) =>
                  handleFormChange("intake_per_year", e.target.value)
                }
                placeholder="Intake Per Year"
              />
              <NumberInput
                title="Total Strength"
                value={state.total_strength}
                onChange={(e) =>
                  handleFormChange("total_strength", e.target.value)
                }
                placeholder="Total Strength"
              />
              <div></div>

              <DynamicAchievementInput
                title="Achivements"
                placeholder="Enter achivessments"
                defaultValue={state.recent_achievements}
                onChange={(data: any) =>
                  setState({ recent_achievements: data })
                }
              />
              <TextArea
                title="Summary"
                placeholder="Enter college summary"
                value={state.summary}
                onChange={(e) => handleFormChange("summary", e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <div
            className="flex w-full cursor-pointer items-center justify-between gap-3 bg-blue-50 px-4 py-3 dark:bg-gray-700"
            onClick={() => setState({ isOpenDeptInfo: !state.isOpenDeptInfo })}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full  dark:bg-gray-600">
                {state.isOpenDeptInfo ? (
                  <img src={"/assets/images/arrowDown.svg"} height={10} />
                ) : (
                  <img src={"/assets/images/arrowUp.png"} height={10} />
                )}
              </div>
              <div className="text-base font-semibold text-gray-800 dark:text-white">
                Department
              </div>
            </div>
          </div>
          {state.isOpenDeptInfo && (
            <>
              {(!state.category || state.category?.length === 0) && (
                <p
                  className="px-2  pt-2 text-sm text-red-600"
                  id={`${name}-error`}
                >
                  Please select college category
                </p>
              )}
              <div className="space-y-4 p-4">
                <CustomSelect
                  title="Department"
                  options={state.master_department}
                  value={state.department}
                  onChange={(selectedOption: any) => {
                    const existing = state.departmentData;
                    const updated = (selectedOption || []).map((opt) => {
                      const prev = existing?.find(
                        (d) => d.dept?.value === opt.value
                      );
                      return (
                        prev || {
                          dept: opt,
                          intake_per_year: "",
                          isNBAAccreditation: false,
                          summary: "",
                          recent_achievements: [],
                          open: true,
                        }
                      );
                    });

                    setState({
                      department: selectedOption,
                      departmentData: updated,
                    });
                  }}
                  onSearch={(e) =>
                    master_department(1, e, false, state.category)
                  }
                  loadMore={() => {
                    state.masterNext &&
                      master_department(
                        state.masterPage + 1,
                        "",
                        true,
                        state.category
                      );
                  }}
                  isMulti={true}
                  placeholder="Select department"
                />

                {state.departmentData?.map((item, index) => (
                  <div
                    key={item.dept.value}
                    className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between bg-gray-50 px-4 py-2 dark:bg-gray-700"
                      onClick={() => {
                        const updated = [...state.departmentData];
                        updated[index] = {
                          ...updated[index],
                          open: !item.open,
                        };
                        setState({ departmentData: updated });
                      }}
                    >
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {item.dept.label}
                      </span>
                      {item.open ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    {item.open && (
                      <div className="px-3 pb-4 pt-3">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <NumberInput
                            title="Intake Per Year"
                            value={item.intake_per_year}
                            onChange={(e) => {
                              const updated = [...state.departmentData];
                              updated[index] = {
                                ...updated[index],
                                intake_per_year: e.target.value,
                              };
                              setState({ departmentData: updated });
                            }}
                            placeholder="Intake Per Year"
                          />

                          <TextArea
                            title="Summary"
                            placeholder="Enter department summary"
                            value={item.summary}
                            onChange={(e) => {
                              const updated = [...state.departmentData];
                              updated[index] = {
                                ...updated[index],
                                summary: e.target.value,
                              };
                              setState({ departmentData: updated });
                            }}
                            rows={3}
                          />
                          <CheckboxInput
                            checked={item.isNBAAccreditation}
                            onChange={() => {
                              const updated = [...state.departmentData];
                              updated[index] = {
                                ...updated[index],
                                isNBAAccreditation: !item.isNBAAccreditation,
                              };
                              setState({ departmentData: updated });
                            }}
                            label="NBA Accreditation"
                          />
                        </div>
                        <DynamicAchievementInput
                          title="Achievements"
                          placeholder="Enter achievements"
                          defaultValue={item.recent_achievements}
                          onChange={(data: any) => {
                            const updated = [...state.departmentData];
                            updated[index] = {
                              ...updated[index],
                              recent_achievements: data,
                            };
                            setState({ departmentData: updated });
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  const renderDepartmentForm = () => (
    <>
      <div className="grid grid-cols-3 gap-6 pb-4">
        {!state.editDeptId && (
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
        )}
        {!state.editDeptId && (
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
        )}
        <CustomSelect
          title="Department"
          options={state.master_department}
          value={state.departments}
          onChange={(selectedOption: any) => {
            const existing = state.departmentData;
            const updated = (selectedOption || []).map((opt, i) => {
              const prev = existing?.find((d) => d.dept?.value === opt.value);
              return (
                prev || {
                  dept: opt,
                  intake_per_year: "",
                  isNBAAccreditation: false,
                  summary: "",
                  recent_achievements: [],
                  open: true,
                }
              );
            });
            setState({
              departments: selectedOption,
              departmentsData: updated,
            });
          }}
          isMulti={true}
          placeholder="Select department"
          disabled={state.editDeptId}
        />
        {/* <CustomSelect
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
        /> */}
      </div>
      <div className=" ">
        {state.departmentsData?.map((item, index) => (
          <div
            key={item.dept.value}
            className="mb-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div
              className="flex cursor-pointer items-center justify-between bg-gray-50 px-4 py-2 dark:bg-gray-700"
              onClick={() => {
                const updated = [...state.departmentsData];
                updated[index] = { ...updated[index], open: !item.open };
                setState({ departmentsData: updated });
              }}
            >
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {item.dept.label}
              </span>
              {item.open ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
            {item.open && (
              <div className="grid grid-cols-2 gap-3 px-3 py-3 ">
                <NumberInput
                  title="Intake Per Year"
                  value={item.intake_per_year}
                  onChange={(e) => {
                    const updated = [...state.departmentsData];
                    updated[index] = {
                      ...updated[index],
                      intake_per_year: e.target.value,
                    };
                    setState({ departmentsData: updated });
                  }}
                  placeholder="Intake Per Year"
                />

                <div className="lg:mt-8">
                  <CheckboxInput
                    checked={item.isNBAAccreditation}
                    onChange={() => {
                      const updated = [...state.departmentsData];
                      updated[index] = {
                        ...updated[index],
                        isNBAAccreditation: !item.isNBAAccreditation,
                      };
                      setState({ departmentsData: updated });
                    }}
                    label="NBA Accreditation"
                  />
                </div>
                <TextArea
                  title="Summary"
                  placeholder="Enter department summary"
                  value={item.summary}
                  onChange={(e) => {
                    const updated = [...state.departmentsData];
                    updated[index] = {
                      ...updated[index],
                      summary: e.target.value,
                    };
                    setState({ departmentsData: updated });
                  }}
                  rows={3}
                />
                <DynamicAchievementInput
                  title="Achievements"
                  placeholder="Enter achievements"
                  defaultValue={item.recent_achievements}
                  onChange={(data: any) => {
                    const updated = [...state.departmentsData];
                    updated[index] = {
                      ...updated[index],
                      recent_achievements: data,
                    };
                    setState({ departmentsData: updated });
                  }}
                  grid={false}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );

  const collegeColumns = [
    {
      accessor: "college_code",
      title: "College Code",
      sortable: true,
      render: (row) => (
        <div
          onClick={() => handleEdit(row)}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          {row?.college_code}
        </div>
      ),
    },
    {
      accessor: "short_name",
      title: "College Name",
      sortable: true,
      render: (row) => (
        <div
          onClick={() => handleEdit(row)}
          className="cursor-pointer font-medium text-gray-900 dark:text-white"
          title={row.short_name}
        >
          {row.short_name}
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
      accessor: "total_departments",
      title: "Total Applications",
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
      render: ({ short_name }) => (
        <div
          title={short_name}
          className="font-medium text-gray-900 dark:text-white"
        >
          {short_name}
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
      accessor: "college_short_name",
      title: "College ",
      sortable: true,
      render: ({ college_short_name }) => (
        <div
          title={college_short_name}
          className="font-medium text-gray-900 dark:text-white"
        >
          {college_short_name}
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

  const subTitle = () => {
    let title = "";
    if (state.activeTab === "colleges") {
      if (state.editId) {
        title = "Update College";
      } else {
        title = "Add New College";
      }
    } else {
      if (state.editDeptId) {
        title = "Update Department";
      } else {
        title = "Add New Department";
      }
    }
    return title;
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">
              Colleges and Deparments
            </h1>
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
            <span className="relative z-10">Add College</span>
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-4 ">
          <div className="flex gap-4">
            <div className="group relative">
              <TextInput
                placeholder={`Search colleges...`}
                value={state.search}
                onChange={(e) => setState({ search: e.target.value })}
                icon={<IconSearch className="h-4 w-4" />}
                className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
              />
            </div>
            <div className="group relative ">
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
          </div>
          {/* {state.activeTab === "colleges" && ( */}
          <div className="group relative z-50">
            <CustomSelect
              options={RECORDS_FOR_ADMIN}
              value={state.sortingFilter}
              onChange={(e) => setState({ sortingFilter: e })}
              placeholder={
               "All Records"
              }
              isClearable={false}
            />
          </div>
          {/* )} */}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              College List
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
            columns={collegeColumns}
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
        // isFullWidth
        maxWidth="max-w-7xl"
        // closeIcon={true}
        closeIcon
        open={state.showModal}
        close={handleCloseModal}
        subTitle={subTitle()}
        renderComponent={() => (
          <div className="w-full ">
            <style jsx>{`
              .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <div className="">
              {state.activeTab === "departments"
                ? renderDepartmentForm()
                : renderCollegeForm()}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t pt-3">
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
                    onClick={() => handleDeptSubmit()}
                    disabled={state.submitting}
                    className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                  >
                    {state.submitting ? "Creating..." : "Submit"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex w-full justify-end gap-2">
                    <button
                      onClick={() => handleCloseModal()}
                      disabled={state.submitting}
                      className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        state.editId ? updateCollege() : createCollege()
                      }
                      disabled={state.submitting}
                      className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
                    >
                      {state.submitting ? "Loading..." : "Submit"}
                    </button>
                    {/* )} */}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(CollegeAndDepartment);
