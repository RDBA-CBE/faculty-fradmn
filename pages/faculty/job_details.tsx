import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import { capitalizeFLetter, useSetState } from "@/utils/function.utils";
import { Models } from "@/imports/models.import";
import { Failure } from "@/utils/function.utils";
import IconLoader from "@/components/Icon/IconLoader";
import IconEdit from "@/components/Icon/IconEdit";
import { DataTable } from "mantine-datatable";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  FileText,
  Award,
  Tag,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Check,
  CheckIcon,
  IndianRupee,
} from "lucide-react";
import moment from "moment";
import IconEye from "@/components/Icon/IconEye";

const JobDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");

  const [state, setState] = useSetState({
    loading: true,
    jobDetails: null,
    applicantList: [],
    applicantLoading: false,
    applicantPage: 1,
    applicantCount: 0,
  });

  useEffect(() => {
    dispatch(setPageTitle("Job Details"));
    if (jobId) {
      fetchJobDetails();
      fetchApplicants(1);
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.job.details(jobId);
      setState({ jobDetails: res, loading: false });
    } catch (error) {
      setState({ loading: false });
      Failure("Failed to fetch job details");
    }
  };

  const fetchApplicants = async (page: number) => {
    try {
      setState({ applicantLoading: true });
      const body = { jobId };

      const res: any = await Models.application.list(page, body);
      console.log("✌️res --->", res);

      setState({
        applicantList: res?.results || [],
        applicantCount: res?.count || 0,
        applicantPage: page,
        applicantLoading: false,
      });
    } catch (error) {
      setState({ applicantLoading: false });
    }
  };

  const handleEdit = (row) => {
    router.push(`/faculty/application_detail?id=${row?.id}`);
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const job = state.jobDetails;

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-xl   font-medium text-gray-700 transition-all  dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
      </div>

      <div className="">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content (Left Column) */}
          <div className="space-y-4 lg:col-span-2">
            {/* Job Header */}
            <div className="rounded-lg border bg-white p-6  dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="page-ti mb-4">{job?.job_title}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-dyellow h-4 w-4" />
                      <span>{job?.college?.name}</span>
                    </div>
                    {job?.locations?.[0] && (
                      <div className="flex items-center gap-2">
                        <MapPin className="text-dyellow h-4 w-4" />
                        <span>{job?.locations[0]?.city}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/faculty/updatejob?id=${jobId}`)}
                  className="bg-dblue group relative inline-flex transform items-center gap-2 overflow-hidden rounded-lg px-4 py-2  text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="bg-dblue absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                  <IconEdit className="relative z-10 h-5 w-5" />
                  <span className="relative z-10">Edit</span>
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs  ${
                    job?.is_approved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {job?.is_approved ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  {job?.is_approved ? "Approved" : "Pending Approval"}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs  ${
                    job?.priority_display === "urgent"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <AlertCircle className="h-4 w-4" />
                  {capitalizeFLetter(job?.priority_display) || "N/A"}
                </span>
                {/* <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs  text-blue-700">
                  <Briefcase className="h-4 w-4" />
                  {job?.job_type_obj?.name || job?.job_type}
                </span> */}
              </div>
            </div>

            <div className="rounded-lg border bg-white p-6  dark:bg-gray-800">
              {/* Job Description */}
              <h2 className="mb-2 text-lg  text-gray-900 dark:text-white">
                Job Description
              </h2>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                {job?.job_description || "No description provided."}
              </p>

              {/* Key Responsibilities */}
              {job?.responsibility?.blocks?.length > 0 && (
                <>
                  <h2 className="mb-2 mt-4  text-lg text-gray-900 dark:text-white">
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-2">
                    {job.responsibility.blocks.map((block, idx) => {
                      if (block.type === "list") {
                        return block.data.items.map((item, i) => (
                          <li
                            key={`${idx}-${i}`}
                            className="flex items-start gap-2"
                          >
                            <CheckIcon className="text-dyellow" size={16} />
                            <span
                              className="text-gray-700 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: item }}
                            />
                          </li>
                        ));
                      }
                      return null;
                    })}
                  </ul>
                </>
              )}

              <h2 className="mb-2 mt-4 text-lg  text-gray-900 dark:text-white">
                Additional Information
              </h2>
              <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {job?.start_date
                      ? moment(job.start_date).format("MMM DD, YYYY")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-50 to-red-50 p-4 dark:from-pink-900/20 dark:to-red-900/20">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Deadline
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {job?.deadline
                      ? moment(job.deadline).format("MMM DD, YYYY")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Key Details Card */}
              <div className="rounded-lg border bg-white p-6  dark:bg-gray-800">
                <h2 className="mb-4 text-lg  text-gray-900 dark:text-white">
                  Key Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IndianRupee className="text-dyellow h-4 w-4" /> Salary
                    </span>
                    <span className=" text-gray-900 dark:text-white">
                      {job?.salary_range || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="text-dyellow h-4 w-4" /> Openings
                    </span>
                    <span className=" text-gray-900 dark:text-white">
                      {job?.number_of_openings || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="text-dyellow h-4 w-4" /> Experience
                    </span>
                    <span className=" text-gray-900 dark:text-white">
                      {job?.experiences?.name || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="text-dyellow h-4 w-4" /> Deadline
                    </span>
                    <span className=" text-gray-900 dark:text-white">
                      {job?.last_date
                        ? moment(job.last_date).format("MMM DD, YYYY")
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col justify-start">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 ">
                      <Award className="text-dyellow h-4 w-4" /> Qualification
                    </span>
                    <span className=" mt-2 text-gray-900 dark:text-white">
                      {job?.qualification || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Departments Card */}
              {job?.department?.length > 0 && (
                <div className="rounded-lg border bg-white p-6  dark:bg-gray-800">
                  <h2 className="mb-4 text-lg  text-gray-900 dark:text-white">
                    College
                  </h2>
                  <div className="flex items-start gap-4">
                    {job?.college?.college_logo && (
                      <img
                        src={job.college?.college_logo}
                        alt={job.college.name}
                        className="h-8 w-8 rounded-lg border object-contain"
                      />
                    )}
                    <div>
                      <p className=" ">{job.college?.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {job.college?.company_detail}
                      </p>
                    </div>
                  </div>
                  <h2 className="mb-4 mt-4  text-lg text-gray-900 dark:text-white">
                    Departments
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.department.map((dept) => (
                      <span
                        key={dept.id}
                        className="bg-lblue rounded-full px-3 py-1 text-sm font-medium text-black "
                      >
                        {dept.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills & Tags Card */}
              {/* {(job?.skills?.length > 0 || job?.tags?.length > 0) && (
                <div className="rounded-lg border bg-white p-6  dark:bg-gray-800">
                  <h2 className="mb-4 text-xl  text-gray-900 dark:text-white">
                    Skills & Tags
                  </h2>
                  <div className="space-y-4">
                    {job?.skills?.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm  text-gray-500 dark:text-gray-400">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {job?.tags?.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm  text-gray-500 dark:text-gray-400">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full px-3 py-1 text-sm font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Applicants Section */}
      <div className="mt-8 rounded-lg   dark:bg-gray-800">
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Users className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-lg  text-black ">
              Applicants{" "}
              <span className="text-purple-600">({state.applicantCount})</span>
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto border border-gray-200 bg-white ">
          <DataTable
            noRecordsText="No applicants yet"
            highlightOnHover
            className="table-hover"
            records={state.applicantList}
            fetching={state.applicantLoading}
            customLoader={
              <div className="flex items-center justify-center py-12">
                <IconLoader className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            }
            columns={[
              {
                accessor: "name",
                title: "Name",
                render: (row: any) => (
                  <div className=" text-gray-900 dark:text-white">
                    {row?.first_name} {row?.last_name}
                  </div>
                ),
              },
              {
                accessor: "email",
                title: "Email",
                render: (row: any) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {row?.email}
                  </span>
                ),
              },
              {
                accessor: "phone",
                title: "Phone",
                render: (row: any) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {row?.phone || "-"}
                  </span>
                ),
              },
              {
                accessor: "applied_date",
                title: "Applied Date",
                render: (row: any) => (
                  <span className="text-gray-600 dark:text-gray-400">
                    {moment(row?.created_at).format("MMM DD, YYYY")}
                  </span>
                ),
              },
              {
                accessor: "status",
                title: "Status",
                render: (row: any) => (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs  shadow-md ${
                      row?.status === "accepted"
                        ? "bg-green-500 text-white"
                        : row?.status === "rejected"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-white"
                    }`}
                  >
                    {capitalizeFLetter(row?.status || "Pending")}
                  </span>
                ),
              },

              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(row)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-all duration-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-400"
                      title="View"
                    >
                      <IconEye className="h-4 w-4" />
                    </button>
                  </div>
                ),
              },
            ]}
            minHeight={200}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
