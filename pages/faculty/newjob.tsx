import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  Failure,
  objIsEmpty,
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
import { useRouter } from "next/router";
import UpdatePropertyImagePreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";

export default function Newjob() {
  const router = useRouter();
  const id = router?.query?.id;

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
    address: "",
    institution: null,
    college: null,
    department: null,
    jobType: null,
    salary: {
      value: 8,
      label: "As per college norms",
    },
    deadline: "",
    startDate: "",
    endDate: "",
    numberOfOpenings: "",
    qualification: "",
    experience: "",
    skills: [],
    tags: [],
    images: [],
    newImages: [],
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
    responsibilityData: null,
    editorData: {
      time: Date.now(),
      blocks: [],
      version: "2.19.0",
    },
    error: {},
    location: [],
    applyType: { value: "internal", label: "Internal" },
    isCollegeEmail: true,
    alternativeEmail: "",
    applyLink: "",
  });

  useEffect(() => {
    fetchInstitutions();
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    // jobStatusList();
    categoryList(1);
    skillList(1);
    tagList(1);
    fetchExperience(1);
    jobRoleList(1);
  }, []);

  useEffect(() => {
    profile();
  }, []);

  const profile = async () => {
    try {
      const res: any = await Models.auth.profile();
      console.log("✌️res --->", res);
      setState({ profile: res });
      if (res?.role == ROLES.INSTITUTION_ADMIN) {
        setState({
          profile: res,
          institution: {
            value: res?.institution?.id,
            label: res?.institution?.name,
          },
        });
        fetchColleges(res?.institution?.id, 1);
      } else if (res?.role == ROLES.HR) {
        setState({
          profile: res,
          institution: {
            value: res?.institution?.id,
            label: res?.institution?.name,
          },
        });
        if (res?.college?.length > 0) {
        } else {
          setState({
            college: {
              value: res?.college?.college_id,
              label: res?.college?.short_name,
            },
          });
        }
        fetchDepartments(res?.college?.college_id, 1);
      } else if (res?.role == ROLES.HOD) {
        setState({
          college: {
            value: res?.college?.[0]?.college_id,
            label: res?.college?.[0]?.college_name,
          },
          institution: {
            value: res?.institution?.id,
            label: res?.institution?.name,
          },
          department: {
            value: res?.department?.id,
            label: res?.department?.name,
          },
        });
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

  const categoryList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ catLoading: true });
      const body = {
        search,
      };
      const res: any = await Models.master.category_list(body, page);

      const dropdown = Dropdown(res?.results, "name");
      setState({
        categoryOption: loadMore
          ? [...state.categoryOption, ...dropdown]
          : dropdown,
        catLoading: false,
        catPage: page,
        catNext: res?.next,
      });
    } catch (error) {
      setState({ hrLoading: false });
      // console.error("Error fetching HR users:", error);
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

  const jobRoleList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ jobRoleLoading: true });
      const body: any = {};
      if (search) body.search = search;
      const res: any = await Models.master.role_list(body, page);
      const dropdown = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.role_name,
      }));
      setState({
        jobRoleList: loadMore ? [...state.jobRoleList, ...dropdown] : dropdown,
        jobRoleNext: res?.next,
        jobRolePage: page,
        jobRoleLoading: false,
      });
    } catch {
      setState({ jobRoleLoading: false });
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

  const fetchInstitutions = async (page = 1, search = "") => {
    try {
      const body = {
        search,
      };
      const res: any = await Models.institution.list(page, body);
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
    console.log("✌️fetchColleges --->");
    try {
      const res: any = await Models.college.list(page, {
        institution: institutionId,
      });
      const options = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.short_name,
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
        label: item.short_name,
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

  const fetchExperience = async (page = 1) => {
    try {
      const res: any = await Models.master.experience_list(null, page);
      const options = res?.results?.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      setState({
        experienceList:
          page === 1 ? options : [...state.experienceList, ...options],
        experiencePage: page,
        experienceHasMore: !!res?.next,
      });
    } catch (error) {
      console.error("Error fetching experiences:", error);
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
  }, [state.responsibilityData]);

  const scrollToSection = (ref: any) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    setState({ btnLoading: true });
    const keyResponsibilityData =
      await state.keyResponsibilityEditorInstance?.save();

    try {
      const validation = {
        title: state.title,

        location: state.location,
        // address: state.address,
        institution: state.institution,
        college: state.college,
        department: state.department,

        // salary: state.salary?.value,

        priority: state.priority?.value,
        // deadline: state.deadline,
        // startDate: state.startDate,
        // endDate: state.endDate,

        experience: state.experience?.value,
        qualification: state.qualification,
        // keyResponsibility: keyResponsibilityData,

        description: state.description,
        applyType: state.applyType?.value,
        isCollegeEmail: state.isCollegeEmail,
        alternativeEmail: state.alternativeEmail,
        applyLink: state.applyLink,
        jobRole: state.jobRole?.value,
      };

      await CreateNewJob.validate(validation, { abortEarly: false });

      const body: any = {
        // job_title: capitalizeFLetter(state.title),
        job_title: state.jobRole?.label,

        job_description: state.description
          ? capitalizeFLetter(state.description)
          : "",

        job_type_id: state.jobType?.value,
        experiences: state.experience?.value,
        qualification: capitalizeFLetter(state.qualification),
        salary_range_id: state.salary?.value,
        location_ids: state.location?.map((item) => item?.value),

        number_of_openings: Number(state.numberOfOpenings),
        last_date: state.endDate
          ? moment(state.endDate).format("YYYY-MM-DD")
          : "",
        // job_status_id: state.job_status?.value,
        deadline: state.deadline
          ? moment(state.deadline).format("YYYY-MM-DD")
          : "",
        start_date: state.startDate
          ? moment(state.startDate).format("YYYY-MM-DD")
          : "",
        responsibility: keyResponsibilityData,

        is_approved: state.profile?.role == ROLES.HR ? true : false,
        priority_id: state.priority?.value,
      };

      if (state.profile?.role == ROLES.SUPER_ADMIN) {
        body.institution = state.institution?.value;
        body.college = state.college?.value;
        body.department = state.department?.map((dept: any) => dept.value);
      } else if (state.profile?.role == ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.id;
        body.college = state.college?.value;
        body.department = state.department?.map((dept: any) => dept.value);
      } else if (state.profile?.role == ROLES.HR) {
        body.institution = state.profile?.institution?.id;
        body.department = state.department?.map((dept: any) => dept.value);

        if (state.profile?.college?.length > 0) {
          body.college = state.college?.value;
        } else {
          body.college = state.profile?.college?.college_id;
        }
      } else {
        body.institution = state.profile?.institution?.id;
        body.college = state.profile?.college?.[0]?.college_id;
        body.department = state.profile?.department?.department_id;
      }
      if (state.newImages?.length > 0) {
        body.job_image = state.newImages?.[0];
      }
      if (state.applyType?.value == "internal") {
        if (state.isCollegeEmail) {
          body.alternative_email = state.alternativeEmail;
          body.user_collage_email = state.isCollegeEmail;
          body.apply_link = "";
        } else {
          body.alternative_email = "";
          body.user_collage_email = false;
          body.apply_link = "";
        }
      } else {
        body.user_collage_email = false;
        body.apply_link = state.applyLink;
        body.alternative_email = "";
      }

      if (state.category) {
        body.category_ids = [state.category?.value];
      } else {
        body.category_ids = [];
      }

      if (state.jobRole) {
        body.role_ids = [state.jobRole?.value];
      } else {
        body.role_ids = [];
      }

      console.log("✌️body --->", body);
      const formData = buildFormData(body);

      const res = await Models.job.create(formData);
      console.log("✌️res --->", res);

      setState({ error: {} });
      Success("Job created successfully.");
      router.back();
      setState({ btnLoading: false });
    } catch (err: any) {
      console.log("✌️err --->", err);
      if (err?.inner) {
        const errors: any = {};
        err.inner.forEach((error: any) => {
          errors[error.path] = error.message;
        });
        console.log("✌️errors --->", errors);
        if (!objIsEmpty(errors)) {
          Failure("Fill all details");
        }

        setState({ error: errors });
      } else if (err?.data?.error) {
        Failure(err?.data?.error);
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
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800">
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
      <div className=" z-10">
        <div className=" pb-4 ">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-ti text-transparent">Create Job Posting</h1>
              <p className="mt-1 text-sm text-gray-500">
                {" "}
                Post a new opportunity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="sticky top-[58px] z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section1Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 1
                    ? "bg-dblue text-white"
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
                state.activeStep >= 2 ? "bg-dblue" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section2Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 2
                    ? "bg-dblue text-white"
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
                state.activeStep >= 3 ? "bg-dblue" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section3Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 3
                    ? "bg-dblue text-white"
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
                state.activeStep >= 4 ? "bg-dblue" : "bg-gray-200"
              }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section4Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 4
                    ? "bg-dblue text-white"
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
            {/* <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 5 ? "bg-dblue" : "bg-gray-200"
              }`}
            ></div> */}

            {/* <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section5Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  state.activeStep >= 5
                    ? "bg-dblue text-white"
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
            </div> */}
          </div>
        </div>
      </div>

      <div className="   py-4 ">
        <div className="space-y-4">
          {/* Card 1: Basic Information */}
          <div
            ref={section1Ref}
            className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* <TextInput
                  name="title"
                  type="text"
                  title="Job Title"
                  placeholder="e.g., Senior Software Engineer"
                  value={state.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  error={state.error?.title}
                  required
                />

                <CustomSelect
                  options={state.locationList}
                  value={state.location}
                  onChange={(option) => handleFieldChange("location", option)}
                  placeholder="Select location"
                  title="Select Location"
                  required
                  isClearable={true}
                  error={state.error?.location}
                  loading={state.locationLoading}
                  isMulti={true}
                /> */}
                <CustomSelect
                  options={state.jobRoleList}
                  value={state.jobRole}
                  onChange={(option) => handleFieldChange("jobRole", option)}
                  placeholder="Select job role"
                  title="Select Job Role"
                  required
                  isClearable={true}
                  error={state.error?.jobRole}
                  loading={state.jobRoleLoading}
                  onSearch={(searchTerm) => jobRoleList(1, searchTerm)}
                  loadMore={() =>
                    state.jobRoleNext &&
                    jobRoleList(state.jobRolePage + 1, "", true)
                  }
                  // isMulti={true}
                />

                <CustomSelect
                  options={state.categoryOption}
                  value={state.category}
                  onChange={(selectedOption) => {
                    setState({
                      category: selectedOption,
                    });
                  }}
                  onSearch={(searchTerm) => categoryList(1, searchTerm)}
                  placeholder="Select category"
                  isClearable={true}
                  loadMore={() =>
                    state.catNext && categoryList(state.catPage + 1, "", true)
                  }
                  loading={state.catLoading}
                  title="Select category"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Job Details */}
          <div
            ref={section2Ref}
            className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
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
                      onSearch={(e) =>
                        fetchInstitutions(state.institutionPage + 1, e)
                      }
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
                      isMulti={true}
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
                      value={state.profile?.institution?.name}
                      onChange={(e) => {}}
                      disabled
                    />
                    <CustomSelect
                      title="College"
                      options={state.collegeList}
                      value={state.college}
                      onChange={(option) => {
                        setState({ department: [] });
                        handleFieldChange("college", option);
                      }}
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
                      isMulti={true}
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
                {state.profile?.role == ROLES.HR && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.name}
                      onChange={(e) => {}}
                      disabled
                    />
                    {state.profile?.college?.length > 0 ? (
                      <CustomSelect
                        title="College"
                        options={state.profile?.college?.map((item: any) => ({
                          value: item.college_id,
                          label: item.short_name,
                        }))}
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
                    ) : (
                      <TextInput
                        title="College"
                        placeholder="College"
                        value={state.profile?.college?.college_name}
                        onChange={(e) => {}}
                        disabled
                      />
                    )}
                    <CustomSelect
                      title="Department"
                      options={state.departmentList}
                      value={state.department}
                      onChange={(option) =>
                        handleFieldChange("department", option)
                      }
                      placeholder="Select department"
                      error={state.error?.department}
                      isMulti={true}
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
                      value={state.profile?.college?.[0]?.college_name}
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
                  placeholder="Job Urgency"
                  title="Job Urgency"
                  isClearable={true}
                  error={state.error?.priority}
                  required
                />

                <CustomSelect
                  options={state.salaryRangeList}
                  title="Salary Range"
                  placeholder="₹80k - ₹120k"
                  value={state.salary}
                  onChange={(option) => handleFieldChange("salary", option)}
                  error={state.error?.salary}
                  isClearable={true}
                  // required
                />

                {/* <CustomSelect
                  options={state.jobStatusList}
                  title="Select job status"
                  placeholder="Select job status"
                  value={state.job_status}
                  onChange={(option) => handleFieldChange("job_status", option)}
                  error={state.error?.job_status}
                  isClearable={true}
                  required
                /> */}

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
                />

                <TextInput
                  name="endDate"
                  type="date"
                  title="End Date"
                  value={state.endDate}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  min={state.startDate}
                />

                <TextInput
                  name="deadline"
                  type="date"
                  title="Deadline"
                  value={state.deadline}
                  onChange={(e) =>
                    handleFieldChange("deadline", e.target.value)
                  }
                  min={state.startDate}
                  max={state.endDate}
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
                  options={state?.experienceList}
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
              <div className="mt-5">
                <CustomSelect
                  title="Apply Type"
                  options={[
                    { value: "internal", label: "Internal" },
                    { value: "external", label: "External" },
                  ]}
                  value={state.applyType}
                  onChange={(option) => handleFieldChange("applyType", option)}
                  placeholder="Apply Type"
                  error={state.error?.applyType}
                  isClearable={false}
                />
                {state.applyType?.value == "internal" ? (
                  <>
                    <div className="mt-5">
                      <CheckboxInput
                        label="Use College Email"
                        checked={state.isCollegeEmail}
                        labelStyle="font-bold text-md"
                        onChange={(e) =>
                          setState({
                            isCollegeEmail: e,
                          })
                        }
                      />
                    </div>

                    {!state.isCollegeEmail && (
                      <div className="mt-5">
                        <TextInput
                          name="Alternative Email"
                          title="Alternative Email"
                          placeholder="Alternative Email"
                          value={state.alternativeEmail}
                          onChange={(e) =>
                            handleFieldChange(
                              "alternativeEmail",
                              e.target.value
                            )
                          }
                          error={state.error?.alternativeEmail}
                          required
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-5">
                    <TextInput
                      name="Apply Link"
                      title="Apply Link"
                      placeholder="Apply Link"
                      value={state.applyLink}
                      onChange={(e) =>
                        handleFieldChange("applyLink", e.target.value)
                      }
                      error={state.error?.applyLink}
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <UpdatePropertyImagePreview
            existingImages={state.college_logo}
            onImagesChange={(newImages) => setState({ newImages })}
            onDeleteImage={(imageUrl) => {
              setState({
                college_logo: state.college_logo.filter(
                  (img) => img !== imageUrl
                ),
              });
            }}
            maxFiles={1}
            title="Job Image"
            description="Upload job logo (JPEG or PNG)"
            validateDimensions={false}
            isSingleImage={true}
          />
          <div
            ref={section5Ref}
            className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
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
                rows={10}
              />
            </div>
          </div>

          {/* Card 3: Key Responsibility */}
          <div
            ref={section3Ref}
            className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="border-b px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-black">
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
              <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors ">
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

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => router.back()}
              type="button"
              className="w-full rounded-lg border-2 border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-dblue w-full rounded-lg px-8 py-2 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl sm:w-auto"
              onClick={() => handleSubmit()}
            >
              Create Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
