import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
import IconEdit from "@/components/Icon/IconEdit";
import {
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
import IconMapPin from "@/components/Icon/IconMapPin";
import Link from "next/link";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import { propertyType } from "@/utils/constant.utils";
import { FaHome } from "react-icons/fa";


export default function list() {
  const router = useRouter();

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
  });

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", state.search);

  useEffect(() => {
    projectList(1);
  }, []);

  useEffect(() => {
    projectList(1);
  }, [debouncedSearch]);

  const projectList = async (page) => {
    try {
      const body = bodyData();
      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
      }));

      setState({
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
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
      projectList(1);
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
      projectList(state.page);

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

      const res = await Models.project.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      projectList(state.page);

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

  const bodyData = () => {
    let body: any = {}; // start with empty object

    if (state.search) {
      body.search = state.search;
    }

    console.log("✌️body --->", body);
    return body;
  };

  const handleEdit = (row) => {
    setState({
      name: row.name,
      location: row.location,
      description: row.description,
      isOpen: true,
      editId: row?.id,
    });
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
      projectList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      projectList(newPage);
    }
  };

    const properties = [
    {
      id: 1,
      city: "Panama City",
      title: "Willow Creek Residence",
      date: "04 April, 2023",
      price: "$34,542.000",
      propertyType:{type: "Plot",
        color:"warning"
      },
      area: "34,542 sq.ft",
      status: "Active",
      image: "/assets/images/real-estate/property-info-img1.png", 
    },
    {
      id: 2,
      city: "Panama City",
      title: "Harmony House",
      date: "04 April, 2023",
      price: "$34,542.000",
      propertyType:{type: "Rent",
        color:"secondary"
      },
      
      area: "34,542 sq.ft",
      status: "Active",
      image: "/assets/images/real-estate/property-info-img2.png",
    },
    {
      id: 3,
      city: "Panama City",
      title: "Sunflower Cottage",
      date: "04 April, 2023",
      price: "$34,542.000",
     propertyType:{type: "Sale",
        color:"success"
      },
      area: "34,542 sq.ft",
      status: "Active",
      image: "/assets/images/real-estate/property-info-img3.png",
    },
    {
      id: 4,
      city: "Panama City",
      title: "Sunset Retreat",
      date: "04 April, 2023",
      price: "$34,542.000",
       propertyType:{type: "Lease",
        color:"info"
      },
      area: "34,542 sq.ft",
      status: "Active",
      image: "/assets/images/real-estate/property-info-img4.png",
    },
  
    
  ];

  const propertStatus = [
    {value:1, label:"Active"},
    {value:2, label:"In Active"}
  ]

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Property List
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
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            className="w-100 form-input"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex-1">
          <CustomSelect
            placeholder="Select Property Type"
            value={state.property_type}
            onChange={(e) => setState({ property_type: e })}
            options={propertyType}
          />
        </div>

        <div className="flex-1">
          <CustomSelect
            placeholder="Select Property Status"
            value={state.status}
            onChange={(e) => setState({ status: e })}
            options={propertStatus}
          />
        </div>

        {/* Status Dropdown */}

        {/* Bulk Actions Dropdown */}

        {/* <div > */}
        <button
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
        </button>
        {/* </div> */}
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding">
          <DataTable
            className="table-hover whitespace-nowrap"
            records={properties || []}
            columns={[
              {
                accessor: "name",
                title: "Property Info",

                render: (row) => (
                  <div className="flex gap-3 font-semibold">
                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                      <img
                        className="h-50 w-50 cursor-pointer rounded-md object-cover"
                        src={row.image}
                        alt=""
                      />
                    </div>
                    <div className="flex flex-col justify-between py-2">
                      <div>
                        <div className="flex gap-1">
                          {" "}
                          <IconMapPin className="h-4 w-4" />
                          {row.city}
                        </div>
                        <Link
                          className="cursor-pointer text-lg font-bold"
                          href={`/real-estate/profile/${row.id}/`}
                        >
                          {row.title}
                        </Link>
                      </div>
                      {/* <div>
                        <Link className="flex gap-1 text-primary" href={"#"}>
                          <FaHome className="text-black" /> View Details
                        </Link>
                      </div> */}
                    </div>
                  </div>
                ),
              },
              { accessor: "date", title: "Listed Date	" },

              { accessor: "price", title: "Price Range	" },

              {
                accessor: "role",
                title: "Property Type",
                render: (row: any) => (
                  <span
                    className={`badge badge-outline-${row?.propertyType?.color} `}
                  >
                    {row?.propertyType?.type}
                  </span>
                ),
              },
              { accessor: "status", title: "Status" },
              {
                accessor: "action",
                title: "Actions",
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
                    {/* <Link
                      href="/real-estate/profile"
                      className="flex hover:text-primary"
                    >
                      <IconEye />
                    </Link> */}
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
            ]}
            highlightOnHover
            totalRecords={state?.initialRecords?.length}
            recordsPerPage={state?.pageSize}
            page={null}
            onPageChange={(p) => {}}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
          />
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
}
