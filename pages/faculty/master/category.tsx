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
  Dropdown,
  showDeleteAlert,
  useSetState,
} from "@/utils/function.utils";
import Modal from "@/components/modal/modal.component";
import { Models } from "@/imports/models.import";
import { Success, Failure } from "@/utils/function.utils";
import useDebounce from "@/hook/useDebounce";
import Swal from "sweetalert2";
import PrivateRouter from "@/hook/privateRouter";
import CustomPhoneInput from "@/components/phoneInput";
import * as Yup from "yup";
import Utils from "@/imports/utils.import";
import { ROLES } from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";

const Category = () => {
  const dispatch = useDispatch();
  const [state, setState] = useSetState({
    page: 1,
    pageSize: 10,
    experienceList: [],
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
    decision_maker: false,
  });

  const debounceSearch = useDebounce(state.search, 500);

  useEffect(() => {
    dispatch(setPageTitle("Category Management"));
    // categoryList(1);
  }, [dispatch]);

  useEffect(() => {
    categoryList(1);
  }, [debounceSearch, state.sortBy]);

  const categoryList = async (page) => {
    try {
      setState({ loading: true });
      const body: any = {};
      if (state.search) body.search = state.search;
      if (state.sortBy) {
        body.ordering =
          state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
      }

      const res: any = await Models.master.category_list(body);
      console.log("✌️res --->", res);
      const tableData = res?.results?.map((item) => ({
        id: item?.id,
        name: item?.name,
      }));

      setState({
        loading: false,
        categoryList: tableData,
        count: res?.count,
      });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch categories");
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    categoryList(pageNumber);
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
      "Are you sure you want to delete this category?"
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
      `Are you sure want to delete ${state.selectedRecords?.length} record(s)?`
    );
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.master.delete_category(id);
      }
      Success(
        `${state.selectedRecords?.length} Category deleted successfully!`
      );
      setState({ selectedRecords: [] });
      categoryList(state.page);
    } catch (error) {
      Failure("Failed to delete category. Please try again.");
    }
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.master.delete_category(id);
      Success("Category deleted successfully!");
      categoryList(state.page);
    } catch (error) {
      Failure("Failed to delete category");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });
      const body = { name: state.name };

      if (!state.name) {
        setState({ errors: { name: "Category name is required" } });
        return;
      }

      if (state.editId) {
        await Models.master.update_category(body, state.editId);
        Success("Category updated successfully!");
      } else {
        await Models.master.create_category(body);
        Success("Category created successfully!");
      }

      categoryList(state.page);
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
            <h1 className="page-ti text-transparent">Category Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage Category
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Category</span>
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative">
            <TextInput
              placeholder="Search category..."
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
              Category Management
            </h3>
            <div className="flex items-center gap-4">
              {state.selectedRecords?.length > 0 && (
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
                // <button
                //   // onClick={handleBulkDelete}
                //   className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                // >
                //   <IconTrash className="h-4 w-4" />
                //   Delete ({state.selectedRecords.length})
                // </button>
              )}
              <div className="text-sm text-black ">
                {state.count} records found
              </div>
            </div>
          </div>
        </div>

        {/* <div className="overflow-x-auto"> */}
        <div className="overflow-x-auto border border-gray-200 bg-white">
          <DataTable
            noRecordsText="No category found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.categoryList}
            fetching={state.loading}
            selectedRecords={state.categoryList?.filter((record) =>
              state.selectedRecords?.includes(record.id)
            )}
            onSelectedRecordsChange={(records) =>
              setState({ selectedRecords: records.map((r) => r.id) })
            }
            customLoader={
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <IconLoader className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading category...
                  </span>
                </div>
              </div>
            }
            columns={[
              {
                accessor: "name",
                title: "Name",
                sortable: true,
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
              // categoryList(1);
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
      closeIcon
      subTitle= {state.editId ? "Update Category" : "Add New Category"} 
        open={state.showModal}
        close={handleCloseModal}
        renderComponent={() => (
          <div className="relative">
            

            <div className="space-y-6">
              <TextInput
                title="Category Name"
                placeholder="Enter category name"
                value={state.name}
                onChange={(e) => setState({ name: e.target.value, errors: { ...state.errors, name: "" } })}
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
                  {state.submitting ? "Loading..." : state.editId ? "Update" : "Create"}
                </span>
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default PrivateRouter(Category);
