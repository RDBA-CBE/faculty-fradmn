import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconSearch from "@/components/Icon/IconSearch";
import IconPlus from "@/components/Icon/IconPlus";
import IconTrash from "@/components/Icon/IconTrash";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconLoader from "@/components/Icon/IconLoader";
import Pagination from "@/components/pagination/pagination";
import {
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
import PrivateRouter from "@/hook/privateRouter";
import IconEdit from "@/components/Icon/IconEdit";
import DynamicAchievementInput from "@/components/DynamicAchievementInput";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import NumberInput from "@/components/FormFields/NumberInputs.component";
import TextArea from "@/components/FormFields/TextArea.component";
import { ChevronDown, ChevronUp } from "lucide-react";

const CollegeAndDepartment = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    selectedRecords: [],
    activeTab: "Department",
    page: 1,
    pageSize: 10,
    search: "",
    institutionFilter: null,
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    departmentCount: 0,
    department_name: "",
    department_code: "",

    // Institution filter data
    institutionOptions: [],
    institutionLoading: false,
    institutionPage: 1,
    institutionNext: null,

    errors: {},
    editId: null,
    showEditModal: false,
    intake_per_year: "",
    total_strength: "",
    recent_achievements: [],
    recent_dept_achievements: [],
    sortingFilter: {
      value: 1,
      label: "Own Department",
    },
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Departments"));
    profile();
    master_department();

    // loadInstitutionOptions(1);
  }, [dispatch]);

  useEffect(() => {
    if (state.profile) deptList(1);
  }, [
    debounceSearch,
    state.institutionFilter,
    state.sortBy,
    state.sortingFilter,
    state.profile,
  ]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      console.log("profile --->", res);
      setState({
        profile: res,
        profile_institution: res?.institution,
        profile_college: res?.college,
        collegeList: res?.college?.map((item) => ({
          value: item?.college_id,
          label: item?.college_name,
        })),
      });
      const collegeIds = res?.college?.map((c: any) => c.college_id);
      deptList(1, collegeIds);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const master_department = async (page = 1, search = "", loadMore = false) => {
    try {
      const body: any = {};
      if (search) {
        body.search = search;
      }
      body.is_approved = "Yes";

      const res: any = await Models.master.dept_list(body, page);
      console.log("✌️res --->", res);
      const dropdown = Dropdown(res?.results, "short_name");
      setState({
        master_department: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const deptList = async (page, collegeId = null) => {
    try {
      setState({ loading: true });
      const body = collegeBodyData();
      const colleges =
        collegeId ?? state.profile?.college?.map((c: any) => c.college_id);
      if (colleges) body.college = colleges;
      const res: any = await Models.department.list(page, body);

      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        department_name: item?.short_name,
        department_code: item?.department_code,
        department_email: item?.department_email,
        department_phone: item?.department_phone,
        status: item?.status,
        college_name: item?.college_name,
        college_id: item?.college,
        total_jobs: item?.total_jobs,
        institution_name: item?.institution_name,
        institution_id: item?.institution,
        department_head: item?.hod?.name,
        hod_id: item?.hod?.id,
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
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch departments");
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

  const handlePageChange = (pageNumber) => {
    setState({ page: pageNumber });
    deptList(pageNumber);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      department_name: "",
      department_code: "",
      errors: {},
      editId: null,
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
      college: null,
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
      if (state.sortingFilter?.value == 1) {
        body.team = "No";
        body.created_by = userId;
      } else {
        body.created_by = userId;

        body.team = "Yes";
      }
    }

    // if (userId) {
    //   body.created_by = userId;
    // }
    // body.team = "No";

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
      editDeptId: row?.id,
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
    if (row?.college_id) {
      deptHodDropdownList(1, "", false, row?.college_id);
    }

    if (row?.department_extras?.length > 0) {
      const departmentsData = row.department_extras.map((item, i) => ({
        dept: [
          {
            value: item?.department_master?.id,
            label: item?.department_master?.short_name,
          },
        ],
        intake_per_year: item?.intake_per_year || "",
        isNBAAccreditation: item?.nba_accreditation || false,
        summary: item?.summary || "",
        recent_achievements: item?.recent_achievements || [],
        open: i == 0,
        id: item?.id,
      }));
      setState({
        departments: row.department_extras.map((item, i) => ({
          value: item?.department_master?.id,
          label: item?.department_master?.short_name,
        })),
        departmentsData,
        open: true,
      });
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const newStatus = row.status === "active" ? "inactive" : "active";

      await Models.department.update({ status: newStatus }, row.id);
      Success(`Department ${newStatus} successfully!`);

      deptList(state.page);
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
      await Models.department.delete(id);
      Success("Department deleted successfully!");
      deptList(state.page);
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

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      // If activeTab is departments, show single step department form
      const body: any = {
        department_name: capitalizeFLetter(state.department_name),
        // department_code: state.department_code,
        college: state.profile_college?.college_id,
        institution: state?.profile_institution?.id,
        intake_per_year: Number(state.dept_intake_per_year),
        summary: capitalizeFLetter(state.dept_summary),
        recent_achievements: state.recent_dept_achievements,
        nba_accreditation: state.isNBAAccreditation,
      };

      if (state.profile?.college?.length > 0) {
        body.college = state.college?.value;
      } else {
        body.college = state.profile_college?.college_id;
      }

      // Validate all department fields at once
      const validationBody = {
        college: state.profile_college?.college_id,
        department_name: state.department_name,
        // department_code: state.department_code,
      };

      if (state.profile?.college?.length > 0) {
        validationBody.college = state.college?.value;
      } else {
        validationBody.college = state.profile_college?.college_id;
      }
      const errors: any = {};

      // Check all required fields
      if (!validationBody.college) {
        errors.college = "Please select a college";
      }
      if (!validationBody.department_name) {
        errors.department_name = "Department name is required";
      }
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

      if (state.deptHod?.value) {
        body.hod_id = state.deptHod?.value;
      } else {
        body.hod_id = null;
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

      body.role = "hod";

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
          institution_id: state.profile?.institution?.id,
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

  const renderDepartmentForm = () => (
    <>
      <div className="grid grid-cols-3 gap-6 pb-4">
        {!state.editDeptId && (
          <CustomSelect
            options={state.collegeList}
            value={state.college}
            onChange={(selectedOption) => {
              setState({
                college: selectedOption,
                errors: { ...state.errors, college: "" },
              });
            }}
            placeholder="Select College"
            isClearable={true}
            loading={state.collegeLoading}
            title="Select College"
            error={state.errors.college}
            required
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

  const departmentColumns = [
    // {
    //   accessor: "department_code",
    //   title: "Department Code",
    //   sortable: true,
    //   render: ({ department_code }) => (
    //     <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
    //       {department_code}
    //     </span>
    //   ),
    // },
    {
      accessor: "department_name",
      title: "Department Name",
      sortable: true,
      render: ({ department_name }) => (
        <div
          className="font-medium text-gray-900 dark:text-white"
          title={department_name}
        >
          {department_name}
        </div>
      ),
    },
    {
      accessor: "hod",
      title: "Department Head",
      sortable: true,
      render: ({ department_head }) => (
        <div
          className="text-gray-600 dark:text-gray-400"
          title={department_head}
        >
          {truncateText(department_head)}
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
      accessor: "college_name",
      title: "College ",
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
              <IconEye className="h-4 w-4" />
            ) : (
              <IconEyeOff className="h-4 w-4" />
            )}
          </button> */}
          <button
            onClick={() => handleDelete(row)}
            className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200 "
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
            <h1 className="page-ti text-transparent">Departments</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage departments
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Department</span>
          </button>
        </div>
      </div>

      {/* Tabs */}

      {/* Filters Section */}
      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
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
              options={[
                {
                  value: 1,
                  label:
                    state.activeTab === "colleges"
                      ? "Own College"
                      : "Own Department",
                },
                {
                  value: 2,
                  label:
                    state.activeTab === "colleges"
                      ? "Not Own College"
                      : "Not Own Department",
                },
              ]}
              value={state.sortingFilter}
              onChange={(e) => setState({ sortingFilter: e })}
              placeholder={
                state.activeTab === "colleges"
                  ? "Own College"
                  : "Own Department"
              }
              isClearable={false}
            />
          </div>
          {/* <div className="group relative z-50">
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
          </div> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              {"Departments"} List
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

        <div className="overflow-x-auto border border-gray-200 bg-white">
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
              deptList(
                1,
                state.profile?.college?.map((c: any) => c.college_id)
              );
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
      {/* <Modal
        open={state.showModal}
        close={handleCloseModal}
        addHeader={"Add Department"}
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


   
            <div className="min-h-[300px]">{renderDepartmentForm()}</div>

  
            <div className="flex justify-between border-t p-6">
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
                  className="rounded-lg bg-dblue px-6 py-2 text-white hover:bg-dblue disabled:opacity-50"
                >
                  {state.submitting
                    ? "Loading..."
                    : state.editId
                    ? "Update Department"
                    : "Create Department"}
                </button>
              </div>
            </div>
          </div>
        )}
      /> */}

      <Modal
        // isFullWidth
        maxWidth="max-w-7xl"
        // closeIcon={true}
        closeIcon
        open={state.showModal}
        close={handleCloseModal}
        subTitle={state.editDeptId ? "Update Department" : "Add New Department"}
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

            <div className="">{renderDepartmentForm()}</div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between border-t pt-3">
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
            </div>
          </div>
        )}
      />

      <Modal
        open={state.showEditModal}
        close={handleCloseModal}
        addHeader={"Update Department"}
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
            <div className="flex justify-between  p-6">
              {/* {state.activeTab === "departments" ? ( */}
              <div className="flex w-full justify-end gap-4">
                <button
                  onClick={() => handleCloseModal()}
                  disabled={state.submitting}
                  className="rounded-lg border px-6 py-2 text-black hover:bg-green-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={state.submitting}
                  className="bg-dblue hover:bg-dblue rounded-lg px-6 py-2 text-white disabled:opacity-50"
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
