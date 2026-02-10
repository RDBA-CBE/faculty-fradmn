import {
  buildFormData,
  Dropdown,
  Success,
  toISO,
  useSetState,
} from "@/utils/function.utils";
import React, { useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import TextArea from "@/components/FormFields/TextArea.component";
import ChipInput from "@/components/FormFields/ChipInput.component";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import { CreateNewJob } from "@/utils/validation.utils";
import { Models } from "@/imports/models.import";
import { EXPERIENCE, JOB_TYPE, ROLES } from "@/utils/constant.utils";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function Newjob() {
  const router = useRouter();
  const editorRef = useRef(null);
  const keyResponsibilityEditorRef = useRef(null);
  const professionalSkillsEditorRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const isEditorInitialized = useRef(false);
  const isKeyResponsibilityEditorInitialized = useRef(false);
  const isProfessionalSkillsEditorInitialized = useRef(false);

  const [state, setState] = useSetState({
    activeStep: 1,
    title: "",
    company: "",
    location: "",
    address: "",
    institution: null,
    college: null,
    department: null,
    jobType: null,
    salary: "",
    deadline: "",
    startDate: "",
    endDate: "",
    numberOfOpenings: "",
    qualification: "",
    experience: "",
    skills: [],
    tags: [],
    images: [],
    institutionList: [],
    collegeList: [],
    departmentList: [],
    skillList: [],
    tagList: [],
    institutionPage: 1,
    collegePage: 1,
    departmentPage: 1,
    skillPage: 1,
    tagPage: 1,
    institutionHasMore: true,
    collegeHasMore: true,
    departmentHasMore: true,
    skillHasMore: true,
    tagHasMore: true,
    skillLoading: false,
    tagLoading: false,
    editorInstance: null,
    keyResponsibilityEditorInstance: null,
    professionalSkillsEditorInstance: null,
    editorData: {
      time: Date.now(),
      blocks: [],
      version: "2.19.0",
    },
    error: {},
  });

  useEffect(() => {
    fetchInstitutions();
    profile();
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    jobStatusList();
    categoryList(1);
    skillList(1);
    tagList(1);
  }, []);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      setState({ profile: res });
      if (res?.role == ROLES.INSTITUTION_ADMIN) {
        setState({
          profile: res,
          institution: {
            value: res?.institution?.institution_id,
            label: res?.institution?.institution_name,
          },
        });
        fetchColleges(res?.institution?.institution_id, 1);
      } else if (res?.role == ROLES.HR) {
        setState({
          profile: res,
          institution: {
            value: res?.institution?.institution_id,
            label: res?.institution?.institution_name,
          },
          college: {
            value: res?.college?.college_id,
            label: res?.college?.college_name,
          },
        });
        fetchDepartments(res?.college?.college_id, 1);
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const locationList = async (page = 1) => {
    try {
      setState({ locationLoading: true });
      const res: any = await Models.job.job_locations();
      const dropdown = Dropdown(res?.results, "city");
      setState({ locationLoading: false, locationList: dropdown });
    } catch (error) {
      setState({ locationLoading: false });
    }
  };

  const categoryList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_category();
      const dropdown = Dropdown(res?.results, "name");
      setState({ categoryLoading: false, categoryList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const salaryRangeList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_salary_ranges();
      const dropdown = Dropdown(res?.results, "name");
      setState({ salaryRangeLoading: false, salaryRangeList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const priorityList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_priority();
      const dropdown = Dropdown(res?.results, "name");
      setState({ priorityLoading: false, priorityList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };
  const typeList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_types();
      const dropdown = Dropdown(res?.results, "name");
      setState({ typeLoading: false, typeList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const jobStatusList = async (page = 1) => {
    try {
      setState({ categoryLoading: true });
      const res: any = await Models.job.job_status();
      const dropdown = Dropdown(res?.results, "name");
      setState({ jobStatusLoading: false, jobStatusList: dropdown });
    } catch (error) {
      setState({ categoryLoading: false });
    }
  };

  const skillList = async (page = 1) => {
    try {
      setState({ skillLoading: true });
      const res: any = await Models.job.job_skills(page);
      console.log("✌️res --->", res);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        skillLoading: false,
        skillList: page === 1 ? dropdown : [...state.skillList, ...dropdown],
        skillPage: page,
        skillHasMore: !!res?.next,
      });
    } catch (error) {
      setState({ skillLoading: false });
    }
  };

  const tagList = async (page = 1) => {
    try {
      setState({ tagLoading: true });
      const res: any = await Models.job.job_tags(page);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        tagLoading: false,
        tagList: page === 1 ? dropdown : [...state.tagList, ...dropdown],
        tagPage: page,
        tagHasMore: !!res?.next,
      });
    } catch (error) {
      setState({ tagLoading: false });
    }
  };

  const fetchInstitutions = async (page = 1) => {
    try {
      const res: any = await Models.institution.list(page, {});
      const options = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.institution_name,
      }));
      setState({
        institutionList:
          page === 1 ? options : [...state.institutionList, ...options],
        institutionPage: page,
        institutionHasMore: !!res?.next,
      });
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const fetchColleges = async (institutionId: number, page = 1) => {
    try {
      const res: any = await Models.college.list(page, {
        institution: institutionId,
      });
      const options = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.college_name,
      }));
      setState({
        collegeList: page === 1 ? options : [...state.collegeList, ...options],
        collegePage: page,
        collegeHasMore: !!res?.next,
      });
    } catch (error) {
      console.error("Error fetching colleges:", error);
    }
  };

  const fetchDepartments = async (collegeId: number, page = 1) => {
    try {
      const res: any = await Models.department.list(page, {
        college: collegeId,
      });
      const options = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.department_name,
      }));
      setState({
        departmentList:
          page === 1 ? options : [...state.departmentList, ...options],
        departmentPage: page,
        departmentHasMore: !!res?.next,
      });
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const section1 = section1Ref.current?.getBoundingClientRect();
      const section2 = section2Ref.current?.getBoundingClientRect();
      const section5 = section5Ref.current?.getBoundingClientRect();
      const section3 = section3Ref.current?.getBoundingClientRect();
      const section4 = section4Ref.current?.getBoundingClientRect();

      if (section4 && section4.top < 300) {
        setState({ activeStep: 5 });
      } else if (section3 && section3.top < 300) {
        setState({ activeStep: 4 });
      } else if (section5 && section5.top < 300) {
        setState({ activeStep: 3 });
      } else if (section2 && section2.top < 300) {
        setState({ activeStep: 2 });
      } else if (section1 && section1.top < 300) {
        setState({ activeStep: 1 });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      editorRef.current &&
      !isEditorInitialized.current
    ) {
      isEditorInitialized.current = true;

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: editorRef.current,
          data: state.editorData,
          placeholder: "Start typing your job description...",
          tools: {
            list: {
              class: require("@editorjs/list"),
            },
          },
        });
        setState({ editorInstance: editor });
      });
    }

    if (
      typeof window !== "undefined" &&
      keyResponsibilityEditorRef.current &&
      !isKeyResponsibilityEditorInitialized.current
    ) {
      isKeyResponsibilityEditorInitialized.current = true;

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: keyResponsibilityEditorRef.current,
          placeholder: "List key responsibilities...",
          tools: {
            list: {
              class: require("@editorjs/list"),
            },
          },
        });
        setState({ keyResponsibilityEditorInstance: editor });
      });
    }

    if (
      typeof window !== "undefined" &&
      professionalSkillsEditorRef.current &&
      !isProfessionalSkillsEditorInitialized.current
    ) {
      isProfessionalSkillsEditorInitialized.current = true;

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: professionalSkillsEditorRef.current,
          placeholder: "List required professional skills...",
          tools: {
            list: {
              class: require("@editorjs/list"),
            },
          },
        });
        setState({ professionalSkillsEditorInstance: editor });
      });
    }

    return () => {
      if (state.editorInstance && isEditorInitialized.current) {
        state.editorInstance?.destroy?.();
        isEditorInitialized.current = false;
      }
      if (
        state.keyResponsibilityEditorInstance &&
        isKeyResponsibilityEditorInitialized.current
      ) {
        state.keyResponsibilityEditorInstance?.destroy?.();
        isKeyResponsibilityEditorInitialized.current = false;
      }
      if (
        state.professionalSkillsEditorInstance &&
        isProfessionalSkillsEditorInitialized.current
      ) {
        state.professionalSkillsEditorInstance?.destroy?.();
        isProfessionalSkillsEditorInitialized.current = false;
      }
    };
  }, []);

  const scrollToSection = (ref: any) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    setState({ btnLoading: true });
    const keyResponsibilityData =
      await state.keyResponsibilityEditorInstance?.save();
    console.log("✌️keyResponsibilityData --->", keyResponsibilityData);

    const valid: any = {
      title: state.title,
      company: state.company,
      location: state.location?.value,
      address: state.address,
      jobType: state.jobType,
      salary: state.salary,
      category: state.category,
      priority: state.priority,
      deadline: state.deadline,
      startDate: state.startDate,
      endDate: state.endDate,
      numberOfOpenings: state.numberOfOpenings,
      experience: state.experience?.value,
      qualification: state.qualification,
      responsibility: keyResponsibilityData,
      // professionalSkills: professionalSkillsData,
      skills: state.skills,
      tags: state.tags,
      jobDescription: state.description,
    };
    if (state.profile?.role == ROLES.SUPER_ADMIN) {
      valid.institution = state.institution?.value;
      valid.college = state.college?.value;
      valid.department = state.department?.value;
    } else if (state.profile?.role == ROLES.INSTITUTION_ADMIN) {
      valid.institution = state.profile?.institution?.institution_id;
      valid.college = state.college?.value;
      valid.department = state.department?.value;
    } else if (state.profile?.role == ROLES.HR) {
      valid.institution = state.profile?.institution?.institution_id;
      valid.college = state.profile?.college?.college_id;
      valid.department = state.department?.value;
    } else {
      valid.institution = state.profile?.institution?.institution_id;
      valid.college = state.profile?.college?.college_id;
      valid.department = state.profile?.department?.department_id;
    }

    console.log("✌️valid --->", valid);

    try {
      // await CreateNewJob.validate(
      //   {
      //     title: state.title,
      //     company: state.company,
      //     location: state.location?.value,
      //     address: state.address,
      //     institution: state.institution,
      //     college: state.college,
      //     department: state.department,
      //     jobType: state.jobType?.value,
      //     salary: state.salary?.value,
      //     category: state.category?.value,
      //     priority: state.priority?.value,
      //     deadline: state.deadline,
      //     startDate: state.startDate,
      //     endDate: state.endDate,
      //     numberOfOpenings: state.numberOfOpenings,
      //     experience: state.experience?.value,
      //     qualification: state.qualification,
      //     keyResponsibility: keyResponsibilityData,
      //     professionalSkills: professionalSkillsData,
      //     skills: state.skills,
      //     tags: state.tags,
      //     jobDescription: state.description,
      //   },
      //   { abortEarly: false }
      // );

      const body: any = {
        job_title: state.title,
        job_description: state.description,
        company: state.company,
        job_type_id: state.jobType?.value,
        experiences: state.experience?.value,
        qualification: state.qualification,
        salary_range_id: state.salary?.value,
        location_ids: state.location?.map((item) => item?.value),
        company_detail: state.company_detail,
        number_of_openings: Number(state.numberOfOpenings),
        last_date: moment(state.endDate).format("YYYY-MM-DD"),
        job_status_id: state.job_status?.value,
        deadline: moment(state.deadline).format("YYYY-MM-DD"),
        start_date: moment(state.startDate).format("YYYY-MM-DD"),
        responsibility: keyResponsibilityData,
        skill_ids: state.skills?.map((item) => item?.value),
        tag_ids: state.tags?.map((item) => item?.value),
        company_logo: state.images?.length > 0 && state.images[0],
        is_approved: state.profile?.role == ROLES.HR ? true : false,
        priority_id: state.priority?.value,
        category_ids: state.category?.map((item) => item?.value),
      };

      if (state.profile?.role == ROLES.SUPER_ADMIN) {
        body.institution = state.institution?.value;
        body.college = state.college?.value;
        body.department = state.department?.value;
      } else if (state.profile?.role == ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.institution_id;
        body.college = state.college?.value;
        body.department = state.department?.value;
      } else if (state.profile?.role == ROLES.HR) {
        body.institution = state.profile?.institution?.institution_id;
        body.college = state.profile?.college?.college_id;
        body.department = state.department?.value;
      } else {
        body.institution = state.profile?.institution?.institution_id;
        body.college = state.profile?.college?.college_id;
        body.department = state.profile?.department?.department_id;
      }

      console.log("✌️body --->", body);
      const formData = buildFormData(body);

      const res = await Models.job.create(formData);

      setState({ error: {} });
      setState({ btnLoading: false });
      Success(
        "Job created successfully. This job will be published after HR verification"
      );
      router.back();
    } catch (err: any) {
      if (err.inner) {
        const errors: any = {};
        err.inner.forEach((error: any) => {
          errors[error.path] = error.message;
        });
        console.log("✌️errors --->", errors);

        setState({ error: errors });
      }
      setState({ btnLoading: false });
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setState({
      [field]: value,
      error: { ...state.error, [field]: undefined },
    });

    if (field === "institution" && value) {
      setState({
        college: null,
        department: null,
        collegeList: [],
        departmentList: [],
      });
      fetchColleges(value.value, 1);
    }

    if (field === "college" && value) {
      setState({ department: null, departmentList: [] });
      fetchDepartments(value.value, 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <style jsx global>{`
        .codex-editor__redactor {
          padding-bottom: 0 !important;
        }
        .ce-block__content,
        .ce-toolbar__content {
          max-width: 100%;
        }
        .codex-editor .ce-block:first-child {
          margin-top: 0;
        }
        .ce-toolbar__plus {
          left: 0 !important;
        }
        .ce-toolbar__actions {
          right: 0 !important;
        }
      `}</style>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Create Job Posting
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Post a new opportunity
              </p>
            </div>
            <div className="hidden items-center gap-2 text-sm sm:flex">
              <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-700">
                Draft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="sticky top-[73px] z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section1Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 1
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {state.activeStep > 1 ? "✓" : "1"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 1 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Basic
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 2 ? "bg-purple-600" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section2Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 2
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {state.activeStep > 2 ? "✓" : "2"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 2 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Details
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 3 ? "bg-purple-600" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section3Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 3
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {state.activeStep > 3 ? "✓" : "3"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 3 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Description
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 4 ? "bg-purple-600" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section4Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 4
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {state.activeStep > 4 ? "✓" : "4"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 4 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Responsibility
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 5 ? "bg-purple-600" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section5Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 5
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                5
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 5 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Skills
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto   py-6 sm:px-6 lg:px-8  lg:py-8">
        <div className="space-y-6">
          {/* Card 1: Basic Information */}
          <div
            ref={section1Ref}
            className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Basic Information
              </h2>
            </div>
            <div className="space-y-5 p-6">
              <TextInput
                name="title"
                type="text"
                title="Job Title"
                placeholder="e.g., Senior Software Engineer"
                value={state.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                error={state.error?.title}
                required
              />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextInput
                  name="company"
                  type="text"
                  title="Company"
                  placeholder="Company name"
                  value={state.company}
                  onChange={(e) => handleFieldChange("company", e.target.value)}
                  error={state.error?.company}
                  required
                />

                <CustomSelect
                  options={state.locationList}
                  value={state.location}
                  onChange={(option) => handleFieldChange("location", option)}
                  placeholder="Select location"
                  title="Select location"
                  required
                  isClearable={true}
                  error={state.error?.location}
                  loading={state.locationLoading}
                  isMulti={true}
                />
              </div>

              <TextArea
                name="address"
                title="Company Details"
                placeholder="Company Details"
                value={state.company_detail}
                onChange={(e) =>
                  handleFieldChange("company_detail", e.target.value)
                }
                error={state.error?.company_detail}
                rows={3}
                required
              />

              <div className="mt-5">
                <ImageUploadWithPreview
                  onImagesChange={(images) => setState({ images })}
                  maxFiles={1}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Job Details */}
          <div
            ref={section2Ref}
            className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Job Details
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                {state.profile?.role == ROLES.SUPER_ADMIN && (
                  <>
                    <CustomSelect
                      title="Institution"
                      options={state.institutionList}
                      value={state.institution}
                      onChange={(option) =>
                        handleFieldChange("institution", option)
                      }
                      placeholder="Select institution"
                      error={state.error?.institution}
                      loadMore={() =>
                        state.institutionHasMore &&
                        fetchInstitutions(state.institutionPage + 1)
                      }
                      required
                    />
                    <CustomSelect
                      title="College"
                      options={state.collegeList}
                      value={state.college}
                      onChange={(option) =>
                        handleFieldChange("college", option)
                      }
                      placeholder="Select college"
                      error={state.error?.college}
                      disabled={!state.institution}
                      loadMore={() =>
                        state.collegeHasMore &&
                        fetchColleges(
                          state.institution?.value,
                          state.collegePage + 1
                        )
                      }
                      required
                    />
                    <CustomSelect
                      title="Department"
                      options={state.departmentList}
                      value={state.department}
                      onChange={(option) =>
                        handleFieldChange("department", option)
                      }
                      placeholder="Select department"
                      error={state.error?.department}
                      disabled={!state.college || !state.institution}
                      loadMore={() =>
                        state.departmentHasMore &&
                        fetchDepartments(
                          state.college?.value,
                          state.departmentPage + 1
                        )
                      }
                      required
                    />
                  </>
                )}

                {state.profile?.role == ROLES.INSTITUTION_ADMIN && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.institution_name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <CustomSelect
                      title="College"
                      options={state.collegeList}
                      value={state.college}
                      onChange={(option) =>
                        handleFieldChange("college", option)
                      }
                      placeholder="Select college"
                      error={state.error?.college}
                      disabled={!state.institution}
                      loadMore={() =>
                        state.collegeHasMore &&
                        fetchColleges(
                          state.institution?.value,
                          state.collegePage + 1
                        )
                      }
                      required
                    />
                  </>
                )}
                {state.profile?.role == ROLES.HR && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.institution_name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <TextInput
                      title="College"
                      placeholder="College"
                      value={state.profile?.college?.college_name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <CustomSelect
                      title="Department"
                      options={state.departmentList}
                      value={state.department}
                      onChange={(option) =>
                        handleFieldChange("department", option)
                      }
                      placeholder="Select department"
                      error={state.error?.department}
                      disabled={!state.college || !state.institution}
                      loadMore={() =>
                        state.departmentHasMore &&
                        fetchDepartments(
                          state.college?.value,
                          state.departmentPage + 1
                        )
                      }
                      required
                    />
                  </>
                )}
                {state.profile?.role == ROLES.HOD && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <TextInput
                      title="College"
                      placeholder="College"
                      value={state.profile?.college?.college_name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <TextInput
                      title="Department"
                      placeholder="Department"
                      value={state.profile?.department?.department_name}
                      onChange={(e) => {}}
                      disabled
                    />
                  </>
                )}
                <CustomSelect
                  options={state.priorityList}
                  value={state.priority}
                  onChange={(option) => handleFieldChange("priority", option)}
                  placeholder="Select Priority"
                  title="Select Priority"
                  isClearable={true}
                  error={state.error?.priority}
                  required
                />
                <CustomSelect
                  options={state.typeList}
                  value={state.jobType}
                  onChange={(option) => handleFieldChange("jobType", option)}
                  placeholder="Select job type"
                  error={state.error?.jobType}
                  required
                  title="Job Type"
                />
                <CustomSelect
                  options={state.salaryRangeList}
                  title="Salary Range"
                  placeholder="₹80k - ₹120k"
                  value={state.salary}
                  onChange={(option) => handleFieldChange("salary", option)}
                  error={state.error?.salary}
                  isClearable={true}
                  required
                />

                <CustomSelect
                  options={state.jobStatusList}
                  title="Select job status"
                  placeholder="Select job status"
                  value={state.job_status}
                  onChange={(option) => handleFieldChange("job_status", option)}
                  error={state.error?.job_status}
                  isClearable={true}
                  required
                />

                {/* <TextInput
                  name="salary"
                  type="text"
                  title="Salary Range"
                  placeholder="₹80k - ₹120k"
                  value={state.salary}
                  onChange={(e) => handleFieldChange("salary", e.target.value)}
                  error={state.error?.salary}
                /> */}

                <TextInput
                  name="startDate"
                  type="date"
                  title="Start Date"
                  value={state.startDate}
                  onChange={(e) =>
                    handleFieldChange("startDate", e.target.value)
                  }
                  error={state.error?.startDate}
                  required
                />

                <TextInput
                  name="endDate"
                  type="date"
                  title="End Date"
                  value={state.endDate}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  error={state.error?.endDate}
                  min={state.startDate}
                  required
                />

                <TextInput
                  name="deadline"
                  type="date"
                  title="Deadline"
                  value={state.deadline}
                  onChange={(e) =>
                    handleFieldChange("deadline", e.target.value)
                  }
                  error={state.error?.deadline}
                  min={state.startDate}
                  max={state.endDate}
                  required
                />

                <TextInput
                  name="numberOfOpenings"
                  type="number"
                  title="Number of Openings"
                  placeholder="e.g., 5"
                  value={state.numberOfOpenings}
                  onChange={(e) =>
                    handleFieldChange("numberOfOpenings", e.target.value)
                  }
                  error={state.error?.numberOfOpenings}
                  required
                />

                <CustomSelect
                  options={state.categoryList}
                  value={state.category}
                  onChange={(option) => handleFieldChange("category", option)}
                  placeholder="Select category"
                  title="Select category"
                  required
                  isClearable={true}
                  error={state.error?.category}
                  loading={state.categoryLoading}
                  isMulti={true}
                />

                {/* <TextInput
                  name="experience"
                  type="text"
                  title="Experience"
                  placeholder="e.g., 2-5 years"
                  value={state.experience}
                  onChange={(e) =>
                    handleFieldChange("experience", e.target.value)
                  }
                  error={state.error?.experience}
                  required
                /> */}

                <CustomSelect
                  title="Experience"
                  options={EXPERIENCE}
                  value={state.experience}
                  onChange={(option) => handleFieldChange("experience", option)}
                  placeholder="Select Experience"
                  error={state.error?.experience}
                  required
                />
              </div>

              <div className="mt-5">
                <TextInput
                  name="qualification"
                  title="Qualification"
                  placeholder="Required qualifications..."
                  value={state.qualification}
                  onChange={(e) =>
                    handleFieldChange("qualification", e.target.value)
                  }
                  error={state.error?.qualification}
                  required
                />
              </div>
            </div>
          </div>
          <div
            ref={section5Ref}
            className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Job Description
              </h2>
            </div>
            <div className="p-6">
              <TextArea
                name="qualification"
                placeholder="Job descriptions..."
                value={state.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                error={state.error?.description}
                rows={10}
                required
              />
            </div>
          </div>

          {/* Card 3: Key Responsibility */}
          <div
            ref={section3Ref}
            className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Key Responsibility
              </h2>
            </div>
            <div className="p-6">
              <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-purple-400">
                <div
                  ref={keyResponsibilityEditorRef}
                  id="keyResponsibilityEditor"
                  className="max-h-[400px] min-h-[250px] overflow-y-auto p-4"
                ></div>
              </div>
              {state.error?.keyResponsibility && (
                <p className="mt-2 text-sm text-red-600">
                  {state.error.keyResponsibility}
                </p>
              )}
            </div>
          </div>

          {/* Card 4: Professional Skills */}
          <div
            ref={section4Ref}
            className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Professional Skills
              </h2>
            </div>
            <div className="p-6">
              <CustomSelect
                options={state.skillList}
                value={state.skills}
                onChange={(option) => handleFieldChange("skills", option)}
                placeholder="Select Skills"
                error={state.error?.skills}
                required
                isMulti={true}
                loading={state.skillLoading}
                loadMore={() =>
                  state.skillHasMore && skillList(state.skillPage + 1)
                }
              />
            </div>
          </div>

          {/* Card 5: Skills */}
          <div className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Tags
              </h2>
            </div>
            <div className="p-6">
              <CustomSelect
                options={state.tagList}
                value={state.tags}
                onChange={(option) => handleFieldChange("tags", option)}
                placeholder="Select Tags"
                error={state.error?.tags}
                required
                isMulti={true}
                loading={state.tagLoading}
                loadMore={() => state.tagHasMore && tagList(state.tagPage + 1)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="w-full rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
            >
              Save as Draft
            </button>
            <button
              type="button"
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl sm:w-auto"
              onClick={() => handleSubmit()}
            >
              Publish Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
