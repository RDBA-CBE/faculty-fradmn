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

export default function list() {
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
    categoryList(1);
  }, [debouncedSearch]);

  const categoryList = async (page) => {
    try {
      const body = bodyData();
      const res: any = await Models.category.list(page, body);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        location: item?.location,
        properties_count: item?.properties_count,
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
      await Utils.Validation.category.validate(body, { abortEarly: false });

      const res = await Models.category.create(body);

      clearData();
      setState({ btnLoading: false });
      categoryList(1);
      Success("Category created succssfully");
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
      await Utils.Validation.category.validate(body, { abortEarly: false });

      const res = await Models.category.update(body, state.editId);
      console.log("createProject --->", res);
      clearData();
      setState({ btnLoading: false });
      categoryList(state.page);

      Success("Category updated succssfully");
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

      const res = await Models.category.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      categoryList(state.page);

      Success("Category deleted succssfully");
    } catch (error) {
      setState({ btnLoading: false });

      console.log("✌️error --->", error);
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
      "Are you sure want to delete category?"
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
      categoryList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      categoryList(newPage);
    }
  };

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Category List
          </h5>
        </div>
        {/* <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-primary  w-full md:mb-0 md:w-auto"
            onClick={() => setState({ isOpen: true })}
          >
            + Create
          </button>
        </div> */}
      </div>

      {/* <div className="panel mb-5 mt-5 gap-2 px-2 md:mt-0 md:flex md:justify-between xl:gap-4">
       
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
       
        <div>
          <button type="button" className="btn btn-primary">
            Clear Filter
          </button>
        </div>
      </div> */}

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding">
          {/* <div className="flex items-center justify-end pb-2 pr-3">
            <div className="rounded-lg bg-gray-300 p-1 font-semibold">
              {state.page}-{Math.min(state.page * 10, state.totalRecords)} of{" "}
              {state.totalRecords}
            </div>
          </div> */}
          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={[
              { accessor: "name", title: "Category Name" },
              { accessor: "properties_count", title: "No of Properties" },

              // {
              //   accessor: "actions",
              //   title: "Actions",
              //   render: (row: any) => (
              //     <div className="mx-auto flex w-max items-center gap-4">
              //       <button
              //         className="flex hover:text-primary"
              //         onClick={(e) => {
              //           handleEdit(row);
              //         }}
              //       >
              //         <IconEdit className="h-4.5 w-4.5" />
              //       </button>
              //       <button
              //         className="flex text-danger hover:text-primary"
              //         onClick={() => handleDelete(row)}
              //       >
              //         <IconTrash />
              //       </button>
              //     </div>
              //   ),
              // },
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
        addHeader={state.editId ? "Update Category" : "Create Category"}
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
                  title="Category Name"
                  placeholder="Enter category name"
                  value={state.name}
                  onChange={(e) => {
                    setState({
                      name: e.target.value,
                      error: { ...state.error, name: "" },
                    });
                  }}
                  error={state.error?.name}
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
