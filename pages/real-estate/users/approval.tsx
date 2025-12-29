import Link from "next/link";
import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { useSetState } from "@mantine/hooks";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import PrivateRouter from "@/hook/privateRouter";
import Models from "@/imports/models.import";
import { capitalizeFLetter, formatDate, Success } from "@/utils/function.utils";

import useDebounce from "@/hook/useDebounce";

import { roleList } from "@/utils/constant.utils";

const List = () => {
  const [state, setState] = useSetState<any>({
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

  useEffect(() => {
    usersList(1);
  }, []);

  useEffect(() => {
    usersList(1);
  }, [debouncedSearch, state.role]);

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

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }
    if (state.role) {
      body.user_type = state.role.value;
    }
    body.account_status = "pending_review";

    return body;
  };

  const clearFilter = () => {
    setState({
      search: "",
      role: "",
    });
  };

  const handleApprove = async (row) => {
    try {
      setState({ btnLoading: true });
      const body = {
        account_status: "approved",
        is_active:true
      };

      const res = await Models.user.update(body, row?.id);
      setState({ btnLoading: false });
      usersList(state.page);
      Success("User Approval successfully");
    } catch (error) {}
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
            Waiting For User Approval List
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
            placeholder="Role"
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
                    <div className="flex gap-5">
                      <button
                        type="button"
                        className="btn btn-outline-primary w-full md:mb-0 md:w-auto"
                        onClick={() => handleApprove(row)}
                      >
                        Approve
                      </button>
                    </div>
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
    </>
  );
};

export default PrivateRouter(List);
