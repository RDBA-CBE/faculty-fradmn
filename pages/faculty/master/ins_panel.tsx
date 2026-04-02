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
    dispatch(setPageTitle("Panel Management"));
    profile();
  }, [dispatch]);

  useEffect(() => {
    if(state.profile){
    panelList(1,state.profile?.institution?.id);
  }
  }, [debounceSearch, state.sortBy,state.collegeFilter,state.profile]);

  const panelList = async (page = 1,insId) => {
    console.log("✌️page --->", page);
    try {

      setState({ loading: true });

      const body: any = {};
      if (state.search) body.search = state.search;
      if (insId) body.institution_id = insId;
      if(state.collegeFilter){
        body.college_id=state.collegeFilter?.value
      }
      console.log('✌️body --->', body);

      const res: any = await Models.master.panel_list(body, page);

      const data = res?.results?.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        department_name: item?.department?.short_name,
        department_id: item.department?.id,
        designation: item.designation,
        college: {
          label: item?.department?.college?.short_name,
          value: item?.department?.college?.id,
        },
      }));

      setState({
        panelList: data,
        count: res?.count,
        loading: false,
        page: page,
      });
    } catch {
      setState({ loading: false });
    }
  };
  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      collegeList(1, "", false, res?.institution?.id);
      CollegeDropList(1, "", false, res?.institution?.id);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const collegeList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };

      if (institutionId) {
        body.institution = institutionId;
      } else if (state.profile?.role === ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.id;
      }

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");

      setState({
        collegeLoading: false,
        collegePage: page,
        collegeList: loadMore ? [...state.collegeList, ...dropdown] : dropdown,
        collegeNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const CollegeDropList = async (
    page,
    search = "",
    loadMore = false,
    institutionId = null
  ) => {
    try {
      setState({ collegeLoading: true });
      const body: any = { search };

      if (institutionId) {
        body.institution = institutionId;
      } else if (state.profile?.role === ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.id;
      }

      const res: any = await Models.college.list(page, body);
      const dropdown = Dropdown(res?.results, "short_name");

      setState({
        collegeDropLoading: false,
        collegeDropPage: page,
        CollegeDropList: loadMore
          ? [...state.CollegeDropList, ...dropdown]
          : dropdown,
        collegeDropNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setState({ collegeLoading: false });
    }
  };

  const departmentList = async (
    page,
    search = "",
    loadMore = false,
    collegeId = null
  ) => {
    try {
      setState({ deptLoading: true });
      const body: any = { search };
      if (collegeId) {
        body.college = collegeId;
      }

      console.log("✌️body --->", body);

      const res: any = await Models.department.list(page, body);
      console.log("✌️res --->", res);
      const dropdown = Dropdown(res?.results, "short_name");

      setState({
        deptLoading: false,
        deptPage: page,
        departmentList: loadMore
          ? [...state.departmentList, ...dropdown]
          : dropdown,
        deptNext: res?.next,
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
      setState({ deptLoading: false });
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setState({ page: pageNumber });
    panelList(pageNumber,state.profile?.institution?.id);
  };

  const handleCloseModal = () => {
    setState({
      showModal: false,
      editId: null,
      name: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      errors: {},
      submitting: false,
      department_id: null,
      filterCollege: null,
    });
  };

  const handleEdit = (row) => {
    setState({
      editId: row?.id,
      showModal: true,
      name: row.name,
      email: row.email,
      phone: row.phone,
      department_id: {
        label: row.department_name,
        value: row.department_id,
      },

      filterCollege: row?.college,
      // department: {
      //   label: row.department_name,
      //   value: row.department_id,
      // },
      designation: row.designation,
      decision_maker: row?.decision_maker,
    });

    if (row?.college?.value) {
      departmentList(1, "", false, row?.college?.value);
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row.id),
      () => Swal.fire("Cancelled", "Record is safe", "info"),
      "Are you sure you want to delete this panel member?"
    );
  };

  const deleteRecord = async (id: number) => {
    try {
      await Models.master.delete_panel(id);
      Success("Panel member deleted successfully!");
      panelList(state.page,state.profile?.institution?.id);
    } catch (error) {
      Failure("Failed to delete panel member ");
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ submitting: true });

      const body = {
        name: capitalizeFLetter(state.name),
        email: state.email,
        phone: state.phone,
        department_id: state.department_id?.value,
        designation: capitalizeFLetter(state.designation),
        decision_maker: state.decision_maker,
        filterCollege: state.filterCollege?.value,
      };
      console.log("✌️body --->", body);

      await Utils.Validation.panel.validate(body, { abortEarly: false });

      if (state.editId) {
        await Models.master.update_panel(body, state.editId);
        Success("Panel member updated successfully");
      } else {
        await Models.master.create_panel(body);
        Success("Panel member created successfully");
      }

      handleCloseModal();
      panelList(state.page,state.profile?.institution?.id);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ errors: validationErrors, submitting: false });
      } else {
        if (error?.data?.error) {
          Failure(capitalizeFLetter(error?.data?.error));
        }
        setState({ submitting: false });
      }
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
      `Are you sure want to delete ${state.selectedRecords?.length} record(s)?`
    );
  };

  const bulkDeleteRecords = async () => {
    try {
      for (const id of state.selectedRecords) {
        await Models.master.delete_panel(id);
      }
      Success(
        `${state.selectedRecords?.length} panel member deleted successfully!`
      );
      setState({ selectedRecords: [] });
      panelList(state.page,state.profile?.institution?.id);
    } catch (error) {
      Failure("Failed to delete panel member. Please try again.");
    }
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="page-ti text-transparent">Panel Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage panel member
            </p>
          </div>
          <button
            onClick={() => setState({ showModal: true })}
            className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <IconPlus className="relative z-10 h-5 w-5" />
            <span className="relative z-10">Add Panel Member</span>
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-2xl  backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="group relative">
            <TextInput
              placeholder="Search panel member..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
              icon={<IconSearch className="h-4 w-4" />}
              className="transition-all duration-200 focus:shadow-lg group-hover:shadow-md"
            />
          </div>
          <CustomSelect
            options={state.collegeList}
            value={state.collegeFilter}
            onChange={(e) => setState({ collegeFilter: e })}
            placeholder="Select College"
            isClearable={true}
            onSearch={(e) =>
              collegeList(1, e, false, state.profile?.institution?.id)
            }
            loadMore={() =>
              state?.collegeNext &&
              collegeList(
                state.collegePage + 1,
                "",
                true,
                state.profile?.institution?.id
              )
            }
            loading={state.collegeLoading}
            className="!w-fit"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg   backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
              Panel Member List
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
            noRecordsText="No panel member found"
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={state.panelList}
            fetching={state.loading}
            selectedRecords={state.panelList?.filter((record) =>
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
                    Loading panel member...
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
                accessor: "email",
                title: "Email",
                sortable: true,
                render: ({ email }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {email}
                  </div>
                ),
              },

              {
                accessor: "college",
                title: "College",
                sortable: true,
                render: (row) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {row?.college?.label}
                  </div>
                ),
              },

              {
                accessor: "department_name",
                title: "Department",
                sortable: true,
                render: ({ department_name }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {department_name}
                  </div>
                ),
              },
              {
                accessor: "designation",
                title: "Designation",
                sortable: true,
                render: ({ designation }) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {designation}
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
              panelList(1,state.profile?.institution?.id);
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
        maxWidth="max-w-3xl"
        open={state.showModal}
        close={handleCloseModal}
        subTitle={`${state.editId ? "Update" : "Add New"} Panel Member`}
        closeIcon
        renderComponent={() => (
          <div className="relative">
            {/* <div className="mb-8 text-center">
              <div className="bg-dblue mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full dark:from-blue-900 dark:to-purple-900">
                {state.editId ? (
                  <IconEdit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                ) : (
                  <IconPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {state.editId ? "Update" : "Add New"} Panel Member
              </h2>
            </div> */}

            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-2">
              <TextInput
                title="Name"
                placeholder="Enter name"
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
              <TextInput
                title="Email"
                placeholder="Enter email"
                value={state.email}
                onChange={(e) =>
                  setState({
                    email: e.target.value,
                    errors: { ...state.errors, email: "" },
                  })
                }
                error={state.errors.email}
                required
              />
              <CustomPhoneInput
                title="Phone Number"
                value={state.phone}
                onChange={(e: any) =>
                  setState({
                    phone: e,
                    errors: { ...state.errors, phone: "" },
                  })
                }
                error={state.errors.phone}
                required
              />

              <CustomSelect
                options={state.CollegeDropList}
                value={state.filterCollege}
                onChange={(e) => {
                  departmentList(1, "", false, e?.value);

                  setState({
                    filterCollege: e,
                    department_id: null,
                    departmentList: [],
                    errors: { ...state.errors, filterCollege: "" },

                  });
                }}
                onSearch={(e) =>
                  CollegeDropList(1, e, false, state.profile?.institution?.id)
                }
                loadMore={() =>
                  state?.collegeDropNext &&
                  CollegeDropList(
                    state.collegePage + 1,
                    "",
                    true,
                    state.profile?.institution?.id
                  )
                }
                placeholder={"Select College"}
                isClearable={true}
                title="Select College"
                required
                loading={state.collegeDropLoading}
                error={state.errors?.filterCollege}
              />

              <CustomSelect
                options={state.departmentList}
                value={state.department_id}
                onChange={(selectedOption) =>
                  setState({
                    department_id: selectedOption,
                    errors: { ...state.errors, department_id: "" },
                  })
                }
                onSearch={(searchTerm) =>
                  departmentList(
                    1,
                    searchTerm,
                    false,
                    state.filterCollege?.value
                  )
                }
                placeholder="Select department"
                isClearable={state.profile?.role != ROLES.HOD}
                loadMore={() =>
                  state.deptNext &&
                  departmentList(
                    state.deptPage + 1,
                    "",
                    true,
                    state.filterCollege?.value
                  )
                }
                loading={state.deptLoading}
                title="Select department"
                error={state.errors.department_id}
                disabled={!state.filterCollege}
                required
              />
              <TextInput
                title="Designation"
                placeholder="Enter designation"
                value={state.designation}
                onChange={(e) =>
                  setState({
                    designation: e.target.value,
                    errors: { ...state.errors, designation: "" },
                  })
                }
                error={state.errors.designation}
                required
              />

              <CheckboxInput
                checked={state.decision_maker}
                onChange={(e) =>
                  setState({ decision_maker: !state.decision_maker })
                }
                label="Is Desicion Maker"
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
                className={`bg-dblue group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-3 text-sm font-medium text-white shadow-lg transition-all duration-200 ${
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

export default PrivateRouter(Category);
