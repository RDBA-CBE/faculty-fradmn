import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../store/themeConfigSlice";
import TextInput from "@/components/FormFields/TextInput.component";
import IconSearch from "@/components/Icon/IconSearch";
import IconPlus from "@/components/Icon/IconPlus";
import IconTrash from "@/components/Icon/IconTrash";
import IconLoader from "@/components/Icon/IconLoader";
import IconEdit from "@/components/Icon/IconEdit";
import Pagination from "@/components/pagination/pagination";
import {
  showDeleteAlert,
  useSetState,
  Success,
  Failure,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Models } from "@/imports/models.import";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import PrivateRouter from "@/hook/privateRouter";

const AdditionalAcademicResponsibilities = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    list: [],
    count: 0,
    search: "",
    showModal: false,
    loading: false,
    submitting: false,
    sortBy: "",
    sortOrder: "asc",
    name: "",
    errors: {},
    editId: null,
    selectedRecords: [],
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Additional Academic Responsibilities"));
  }, [dispatch]);

  useEffect(() => {
    fetchList(1);
  }, [debounceSearch, state.sortBy]);

  const fetchList = async (page) => {
    try {
      setState({ loading: true });
      const body: any = {};
      if (state.search) body.search = state.search;
      if (state.sortBy) {
        body.ordering =
          state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
      }

      const res: any =
        await Models.master.additional_academic_responsibilities_list(
          body,
          page
        );

      const tableData = res?.results?.map((item: any) => ({
        id: item?.id,
        name: item?.responsibility_title,
      }));

      setState({
        loading: false,
        list: tableData,
        count: res?.count,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch records");
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    fetchList(pageNumber);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      name: "",
      errors: {},
      editId: null,
    });
  };

  const handleEdit = (row: any) => {
    setState({
      editId: row?.id,
      showModal: true,
      name: row?.name,
    });
  };

  const handleDelete = (row: any) => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this record?"
    );
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      () => bulkDeleteRecords(),
      () => Swal.fire("Cancelled", "Your Records are safe :)", "info"),
      `Are you sure want to delete ${state.selectedRecords?.length} record(s)?`
    );
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.master.delete_additional_academic_responsibility(id);
      }
      Success(
        `${state.selectedRecords?.length} record(s) deleted successfully!`
      );
      setState({ selectedRecords: [] });
      fetchList(state.page);
    } catch (error) {
      Failure("Failed to delete records. Please try again.");
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.master.delete_additional_academic_responsibility(id);
      Success("Record deleted successfully!");
      fetchList(state.page);
    } catch (error) {
      Failure("Failed to delete record");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      if (!state.name) {
        setState({ errors: { name: "Name is required" }, submitting: false });
        return;
      }

      const body = { responsibility_title: state.name };

      if (state.editId) {
        await Models.master.update_additional_academic_responsibility(
          body,
          state.editId
        );
        Success("Record updated successfully!");
      } else {
        await Models.master.create_additional_academic_responsibility(body);
        Success("Record created successfully!");
      }

      fetchList(state.page);
      handleCloseModal();
    } catch (error: any) {
      if (error?.data) {
        const apiErrors: any = {};
        Object.keys(error.data).forEach((field) => {
          apiErrors[field] = Array.isArray(error.data[field])
            ? error.data[field][0]
            : error.data[field];
        });
        setState({ errors: apiErrors });
      } else {
        Failure("Operation failed");
      }
    } finally {
      setState({ submitting: false });
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">
              Additional Academic Responsibilities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Additional Academic Responsibilities
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Responsibility</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 rounded-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative">
            <TextInput
              placeholder="Search responsibilities..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Additional Academic Responsibilities
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords?.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="group relative inline-flex transform items-center gap-2 overflow-hidden rounded-md border border-red-500 px-3 py-1 text-red-500 shadow-lg transition-all duration-200"
                >
                  <IconTrash className="h-4 w-4" />
                  <span className="relative z-10 text-[13px]">
                    Delete ({state.selectedRecords?.length})
                  </span>
                </button>
              )}
              <div className="text-sm text-black">
                {state.count} records found
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 bg-white">
          <DataTable
            noRecordsText="No records found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.list}
            fetching={state.loading}
            selectedRecords={state.list?.filter((record: any) =>
              state.selectedRecords?.includes(record.id)
            )}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r: any) => r.id) })
            }
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: "name",
                title: "Name",
                sortable: true,
                render: ({ name }: any) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {name}
                  </div>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200 dark:text-blue-400"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex items-center justify-center rounded-lg text-red-600 transition-all duration-200"
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

      {/* Add / Edit Modal */}
      <Modal
        closeIcon
        subTitle={
          state.editId
            ? "Update Responsibility"
            : "Add New Responsibility"
        }
        open={state.showModal}
        close={handleCloseModal}
        renderComponent={() => (
          <div className="relative">
            <div className="space-y-6">
              <TextInput
                title="Name"
                placeholder="Enter responsibility name"
                value={state.name}
                onChange={(e) =>
                  setState({
                    name: e.target.value,
                    errors: { ...state.errors, name: "" },
                  })
                }
                error={state.errors.name}
                required
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={state.submitting}
                className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-dblue px-8 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 ${
                  state.submitting ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
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
                      ? "Update"
                      : "Create"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(AdditionalAcademicResponsibilities);
