import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
import IconEdit from "@/components/Icon/IconEdit";
import {
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  Failure,
  formatPriceRange,
  formatToINR,
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
import IconMapPin from "@/components/Icon/IconMapPin";
import Link from "next/link";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import {
  LISTING_TYPE_LIST,
  ListType,
  propertyType,
} from "@/utils/constant.utils";
import { FaHome } from "react-icons/fa";
import { RotatingLines } from "react-loader-spinner";
import { Checkbox, Popover, Text } from "@mantine/core";
import {
  Calendar,
  Columns,
  Eye,
  EyeOff,
  LucideHome,
  Table,
} from "lucide-react";

export default function list() {
  const router = useRouter();

  const tableColumns = [
    {
      accessor: "name",
      title: "Property Info",
      visible: true,
      toggleable: true,
      render: (row) => (
        <div className="flex gap-3 font-semibold">
          <div className="flex flex-col justify-between ">
            <div>
              <Link
                className="cursor-pointer text-sm"
                href={`/real-estate/profile/${row.id}/`}
              >
                {row.title}
              </Link>
            </div>
          </div>
        </div>
      ),
    },

    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "agent",
      title: "Agent",
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
      accessor: "role",
      title: "Offer Type",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color} `}>
          {row?.listing_type?.type}
        </span>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false, // Actions column cannot be hidden
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

  const allColumns = [
    {
      accessor: "name",
      title: "Property Info",
      visible: true,
      toggleable: true,
      render: (row) => {
        const group = localStorage.getItem("group");

        return (
          <div className="flex gap-3 font-semibold">
            <div className="h-28 w-44 rounded-md bg-white-dark/30 ltr:mr-2 rtl:ml-2">
              <img
                className="h-full w-full cursor-pointer rounded-md object-cover"
                src={row.image}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-between py-2">
              <div>
                <div className="flex gap-1">
                  <IconMapPin className="h-4 w-4" />
                  {row.location}
                </div>
                <Link
                  className="cursor-pointer text-lg font-bold"
                  href={`/real-estate/profile/${row.id}/`}
                >
                  {row.title}
                </Link>
              </div>
              {group !== "Admin" && (
                <span
                  className={`badge  ${
                    row?.is_approved
                      ? "badge-outline-success w-[70px]"
                      : "badge-outline-warning w-[140px]"
                  }`}
                >
                  {row?.is_approved ? "Approved" : "Waiting For Approval"}
                </span>
              )}
              <div>
                <Link className="flex gap-1 text-primary" href={"/detail"}>
                  <LucideHome className="h-4 w-4 text-black" /> View Details
                </Link>
              </div>
            </div>
          </div>
        );
      },
    },

    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "agent",
      title: "Agent",
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
      accessor: "role",
      title: "Offer Type",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color} `}>
          {row?.listing_type?.type}
        </span>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false, // Actions column cannot be hidden
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

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    group: null,
    page: 1,
    tableList: [],
    categoryList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    loading: false,
    userId: null,
    visibleColumns: allColumns,
    viewMode: "image",
  });

  const visibleCount = state.visibleColumns.filter((col) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col) => col.toggleable !== false
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", debouncedSearch);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setState({
      userId: userId,
    });
  }, []);

  useEffect(() => {
    categoryList(1);
  }, []);

  useEffect(() => {
    if (state.userId !== null) {
      propertyList(1);
    }
  }, [
    debouncedSearch,
    state.userId,
    state.property_type,
    state.offer_type,
    state.status,
  ]);

  useEffect(() => {
    if (state.viewMode == "table") {
      setState({
        visibleColumns: tableColumns,
      });
    } else {
      setState({
        visibleColumns: allColumns,
      });
    }
  }, [state.viewMode]);

  const propertyList = async (page) => {
    try {
      setState({ loading: true });
      const body = bodyData();
      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item) => ({
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        total_area: item?.total_area,
        property_type: item?.property_type?.name,
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color:
            item?.listing_type == LISTING_TYPE_LIST.RENT
              ? "warning"
              : item?.listing_type == LISTING_TYPE_LIST.SALE
              ? "secondary"
              : item?.listing_type == LISTING_TYPE_LIST.LEASE
              ? "info"
              : "success",
        },

        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
        agent: `${capitalizeFLetter(
          item?.agent?.first_name
        )} ${capitalizeFLetter(item?.agent?.last_name)}`,
        project: capitalizeFLetter(item?.project?.name),

        // price: formatToINR(item?.price),
        price: formatPriceRange(
          item?.price_range?.minimum_price,
          item?.price_range?.maximum_price
        ),

        is_approved: item?.is_approved,
        image:
          item?.primary_image ??
          "/assets/images/real-estate/property-info-img1.png",
      }));

      setState({
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
        loading: false,
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

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

  const deleteDecord = async (row: any) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.property.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      propertyList(state.page);

      Success("Property deleted succssfully");
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

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = debouncedSearch;
    }
    if (state.userId) {
      body.userId = state.userId;
    }

    if (state.property_type) {
      body.property_type = state.property_type.value;
    }

    if (state.offer_type) {
      body.listing_type = state.offer_type.value;
    }

    if (state.status) {
      body.status = state.status.value;
    }

    return body;
  };

  const handleEdit = (row) => {
    router.push(`/real-estate/property/update/${row?.id}`);
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
      propertyList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      propertyList(newPage);
    }
  };

  const clearFilter = async () => {
    setState({
      search: "",
      property_type: "",
      offer_type: "",
      status: "",
      role: { value: "developer", label: "Developer" },
      user: "",
      // developer: "",
      // agent: "",
    });
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

  const propertStatus = [
    { value: 1, label: "Active" },
    { value: 2, label: "In Active" },
  ];

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            My Property List
          </h5>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-primary  w-full md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/property/create")}
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

        <div className="flex-1">
          <CustomSelect
            placeholder="Select Property Type"
            value={state.property_type}
            onChange={(e) => setState({ property_type: e })}
            options={state?.categoryList}
            isClearable={true}
            loadMore={() => catListLoadMore()}
          />
        </div>

        <div className="flex-1">
          <CustomSelect
            placeholder="Select Offer Type"
            value={state.offer_type}
            onChange={(e) => setState({ offer_type: e })}
            options={ListType}
          />
        </div>

        {/* Status Dropdown */}

        {/* Bulk Actions Dropdown */}

        {/* <button
          type="button"
          className="btn btn-primary"
          // onClick={() => usersList(1)}
        >
          Apply Filter
        </button>
        <button
          type="button"
          className="btn btn-primary"
          // onClick={() => clearFilter()}
        >
          Clear Filter
        </button> */}
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          {state?.loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <RotatingLines
                visible={true}
                strokeColor="gray"
                strokeWidth="5"
                animationDuration="0.75"
                width="40"
                ariaLabel="rotating-lines-loading"
              />
            </div>
          ) : state.tableList.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                  marginBottom: "16px",
                  gap: "10px",
                }}
              >
                <div className="flex items-center gap-3 rounded-md border bg-white px-3  shadow-sm">
                  <button
                    onClick={() => setState({ viewMode: "table" })}
                    className={`rounded-md p-2 transition-all duration-200 `}
                  >
                    <Table
                      size={18}
                      color={state.viewMode == "table" ? "blue" : "grey"}
                    />
                  </button>

                  <div className="h-6 w-px bg-gray-300" />

                  <button
                    onClick={() => setState({ viewMode: "image" })}
                    className={`rounded-md p-2 transition-all duration-200 `}
                  >
                    <Calendar
                      size={18}
                      color={state.viewMode == "image" ? "blue" : "grey"}
                    />
                  </button>
                </div>

                <Popover
                  position="bottom-end"
                  withArrow
                  shadow="md"
                  width={220}
                >
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
                className="table-hover whitespace-nowrap"
                records={state.tableList || []}
                columns={filteredColumns}
                highlightOnHover
              />
            </>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <p>No Records Found</p>
            </div>
          )}
        </div>

        <div className="me-2 mt-5 flex justify-end gap-3">
          <button
            disabled={!state?.previous}
            onClick={handlePreviousPage}
            className={`btn ${
              !state?.previous ? "btn-disabled" : "btn-primary"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state?.next}
            onClick={handleNextPage}
            className={`btn ${!state?.next ? "btn-disabled" : "btn-primary"}`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

      {/* <Modal
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
      /> */}
    </>
  );
}
