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
import { Dropdown, showDeleteAlert, useSetState } from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import Models from "@/imports/models.import";
import PrivateRouter from "@/hook/privateRouter";
import IconEdit from "@/components/Icon/IconEdit";

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
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Departments"));
    profile();
    // loadInstitutionOptions(1);
  }, [dispatch]);

  useEffect(() => {
    deptList(1);
  }, [debounceSearch, state.institutionFilter, state.sortBy]);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({
        profile: res,
        profile_institution: res?.institution,
        profile_college: res?.college,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Institution filter handlers
  // const loadInstitutionOptions = async (page, search = "", loadMore = false) => {
  //   try {
  //     setState({ institutionLoading: true });
  //     const body = { search };
  //     const res: any = await Models.institution.list(page, body);
  //     const dropdown = Dropdown(res?.results, "institution_name");

  //     setState({
  //       institutionLoading: false,
  //       institutionPage: page,
  //       institutionOptions: loadMore
  //         ? [...state.institutionOptions, ...dropdown]
  //         : dropdown,
  //       institutionNext: res?.next,
  //     });
  //   } catch (error) {
  //     console.error("Error loading institution options:", error);
  //     setState({ institutionLoading: false });
  //   }
  // };

  // const handleInstitutionChange = (selectedOption) => {
  //   setState({ institutionFilter: selectedOption, page: 1 });
  // };

  // const handleInstitutionSearch = (searchTerm) => {
  //   loadInstitutionOptions(1, searchTerm);
  // };

  // const handleLoadMoreInstitutions = () => {
  //   if (state.institutionNext) {
  //     loadInstitutionOptions(state.institutionPage + 1, "", true);
  //   }
  // };

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
    deptList(pageNumber);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      department_name: "",
      department_code: "",
      errors: {},
      editId: null,
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
  
    if (userId) {
      body.created_by = userId;
    }
    body.team = "No";

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
        department_name: state.department_name,
        department_code: state.department_code,
        college: state.profile_college?.college_id,
        institution: state?.profile_institution?.id,
      };

      // Validate all department fields at once
      const validationBody = {
        college: state.profile_college?.college_id,
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

  const renderDepartmentForm = () => (
    <div className="space-y-6">
      <>
        <TextInput
          title="Institution"
          placeholder="Institution"
          value={state.profile_institution?.name}
          onChange={(e) => {}}
          disabled
        />

        <TextInput
          title="Select College"
          placeholder="College"
          value={state.profile_college?.college_name}
          onChange={(e) => {}}
          disabled
        />
        {/* <CustomSelect
          options={state.collegeDropdownList}
          value={state.college}
          onChange={selectedOption =>
            setState({
              college: selectedOption,
              errors: { ...state.errors, college: '' }
            })
          }
          onSearch={searchTerm =>
            collegeDropdownList(1, searchTerm, state.profile_institution)
          }
          placeholder='Select College'
          isClearable={true}
          loadMore={() =>
            state.collegeNext &&
            collegeDropdownList(
              state.collegePage + 1,
              '',
              true,
              state.profile_institution
            )
          }
          loading={state.collegeLoading}
          title='Select College'
          error={state.errors.college}
          required
        /> */}
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
              Departments
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage departments
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Department</span>
          </button>
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
            {/* Progress Header */}

            {/* Step Content */}
            <div className="min-h-[300px]">{renderDepartmentForm()}</div>

            {/* Navigation Footer */}
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