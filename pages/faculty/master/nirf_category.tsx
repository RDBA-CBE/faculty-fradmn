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
  capitalizeFLetter,
  showDeleteAlert,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import PrivateRouter from "@/hook/privateRouter";

const NIRFCategory = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    statusList: [],
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
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("NIRF Category Management"));
    statusList(1);
  }, [dispatch]);

  useEffect(() => {
    statusList(1);
  }, [debounceSearch, state.sortBy]);

  const statusList = async (page) => {
    try {
      setState({ loading: true });
      const body: any = {};
      if (state.search) body.search = state.search;
      if (state.sortBy) {
        body.ordering =
          state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
      }

      const res: any = await Models.master.NIRF_Category(page,body);
      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        name: item?.category,
      }));

      setState({
        loading: false,
        statusList: tableData,
        count: res?.count,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    statusList(pageNumber);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      name: "",
      errors: {},
      editId: null,
    });
  };

  const handleEdit = (row) => {
    setState({
      editId: row?.id,
      showModal: true,
      name: row?.name,
    });
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this NIRF Category?"
    );
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.master.delete_NIRF_Category(id);
      Success("NIRF Category deleted successfully!");
      statusList(state.page);
    } catch (error) {
      Failure("Failed to delete NIRF Category");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });
      const body = { category: capitalizeFLetter(state.name) };

      if (!state.name) {
        setState({ errors: { name: "NIRF Category is required" } });
        return;
      }

      if (state.editId) {
        await Models.master.update_NIRF_Category(body, state.editId);
        Success("NIRF Category updated successfully!");
      } else {
        await Models.master.create_NIRF_Category(body);
        Success("NIRF Category created successfully!");
      }

      statusList(state.page);
      handleCloseModal();
    } catch (error: any) {
      if (error?.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach((field) => {
          apiErrors[field] = Array.isArray(error.response.data[field])
            ? error.response.data[field][0]
            : error.response.data[field];
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
    {/* Header Section */}
    <div className="mb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-ti text-transparent"> NIRF Categorys</h1>
          <p className="text-gray-600 dark:text-gray-400">
          Manage NIRF Categorys
          </p>
        </div>
        <button
          onClick={() => setState({ showModal: true })}
          className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
          <IconPlus className="relative z-10 h-5 w-5" />
          <span className="relative z-10">Add NIRF Category</span>
        </button>
      </div>
    </div>

    <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="group relative">
          <TextInput
        placeholder="Search NIRF Category..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
            icon={<IconSearch className="h-4 w-4" />}
            className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
          />
        </div>
      </div>
    </div>

    <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
          NIRF Category List
          </h3>
          <div className="flex items-center gap-4">
            
            <div className="text-sm text-black ">
              {state.count} records found
            </div>
          </div>
        </div>
      </div>

      {/* <div className="overflow-x-auto"> */}
      <div className="overflow-x-auto border border-gray-200 bg-white">
          <DataTable
            noRecordsText="No NIRF Categorys found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.statusList}
            fetching={state.loading}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading NIRF Category...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: "name",
                title: "Name",
                render: ({ name }) => (
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
                      className="flex items-center justify-center rounded-lg text-blue-600 transition-all duration-200  dark:text-blue-400"
                      title="Edit"
                    >
                      <IconEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      className="flex items-center justify-center rounded-lg  text-red-600 transition-all duration-200  "
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
              statusList(1);
            }}
            minHeight={200}
          />
        </div>

        {/* <div className="border-t border-gray-200 p-6 dark:border-gray-700">
          <Pagination
            activeNumber={handlePageChange}
            totalPage={state.count}
            currentPages={state.page}
            pageSize={state.pageSize}
          />
        </div> */}
      </div>

      <Modal
        open={state.showModal}
        close={handleCloseModal}
        subTitle={`${state.editId ? "Update" : "Add New"} NIRF Category`}
        closeIcon
        renderComponent={() => (
          <div className="relative">
            {/* <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-dblue dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} NIRF Category
              </h2>
            </div> */}

            <div className="space-y-6">
              <TextInput
                title="NIRF Category"
                placeholder="Enter NIRF Category"
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

export default PrivateRouter(NIRFCategory);
