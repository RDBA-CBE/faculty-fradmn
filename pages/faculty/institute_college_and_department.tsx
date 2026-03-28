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
import { RECORDS_FOR_INS_ADMIN } from "@/utils/constant.utils";
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
    category: [],
    sortingFilter: {
      value: 1,
      label: "All Records",
    },
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Colleges & Departments"));
    college_type();
    naac_accreditations();
    nirf_band(), nirf_category();
    categoryList();
    locationList();
    profile();
  }, [dispatch]);

  useEffect(() => {
    if (state.profile) collegeTableList(1, state.profile?.institution?.id);
  }, [
    debounceSearch,
    state.statusFilter,
    state.institutionFilter,
    state.collegeFilter,
    state.sortBy,
    state.sortingFilter,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      collegeTableList(1, res?.institution?.id);
      HRList(1, "", false, res?.institution?.id);
      collegeDropdownList(1, "", false, state.profile?.institution?.id);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const collegeTableList = async (page, institutionId = null) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();

      if (institutionId) {
        body.institution = institutionId;
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

  const HRList = async (page = 1, search = "", loadMore = false, insId) => {
    try {
      setState({ hrLoading: true });
      const body: any = {
        role: "hr",
        search,
      };
      if (insId) {
        body.institution_id = insId;
      }
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
        body.institution = seletedInstitution;
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

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });

    collegeTableList(pageNumber, state.profile?.institution?.id);
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
      college_logo: [],
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
    console.log("✌️row --->", row);
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
      await Models.college.delete(id);
      Success("College deleted successfully!");
      collegeTableList(state.page, state.profile?.institution?.id);
    } catch (error) {
      Failure(
        `Failed to delete ${state.activeTab.slice(0, -1)}. Please try again.`
      );
    }
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.college.delete(id);
      }
      Success(`${state.selectedRecords.length} colleges deleted successfully!`);
      setState({ selectedRecords: [] });

      collegeTableList(state.page, state.profile?.institution?.id);
    } catch (error) {
      Failure(`Failed to delete ${state.activeTab}. Please try again.`);
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
        institution: state?.profile?.institution?.id,
        college_hr: state?.college_hr?.value,

        nirf_band_id: state.nirf_band?.value ?? "",
        // nirf_category_id: state.nirf_category?.value ?? "",
        intake_per_year: Number(state.intake_per_year),
        total_strength: Number(state.total_strength),
        summary: state.summary,
        recent_achievements: state.recent_achievements,
        is_legacy: state.is_legacy,
        short_name: capitalizeFLetter(state.short_name) || "",
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
      } else if (error?.error) {
        Failure(error?.error || "Operation failed. Please try again.");
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
        short_name: capitalizeFLetter(state.short_name),
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
      } else if (error?.error) {
        Failure(error?.error || "Operation failed. Please try again.");
      }
      setState({ submitting: false });
    } finally {
      setState({ submitting: false });
    }
  };

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
        <TextInput
          title="Institution"
          placeholder="Institution"
          value={state.profile?.institution?.name}
          onChange={(e) => handleFormChange("short_name", e.target.value)}
          disabled
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

        <CustomSelect
          options={state.hrOptions}
          value={state.college_hr}
          onChange={(selectedOption) => {
            setState({
              college_hr: selectedOption,
            });
          }}
          onSearch={(searchTerm) =>
            HRList(1, searchTerm, false, state.profile?.institution?.id)
          }
          placeholder="Assign HR"
          isClearable={true}
          loadMore={() =>
            state.hrNext &&
            HRList(state.hrPage + 1, "", true, state.profile?.institution?.id)
          }
          loading={state.hrLoading}
          title="Assign HR"
        />
        <CustomSelect
          options={state.locOptions}
          value={state.location_id}
          onChange={(selectedOption) => {
            setState({
              location_id: selectedOption,
              errors: { ...state.errors, location_id: "" },
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
              errors: { ...state.errors, category: "" },
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
              {(!state.category || state.category.length === 0) && (
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
                  disabled={!state.category || state.category.length === 0}
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

  const collegeColumns = [
    {
      accessor: "college_code",
      title: "College Code",
      sortable: true,
      render: (row) => (
        <span
          onClick={() => handleEdit(row)}
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          {capitalizeFLetter(row?.college_code)}
        </span>
      ),
    },
    {
      accessor: "short_name",
      title: "College Name",
      sortable: true,
      render: (row) => (
        <div
          className=" font-medium text-gray-900 dark:text-white"
          title={row?.short_name}
        >
          {capitalizeFLetter(row?.short_name)}
        </div>
      ),
    },

    // {
    //   accessor: "institution_name",
    //   title: "Institution",
    //   sortable: true,
    //   render: ({ institution_name }) => (
    //     <div
    //       className="font-medium text-gray-900 dark:text-white"
    //       title={institution_name}
    //     >
    //       {truncateText(institution_name)}
    //     </div>
    //   ),
    // },

    // {
    //   accessor: "college_email",
    //   title: "Email",
    //   sortable: true,
    //   render: ({ college_email }) => (
    //     <span
    //       title={college_email}
    //       className="text-gray-600 dark:text-gray-400"
    //     >
    //       {truncateText(college_email)}
    //     </span>
    //   ),
    // },
    // {
    //   accessor: "college_phone",
    //   title: "Phone",
    //   render: ({ college_phone }) => (
    //     <div className="text-gray-600 dark:text-gray-400">{college_phone}</div>
    //   ),
    // },

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
            <h1 className="page-ti text-transparent">Colleges and Deparments</h1>
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
      {/* <div className="mb-4">
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
      </div> */}

      {/* Filters Section */}
      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        {/* <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div> */}
        <div className="flex gap-4 ">
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
            {/* <CustomSelect
              options={state.collegeFilterOptions}
              value={state.collegeFilter}
              onChange={handleCollegeFilterChange}
              placeholder="Select College"
              isClearable={true}
              isSearchable={true}
              onSearch={(e) =>
                collegeDropdownList(1, e, false, state.profile?.institution?.id)
              }
              loadMore={() =>
                state.collegeNext &&
                collegeDropdownList(
                  state.collegePage + 1,
                  "",
                  true,
                  state.profile?.institution?.id
                )
              }
              loading={state.collegeFilterLoading}
            /> */}
          </div>
          {/* {state.activeTab === "colleges" && ( */}
          <div className="group relative z-50">
            <CustomSelect
              options={RECORDS_FOR_INS_ADMIN}
              value={state.sortingFilter}
              onChange={(e) => setState({ sortingFilter: e })}
              placeholder={"All Records"}
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

            <div className="">{renderCollegeForm()}</div>

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
