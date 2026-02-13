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
} from "lucide-react";
import moment from "moment";

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
      const body={jobId}

      const res: any = await Models.application.list(page, body);
console.log('✌️res --->', res);

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

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  const job = state.jobDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 dark:from-gray-900 dark:to-gray-800">
      {/* Floating Header */}
      <div className="sticky top-4 z-10 mb-8 flex items-center justify-between rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </button>
        <button
          onClick={() => router.push(`/faculty/updatejob?id=${jobId}`)}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <IconEdit className="h-5 w-5" />
          <span>Edit Job</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="mb-8 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 shadow-2xl backdrop-blur-xl dark:border-gray-700/50 dark:from-gray-800 dark:via-purple-900/20 dark:to-pink-900/20">
        <div className="p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                {job?.is_approved ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-yellow-500" />
                )}
                <span className={`text-sm font-semibold ${job?.is_approved ? "text-green-600" : "text-yellow-600"}`}>
                  {job?.is_approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <h1 className="mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
                {job?.job_title}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 backdrop-blur-sm dark:bg-gray-700/60">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">{job?.college?.name}</span>
                </div>
                {job?.department?.name && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 backdrop-blur-sm dark:bg-gray-700/60">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">{job?.department?.name}</span>
                  </div>
                )}
                {job?.locations?.[0] && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 backdrop-blur-sm dark:bg-gray-700/60">
                    <MapPin className="h-5 w-5 text-pink-600" />
                    <span className="font-medium">{job?.locations[0]?.city}, {job?.locations[0]?.state}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg ${
                job?.priority_display === "urgent" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" :
                job?.priority_display === "high" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" :
                job?.priority_display === "medium" ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white" :
                "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
              }`}>
                <AlertCircle className="h-4 w-4" />
                {capitalizeFLetter(job?.priority_display) || "N/A"} Priority
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg">
                <Briefcase className="h-4 w-4" />
                {job?.job_type_obj?.name || job?.job_type}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="group rounded-2xl border border-white/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-700/40">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Salary Range</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job?.salary_range || "Not specified"}</p>
            </div>

            <div className="group rounded-2xl border border-white/40 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-700/40">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Openings</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job?.number_of_openings || 0}</p>
            </div>

            <div className="group rounded-2xl border border-white/40 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-700/40">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Experience</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job?.experiences || "Not specified"}</p>
            </div>

            <div className="group rounded-2xl border border-white/40 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg dark:border-gray-700/40">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Deadline</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job?.last_date ? moment(job.last_date).format("MMM DD") : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Job Description */}
        <div className="group rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Job Description</h2>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-400">
            {job?.job_description || "No description provided"}
          </p>
        </div>

        {/* Qualification */}
        <div className="group rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Qualification</h2>
          </div>
          <p className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-400">
            {job?.qualification || "Not specified"}
          </p>
        </div>

        {/* Key Responsibilities */}
        {job?.responsibility?.blocks && (
          <div className="group rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Key Responsibilities</h2>
            </div>
            <ul className="space-y-2">
              {job.responsibility.blocks.map((block: any, idx: number) => (
                block.type === "list" && block.data.items.map((item: string, i: number) => (
                  <li key={`${idx}-${i}`} className="flex items-start gap-3">
                    <span className="mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">{item}</span>
                  </li>
                ))
              ))}
            </ul>
          </div>
        )}

        {/* Company Info */}
        {job?.company && (
          <div className="group rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-gray-700/50 dark:bg-gray-800/80">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company</h2>
            </div>
            <div className="flex items-start gap-4">
              {job?.company_logo && (
                <img src={job.company_logo} alt={job.company} className="h-16 w-16 rounded-xl object-cover shadow-lg" />
              )}
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{job.company}</p>
                <p className="text-gray-600 dark:text-gray-400">{job.company_detail}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mb-8 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Tag className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Additional Information</h2>
        </div>
        
        <div className="space-y-6 ">
          {job?.categories?.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Categories</p>
              <div className="flex flex-wrap gap-2">
                {job.categories.map((cat: any) => (
                  <span key={cat.id} className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {job?.skills?.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Skills Required</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill: any) => (
                  <span key={skill.id} className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {job?.tags?.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</p>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: any) => (
                  <span key={tag.id} className="rounded-full px-4 py-2 text-sm font-semibold shadow-lg" style={{ backgroundColor: tag.color, color: '#fff' }}>
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 border-t pt-6 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
              <span className="font-medium text-gray-700 dark:text-gray-300">Start Date</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {job?.start_date ? moment(job.start_date).format("MMM DD, YYYY") : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-50 to-red-50 p-4 dark:from-pink-900/20 dark:to-red-900/20">
              <span className="font-medium text-gray-700 dark:text-gray-300">Deadline</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {job?.deadline ? moment(job.deadline).format("MMM DD, YYYY") : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants Section */}
      <div className="rounded-3xl border border-white/20 bg-white/80 shadow-xl backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-800/80">
        <div className="border-b border-gray-200/50 p-6 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Applicants <span className="text-purple-600">({state.applicantCount})</span>
            </h2>
          </div>
        </div>
        <div className="p-6">
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
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {row?.first_name} {row?.last_name}
                  </div>
                ),
              },
              {
                accessor: "email",
                title: "Email",
                render: (row: any) => (
                  <span className="text-gray-600 dark:text-gray-400">{row?.email}</span>
                ),
              },
              {
                accessor: "phone",
                title: "Phone",
                render: (row: any) => (
                  <span className="text-gray-600 dark:text-gray-400">{row?.phone || "-"}</span>
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
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                    row?.status === "accepted" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" :
                    row?.status === "rejected" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" :
                    "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                  }`}>
                    {row?.status || "Pending"}
                  </span>
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
