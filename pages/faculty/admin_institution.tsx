import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
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
import {
  Building2,
  User,
  GraduationCap,
  BookOpen,
  UserCheck,
  Briefcase,
  Play,
  Pause,
  ToggleLeft,
  ToggleRight,
  Hourglass,
  SlidersHorizontal,
} from "lucide-react";
import Pagination from "@/components/pagination/pagination";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  showDeleteAlert,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import {
  CreateInstituion,
  CreateInstitutionAdmin,
  CreateCollege,
  CreateCollegeForm,
  CreateHR,
  CreateHOD,
  CreateDepartment,
} from "@/utils/validation.utils";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import { GENDER_OPTION } from "@/utils/constant.utils";
import PrivateRouter from "@/hook/privateRouter";
import * as Yup from "yup";

const Institution = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    recordsData: [],
    totalRecords: 0,
    search: "",
    statusFilter: null,
    typeFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    showEditModal: false,

    // Wizard state
    currentStep: 1,
    completedSteps: [],

    // Selection state
    selectedRecords: [],

    // API response IDs
    institutionId: null,
    institutionAdminId: null,
    collegeId: null,
    hrId: null,
    departmentId: null,
    hodId: null,

    // Institution fields
    institution_name: "",
    institution_code: "",
    institution_email: "",
    institution_phone: "",
    address: "",

    // Admin fields
    admin_username: "",
    admin_email: "",
    admin_phone: "",
    admin_password: "",
    admin_confirm_password: "",
    admin_gender: null,
    admin_education_qualification: "",
    showAdminPassword: false,
    showAdminConfirmPassword: false,

    // HR fields
    hr_username: "",
    hr_email: "",
    hr_phone: "",
    hr_password: "",
    hr_confirm_password: "",
    hr_gender: null,
    hr_qualification: "",
    showHRPassword: false,
    showHRConfirmPassword: false,

    // College fields
    colleges: [],
    college_name: "",
    college_code: "",
    college_email: "",
    college_phone: "",
    college_address: "",

    // Department fields
    departments: [],
    department_name: "",
    // department_code: '',
    selectedCollege: null,

    // HOD fields
    hod_username: "",
    hod_email: "",
    hod_phone: "",
    hod_password: "",
    hod_confirm_password: "",
    hod_gender: null,
    hod_qualification: "",
    hod_experience: "",
    selectedDepartment: null,
    showHODPassword: false,
    showHODConfirmPassword: false,

    // Job fields
    job_title: "",
    job_description: "",
    job_requirements: "",
    job_salary_min: "",
    job_salary_max: "",
    job_department: null,

    errors: {},
    count: 0,
    instutionList: [],
    next: null,
    prev: null,
    editId: null,
    college_type_list: [],
    naac_accreditation_list: [],
    college_type: null,
    naac_accreditation: "",
    nirf_band: "",
    nirf_category: "",
    intake_per_year: "",
    total_strength: "",
    nirf_band_list: [],
    nirf_category_list: [],
    recent_achievements: [],
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Institution"));
  }, [dispatch]);

  useEffect(() => {
    instutionList(1);
    college_type();
    naac_accreditations();
    nirf_band(), nirf_category();
  }, []);

  useEffect(() => {
    instutionList(1);
  }, [debounceSearch, state.statusFilter, state.typeFilter, state.sortBy]);

  const create_institution = async () => {
    try {
      setState({ btnLoading: true });
      const institutionBody = {
        institution_name: capitalizeFLetter(state.institution_name),
        institution_code: capitalizeFLetter(state.institution_code),
        institution_email: state.institution_email,
        institution_phone: state.institution_phone,
        address: capitalizeFLetter(state.address),
      };
      await CreateInstituion.validate(institutionBody, { abortEarly: false });

      const institutionRes: any = await Models.institution.create(
        institutionBody
      );
      Success("Institution created successfully");
      handleCloseModal();
    } catch (error) {
      setState({ btnLoading: false });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ errors: validationErrors, btnLoading: false });
      } else {
        Failure(capitalizeFLetter(error?.response?.data?.error));
      }
      console.log(error);
    }
  };

  const handleUpdate = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        institution_name: capitalizeFLetter(state.institution_name),
        institution_code: capitalizeFLetter(state.institution_code),
        institution_email: state.institution_email,
        institution_phone: state.institution_phone,
        address: capitalizeFLetter(state.address),
      };
      await CreateInstituion.validate(body, { abortEarly: false });

      const res = await Models.institution.update(body, state.editId);
      instutionList(state.page);
      handleCloseModal();
      Success("Institution updated successfully!");
    } catch (error) {
      setState({ btnLoading: false });

      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ errors: validationErrors, btnLoading: false });
      } else {
        Failure(capitalizeFLetter(error?.response?.data?.error));
      }
    }
  };

  const handleFinishWizard = async () => {
    let createdRecords = {
      institutionId: null,
      institutionAdminId: null,
      collegeId: null,
      hrId: null,
      departmentId: null,
      hodId: null,
    };

    try {
      setState({ submitting: true });

      // Step 1: Create Institution
      if (state.completedSteps.includes(1)) {
        try {
          const institutionBody = {
            institution_name: capitalizeFLetter(state.institution_name),
            institution_code: capitalizeFLetter(state.institution_code),
            institution_email: state.institution_email,
            institution_phone: state.institution_phone,
            address: state.address,
          };
          const institutionRes: any = await Models.institution.create(
            institutionBody
          );
          console.log("✌️institutionRes --->", institutionRes);

          createdRecords.institutionId = institutionRes?.id;
        } catch (error: any) {
          throw new Error(`Institution creation failed: ${error?.message}`);
        }

        // Step 2: Create Institution Admin
        if (state.completedSteps.includes(2)) {
          try {
            const adminBody = {
              username: capitalizeFLetter(state.admin_username),
              email: state.admin_email,
              password: state.admin_password,
              password_confirm: state.admin_confirm_password,
              phone: state.admin_phone,
              role: "institution_admin",
              status: "active",
              gender: state.admin_gender?.value,
              education_qualification: capitalizeFLetter(
                state.admin_education_qualification
              ),
              institution: createdRecords.institutionId,
            };
            const formData = buildFormData(adminBody);

            const adminRes: any = await Models.auth.createUser(formData);
            createdRecords.institutionAdminId = adminRes?.id;
          } catch (error: any) {
            // Handle API validation errors
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
                `Institution Admin creation failed:\n${errorMessages.join(
                  "\n"
                )}`
              );
            }
            throw new Error(
              `Institution Admin creation failed: ${error?.message}`
            );
          }
        }

        // Step 3: Create College
        if (state.completedSteps.includes(3)) {
          try {
            const collegeBody: any = {
              college_name: capitalizeFLetter(state.college_name),
              college_code: capitalizeFLetter(state.college_code),
              college_email: state.college_email,
              college_phone: state.college_phone,
              college_address: capitalizeFLetter(state.college_address),
              institution: createdRecords.institutionId,
              nirf_band_id: state.nirf_band?.value ?? "",
              intake_per_year: Number(state.intake_per_year),
              total_strength: Number(state.total_strength),
              summary: capitalizeFLetter(state.summary),
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
              collegeBody.naac_accreditation_ids =
                state.naac_accreditation?.map((item) => item?.value);
            } else {
              collegeBody.naac_accreditation_ids = [];
            }

            if (state.newImages?.length > 0) {
              collegeBody.college_logo = state.newImages[0];
            } else {
              collegeBody.college_logo = null;
            }
            const formData = buildFormData(collegeBody);
            console.log("✌️collegeBody --->", collegeBody);

            const collegeRes: any = await Models.college.create(formData);
            createdRecords.collegeId = collegeRes?.id;
          } catch (error: any) {
            throw new Error(`College creation failed: ${error?.message}`);
          }

          // Step 4: Create HR
          if (state.completedSteps.includes(4)) {
            try {
              const hrBody = {
                username: capitalizeFLetter(state.hr_username),
                email: state.hr_email,
                password: state.hr_password,
                password_confirm: state.hr_confirm_password,
                phone: state.hr_phone,
                role: "hr",
                status: "active",
                gender: state.hr_gender?.value,
                education_qualification: capitalizeFLetter(
                  state.hr_qualification
                ),
                college: createdRecords.collegeId,
              };
              const formData = buildFormData(hrBody);

              const hrRes: any = await Models.auth.createUser(formData);
              createdRecords.hrId = hrRes?.id;
            } catch (error: any) {
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
                  `HR creation failed:\n${errorMessages.join("\n")}`
                );
              }
              throw new Error(`HR creation failed: ${error?.message}`);
            }
          }

          // Step 5: Create Department
          if (state.completedSteps.includes(5)) {
            try {
              const deptBody = {
                department_name: capitalizeFLetter(state.department_name),
                // department_code: state.department_code,
                college: createdRecords.collegeId,
                institution: createdRecords.institutionId,
                intake_per_year: Number(state.dept_intake_per_year),
                summary: capitalizeFLetter(state.dept_summary),
                recent_achievements: state.recent_dept_achievements,
                nba_accreditation: state.isNBAAccreditation,
              };
              const deptRes: any = await Models.department.create(deptBody);
              createdRecords.departmentId = deptRes?.id;
            } catch (error: any) {
              throw new Error(`Department creation failed: ${error?.message}`);
            }

            // Step 6: Create HOD
            // if (state.completedSteps.includes(6)) {
            try {
              const hodBody = {
                username: capitalizeFLetter(state.hod_username),
                email: state.hod_email,
                password: state.hod_password,
                password_confirm: state.hod_confirm_password,
                phone: state.hod_phone,
                role: "hod",
                status: "active",
                gender: state.hod_gender?.value,
                education_qualification: capitalizeFLetter(
                  state.hod_qualification
                ),
                department: createdRecords.departmentId,
              };
              const formData = buildFormData(hodBody);

              const hodRes: any = await Models.auth.createUser(formData);
              createdRecords.hodId = hodRes?.id;

              const updateData = {
                hod_id: hodRes?.id,
              };
              const deptRes: any = await Models.department.update(
                updateData,
                createdRecords.departmentId
              );
            } catch (error: any) {
              throw new Error(`HOD creation failed: ${error?.message}`);
            }
            // }
          }
        }
      }

      // Generate success message based on created entities
      let successMessage = "";
      const createdEntities = [];
      console.log("✌️createdRecords --->", createdRecords);

      if (createdRecords.institutionId) createdEntities.push("Institution");
      if (createdRecords.institutionAdminId) createdEntities.push("Admin");
      if (createdRecords.collegeId) createdEntities.push("College");
      if (createdRecords.hrId) createdEntities.push("HR");
      if (createdRecords.departmentId) createdEntities.push("Department");
      if (createdRecords.hodId) createdEntities.push("HOD");

      if (createdEntities.length > 0) {
        successMessage = `${createdEntities.join(
          " and "
        )} created successfully!`;
      } else {
        successMessage = "Setup completed successfully!";
      }

      Success(successMessage);
      handleCloseModal();
    } catch (error: any) {
      console.log("✌️error --->", error);
      // Rollback created records
      await rollbackCreatedRecords(createdRecords);
      Failure(
        error?.message || "Setup failed. All created records have been removed."
      );
    } finally {
      setState({ submitting: false });
    }
  };

  const rollbackCreatedRecords = async (records: any) => {
    console.log("✌️records --->", records);
    try {
      if (records.hodId) {
        await Models.auth.deleteUser(records.hodId);
        console.log("Deleted HOD:", records.hodId);
      }
      if (records.departmentId) {
        await Models.department.delete(records.departmentId);
        console.log("Deleted Department:", records.departmentId);
      }
      if (records.hrId) {
        await Models.auth.deleteUser(records.hrId);
        console.log("Deleted HR:", records.hrId);
      }
      if (records.collegeId) {
        await Models.college.delete(records.collegeId);
        console.log("Deleted College:", records.collegeId);
      }
      if (records.institutionAdminId) {
        await Models.auth.deleteUser(records.institutionAdminId);
        console.log("Deleted Institution Admin:", records.institutionAdminId);
      }
      if (records.institutionId) {
        await Models.institution.delete(records.institutionId);
        console.log("Deleted Institution:", records.institutionId);
      }
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }
  };

  const instutionList = async (page: number) => {
    try {
      setState({ loading: true });
      const body = bodyData();

      const res: any = await Models.institution.list(page, body);

      const tableData = res?.results?.map((item) => ({
        institution_name: item?.institution_name,
        institution_code: item?.institution_code,
        institution_email: item?.institution_email,
        institution_phone: item?.institution_phone,
        address: item?.address,
        status: item?.status,
        id: item?.id,
        total_colleges: item?.total_colleges,
        total_departments: item?.total_departments,
        total_jobs: item?.total_jobs,
      }));

      setState({
        loading: false,
        page: page,
        count: res?.count,
        instutionList: tableData,
        next: res?.next,
        prev: res?.previous,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
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

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    instutionList(pageNumber);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      currentStep: 1,
      completedSteps: [],

      // Clear all form fields
      institution_name: "",
      institution_code: "",
      institution_email: "",
      institution_phone: "",
      address: "",
      btnLoading: false,

      admin_username: "",
      admin_email: "",
      admin_phone: "",
      admin_password: "",
      admin_confirm_password: "",
      admin_gender: null,
      admin_education_qualification: "",

      hr_username: "",
      hr_email: "",
      hr_phone: "",
      hr_password: "",
      hr_confirm_password: "",
      hr_gender: null,
      hr_qualification: "",

      college_name: "",
      college_code: "",
      college_email: "",
      college_phone: "",
      college_address: "",

      hod_username: "",
      hod_email: "",
      hod_phone: "",
      hod_password: "",
      hod_confirm_password: "",
      hod_gender: null,
      hod_qualification: "",

      department_name: "",
      // department_code: '',

      job_title: "",
      job_description: "",
      job_requirements: "",
      job_salary_min: "",
      job_salary_max: "",

      errors: {},
      editId: null,
      selectedRecords: [],
      showEditModal: false,
    });
  };

  const handleFormChange = (field: string, value: any) => {
    // Map validation field names to form field names for error clearing
    const errorFieldMap: { [key: string]: string[] } = {
      admin_username: ["username", "admin_username"],
      admin_email: ["email", "admin_email"],
      admin_password: ["password", "admin_password"],
      admin_confirm_password: ["password_confirm", "admin_confirm_password"],
      admin_phone: ["phone", "admin_phone"],
      admin_gender: ["gender", "admin_gender"],
      admin_education_qualification: [
        "education_qualification",
        "admin_education_qualification",
      ],
    };

    const fieldsToClear = errorFieldMap[field] || [field];
    const clearedErrors = { ...state.errors };
    fieldsToClear.forEach((errorField: string) => {
      clearedErrors[errorField] = "";
    });

    setState({
      [field]: value,
      errors: clearedErrors,
    });
  };

  const handleEdit = (row: any) => {
    setState({
      editId: row?.id,
      showEditModal: true,
      institution_name: row?.institution_name,
      institution_code: row?.institution_code,
      institution_email: row?.institution_email,
      institution_phone: row?.institution_phone,
      address: row?.address,
    });
    // TODO: Implement edit functionality
  };

  const handleToggleStatus = async (row: any) => {
    try {
      const newStatus = row?.status === "active" ? "inactive" : "active";
      const body = {
        status: newStatus,
      };
      await Models.institution.update(body, row?.id);
      Success(`Institution ${row?.status.toLowerCase()} successfully!`);
      instutionList(state.page);
    } catch (error) {
      Failure("Failed to update status. Please try again.");
    }
  };

  const handleDelete = (row: any) => {
    showDeleteAlert(
      () => {
        deleteDecord(row?.id);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete record?"
    );
  };

  const deleteDecord = async (id) => {
    try {
      await Models.institution.delete(id);
      Success(`Institutions deleted successfully!`);
      setState({ selectedRecords: [] });
      instutionList(state.page);
    } catch (error) {
      Failure("Failed to delete institutions. Please try again.");
    }
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

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.institution.delete(id);
      }
      Success(
        `${state.selectedRecords.length} institutions deleted successfully!`
      );
      setState({ selectedRecords: [] });
      instutionList(state.page);
    } catch (error) {
      Failure("Failed to delete institutions. Please try again.");
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">Institution Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize educational institutions
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Setup Institution</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative">
            <TextInput
              placeholder="Search institutions..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Institutions List
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
                {state.count} institutions found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 bg-white">
          <DataTable
            noRecordsText="No institutions found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.instutionList}
            fetching={state.loading}
            selectedRecords={state.instutionList.filter((record) =>
              state.selectedRecords.includes(record.id)
            )}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r) => r.id) })
            }
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading institutions...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: "institution_code",
                title: (
                  <div className=" flex items-center gap-1">
                    Institution Code
                  </div>
                ),
                sortable: true,

                render: (row) => (
                  <span
                    onClick={() => handleEdit(row)}
                    className=" inline-flex cursor-pointer items-center justify-center rounded-full bg-blue-100 px-4 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {row?.institution_code}
                  </span>
                ),
              },
              {
                accessor: "institution_name",
                title: (
                  <div className="flex items-center gap-1">
                    Institution Name
                  </div>
                ),
                sortable: true,
                render: (row) => (
                  <div
                    onClick={() => handleEdit(row)}
                    className="cursor-pointer font-medium text-gray-900 dark:text-white"
                    title={row?.institution_name}
                  >
                    {truncateText(row?.institution_name, 10)}
                  </div>
                ),
              },
              // {
              //   accessor: "institution_email",
              //   title: (
              //     <div className="flex items-center gap-1">
              //       Institution Email
              //     </div>
              //   ),
              //   sortable: true,
              //   render: ({ institution_email }) => (
              //     <span
              //       title={institution_email}
              //       className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              //     >
              //       {truncateText(institution_email, 10)}
              //     </span>
              //   ),
              // },
              // {
              //   accessor: "institution_phone",
              //   title: "Institution Phone",
              //   render: ({ institution_phone }) => (
              //     <div className="text-gray-600 dark:text-gray-400">
              //       {institution_phone}
              //     </div>
              //   ),
              //   sortable: true,
              // },

              {
                accessor: "total_colleges",
                title: "Total Colleges",
                render: ({ total_colleges }) => (
                  <div className="text-gray-600 dark:text-gray-400">
                    {total_colleges}
                  </div>
                ),
                sortable: true,
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
                  <div className="text-gray-600 dark:text-gray-400">
                    {total_jobs}
                  </div>
                ),
                sortable: true,
              },
              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => {
                  return (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200  dark:text-blue-400"
                        title="Edit"
                      >
                        <IconEdit className="h-4 w-4" />
                      </button>
                      {/* <button
                        onClick={() => handleToggleStatus(row)}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                          row?.status != "active"
                            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400"
                            : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400"
                        }`}
                        title={
                          row?.status === "active" ? "Deactivate" : "Activate"
                        }
                      >
                        {row?.status !== "active" ? (
                          <ToggleLeft className="h-4 w-4" />
                        ) : (
                          <ToggleRight className="h-4 w-4" />
                        )}
                      </button> */}
                      <button
                        onClick={() => handleDelete(row)}
                        className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200  "
                        title="Delete"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  );
                },
              },
            ]}
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
              instutionList(1);
            }}
            minHeight={200}
          />
        </div>
        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

      <Modal
        subTitle="Create New Institution"
        closeIcon
        maxWidth="max-w-5xl"
        open={state.showModal}
        close={handleCloseModal}
        addHeader="Institution Setup Wizard"
        renderComponent={() => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextInput
                title="Institution Name"
                placeholder="Enter institution name"
                value={state.institution_name}
                onChange={(e) =>
                  handleFormChange("institution_name", e.target.value)
                }
                error={state.errors.institution_name}
                required
              />
              <TextInput
                title="Institution Code"
                placeholder="Enter unique code"
                value={state.institution_code}
                onChange={(e) =>
                  handleFormChange("institution_code", e.target.value)
                }
                error={state.errors.institution_code}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TextInput
                title="Email Address"
                type="email"
                placeholder="institution@example.com"
                value={state.institution_email}
                onChange={(e) =>
                  handleFormChange("institution_email", e.target.value)
                }
                error={state.errors.institution_email}
                required
              />
              <CustomPhoneInput
                title="Phone Number"
                value={state.institution_phone}
                onChange={(value) =>
                  handleFormChange("institution_phone", value)
                }
                error={state.errors.institution_phone}
                required
              />
            </div>
            <TextArea
              title="Complete Address"
              placeholder="Enter the full address"
              value={state.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
              error={state.errors.address}
              rows={4}
              required
            />

            <div className="flex justify-end">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCloseModal()}
                  className="rounded-lg border px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => create_institution()}
                  className="bg-dblue rounded-lg px-6 py-2 text-white"
                >
                  {state.btnLoading ? "Loading..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      />
      <Modal
        closeIcon
        maxWidth="max-w-5xl"
        subTitle="Edit Institution"
        open={state.showEditModal}
        close={handleCloseModal}
        renderComponent={() => (
          <div className="w-full">
            <div className="min-h-[400px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <TextInput
                    title="Institution Name"
                    placeholder="Enter institution name"
                    value={state.institution_name}
                    onChange={(e) =>
                      handleFormChange("institution_name", e.target.value)
                    }
                    error={state.errors.institution_name}
                    required
                  />
                  <TextInput
                    title="Institution Code"
                    placeholder="Enter unique code"
                    value={state.institution_code}
                    onChange={(e) =>
                      handleFormChange("institution_code", e.target.value)
                    }
                    error={state.errors.institution_code}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <TextInput
                    title="Email Address"
                    type="email"
                    placeholder="institution@example.com"
                    value={state.institution_email}
                    onChange={(e) =>
                      handleFormChange("institution_email", e.target.value)
                    }
                    error={state.errors.institution_email}
                    required
                  />
                  <CustomPhoneInput
                    title="Phone Number"
                    value={state.institution_phone}
                    onChange={(value) =>
                      handleFormChange("institution_phone", value)
                    }
                    error={state.errors.institution_phone}
                    required
                  />
                </div>
                <TextArea
                  title="Complete Address"
                  placeholder="Enter the full address"
                  value={state.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  error={state.errors.address}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-end ">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCloseModal()}
                  className="rounded-lg border px-6 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate()}
                  className="bg-dblue rounded-lg px-6 py-2 text-white"
                >
                  {state.btnLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(Institution);
