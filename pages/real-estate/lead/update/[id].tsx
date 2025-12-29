import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../../store/themeConfigSlice";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import IconUser from "@/components/Icon/IconUser";
import {
  Dropdown,
  Failure,
  Success,
  capitalizeFLetter,
  commonDateFormat,
  formatToINR,
  objIsEmpty,
  useSetState,
} from "../../../..//utils/function.utils";
import TextInput from "@/components/FormFields/TextInput.component";

import NumberInput from "@/components/FormFields/NumberInputs.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";

import Models from "@/imports/models.import";
import IconLoader from "@/components/Icon/IconLoader";
import TextArea from "@/components/FormFields/TextArea.component";

import * as Yup from "yup";

import IconSearch from "@/components/Icon/IconSearch";
import { SimpleGrid } from "@mantine/core";
import moment from "moment";
import IconMail from "@/components/Icon/IconMail";
import {
  LEAD_SOURCE_OPTIONS,
  LISTING_TYPE_LIST,
  ROLES,
  STATUS_OPTIONS,
} from "@/utils/constant.utils";
import { Building, Computer, LucideHome, User2, User2Icon } from "lucide-react";
import CustomeDatePicker from "@/components/datePicker";
import CustomPhoneInput from "@/components/phoneInput";
import Link from "next/link";
import IconMapPin from "@/components/Icon/IconMapPin";
import { useRouter, useSearchParams } from "next/navigation";
import Utils from "@/imports/utils.import";

