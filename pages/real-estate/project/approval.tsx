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
import PrivateRouter from "@/hook/privateRouter";

const List = () => {
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

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Waiting for Property Approval List
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
            placeholder="Select Role"
            value={state.role}
            onChange={(e) => setState({ role: e })}
            options={state.roleList}
            // error={state.errors?.tags}
          />
        </div>

        <div className="flex-1">
          <CustomSelect
            placeholder="Select Role"
            value={state.role}
            onChange={(e) => setState({ role: e })}
            options={state.roleList}
            // error={state.errors?.tags}
          />
        </div>
        {/* Status Dropdown */}

        {/* Bulk Actions Dropdown */}

        <div>
          <button type="button" className="btn btn-primary">
            Clear Filter
          </button>
        </div>
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding"></div>
        <DataTable
          className="table-responsive"
          records={state.tableList || []}
          columns={[
            { accessor: "name", title: "Project Name" },
            { accessor: "location", title: "Location" },
            { accessor: "status", title: "status" },

            {
              accessor: "actions",
              title: "Actions",
              render: (row: any) => (
                <div className="mx-auto flex w-max items-center gap-4">
                  <button
                    className="flex hover:text-primary"
                    onClick={(e) => {
                      handleEdit(row);
                    }}
                  >
                    <IconEdit className="h-4.5 w-4.5" />
                  </button>
                  <button
                    className="flex text-danger hover:text-primary"
                    onClick={() => handleDelete(row)}
                  >
                    <IconTrash />
                  </button>
                </div>
              ),
            },
          ]}
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
        />
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
