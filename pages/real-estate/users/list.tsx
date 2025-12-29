import Link from "next/link";
import { DataTable } from "mantine-datatable";
import { useEffect } from "react";

import IconTrashLines from "@/components/Icon/IconTrashLines";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import PrivateRouter from "@/hook/privateRouter";

import Models from "@/imports/models.import";
import {
  capitalizeFLetter,
  Failure,
  formatDate,
  showDeleteAlert,
  Success,
  Dropdown,
  useSetState,
} from "@/utils/function.utils";
import moment from "moment";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import TextInput from "@/components/FormFields/TextInput.component";
import Modal from "@/components/modal/modal.component";
import TextArea from "@/components/FormFields/TextArea.component";
import IconLoader from "@/components/Icon/IconLoader";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import { FILTER_ROLES, roleList } from "@/utils/constant.utils";

const List = () => {
  const [state, setState] = useSetState({
    previousPage: false,
    nextPage: false,
    currentPage: 1,
    role: null,
    page: 1,
    btnLoading: false,
    tableList: [],
    editId: null,
    search: "",
    total: null,
    next: null,
    previous: null,
    totalRecords: null,
    userList: [],
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    date: "",
    address: "",
    isOpen: false,
    error: {},
  });

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", state.search);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setState(() => {
      userId;
    });
  }, []);

  useEffect(() => {
    usersList(1);
    groupsList(1);
  }, []);

  useEffect(() => {
    usersList(1);
  }, [debouncedSearch, state.role]);

  const groupsList = async (page: any) => {
    try {
      const res: any = await Models.user.group(page);
      console.log("res", res);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        groupList: dropdown.filter((item) => item.label !== "Admin"),
        groupPage: page,
        groupNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  console.log("groupList", state.groupList);

  const usersList = async (page: any) => {
    try {
      const body = bodyData();
      console.log("body", body);

      const res: any = await Models.user.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        first_name: item?.first_name,
        last_name: item?.last_name,
        email: item.email,
        // date: moment(item.created_at).format("DD/MM/YYYY HH:mm"),
        date: formatDate(item.created_at, "DD/MM/YYYY"),
        role: {
          role: item.user_type,
          color:
            item.user_type == "buyer"
              ? "success"
              : item.user_type == "developer"
              ? "secondary"
              : item.user_type == "agent"
              ? "info"
              : item.user_type == "seller"
              ? "warning"
              : "success",
        },
        ...item,
      }));

      setState({
        userList: res.results,
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error: any) {
      console.log("✌️error --->", error);
    }
  };

  const createUser = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        first_name: state?.first_name,
        last_name: state?.last_name,
        email: state?.email,
        password: state?.password,
        phone: state?.phone,
        groups: [state?.role?.value],
        // groups: state?.role?.map((item) => item?.value),
        address: state?.address,
        account_status: "approved",
        approved_by: state.userId,
      };

      console.log("create body", body);

      await Utils.Validation.user.validate(body, { abortEarly: false });

      const res = await Models.user.create(body);
      clearData();
      setState({ btnLoading: false });
      usersList(1);
      Success("User created succssfully");
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        console.log("error", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateUsers = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        first_name: state?.first_name,
        last_name: state?.last_name,
        email: state?.email,
        phone: state?.phone,
        role: state?.role?.value,
        address: state?.address,
      };

      const res = await Models.user.update(body, state.editId);

      clearData();
      setState({ btnLoading: false });
      usersList(state.page);

      Success("User updated succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        console.log("errors --->", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }
    if (state.role) {
      body.user_type = state.role.value;
    }
    body.account_status = "approved";

    return body;
  };

  const clearData = () => {
    setState({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "",
      editId: "",
      isOpen: false,
      error: {},
    });
  };

  const clearFilter = () => {
    setState({
      search: "",
      role: "",
    });
  };

  const handleEdit = (row) => {
    console.log("row", row);

    setState({
      first_name: row?.first_name,
      last_name: row?.last_name,
      email: row?.email,
      phone: row?.phone,
      role: state?.groupList?.find(
        (item) => item.label.toLowerCase() === row?.user_type?.toLowerCase()
      ),
      address: row?.address,
      editId: row?.id,
      isOpen: true,
    });
  };

  const deleteDecord = async (row) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.user.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      usersList(state.page);

      Success("User deleted succssfully");
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
      "Are you sure want to delete user?"
    );
  };

  const handleNextPage = () => {
    if (state?.next) {
      const newPage = state.page + 1;
      usersList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state?.previous) {
      const newPage = state.page - 1;
      usersList(newPage);
    }
  };

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            User List
          </h5>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-primary  w-full md:mb-0 md:w-auto"
            onClick={() => setState({ isOpen: true })}
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
            options={roleList}
          />
        </div>

        {/* <button
          type="button"
          className="btn btn-primary"
          onClick={() => usersList(1)}
        >
          Apply Filter
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => clearFilter()}
        >
          Clear Filter
        </button> */}
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding">
          <DataTable
            className="table-hover whitespace-nowrap"
            records={state?.tableList || []}
            columns={[
              {
                accessor: "name",
                title: "Name",

                render: (row) => (
                  <div className="flex items-center font-semibold">
                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                      <img
                        className="h-8 w-8 cursor-pointer rounded-full object-cover"
                        src={`/assets/images/profile-${row.id}.jpeg`}
                        alt=""
                      />
                    </div>
                    <Link
                      className="cursor-pointer"
                      href={`/real-estate/profile/${row.id}/`}
                    >
                      {row.first_name} {row.last_name}
                    </Link>
                  </div>
                ),
              },
              { accessor: "email", title: "Email" },
              { accessor: "date", title: "Date" },

              {
                accessor: "role",
                title: "Role",
                render: (row: any) => (
                  <span className={`badge badge-outline-${row?.role?.color} `}>
                    {capitalizeFLetter(row?.role?.role)}
                  </span>
                ),
              },
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
                    <Link
                      href="/real-estate/profile"
                      className="flex hover:text-primary"
                    >
                      <IconEye />
                    </Link>
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
        addHeader={state.editId ? "Update User" : "Create User"}
        open={state.isOpen}
        close={() => {
          clearData();
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="first_name"
                  type="text"
                  title="First Name"
                  placeholder="Enter First Name"
                  value={state.first_name}
                  onChange={(e) => setState({ first_name: e.target.value })}
                  // error={state.error?.first_name}
                  // required
                />

                <TextInput
                  name="last_name"
                  type="text"
                  title="Last Name"
                  placeholder="Enter First Name"
                  value={state.last_name}
                  onChange={(e) => setState({ last_name: e.target.value })}
                  // error={state.error?.last_name}
                  // required
                />

                <TextInput
                  name="email"
                  type="email"
                  title="Email"
                  placeholder="Enter Email"
                  value={state.email}
                  onChange={(e) => setState({ email: e.target.value })}
                  error={state?.error?.email}
                  required
                />

                {!state.editId && (
                  <TextInput
                    name="password"
                    type="password"
                    title="Password"
                    placeholder="Enter password"
                    value={state.password}
                    onChange={(e) => setState({ password: e.target.value })}
                    error={state?.error?.password}
                    required
                  />
                )}

                <TextInput
                  name="name"
                  type="phone"
                  title="Phone Number"
                  placeholder="Enter Phone Number"
                  value={state.phone}
                  onChange={(e) => setState({ phone: e.target.value })}
                  // error={state.error?.phone}
                  // required
                />

                <CustomSelect
                  title="Role"
                  placeholder="Select Role"
                  value={state.role}
                  onChange={(e) => setState({ role: e })}
                  options={state.groupList}
                />

                <TextArea
                  name="address"
                  title="Address"
                  placeholder="Enter Address"
                  value={state.address}
                  onChange={(e) => setState({ address: e.target.value })}
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
                  onClick={() => (state.editId ? updateUsers() : createUser())}
                  className="btn btn-primary ltr:ml-4 rtl:mr-4"
                >
                  {state.btnLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />
      {/* </div> */}
    </>
  );
};

export default PrivateRouter(List);
