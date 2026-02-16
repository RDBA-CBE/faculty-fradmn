import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import IconLoader from "@/components/Icon/IconLoader";
import IconDownload from "@/components/Icon/IconDownload";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import { Mail, Phone, Briefcase, Calendar, MapPin, Building, GraduationCap, UserLock, UserCog } from "lucide-react";
import { FRONTEND_URL } from "@/utils/constant.utils";

const ApplicationDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = router.query;

  const [state, setState] = useSetState({
    loading: true,
    application: null,
  });

  useEffect(() => {
    dispatch(setPageTitle("Application Details"));
    if (id) {
      fetchApplicationDetail();
    }
  }, [id, dispatch]);

  const fetchApplicationDetail = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.application.details(id);
      setState({ application: res, loading: false });
    } catch (error) {
      console.error("Error fetching application:", error);
      setState({ loading: false });
    }
  };

  const handleDownloadResume = () => {
    if (state.application?.resume) {
      window.open(state.application.resume, "_blank");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      reviewed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <IconLoader className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600 dark:text-gray-400">Loading application...</span>
        </div>
      </div>
    );
  }

  const app = state.application;
  const job = app?.job_detail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-700 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:text-gray-300"
          >
            <IconArrowBackward className="h-4 w-4" />
            Back
          </button>
          {app?.resume && (
            <button
              onClick={handleDownloadResume}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              <IconDownload className="h-4 w-4" />
              Download Resume
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Applicant Info */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
              {/* Profile Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white shadow-lg">
                  {app?.first_name?.[0]}{app?.last_name?.[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {app?.first_name} {app?.last_name}
                </h2>
                <span className={`mt-2 inline-block rounded-full px-4 py-1 text-sm font-medium ${getStatusColor(app?.status)}`}>
                  {app?.status_display}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="break-all text-sm font-medium text-gray-900 dark:text-white">{app?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app?.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{app?.experience}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Applied Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(app?.applied_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCog className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Profile</p>
                    <a href={`${FRONTEND_URL}faculty/profile/${app?.id}`} target="_blank" rel="noopener noreferrer"><p className="text-sm font-medium text-gray-900 dark:text-white">View Profile</p></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Job Details */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Job Details</h3>
              
              {/* Job Title */}
              <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-900/20 dark:to-purple-900/20">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{job?.job_title}</h4>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{job?.company}</p>
              </div>

              {/* Job Info Grid */}
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">{job?.locations?.map((item) => (
                        <span key={item?.id}>{item?.city}</span>
                      ))}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experience Required</p>
                      <p className="font-medium text-gray-900 dark:text-white">{job?.experiences?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qualification</p>
                      <p className="font-medium text-gray-900 dark:text-white">{job?.qualification}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Openings</p>
                      <p className="font-medium text-gray-900 dark:text-white">{job?.number_of_openings} positions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              {job?.job_description && job?.job_description !== '{}' && (
                <div className="mb-6">
                  <h5 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Job Description</h5>
                  <div className="rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {job?.job_description}
                  </div>
                </div>
              )}

              {/* Responsibilities */}
              {job?.responsibility && job?.responsibility.length > 0 && (
                <div className="mb-6">
                  <h5 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Responsibilities</h5>
                  <ul className="space-y-2">
                    {job?.responsibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                <h5 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Timeline</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(job?.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Date to Apply</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(job?.last_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                    <span className={`font-medium ${job?.is_deadline_passed ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(job?.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
