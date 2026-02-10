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
import { GraduationCap, BookOpen, UserCheck } from "lucide-react";
import Pagination from "@/components/pagination/pagination";
import { Dropdown, showDeleteAlert, useSetState } from "@/utils/function.utils";
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
import { ROLES } from "@/utils/constant.utils";

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

    activeTab: "Department",
    page: 1,
    pageSize: 10,
    search: "",
    statusFilter: null,
    showModal: false,
    showEditModal: false,
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
    // Institution dropdown specific states
    institutionDropdownList: [],
    institutionDropLoading: false,
    institutionDropPage: 1,
    institutionDropNext: null,

    errors: {},
    editId: null,
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

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Colleges & Departments"));
    profile(); // Initialize dropdown separately
  }, [dispatch]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeList(1);
    } else {
      deptList(1);
      collegeDropdownList(1); // Load colleges for dropdown
    }
  }, [state.activeTab]);

  useEffect(() => {
    if (state.activeTab === "colleges") {
      collegeList(1);
    } else {
      deptList(1);
    }
  }, [
    debounceSearch,
    state.statusFilter,
    state.sortBy,
    state.institutionFilter,
    state.collegeFilter,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
    } catch (error) {
      console.error("Error fetching institutions:", error);
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

 

  const collegeList = async (page, institutionId = null) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      if (institutionId) {
        body.institution = institutionId?.value;
      }
      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "college_name");

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
      }));

      setState({
        loading: false,
        collegeList: tableData,
        collegeCount: res.count,
        CollegeNext: res?.next,
        collegePrev: res?.prev,
        collegeDropdownList: dropdown,
      });
    } catch (error) {
      setState({ loading: false });
      // Failure("Failed to fetch colleges");
    }
  };

  const deptList = async (page) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      const res: any = await Models.department.list(page, body);
      console.log("deptList --->", res);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        department_name: item?.department_name,
        department_code: item?.department_code,
        department_email: item?.department_email,
        department_phone: item?.department_phone,
        status: item?.status,
        college_name: item?.college_name,
        college_id: item?.college,
        total_jobs: item?.total_jobs,
        institution_name: item?.college_name,
        institution_id: item?.college,
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

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    collegeList(pageNumber);
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
      institution: null,
      department_name: "",
      department_code: "",
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
      institutionDept: null,
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

    if (state.search) {
      body.search = state.search;
    }

    if (state.institutionFilter?.value) {
      body.institution = state.institutionFilter?.value;
    }

    if (state.collegeFilter?.value) {
      body.college = state.collegeFilter?.value;
    }

    if (state.collegeFilter?.value) {
      body.college = state.collegeFilter?.value;
    }

    body.Is_publish = "No";

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
      console.log("Ordering:", body.ordering);
    }

    return body;
  };

  const handleEdit = (row) => {
    console.log("✌️row --->", row);
  
      setState({
        editId: row.id,
        showModal: true,
        department_name: row.department_name,
        department_code: row.department_code,
        institutionDept: {
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
      });
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";
      if (state.activeTab === "colleges") {
        await Models.college.update({ status: newStatus }, row.id);
        Success(`College ${newStatus} successfully!`);

        collegeList(state.page);
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
        collegeList(state.page);
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
       
          await Models.department.delete(id);
      }
      Success(
        `${state.selectedRecords.length} ${state.activeTab} deleted successfully!`
      );
      setState({ selectedRecords: [] });
    
        deptList(state.page);
    } catch (error) {
      Failure(`Failed to delete ${state.activeTab}. Please try again.`);
    }
  };

  const rollbackCreatedRecords = async (records: any) => {
    console.log("Starting rollback for records:", records);
    try {
      if (records.hodId) {
        console.log("Rolling back HOD:", records.hodId);
        await Models.auth.deleteUser(records.hodId);
        console.log("Successfully deleted HOD:", records.hodId);
      }
      if (records.departmentId) {
        console.log("Rolling back Department:", records.departmentId);
        await Models.department.delete(records.departmentId);
        console.log("Successfully deleted Department:", records.departmentId);
      }
      if (records.collegeId) {
        console.log("Rolling back College:", records.collegeId);
        await Models.college.delete(records.collegeId);
        console.log("Successfully deleted College:", records.collegeId);
      }
      console.log("Rollback completed successfully");
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
        const collegeBody = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.institution?.value,
        };
        await CreateCollege.validate(collegeBody, { abortEarly: false });

        const collegeRes = await Models.college.create(collegeBody);
        Success("College created successfully!");
        handleCloseModal();
        collegeList(state.page);
      } else if (state.currentStep === 2) {
        // Step 2: Create College and Department
        const collegeBody = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.institution?.value,
        };
        await CreateCollege.validate(collegeBody, { abortEarly: false });

        if (!state.department_name || !state.department_code) {
          Failure("Department name and code are required");
        }

        let createdRecords = { collegeId: null, departmentId: null };

        try {
          console.log("Step 2.1: Creating college...", collegeBody);
          const collegeRes: any = await Models.college.create(collegeBody);
          createdRecords.collegeId = collegeRes?.id;
          console.log(
            "Step 2.1: College created successfully with ID:",
            createdRecords.collegeId
          );

          const deptBody = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: createdRecords.collegeId,
            institution: state?.institution?.value,
          };

          console.log("Step 2.2: Creating department...", deptBody);
          const deptRes: any = await Models.department.create(deptBody);
          createdRecords.departmentId = deptRes?.id;
          console.log(
            "Step 2.2: Department created successfully with ID:",
            createdRecords.departmentId
          );

          Success("College and Department created successfully!");
          handleCloseModal();
          collegeList(state.page);
        } catch (error) {
          console.error("Step 2 Error Details:", error);

          // Show step-specific error message
          if (createdRecords.collegeId && !createdRecords.departmentId) {
            console.log("Error occurred during department creation");
            Failure(
              "Step 2.2 failed: Department creation failed. College was created but removed due to error."
            );
          } else {
            console.log("Error occurred during college creation");
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

        if (error?.response?.data?.non_field_errors?.length > 0) {
          Failure(error?.response?.data?.non_field_errors?.[0]);
        } else {
          Failure(
            `Step ${state.currentStep} failed: ${
              error?.message || "Creation failed. Please try again."
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
          department_name: state.department_name,
          department_code: state.department_code,
          college: state.college?.value,
        };

        // Validate all department fields at once
        const validationBody = {
          college: state.college?.value,
          department_name: state.department_name,
          department_code: state.department_code,
        };

        const errors: any = {};

        // Check all required fields
        if (!validationBody.college) {
          errors.college = "Please select a college";
        }
        if (!validationBody.department_name) {
          errors.department_name = "Department name is required";
        }
        if (!validationBody.department_code) {
          errors.department_code = "Department code is required";
        }

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

        console.log("✌️department body --->", body);

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
        const body = {
          college_name: state.college_name,
          college_code: state.college_code,
          college_email: state.college_email,
          college_phone: state.college_phone,
          college_address: state.college_address,
          institution: state?.institution?.value,
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

        if (state.editId) {
          const res = await Models.college.update(body, state.editId);
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
        if (!state.department_name || !state.department_code) {
          setState({
            errors: {
              department_name: "Department name is required",
              department_code: "Department code is required",
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
          hod_username: state.hod_username,
          hod_email: state.hod_email,
          hod_password: state.hod_password,
          hod_confirm_password: state.hod_confirm_password,
          hod_phone: state.hod_phone,
          hod_gender: state.hod_gender?.value,
          hod_qualification: state.hod_qualification,
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
          const collegeBody = {
            college_name: state.college_name,
            college_code: state.college_code,
            college_email: state.college_email,
            college_phone: state.college_phone,
            college_address: state.college_address,
            institution: state?.institution?.value,
          };

          console.log("Step 3.1: Creating college...", collegeBody);
          const collegeRes: any = await Models.college.create(collegeBody);
          createdRecords.collegeId = collegeRes?.id;
          console.log(
            "Step 3.1: College created successfully with ID:",
            createdRecords.collegeId
          );

          // Step 3.2: Create department with the created college ID
          const deptBody = {
            department_name: state.department_name,
            department_code: state.department_code,
            college: collegeRes?.id,
            institution: state?.institution?.value,
          };

          console.log("Step 3.2: Creating department...", deptBody);
          const deptRes: any = await Models.department.create(deptBody);
          createdRecords.departmentId = deptRes?.id;
          console.log(
            "Step 3.2: Department created successfully with ID:",
            createdRecords.departmentId
          );

          // Step 3.3: Create HOD with the created department ID
          const finalHodBody = {
            username: state.hod_username,
            email: state.hod_email,
            password: state.hod_password,
            password_confirm: state.hod_confirm_password,
            phone: state.hod_phone,
            role: "hod",
            status: "active",
            gender: state.hod_gender?.value,
            education_qualification: state.hod_qualification,
            department: deptRes?.id,
          };

          console.log("Step 3.3: Creating HOD...", finalHodBody);
          const hodRes: any = await Models.auth.createUser(finalHodBody);
          createdRecords.hodId = hodRes?.id;
          console.log(
            "Step 3.3: HOD created successfully with ID:",
            createdRecords.hodId
          );

          Success("College, Department and HOD created successfully!");
          handleCloseModal();
          collegeList(state.page);
        } catch (error: any) {
          console.error("Step 3 Error Details:", error);

          // Show step-specific error message based on what was created
          if (
            createdRecords.collegeId &&
            createdRecords.departmentId &&
            !createdRecords.hodId
          ) {
            console.log("Error occurred during HOD creation");
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
            console.log("Error occurred during department creation");
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
            console.log("Error occurred during college creation");
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
      console.log("✌️error --->", error);
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
      const body = {
        college_name: state.college_name,
        college_code: state.college_code,
        college_email: state.college_email,
        college_phone: state.college_phone,
        college_address: state.college_address,
        institution: state?.institution?.value,
      };

      await CreateCollege.validate(body, { abortEarly: false });
      const res = await Models.college.update(body, state.editId);
      collegeList(1);
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
      } else {
        if (error?.inner) {
          const errors = {};
          error.inner.forEach((err) => {
            errors[err.path] = err.message;
          });
          setState({ errors });
          console.log("✌️errors --->", errors);
          return; // Stop execution if validation fails
        }
      }
      Failure(error?.message || "Operation failed. Please try again.");
    }
  };

  const renderDepartmentForm = () => (
    <div className="space-y-6">
        <>
          <CustomSelect
            options={state.institutionDropdownList}
            value={state.institutionDept}
            onChange={(selectedOption) => {
              if (selectedOption) {
                setState({
                  institutionDept: selectedOption,
                  errors: { ...state.errors, institution: "" },
                  seletedInstitution: selectedOption,
                  college: null,
                });
                collegeList(1, selectedOption);
              } else {
                setState({
                  institutionDept: null,
                  seletedInstitution: selectedOption,
                  college: null,
                  collegeDropdownList: [],
                });
              }
            }}
            placeholder="Select Institution"
            isClearable={true}
          
            loading={state.institutionDropLoading}
            title="Select Institution"
            error={state.errors.institution}
            required
          />
          <CustomSelect
            options={state.collegeDropdownList}
            value={state.college}
            onChange={(selectedOption) =>
              setState({
                college: selectedOption,
                errors: { ...state.errors, college: "" },
              })
            }
            onSearch={(searchTerm) =>
              collegeDropdownList(1, searchTerm, state.seletedInstitution)
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
          />
        </>
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
    </div>
  );

 

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
      accessor: "college_name",
      title: "College ",
      sortable: true,
      render: ({ college_name }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {college_name}
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
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Team Departments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage departments
            </p>
          </div>
         
        </div>
      </div>

      {/* Tabs */}

      {/* Filters Section */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              options={state.collegeDropdownList}
              value={state.collegeFilter}
              onChange={(selectedOption) =>
                setState({
                  collegeFilter: selectedOption,
                  errors: { ...state.errors, college: "" },
                })
              }
              onSearch={(searchTerm) =>
                collegeDropdownList(1, searchTerm, state.seletedInstitution)
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
            />
          </div>
          {/* <div className="group relative z-50">
            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder="Filter by Status"
              isClearable={true}
            />
          </div> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {"Departments"} List
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  <IconTrash className="h-4 w-4" />
                  Delete ({state.selectedRecords.length})
                </button>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {state.activeTab === "colleges"
                  ? state.collegeCount
                  : state.departmentCount}{" "}
                records found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText={`No ${state.activeTab} found`}
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.deptList || []}
            fetching={state.loading}
            selectedRecords={(state.deptList || []).filter((record) =>
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
                    Loading {state.activeTab}...
                  </span>
                </div>
              </div>
            }
            columns={departmentColumns}
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

              deptList(1);
            }}
            minHeight={200}
          />
        </div>

        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.departmentCount}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        addHeader={
           "Add Department"
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
            <div className="min-h-[300px]">{renderDepartmentForm()}</div>

            {/* Navigation Footer */}
            <div className="flex justify-between border-t p-6">
                <div className="flex w-full justify-end gap-4">
                  <button
                    onClick={handleFinalSubmit}
                    disabled={state.submitting}
                    className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={state.submitting}
                    className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {state.submitting
                      ? "Creating..."
                      : state.editId
                      ? "Update Department"
                      : "Create Department"}
                  </button>
                </div>
             
            </div>
          </div>
        )}
      />
      <Modal
        open={state.showEditModal}
        close={handleCloseModal}
        addHeader={
         "Update Department"
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
              { renderDepartmentForm()}
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
                  onClick={handleFinalSubmit}
                  disabled={state.submitting}
                  className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateCollege()}
                  disabled={state.submitting}
                  className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {state.submitting ? "Updating..." : "Update College"}
                </button>
              </div>
             
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(CollegeAndDepartment);
