import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
import IconEdit from "@/components/Icon/IconEdit";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  Failure,
  showDeleteAlert,
  Success,
  useSetState,
} from "@/utils/function.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconLoader from "@/components/Icon/IconLoader";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import IconTrash from "@/components/Icon/IconTrash";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { useRouter } from "next/navigation";
import PrivateRouter from "@/hook/privateRouter";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import Link from "next/link";
import { Calendar, Columns, Eye, EyeOff, Table } from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import {
  FILTER_ROLES,
  LEAD_SOURCE_OPTIONS,
  ROLES,
  STATUS_OPTIONS,
} from "@/utils/constant.utils";
import CustomeDatePicker from "@/components/datePicker";
import { group } from "console";

const List = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    categoryList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    visibleColumns: [],
    userList: [],
    role: null,
    groupList: [],
    group: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    leadList(1);
    categoryList(1);
    groupList();
    setState({ visibleColumns: columns });
  }, []);

  useEffect(() => {
    leadList(1);
  }, [
    debouncedSearch,
    state.user,
    state.developer,
    state.agent,
    state.role,
    state.lead_source,
    state.status,
    state.date,
  ]);

  const categoryList = async (page) => {
    try {
      const res: any = await Models.category.list(page, {});
      const droprdown = Dropdown(res?.results, "name");
      setState({
        categoryList: droprdown,
        categoryPage: page,
        categoryNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const groupList = async () => {
    try {
      const res: any = await Models.user.groups();
      const droprdown = Dropdown(res?.results, "name");
      const filter = droprdown?.filter(
        (item) => item?.label != "Admin" && item?.label != "Buyer"
      );

      setState({
        groupList: filter,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const catListLoadMore = async () => {
    try {
      if (state.categoryNext) {
        const res: any = await Models.category.list(state.categoryPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          categoryList: [...state.categoryList, ...newOptions],
          categoryNext: res.next,
          categoryPage: state.categoryPage + 1,
        });
      } else {
        setState({
          categoryList: state.categoryList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const leadList = async (page) => {
    try {
      const body = bodyData();
      const res: any = await Models.lead.list(page, body);
      const data = res?.results?.map((item) => ({
        full_name: item?.full_name,
        lead_source: capitalizeFLetter(item?.lead_source),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        date: commonDateFormat(item?.created_at),
        email: item?.email,
        property: item?.property_details?.title,
        property_type: item?.property_details?.property_type?.name,
        requirements: item?.requirements,
        assigned_to: item?.assigned_to_details
          ? `${item?.assigned_to_details?.first_name} ${item?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.assigned_by_details
          ? `${item?.assigned_by_details?.first_name} ${item?.assigned_by_details?.last_name}`
          : "",
      }));
      const group = localStorage.getItem("group");

      setState({
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
        group,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createProject = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.create(body);
      clearData();
      setState({ btnLoading: false });
      leadList(1);
      Success("Preject created succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateProject = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.update(body, state.editId);
      console.log("createProject --->", res);
      clearData();
      setState({ btnLoading: false });
      leadList(state.page);

      Success("Preject updated succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const deleteDecord = async (row) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.lead.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      leadList(state.page);

      Success("Preject deleted succssfully");
    } catch (error) {}
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => {
        deleteDecord(row);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete project?"
    );
  };

  const developerList = async (page) => {
    try {
      const body = {
        user_type: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const agentList = async (page) => {
    try {
      const body = {
        user_type: ROLES.AGENT,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const sellerList = async (page) => {
    try {
      const body = {
        user_type: ROLES.SELLER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const getuserList = (e) => {
    setState({ role: e, user: null });
    if (e?.label == "Developer") {
      developerList(1);
    } else if (e?.label == "Agent") {
      agentList(1);
    } else if (e?.label == "Seller") {
      sellerList(1);
    }
  };

  const bodyData = () => {
    const userId = localStorage.getItem("userId");
    const group = localStorage.getItem("group");
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }

    if (state.lead_source) {
      body.lead_source = state.lead_source.value;
    }

    if (state.property_type) {
      body.property_type = state.property_type;
    }

    if (state.status) {
      body.status = state.status.value;
    }

    if (state.date) {
      body.date = backendDateFormat(state.date);
    }

    if (state.user) {
      body.created_by = state.user?.value;
    } else {
      if (state.role) {
        body.created_by_group = state.role?.value;
      } else {
        body.created_by = userId;
      }
    }

    // if (group == capitalizeFLetter(ROLES.ADMIN)) {
    //   body = { ...body, ...adminBody() };
    // }

    console.log("✌️body --->", body);
    return body;
  };

  // const adminBody = () => {
  //   let body: any = {};
  //   if (state.user) {
  //     body.created_by = state.user?.value;
  //   } else {
  //     if (state.role) {
  //       body.group = state.role?.value;
  //     }
  //   }
  //   return body;
  // };

  const handleEdit = (row) => {
    router.push(`/real-estate/lead/update/${row?.id}`);
    console.log("✌️row --->", row);
  };

  const clearData = () => {
    setState({
      editId: null,
      name: "",
      location: "",
      description: "",
      isOpen: false,
      error: {},
    });
  };

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.page + 1;
      leadList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      leadList(newPage);
    }
  };

  const toggleColumn = (accessor: string) => {
    const updatedColumns = state.visibleColumns?.map((col) =>
      col.accessor === accessor ? { ...col, visible: !col.visible } : col
    );
    setState({ visibleColumns: updatedColumns });
  };

  const toggleAllColumns = (visible: boolean) => {
    const updatedColumns = state.visibleColumns?.map((col) => ({
      ...col,
      visible: col.toggleable === false ? col.visible : visible,
    }));
    setState({ visibleColumns: updatedColumns });
  };

  const filteredColumns = state.visibleColumns
    ?.filter((col) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }) => col);

  

  const columns = [
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "property",
      title: "Property",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "property_type",
      title: "Property Type",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "full_name",
      title: "Customer Name",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "email",
      title: "Email",

      visible: true,
      toggleable: true,
    },

    {
      accessor: "assigned_to",
      title: "Assigned To",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "lead_source",
      title: "Lead Source",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "status",
      title: "Status",

      visible: true,
      toggleable: true,
    },

    {
      accessor: "requirements",
      sortable: false,
      render: (row) => (
        <Tippy
          content={row?.requirements}
          placement="top"
          className="rounded-lg bg-black p-1 text-sm text-white"
        >
          <div>
            {row?.requirements?.length > 20
              ? `${row.requirements.slice(0, 20)}...`
              : row?.requirements}
          </div>
        </Tippy>
      ),
    },

    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false,
      sortable: false,
      textAlignment: "center",
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            className="flex hover:text-info"
            onClick={(e) => {
              handleEdit(row);
            }}
          >
            <IconEdit className="h-4.5 w-4.5" />
          </button>

          <button
            className="flex hover:text-info"
            onClick={(e) => {
              router.push(`/real-estate/lead/view/${row?.id}`);
            }}
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            className="flex hover:text-danger"
            onClick={(e) => handleDelete(row)}
          >
            <IconTrashLines />
          </button>
        </div>
      ),
    },
  ];

  const visibleCount = state.visibleColumns?.filter(
    (col) => col.visible
  ).length;

  const totalToggleable = state.visibleColumns?.filter(
    (col) => col?.toggleable !== false
  ).length;

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Lead List
          </h5>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-primary  w-full md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/lead/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="panel mb-5 mt-5 gap-2 px-2 md:mt-0 md:flex md:justify-between xl:gap-4">
        <div className="flex-1">
          <input
            type="text"
            className="w-100 form-input"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
        </div>

        {/* <div className="flex-1">
          <CustomSelect
            placeholder="Select Property Type"
            value={state.}
            onChange={(e) => setState({ property_type: e })}
            options={state?.categoryList}
            isClearable={true}
            loadMore={() => catListLoadMore()}
          />
        </div> */}

        <div className="flex-1">
          <CustomSelect
            value={state.lead_source}
            onChange={(e) => setState({ lead_source: e })}
            placeholder={"Lead Source"}
            options={LEAD_SOURCE_OPTIONS}
            error={state.errors?.lead_source}
            isClearable={true}
          />
        </div>

        <div className="flex-1">
          <CustomSelect
            value={state.status}
            onChange={(e) => setState({ status: e })}
            placeholder={"Status"}
            options={STATUS_OPTIONS}
            error={state.errors?.status}
            required
            className="w-full"
          />
        </div>

        {state.group == "Admin" && (
          <>
            <div className="flex-1">
              <CustomSelect
                placeholder="Role"
                value={state.role}
                onChange={(e) => {
                  getuserList(e);
                  setState({ userList: [] });
                }}
                options={state.groupList}
              />
            </div>

            <div className="flex-1">
              <CustomSelect
                placeholder="user"
                value={state.user}
                onChange={(e) => setState({ user: e })}
                options={state.userList}
              />
            </div>
          </>
        )}

        <div className="flex-1">
          <CustomeDatePicker
            value={state.date}
            placeholder="Choose Date"
            onChange={(e) => setState({ date: e })}
            showTimeSelect={false}
          />
        </div>

        <div>
          <button type="button" className="btn btn-primary">
            Clear Filter
          </button>
        </div>
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              marginBottom: "16px",
              gap: "10px",
            }}
          >
            <Popover position="bottom-end" withArrow shadow="md" width={220}>
              <Popover.Target>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#475569",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                  className="hover:border-gray-400 hover:shadow-sm"
                >
                  <Columns size={16} color="#64748b" />
                  <span>Show Columns</span>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {visibleCount}
                  </div>
                </div>
              </Popover.Target>

              <Popover.Dropdown
                style={{
                  padding: "16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <Text
                    size="sm"
                    fw={600}
                    style={{ color: "#1e293b", marginBottom: "12px" }}
                  >
                    Show Columns
                  </Text>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#475569",
                        transition: "all 0.2s ease",
                      }}
                      className="hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => toggleAllColumns(true)}
                    >
                      <Eye size={14} color="#475569" />
                      <span>All</span>
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#475569",
                        transition: "all 0.2s ease",
                      }}
                      className="hover:border-gray-300 hover:bg-gray-50"
                      onClick={() => toggleAllColumns(false)}
                    >
                      <EyeOff size={14} color="#475569" />
                      <span>None</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {state.visibleColumns?.map((column) => (
                      <div
                        key={column.accessor}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Checkbox
                          checked={column.visible ?? true}
                          onChange={() => toggleColumn(column.accessor)}
                          disabled={column.toggleable === false}
                          size="sm"
                          style={{ flexShrink: 0 }}
                        />
                        <Text
                          size="sm"
                          style={{
                            color:
                              column.toggleable === false
                                ? "#94a3b8"
                                : "#475569",
                            cursor:
                              column.toggleable === false
                                ? "not-allowed"
                                : "pointer",
                          }}
                          onClick={() =>
                            column.toggleable !== false &&
                            toggleColumn(column.accessor)
                          }
                        >
                          {column.title}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "12px",
                    fontSize: "12px",
                    color: "#64748b",
                    textAlign: "center",
                  }}
                >
                  {visibleCount} of {totalToggleable} columns visible
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={filteredColumns}
            highlightOnHover
            totalRecords={state.taskList?.length}
            recordsPerPage={state.pageSize}
            minHeight={200}
            page={null}
            onPageChange={(p) => {}}
            withBorder={true}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
            style={{ zIndex: 0 }}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            disabled={!state.previous}
            onClick={handlePreviousPage}
            className={`btn ${
              !state.previous ? "btn-disabled" : "btn-primary"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state.next}
            onClick={handleNextPage}
            className={`btn ${!state.next ? "btn-disabled" : "btn-primary"}`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

      <Modal
        addHeader={state.editId ? "Update Project" : "Create Project"}
        open={state.isOpen}
        close={() => {
          clearData();
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="name"
                  title="Project Name"
                  placeholder="Enter project name"
                  value={state.name}
                  onChange={(e) => setState({ name: e.target.value })}
                  error={state.error?.name}
                  required
                />

                <TextInput
                  name="name"
                  title="Location"
                  placeholder="Enter location"
                  value={state.location}
                  onChange={(e) => setState({ location: e.target.value })}
                  error={state.error?.location}
                  required
                />

                <TextArea
                  name="description"
                  title="Description"
                  placeholder="Enter Description"
                  value={state.description}
                  onChange={(e) => setState({ description: e.target.value })}
                />
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  type="button"
                  className="btn btn-outline-primary gap-2"
                  onClick={() => {
                    clearData();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    state.editId ? updateProject() : createProject()
                  }
                  className="btn btn-primary ltr:ml-4 rtl:mr-4"
                >
                  {state.btnLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />
    </>
  );
};

export default PrivateRouter(List);
