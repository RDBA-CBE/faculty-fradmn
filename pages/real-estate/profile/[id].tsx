import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../../store";
import { setPageTitle } from "../../../store/themeConfigSlice";
import { useEffect, useState } from "react";

import {
  Mail,
  Phone,
  Home,
  Users,
  CheckCircle,
  Clock,
  MessageSquare,
  CheckSquare,
  User,
  Calendar,
} from "lucide-react";
import Models from "@/imports/models.import";
import { useRouter } from "next/router";
import {
  capitalizeFLetter,
  formatDate,
  useSetState,
} from "@/utils/function.utils";

const Profile = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const userId = router.query.id;
  const [activeTab, setActiveTab] = useState("Recent Activity");

  const [state, setState] = useSetState({
    loading: false,
    userDetail: [],
  });

  useEffect(() => {
    dispatch(setPageTitle("Profile"));
  });

  useEffect(() => {
    getUser();
  }, [userId]);

  const getUser = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.user.details(userId);

      console.log(res);
      setState({
        loading: false,
        userDetail: res,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  console.log("userDetail", state?.userDetail);

  // Data remains the same, but I'll add a little more dummy data for My Properties and Leads to fill the space better.
  const recentActivity = [
    {
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      text: `Responded to Lead Smith inquiry on Property ID123`,
      time: "5 mins ago",
    },
    {
      icon: <CheckSquare className="h-5 w-5 text-green-500" />,
      text: `Marked task "Follow up with Client Jone" as complete`,
      time: "3 hours ago",
    },
    {
      icon: <Phone className="h-5 w-5 text-blue-500" />,
      text: `Logged call with "Lead Miller"`,
      time: "Yesterday",
    },
    {
      icon: <Home className="h-5 w-5 text-purple-500" />,
      text: `Listed new property *456 Oak Ave*`,
      time: "2 days ago",
    },
    {
      icon: <User className="h-5 w-5 text-gray-500" />,
      text: `Updated profile bio`,
      time: "1 week ago",
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      text: `Client meeting scheduled for '123 Elm Street'`,
      time: "1 week ago",
    },
  ];
  const myProperties = [
    {
      image: "/assets/images/lightbox3.jpeg",
      title: "456 Oak Ave",
      status: "Active",
      price: "$450,000",
      type: "House",
    },
    {
      image: "/assets/images/lightbox3.jpeg",
      title: "789 Pine St",
      status: "Sold",
      price: "$620,000",
      type: "Condo",
    },
    {
      image: "/assets/images/lightbox3.jpeg",
      title: "101 Maple Rd",
      status: "Pending",
      price: "$310,000",
      type: "Apartment",
    },
    {
      image: "/assets/images/lightbox3.jpeg",
      title: "202 Birch Ln",
      status: "Active",
      price: "$890,000",
      type: "Villa",
    },
  ];

  const leadsInquiries = [
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 555 444 3333",
      status: "New",
    },
    {
      name: "Sarah Connor",
      email: "sarah@example.com",
      phone: "+1 555 111 2222",
      status: "Follow-up",
    },
    {
      name: "Kyle Reese",
      email: "kyle@example.com",
      phone: "+1 555 888 9999",
      status: "In Progress",
    },
    {
      name: "T-800",
      email: "arnold@example.com",
      phone: "+1 555 000 1234",
      status: "New",
    },
  ];

  return (
    <div>
      <ul className="mb-4 flex space-x-2 text-sm rtl:space-x-reverse">
        <li>
          <Link href="#" className="text-primary hover:underline">
            Users
          </Link>
        </li>
        <li className="text-gray-500 before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Profile</span>
        </li>
      </ul>
      <div className="pt-2">
        <div className="mb-5 grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {/* User Profile Panel (Left Column) */}
          <div className="panel max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center">
              <img
                src="/assets/images/profile-1.jpeg" // your image path
                alt="Jimmy Turner"
                className="mb-4 h-28 w-28 rounded-full object-cover ring-4 ring-indigo-100"
              />
              <h2 className="text-2xl font-bold text-gray-900">
                {state?.userDetail?.first_name} {state?.userDetail?.last_name}
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                {capitalizeFLetter(state?.userDetail?.user_type)} .{" "}
                {state?.userDetail?.address &&
                  capitalizeFLetter(state?.userDetail?.address)}
              </p>
              <div className="w-full space-y-3 border-t pt-4 text-sm text-gray-700">
                {state?.userDetail?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">
                      {state?.userDetail?.email}
                    </span>
                  </div>
                )}

                {state?.userDetail?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">
                      {state?.userDetail?.phone}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">
                    {formatDate(state?.userDetail?.created_at, "MMMM do, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition hover:bg-indigo-100">
                <Home className="mb-2 h-7 w-7 text-indigo-600" />
                <p className="text-xl font-bold">15</p>
                <p className="mt-1 text-xs text-gray-600">Active Listings</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition hover:bg-indigo-100">
                <Users className="mb-2 h-7 w-7 text-indigo-600" />
                <p className="text-xl font-bold">24</p>
                <p className="mt-1 text-xs text-gray-600">Active Leads</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition hover:bg-indigo-100">
                <CheckCircle className="mb-2 h-7 w-7 text-indigo-600" />
                <p className="text-xl font-bold">4</p>
                <p className="mt-1 text-xs text-gray-600">Properties Sold</p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 p-4 transition hover:bg-indigo-100">
                <Clock className="mb-2 h-7 w-7 text-indigo-600" />
                <p className="text-xl font-bold">2.5 hrs</p>
                <p className="mt-1 text-xs text-gray-600">Avg. Response</p>
              </div>
            </div>
          </div>

          {/* Tabbed Content Panel (Right Column) */}
          <div className="panel rounded-xl bg-white p-6 shadow-2xl lg:col-span-2 xl:col-span-3">
            {/* Tabs Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-8 overflow-x-auto text-base font-semibold">
                {["Recent Activity", "Leads & Inquiries", "My Properties"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 transition duration-150 ease-in-out ${
                        activeTab === tab
                          ? "border-b-4 border-indigo-600 text-indigo-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Tab Content Header */}
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              {activeTab}
            </h2>

            {/* --- Recent Activity Tab --- */}
            {activeTab === "Recent Activity" && (
              <div className="relative pl-7">
                {/* Timeline vertical line */}
                <div className="absolute bottom-0 left-3.5 top-0 w-0.5 bg-indigo-200"></div>

                <ul className="space-y-6">
                  {recentActivity.map((item, index) => (
                    <li key={index} className="relative flex items-start">
                      {/* Timeline dot/icon */}
                      <div className="absolute left-0 top-0 z-10 mt-1.5 rounded-full bg-indigo-600 p-1.5 shadow ring-4 ring-white">
                        {/* The icon from the data should be inside this, but I'll use a placeholder for better visualization */}
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>

                      {/* Activity content */}
                      <div className="ml-8 flex w-full flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-md transition hover:shadow-lg">
                        <p className="text-sm font-medium text-gray-700">
                          {item.text}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* --- My Properties Tab --- */}
            {activeTab === "My Properties" && (
              <div className="grid grid-cols-1 gap-4">
                {myProperties.map((property, index) => (
                  <div
                    key={index}
                    className="flex items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="mr-4 h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="text-base font-bold text-gray-900">
                          {property.title}
                        </h3>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                            property.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : property.status === "Sold"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {property.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{property.type}</p>
                      <p className="mt-1 text-lg font-bold text-indigo-600">
                        {property.price}
                      </p>
                    </div>
                    <button className="flex-shrink-0 rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-600 hover:text-white">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* --- Leads & Inquiries Tab --- */}
            {activeTab === "Leads & Inquiries" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {leadsInquiries.map((lead, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-indigo-100 bg-indigo-50 p-5 shadow transition hover:border-indigo-300 hover:shadow-lg"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900">
                        {lead.name}
                      </h3>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          lead.status === "New"
                            ? "bg-red-100 text-red-700"
                            : lead.status === "Follow-up"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                        <span>{lead.email}</span>
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                        <span>{lead.phone}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button */}
            <button className="mt-8 w-full rounded-xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 active:bg-indigo-800">
              View All {activeTab}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
