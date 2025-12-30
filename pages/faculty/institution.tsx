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
import IconCaretDown from "@/components/Icon/IconCaretDown";
import IconCaretsDown from "@/components/Icon/IconCaretsDown";
import Pagination from "@/components/pagination/pagination";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import { showDeleteAlert, useSetState } from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { CreateInstituion } from "@/utils/validation.utils";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";

const institutionData = [
  {
    id: 1,
    name: "Harvard University",
    type: "University",
    location: "Cambridge, MA",
    established: "1636",
    status: "Active",
  },
  {
    id: 2,
    name: "MIT",
    type: "Institute",
    location: "Cambridge, MA",
    established: "1861",
    status: "Active",
  },
  {
    id: 3,
    name: "Stanford University",
    type: "University",
    location: "Stanford, CA",
    established: "1885",
    status: "Active",
  },
  {
    id: 4,
    name: "Oxford University",
    type: "University",
    location: "Oxford, UK",
    established: "1096",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Cambridge University",
    type: "University",
    location: "Cambridge, UK",
    established: "1209",
    status: "Active",
  },
  {
    id: 4,
    name: "Oxford University",
    type: "University",
    location: "Oxford, UK",
    established: "1096",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Oxford University",
    type: "University",
    location: "Oxford, UK",
    established: "1096",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Oxford University",
    type: "University",
    location: "Oxford, UK",
    established: "1096",
    status: "Inactive",
  },
];

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
    institution_name: "",
    institution_code: "",
    institution_email: "",
    institution_phone: "",
    address: "",
    errors: {},

    count: 0,
    instutionList: [],
    next: null,
    prev: null,
    editId: null,
  });

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const typeOptions = [
    { value: "University", label: "University" },
    { value: "Institute", label: "Institute" },
    { value: "College", label: "College" },
  ];

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Institution"));
  }, [dispatch]);

  useEffect(() => {
    instutionList(1);
  }, []);

  useEffect(() => {
    instutionList(1);
  }, [
    debounceSearch,
    state.statusFilter,
    state.typeFilter,
    state.sortBy,
  ]);

  const instutionList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();

      const res: any = await Models.institution.list(page, body);
      console.log("✌️res --->", res);

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
      setState({
        recordsData: institutionData,
        totalRecords: institutionData.length,
        loading: false,
      });
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
    console.log("✌️body --->", body);

    return body;
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    instutionList(pageNumber);
  };

  const handleStatusChange = (selectedOption: any) => {
    setState({ statusFilter: selectedOption, page: 1 });
  };

  const handleTypeChange = (selectedOption: any) => {
    setState({ typeFilter: selectedOption, page: 1 });
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      institution_name: "",
      institution_code: "",
      institution_email: "",
      institution_phone: "",
      address: "",
      errors: {},
      editId: null,
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setState({
      [field]: value,
      errors: {
        ...state.errors,
        [field]: "",
      },
    });
  };

  const handleEdit = (row) => {
    setState({
      editId: row?.id,
      showModal: true,
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

  const handleDelete = (row) => {
    showDeleteAlert(
      () => {
        deleteDecord(row);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete record?"
    );
  };

  const deleteDecord = async (id: number) => {
    try {
      await Models.institution.delete(id);
      Success("Institution deleted successfully!");
      instutionList(state.page);
    } catch (error) {
      Failure("Failed to delete institution. Please try again.");
    }
  };

  const handleCreateSubmit = async () => {
    try {
      setState({ submitting: true });
      const body = {
        institution_name: state.institution_name,
        institution_code: state.institution_code,
        institution_email: state.institution_email,
        institution_phone: state.institution_phone,
        address: state.address,
        status: "active",
      };
      await CreateInstituion.validate(body, { abortEarly: false });
      if (state.editId) {
        await Models.institution.update(body, state.editId);
        Success("Institution updated successfully!");
      } else {
        
        await Models.institution.create(body);
        Success("Institution created successfully!");
      }

      instutionList(state.page);
      handleCloseModal();
    } catch (error: any) {
      if (error?.data?.institution_code?.length > 0) {
        Failure(error?.data?.institution_code[0]);
      } else if (error?.inner) {
        const errors: any = {};
        error?.inner?.forEach((err: any) => {
          errors[err?.path] = err.message;
        });
        setState({ errors });
      } else {
        Failure("Failed to create institution. Please try again.");
      }
    } finally {
      setState({ submitting: false });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Institution Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and organize educational institutions
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Institution</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-2">
          {/* <IconFilter className="w-5 h-5 text-blue-600" /> */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filters
          </h3>
        </div>
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
          <div className="group relative">
            <CustomSelect
              options={statusOptions}
              value={state.statusFilter}
              onChange={handleStatusChange}
              placeholder="Filter by Status"
              isClearable={true}
            />
          </div>
          <div className="group relative">
            <CustomSelect
              options={typeOptions}
              value={state.typeFilter}
              onChange={handleTypeChange}
              placeholder="Filter by Type"
              isClearable={true}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Institutions List
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {state.count} institutions found
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            noRecordsText="No institutions found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.instutionList}
            fetching={state.loading}
            customLoader={(
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Loading institutions...</span>
                </div>
              </div>
            )}
            columns={[
              {
                accessor: "institution_code",
                title: (
                  <div className="flex items-center gap-1">
                    Institution Code
                  </div>
                ),
                sortable: true,
                render: ({ institution_code }) => (
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {institution_code}
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
                render: ({ institution_name }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {institution_name}
                  </div>
                ),
              },
              {
                accessor: "institution_email",
                title: (
                  <div className="flex items-center gap-1">
                    Institution Email
                  </div>
                ),
                sortable: true,
                render: ({ institution_email }) => (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {institution_email}
                  </span>
                ),
              },
              {
                accessor: "institution_phone",
                title: "Institution Phone",
                render: ({ institution_phone }) => (
                  <div className="text-gray-600 dark:text-gray-400">
                    {institution_phone}
                  </div>
                ),
                sortable: true,

              },

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
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(row)}
                      className={`group relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                        row?.status === "active"
                          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400"
                          : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-400"
                      }`}
                      title={
                        row?.status === "active" ? "Deactivate" : "Activate"
                      }
                    >
                      {row?.status === "active" ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-400"
                      title="Delete"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                ),
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

      {/* Modal */}
      <Modal
        open={state.showModal}
        close={handleCloseModal}
        // addHeader="Create New Institution"
        renderComponent={() => (
          <div className="relative">
            {/* Header with gradient */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} Institution
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Fill in the details to create a new educational institution
              </p>
            </div>

            {/* Form with modern styling */}
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <TextInput
                    title="Institution Name"
                    placeholder="Enter institution name"
                    value={state.institution_name}
                    onChange={(e) =>
                      handleFormChange("institution_name", e.target.value)
                    }
                    error={state.errors.institution_name}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
                <div className="group">
                  <TextInput
                    title="Institution Code"
                    placeholder="Enter unique code"
                    value={state.institution_code}
                    onChange={(e) =>
                      handleFormChange("institution_code", e.target.value)
                    }
                    error={state.errors.institution_code}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="group">
                  <TextInput
                    title="Email Address"
                    type="email"
                    placeholder="institution@example.com"
                    value={state.institution_email}
                    onChange={(e) =>
                      handleFormChange("institution_email", e.target.value)
                    }
                    error={state.errors.institution_email}
                    className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                    required
                  />
                </div>
                <div className="group">
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
              </div>

              {/* Address - Full width */}
              <div className="group">
                <TextArea
                  title="Complete Address"
                  placeholder="Enter the full address including street, city, state, and postal code"
                  value={state.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  error={state.errors.address}
                  rows={4}
                  className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
                  required
                />
              </div>
            </div>

            {/* Action buttons with modern styling */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={state.submitting}
                className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                {state.submitting ? (
                  <IconLoader className="relative z-10 mr-2 h-4 w-4 animate-spin" />
                ) : state.editId ? (
                  <IconEdit className="relative z-10 mr-2 h-4 w-4" />
                ) : (
                  <IconPlus className="relative z-10 mr-2 h-4 w-4" />
                )}
                <span className="relative z-10">
                  {state.submitting
                    ? "Loading..."
                    : state.editId
                    ? "Update Institution"
                    : "Create Institution"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default Institution;