const CreateOpportunities = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  useEffect(() => {
    dispatch(setPageTitle("Create Opportunity"));
  });

  const [state, setState] = useSetState({
    userId: null,
    loading: false,
    first_name: "",
    propertyPage: 1,
    propertyList: [],
    hasMoreProperty: false,
     error: {},
  });

  useEffect(()=>{
    const userId = localStorage.getItem("userId")
    setState({userId})
  },[])

  useEffect(() => {
    if (id) {
      leadDetails();
      propertyList(1);
    }
  }, [id]);

  const leadDetails = async () => {
    try {
      setState({ loading: true });

      const res: any = await Models.lead.details(id);
      setState({
        first_name: res?.first_name,
        last_name: res?.last_name,
        company_name: res?.company_name,
        email: res?.email,
        phone: res?.phone,
        next_follow_up: res?.next_follow_up,
        requirements: res?.requirements,
      });
      if (res?.assigned_to) {
        setState({
          assignRole: {
            value: res?.assigned_to_details?.user_type,
            label: capitalizeFLetter(res?.assigned_to_details?.user_type),
          },
          assigned_to: {
            value: res?.assigned_to_details?.id,
            label: `${capitalizeFLetter(
              res?.assigned_to_details?.first_name
            )} ${capitalizeFLetter(res?.assigned_to_details?.last_name)} `,
          },
        });
        getInitialRoleList(res?.assigned_to_details?.user_type);
      }

      if (!objIsEmpty(res?.property_details)) {
        handleGetProperty({
          value: res?.property_details?.id,
          label: capitalizeFLetter(res?.property_details?.title),
        });
      }
      if (res?.status) {
        setState({
          status: {
            value: res?.status,
            label: capitalizeFLetter(res?.status),
          },
        });
      }

      if (res?.lead_source) {
        setState({
          lead_source: {
            value: res?.lead_source,
            label: capitalizeFLetter(res?.lead_source),
          },
        });
      }

      console.log("leadDetails --->", res);
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getInitialRoleList = async (e) => {
    try {
      if (e) {
        const body = {
          user_type: e == ROLES.DEVELOPER ? ROLES.DEVELOPER : ROLES.AGENT,
        };
        const res: any = await Models.user.list(1, body);
        const dropdown = res?.results?.map((item) => ({
          value: item?.id,
          label: `${capitalizeFLetter(item?.first_name)} ${item?.last_name}`,
        }));
        setState({
          assignList: dropdown,
        });
      } else {
        setState({ assignList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const propertyList = async (id: any) => {
    try {
      setState({ loading: true });

      const res: any = await Models.property.list(1, {});
      const dropdownList = Dropdown(res.results, "title");
      setState({
        propertyList: dropdownList,
        loading: false,
        hasMoreProperty: res.next,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const propertyLoadMore = async () => {
    try {
      if (state.hasMoreProperty) {
        const res: any = await Models.property.list(state.propertyPage + 1, {});
        const newOptions = Dropdown(res?.results, "title");
        setState({
          propertyList: [...state.propertyList, ...newOptions],
          hasMoreProperty: res.next,
          propertyPage: state.propertyPage + 1,
        });
      } else {
        setState({
          propertyList: state.propertyList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleGetProperty = async (e) => {
    try {
      setState({
        property_name: e,
        error: { ...state.error, interested_property: null },
      });
      if (e) {
        const res: any = await Models.property.details(e?.value);
        const data = [
          {
            title: capitalizeFLetter(res?.title),
            status: capitalizeFLetter(res?.status),
            id: res?.id,
            total_area: res?.total_area,
            property_type: res?.property_type?.name,
            listing_type: {
              type: capitalizeFLetter(res?.listing_type),
              color:
                res?.listing_type == LISTING_TYPE_LIST.RENT
                  ? "warning"
                  : res?.listing_type == LISTING_TYPE_LIST.SALE
                  ? "secondary"
                  : res?.listing_type == LISTING_TYPE_LIST.LEASE
                  ? "info"
                  : "success",
            },

            date: commonDateFormat(res?.created_at),
            location: capitalizeFLetter(res?.city),
            developer: `${capitalizeFLetter(
              res?.developer?.first_name
            )} ${capitalizeFLetter(res?.developer?.last_name)}`,
            project: capitalizeFLetter(res?.project?.name),

            price: formatToINR(res?.price),
            image:
              res?.primary_image?.image ??
              "/assets/images/real-estate/property-info-img1.png",
          },
        ];
        setState({ tableList: data });
      } else {
        setState({ tableList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        company_name: state.company_name,
        first_name: state.first_name,
        last_name: state.last_name,
        phone: state.phone,
        email: state.email,
        interested_property: state.property_name?.value,
        lead_source: state.lead_source?.value,
        assigned_to: state.assigned_to ?  state.assigned_to?.value : state.userId,
        // lead_source_details: state.lead_source_details,
        next_follow_up: state.next_follow_up
          ? moment(state.next_follow_up).format("YYYY-MM-DD")
          : null,
        status: state.status?.value,
        requirements: state.requirements,
      };
      console.log("✌️body --->", body);

      await Utils.Validation.lead.validate(body, { abortEarly: false });

      const res = await Models.lead.update(body, id);
      setState({ btnLoading: false });
      Success("Lead Updated Successfully");
      router.push("/real-estate/lead/list");
      console.log("✌️res --->", res);
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
        Failure("Please fill all the required fields");
      } else {
        console.log("error", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const getAssignList = async (e) => {
    try {
      if (e) {
        setState({ assignRole: e, assigned_to: "" });

        const body = {
          user_type:
            e?.value == ROLES.DEVELOPER ? ROLES.DEVELOPER : ROLES.AGENT,
        };
        const res: any = await Models.user.list(1, body);
        const dropdown = res?.results?.map((item) => ({
          value: item?.id,
          label: `${capitalizeFLetter(item?.first_name)} ${item?.last_name}`,
        }));
        setState({
          assignList: dropdown,
        });
      } else {
        setState({ assignRole: null, assigned_to: "", assignList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const allColumns = [
    {
      accessor: "name",
      title: "Property Info",
      visible: true,
      toggleable: true,
      render: (row) => (
        <div className="flex gap-3 font-semibold">
          <div className="h-28 w-44 rounded-md bg-white-dark/30  ltr:mr-2 rtl:ml-2">
            <img
              className="h-full w-full cursor-pointer rounded-md object-cover"
              src={row.image}
              alt=""
            />
          </div>
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex gap-1">
                {" "}
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
            <div>
              <Link className="flex gap-1 text-primary" href={"/detail"}>
                <LucideHome className="h-4 w-4 text-black " /> View Details
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
  ];

  return (
    <div className="relative h-auto  overflow-scroll bg-cover ">
      <div className="panel  flex  items-center justify-between gap-5 ">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[50px] w-[50px] overflow-hidden bg-white"
            style={{ borderRadius: 50 }}
          >
            <img
              src="/assets/images/profile-1.jpeg"
              height={"100%"}
              width={"100%"}
            />
          </div>
          <div>
            <h5 className="font-semibold " style={{ fontSize: "18px" }}>
              Update Lead
            </h5>
            <div className="  " style={{ fontSize: "14px", color: "grey" }}>
              Your data journey starts here...
            </div>
          </div>
        </div>
        <div className="flex  flex-wrap items-center gap-3">
          <p>Assign To:</p>
          <CustomSelect
            value={state.assignRole}
            onChange={(e) => getAssignList(e)}
            placeholder={"Choose Role"}
            options={[
              { value: "developer", label: "Developer" },
              { value: "agent", label: "Agent" },
            ]}
            // required
            className="lg:w-[200px]"
          />
          <CustomSelect
            value={state.assigned_to}
            onChange={(e) => setState({ assigned_to: e })}
            placeholder={"Assign To"}
            options={state.assignList}
            error={state.errors?.assigned_to}
            // required
            className="lg:w-[200px]"
          />
        </div>
      </div>

      <div className={`flex-wrap" mt-1 flex w-full gap-4`}>
        <div className={`mt-1 w-full md:w-1/2`}>
          <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                <IconUser className="text-[#82de69]" />
              </div>
              <div className=" " style={{ fontSize: "20px" }}>
                Lead Information
              </div>
            </div>

            <TextInput
              title="Company Name"
              value={state.company_name}
              onChange={(e) => setState({ company_name: e.target.value })}
              placeholder="Company Name"
              error={state.errors?.company_name}
              icon={<Computer height={15} width={15} />}
            />

            <CustomSelect
              title="Lead Source"
              value={state.lead_source}
              onChange={(e) =>
                setState({
                  lead_source: e,
                  error: { ...state.error, lead_source: null },
                })
              }
              placeholder={"Lead Source"}
              options={LEAD_SOURCE_OPTIONS}
              error={state.error?.lead_source}
              required
              className="w-full"
              leftIcon={<Building className="h-4 w-4 text-gray-400" />}
            />

            {/* <TextArea
              title="Lead Source Details"
              placeholder="Lead Source Details"
              value={state.lead_source_details}
              onChange={(e) =>
                setState({ lead_source_details: e.target.value })
              }
            /> */}

            <CustomSelect
              value={state.status}
              onChange={(e) =>
                setState({ status: e, error: { ...state.error, status: null } })
              }
              placeholder={"Status"}
              title={"Status"}
              options={STATUS_OPTIONS}
              error={state.error?.status}
              required
              className="w-full"
              leftIcon={<User2Icon className="h-4 w-4 text-gray-400" />}
            />

            <CustomeDatePicker
              value={state.next_follow_up}
              placeholder="Next Follow Up Date"
              title="Next Follow Up Date"
              onChange={(e) =>
                setState({
                  next_follow_up: e,
                  error: { ...state.error, next_follow_up: null },
                })
              }
              showTimeSelect={true}
              error={state.error?.next_follow_up}
            />
            <TextArea
              title="Requirements"
              placeholder="Requirements"
              value={state.requirements}
              onChange={(e) =>
                setState({
                  requirements: e.target.value,
                  error: { ...state.error, requirements: "" },
                })
              }
              required
              error={state.error?.requirements}
            />
          </div>
        </div>

        <div className={`mt-1 w-full md:w-1/2`}>
          <div>
            <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#ffefe4]">
                  <IconUser className="text-[#ffbb55]" />
                </div>
                <div className=" " style={{ fontSize: "20px" }}>
                  Contact Information
                </div>
              </div>

              <TextInput
                title="First Name"
                value={state.first_name}
                onChange={(e) => setState({ first_name: e.target.value, error: { ...state.error, first_name: "" } })}
                placeholder={"First Name"}
                error={state.error?.first_name}
                icon={<User2 height={15} width={15} />}
                required
              />

              <TextInput
                title="Last Name"
                value={state.last_name}
                onChange={(e) => setState({ last_name: e.target.value, error: { ...state.error, last_name: "" } })}
                placeholder={"Last Name"}
                error={state.error?.last_name}
                icon={<User2 height={15} width={15} />}
                required
              />
              <TextInput
                title="Email"
                value={state.email}
                onChange={(e) => setState({ email: e.target.value,  error: { ...state.error, email: "" } })}
                placeholder={"Email"}
                error={state.error?.email}
                icon={<IconMail fill={false} />}
                required
              />

              <CustomPhoneInput
                value={state.phone}
                onChange={(value) => setState({ phone: value, error: { ...state.error, phone: "" } })}
                title="Phone Number"
                name="phone"
                required
                error={state.error?.phone}
              />
            </div>
            <div className=" panel mt-4  flex flex-col gap-5 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl   bg-[#deffd7]">
                  <IconUser className="text-[#82de69]" />
                </div>
                <div className=" " style={{ fontSize: "20px" }}>
                  Property Information
                </div>
              </div>

              <CustomSelect
                title="Property"
                value={state.property_name}
                onChange={(e) => handleGetProperty(e)}
                placeholder={"Select Property"}
                options={state.propertyList}
                error={state.errors?.interested_property}
                required
                className="w-full"
                loadMore={() => propertyLoadMore()}
              />
            </div>
          </div>
        </div>
      </div>
      {state.tableList?.length > 0 && (
        <div className={`mt-3 w-full`}>
          <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                <IconUser className="text-[#82de69]" />
              </div>
              <div className=" " style={{ fontSize: "20px" }}>
                Property Details
              </div>
            </div>

            <DataTable
              className="table-hover whitespace-nowrap"
              records={state.tableList || []}
              columns={allColumns}
              highlightOnHover
              style={{ zIndex: 0 }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
        <button
          type="button"
          className="btn btn-outline-danger w-full border md:w-auto"
          onClick={() => router.push("/contacts")}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary w-full md:w-auto"
          onClick={() => handleSubmit()}
        >
          {state.submitLoad ? (
            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Submit"
          )}
        </button>
      </div>
      <div className=" mt-2 grid grid-cols-12  gap-2">
        <div className=" col-span-12 flex flex-col   md:col-span-5"></div>
      </div>
    </div>
  );
};

export default CreateOpportunities;
