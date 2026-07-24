import {
  buildFormData,
  capitalizeFLetter,
  Dropdown,
  Failure,
  formatOptions,
  objIsEmpty,
  Success,
  toISO,
  useSetState,
} from "@/utils/function.utils";
import IconBellBing from "@/components/Icon/IconBellBing";
import React, { useCallback, useEffect, useRef } from "react";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import TextArea from "@/components/FormFields/TextArea.component";
import ChipInput from "@/components/FormFields/ChipInput.component";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import { CreateNewJob } from "@/utils/validation.utils";
import { Models } from "@/imports/models.import";
import { EXPERIENCE, FRONTEND_URL, JOB_TYPE, ROLES } from "@/utils/constant.utils";
import moment from "moment";
import { useRouter } from "next/router";
import UpdatePropertyImagePreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import { BellRing, Sparkles, X } from "lucide-react";
import Modal from "@/components/modal/modal.component";
import ParentChildCat from "@/components/FormFields/parent_child_dropdown";
import CategorySelector, { transformCategoryData } from "@/components/FormFields/categorySelect";
import AccordionSelect from "@/components/FormFields/AccordionSelect";

type QuickOptionGroupProps = {
  label: string;
  options?: Array<{ value: any; label: string }>;
  value?: { value: any; label: string } | null;
  required?: boolean;
  optional?: boolean;
  onSelect: (option: any) => void;
  onSkip?: () => void;
};

function QuickOptionGroup({ label, options = [], value, required, optional, onSelect, onSkip }: QuickOptionGroupProps) {
  const safeOptions = Array.isArray(options) ? options.filter(Boolean) : [];

  return (
    <fieldset>
      <div className="mb-2 flex items-center justify-between gap-2">
        <legend className="text-sm font-semibold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </legend>
        {optional && onSkip && (
          <button type="button" onClick={onSkip} className="text-xs font-medium text-gray-500 hover:text-gray-800">Skip</button>
        )}
      </div>
      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/60 p-2">
        {safeOptions.length ? safeOptions.map((option) => {
          const selected = value?.value === option.value;
          return (
            <label
              key={option.value}
              onClick={() => onSelect(option)}
              className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${selected ? "border-[#243f90] bg-indigo-50 text-[#243f90]" : "border-transparent bg-white text-gray-700 hover:border-indigo-200"}`}
            >
              <input
                type="radio"
                name={`quick-${label.replace(/\s+/g, "-").toLowerCase()}`}
                checked={selected}
                onChange={() => onSelect(option)}
                className="h-4 w-4 border-gray-300 text-[#243f90] focus:ring-[#243f90]"
              />
              {option.label}
            </label>
          );
        }) : (
          <p className="text-xs text-gray-400">Options are loading…</p>
        )}
      </div>
    </fieldset>
  );
}

export default function Newjob() {
  const router = useRouter();
  const id = router?.query?.id;

  const editorRef = useRef(null);
  const keyResponsibilityEditorRef = useRef(null);
  const professionalSkillsEditorRef = useRef(null);
  const qualificationEditorRef = useRef(null);
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);
  const section5Ref = useRef(null);
  const isEditorInitialized = useRef(false);
  const isKeyResponsibilityEditorInitialized = useRef(false);
  const isQualificationEditorInitialized = useRef(false);
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
    qualificationEditorInstance: null,
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
    immediateHiring: false,
    alternativeEmail: "",
    applyLink: "",
    academicResponsibility: [],
    academicResponsibilityList: [],
    academicResponsibilityLoading: false,
    isOpen: false,
    editItem: null,
    catTitle: "",
    canonical_url: "",
    catDescription: "",
    seoCategoryList: [],
    rawSeoCategoryList: [],
    seoCategorySelected: [],
    seoCategory: null,
    meta_title: "",
    meta_description: "",
    aiAssistantOpen: false,
    aiPrompt: "",
    aiSuggestions: [],
    aiLoading: false,
    aiError: "",
    aiSuggestionModalOpen: false,
    aiSelectedSuggestion: null,
    aiDraftDescription: "",
    quickKeyResponsibilities: "",
    editorLoadError: "",
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
    academicResponsibilityList();
    seoCategoryList();
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

  const academicResponsibilityList = async () => {
    try {
      setState({ academicResponsibilityLoading: true });
      const res: any =
        await Models.master.additional_academic_responsibilities_list(
          { pagination: "No" },
          1
        );
      const dropdown = res?.filter(Boolean).map((item: any) => ({
        value: item?.id,
        label: item?.responsibility_title || "",
      }));
      setState({
        academicResponsibilityList: dropdown || [],
        academicResponsibilityLoading: false,
      });
    } catch (error) {
      setState({ academicResponsibilityLoading: false });
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
      const dropdown = res?.results?.filter(Boolean).map((item: any) => ({
        value: item?.id,
        label: item?.role_name || "",
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
      const options = res?.results?.filter(Boolean).map((item: any) => ({
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
      const options = res?.results?.filter(Boolean).map((item: any) => ({
        value: item?.id,
        label: item?.short_name || "",
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
        pagination: "No",
      });
      const options = res?.results?.filter(Boolean).map((item: any) => ({
        value: item?.id,
        label: item?.department_name || "",
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
      const options = res?.results?.filter(Boolean).map((item: any) => ({
        value: item?.id,
        label: item?.name || "",
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
      const section3 = section3Ref.current?.getBoundingClientRect();
      const section4 = section4Ref.current?.getBoundingClientRect();
      const section5 = section5Ref.current?.getBoundingClientRect();

      const isAtPageBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if ((section5 && section5.top < 300) || isAtPageBottom) {
        setState({ activeStep: 5 });
      } else if (section4 && section4.top < 300) {
        setState({ activeStep: 4 });
      } else if (section3 && section3.top < 300) {
        setState({ activeStep: 3 });
      } else if (section2 && section2.top < 300) {
        setState({ activeStep: 2 });
      } else if (section1 && section1.top < 300) {
        setState({ activeStep: 1 });
      }
    };

    handleScroll();
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

      try {
        // Keep Editor.js in the page bundle. Dynamic import creates a separate
        // on-demand chunk that can be stale after a Next.js hot reload.
        const EditorJS = require("@editorjs/editorjs").default;
        const List = require("@editorjs/list");
        const editor = new EditorJS({
          holder: editorRef.current,
          data: state.editorData,
          placeholder: "Start typing your job description...",
          tools: {
            list: {
              class: List,
              inlineToolbar: true,
            },
          },
        });
        setState({ editorInstance: editor });
      } catch (error) {
        console.error("Unable to load Editor.js", error);
        setState({ editorLoadError: "The rich-text editor could not be loaded. Please refresh the page." });
      }
    }

    if (
      typeof window !== "undefined" &&
      qualificationEditorRef.current &&
      !isQualificationEditorInitialized.current
    ) {
      isQualificationEditorInitialized.current = true;

      try {
        const EditorJS = require("@editorjs/editorjs").default;
        const List = require("@editorjs/list");
        const editor = new EditorJS({
          holder: qualificationEditorRef.current,
          placeholder: "List required qualifications...",
          tools: {
            list: {
              class: List,
              inlineToolbar: true,
            },
          },
        });
        setState({ qualificationEditorInstance: editor });
      } catch (error) {
        console.error("Unable to load Editor.js", error);
        setState({ editorLoadError: "The rich-text editor could not be loaded. Please refresh the page." });
      }
    }

    if (
      typeof window !== "undefined" &&
      keyResponsibilityEditorRef.current &&
      !isKeyResponsibilityEditorInitialized.current
    ) {
      isKeyResponsibilityEditorInitialized.current = true;

      try {
        const EditorJS = require("@editorjs/editorjs").default;
        const List = require("@editorjs/list");
        const editor = new EditorJS({
          holder: keyResponsibilityEditorRef.current,
          placeholder: "List key responsibilities...",
          tools: {
            list: {
              class: List,
              inlineToolbar: true,
            },
          },
        });
        setState({ keyResponsibilityEditorInstance: editor });
      } catch (error) {
        console.error("Unable to load Editor.js", error);
        setState({ editorLoadError: "The rich-text editor could not be loaded. Please refresh the page." });
      }
    }

    if (
      typeof window !== "undefined" &&
      professionalSkillsEditorRef.current &&
      !isProfessionalSkillsEditorInitialized.current
    ) {
      isProfessionalSkillsEditorInitialized.current = true;

      try {
        const EditorJS = require("@editorjs/editorjs").default;
        const List = require("@editorjs/list");
        const editor = new EditorJS({
          holder: professionalSkillsEditorRef.current,
          placeholder: "List required professional skills...",
          tools: {
            list: {
              class: List,
              inlineToolbar: true,
            },
          },
        });
        setState({ professionalSkillsEditorInstance: editor });
      } catch (error) {
        console.error("Unable to load Editor.js", error);
        setState({ editorLoadError: "The rich-text editor could not be loaded. Please refresh the page." });
      }
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
        state.qualificationEditorInstance &&
        isQualificationEditorInitialized.current
      ) {
        state.qualificationEditorInstance?.destroy?.();
        isQualificationEditorInitialized.current = false;
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
  console.log('✌️state.seoCategory --->', state.seoCategory);


  const handleSubmit = async () => {
    setState({ btnLoading: true });
    const jobDescriptionData = await state.editorInstance?.save();
    const keyResponsibilityData =
      await state.keyResponsibilityEditorInstance?.save();
    const qualificationData = await state.qualificationEditorInstance?.save();
    const jobDescription = (jobDescriptionData?.blocks || [])
      .map((block: any) => {
        if (block?.data?.text) return String(block.data.text).replace(/<[^>]*>/g, "");
        if (Array.isArray(block?.data?.items)) {
          return block.data.items.map((item: any) => typeof item === "string" ? item : item?.content || "").join("\n");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n") || state.description;

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
        immediateHiring: state.immediateHiring,
        // deadline: state.deadline,
        // startDate: state.startDate,
        // endDate: state.endDate,

        experience: state.experience?.value,
        qualification: qualificationData,
        // keyResponsibility: keyResponsibilityData,

        description: jobDescription,
        applyType: state.applyType?.value,
        isCollegeEmail: state.isCollegeEmail,
        alternativeEmail: state.alternativeEmail,
        applyLink: state.applyLink,
        jobRole: state.jobRole?.value,
        meta_title: state.meta_title,
        meta_description: state.meta_description,
      };

      await CreateNewJob.validate(validation, { abortEarly: false });

      // SEO category is required — at least one must be selected
      const seoCategory = state.seoCategory || {};

      const hasSeoSelection =
        (seoCategory.parent_ids?.length > 0) ||
        (seoCategory.child_ids?.length > 0) ||
        (seoCategory.sub_child_ids?.length > 0);
      if (!hasSeoSelection) {
        Failure("Please select at least one SEO category.");
        setState({ btnLoading: false, error: { ...state.error, seoCategory: "Please select at least one SEO category." } });
        return;
      }

      const body: any = {
        // job_title: capitalizeFLetter(state.title),
        job_title: state.jobRole?.label,

        job_description: jobDescription
          ? capitalizeFLetter(jobDescription)
          : "",

        job_type_id: state.jobType?.value,
        experiences: state.experience?.value,
        new_job_qualification: qualificationData,
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
        immediate_join: state.immediateHiring,
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
        // if (!state.isCollegeEmail) {
        //   body.alternative_email = state.alternativeEmail;
        //   body.user_collage_email = state.isCollegeEmail;
        //   body.apply_link = "";
        // } else {
        //   body.alternative_email = "";
        //   body.user_collage_email = false;
        //   body.apply_link = "";
        // }

        if (state.isCollegeEmail) {
          body.alternative_email = "";
          body.user_collage_email = state.isCollegeEmail;
          body.apply_link = "";
        } else {
          body.alternative_email = state.alternativeEmail;
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

      // const seoCategory = state.seoCategory || {};
      body.master_category_ids = seoCategory.parent_ids || [];
      body.subcategory_ids = seoCategory.child_ids || [];
      body.subcategory_child_ids = seoCategory.sub_child_ids || [];
      body.meta_title = state.meta_title;
      body.meta_description = state.meta_description;

      if (state.jobRole) {
        body.role_ids = [state.jobRole?.value];
      } else {
        body.role_ids = [];
      }

      if (state.academicResponsibility?.length > 0) {
        body.additional_academic_responsibility_ids =
          state.academicResponsibility.map((item: any) => item.value);
      } else {
        body.additional_academic_responsibility_ids = [];
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

  const selectQuickOption = (field: string, option: any) => {
    if (field === "category") {
      setState({ category: option });
      return;
    }
    handleFieldChange(field, option);
  };

  const skipQuickField = (field: string) => {
    const emptyValue = field === "academicResponsibility" ? [] : "";
    handleFieldChange(field, emptyValue);
  };

  const generateJobSuggestions = async () => {
    const prompt = state.aiPrompt.trim();
    if (!prompt) {
      setState({ aiError: "Describe the opening before generating suggestions." });
      return;
    }

    setState({ aiLoading: true, aiError: "", aiSuggestions: [] });
    try {
      const response = await fetch("/api/mistral-job-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to generate suggestions.");
      const suggestions = data.suggestions || [];
      const firstSuggestion = suggestions[0] || null;
      setState({
        aiSuggestions: suggestions,
        aiSelectedSuggestion: firstSuggestion,
        aiDraftDescription: firstSuggestion?.description || "",
        aiSuggestionModalOpen: suggestions.length > 0,
        aiLoading: false,
      });
    } catch (error: any) {
      setState({ aiLoading: false, aiError: error?.message || "Unable to generate suggestions." });
    }
  };

  const applyJobSuggestion = (suggestion: any, description = suggestion?.description || "") => {
    const matchingRole = state.jobRoleList?.find(
      (role: any) => role.label?.toLowerCase() === suggestion.role?.toLowerCase()
    );
    setState({
      aiPrompt: suggestion.title || state.aiPrompt,
      description: description || state.description,
      ...(matchingRole ? { jobRole: matchingRole } : {}),
    });

    if (description && state.editorInstance?.render) {
      Promise.resolve(
        state.editorInstance.render({
          blocks: [{ type: "paragraph", data: { text: description.replace(/\n/g, "<br>") } }],
        })
      ).catch((error: any) => console.error("Unable to apply job description", error));
    }

    const responsibilities = Array.isArray(suggestion.highlights)
      ? suggestion.highlights.filter(Boolean)
      : [];
    setState({ quickKeyResponsibilities: responsibilities.join("\n") });
    if (responsibilities.length && state.keyResponsibilityEditorInstance?.render) {
      Promise.resolve(
        state.keyResponsibilityEditorInstance.render({
          blocks: [{
            type: "list",
            data: {
              style: "unordered",
              items: responsibilities.map((item: string) => ({ content: item, items: [] })),
            },
          }],
        })
      ).catch((error: any) => console.error("Unable to apply key responsibilities", error));
    }
  };

  const updateQuickResponsibilities = () => {
    const responsibilities = state.quickKeyResponsibilities
      .split("\n")
      .map((item: string) => item.trim())
      .filter(Boolean);
    if (!responsibilities.length || !state.keyResponsibilityEditorInstance?.render) return;

    Promise.resolve(
      state.keyResponsibilityEditorInstance.render({
        blocks: [{
          type: "list",
          data: {
            style: "unordered",
            items: responsibilities.map((item: string) => ({ content: item, items: [] })),
          },
        }],
      })
    ).catch((error: any) => console.error("Unable to update key responsibilities", error));
  };

  const seoCategoryList = async () => {
    try {
      const res: any = await Models.seo.list(1, {});
      setState({
        seoCategoryList: transformCategoryData(res?.results || []),
        rawSeoCategoryList: res?.results || [],
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const buildJobCanonicalUrl = (seoCategory: any, rawList: any[]): string => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    if (!seoCategory || !rawList?.length) return "";

    const findNodeById = (nodes: any[], id: number): any => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const sub = node.subcategories || [];
        for (const s of sub) {
          if (s.id === id) return s;
          const subsub = s.subcategories || [];
          const found = subsub.find((ss: any) => ss.id === id);
          if (found) return found;
        }
      }
      return null;
    };

    const getSlugChain = (nodes: any[], id: number): string[] => {
      for (const node of nodes) {
        if (node.id === id) return [node.slug || ""];
        const sub = node.subcategories || [];
        for (const s of sub) {
          if (s.id === id) return [node.slug || "", s.slug || ""];
          const subsub = s.subcategories || [];
          for (const ss of subsub) {
            if (ss.id === id) return [node.slug || "", s.slug || "", ss.slug || ""];
          }
        }
      }
      return [];
    };

    // Use deepest selected id to build full slug chain
    const subChildIds = seoCategory.sub_child_ids || [];
    const childIds = seoCategory.child_ids || [];
    const parentIds = seoCategory.parent_ids || [];

    let targetId: number | null = null;
    if (subChildIds.length) targetId = subChildIds[subChildIds.length - 1];
    else if (childIds.length) targetId = childIds[childIds.length - 1];
    else if (parentIds.length) targetId = parentIds[parentIds.length - 1];

    if (!targetId) return "";
    const slugs = getSlugChain(rawList, targetId).filter(Boolean);
    return slugs.length ? `${base}/${slugs.join("/")}` : "";
  };

  const buildCanonicalUrl = (parentCategory: any, slug: string, rawList: any[]): string => {
    const base = (FRONTEND_URL || "").replace(/\/$/, "");
    const parts: string[] = [];
    if (parentCategory?.id) {
      const findSlugs = (nodes: any[], targetId: number, path: string[]): string[] | null => {
        for (const node of nodes) {
          if (node.id === targetId) return [...path, node.slug || ""];
          const sub = node.subcategories || node.children || [];
          const found = findSlugs(sub, targetId, [...path, node.slug || ""]);
          if (found) return found;
        }
        return null;
      };
      const slugPath = findSlugs(rawList, parentCategory.id, []);
      if (slugPath) parts.push(...slugPath.filter(Boolean));
    }
    if (slug) parts.push(slug);
    return parts.length ? `${base}/${parts.join("/")}` : base;
  };

  const create_category = async () => {
    try {
      setState({ catLoading: true });
      let res: any;
      if (state.parent_category?.id) {
        const body: any = { name: state?.name, slug: state.slug, description: state.catDescription, title: state.catTitle, canonical_url: state.canonical_url };

        const selected = state.parent_category;
        if (selected.depth === 0) {
          body.category_id = selected.id;
        } else {
          body.parent_id = selected.id;
          body.category_id = selected.category_id;
        }
        res = await Models.seo.create_sub_category(body);
      } else {
        res = await Models.seo.create_category({ name: state?.name, slug: state.slug, description: state.catDescription, title: state.catTitle, canonical_url: state.canonical_url });
      }
      const listRes: any = await Models.seo.list(1, {});
      const updatedList = transformCategoryData(listRes?.results || []);
      const existingSelected = Array.isArray(state.seoCategorySelected) ? state.seoCategorySelected : [];
      const newDepth = state.parent_category ? (state.parent_category.depth ?? 0) + 1 : 0;
      const newSelected = res?.id ? { id: res.id, name: res?.name, depth: newDepth } : null;
      setState({
        seoCategoryList: updatedList,
        rawSeoCategoryList: listRes?.results || [],
        seoCategorySelected: newSelected ? [...existingSelected, newSelected] : existingSelected,
        catLoading: false,
        isOpen: false,
        name: "",
        slug: "",
        catDescription: "",
        catTitle: "",
        canonical_url: "",
        parent_category: null,
      });
    } catch (error) {
      setState({ catLoading: false });
      console.log("✌️error --->", error);
    }
  };

  const handleCloseModal = () => {
    setState({
      isOpen: false,
      editItem: null,
      name: "",
      slug: "",
      catDescription: "",
      catTitle: "",
      canonical_url: "",
      parent_category: null,
    });
  };

  const handleEdit = (item: { id: number; name: string; slug?: string; description?: string; title?: string; category_id?: number; depth: number; ancestors?: any[]; type?: string; parent_id?: number; child_id?: number }) => {
    let parent_category = null;
    if (item.ancestors?.length) {
      const ancestors = item.ancestors.filter(Boolean);
      const label = ancestors.map((a: any) => a?.name || "Untitled category").join(" > ");
      const last = ancestors[ancestors.length - 1];
      if (last) {
        parent_category = { id: last.id, label, type: `level${item.depth - 1}`, depth: item.depth - 1, category_id: ancestors[0]?.id };
      }
    }
    setState({
      isOpen: true,
      editItem: item,
      name: item?.name,
      slug: item.slug || "",
      catDescription: item.description || "",
      catTitle: item.title || "",
      canonical_url: buildCanonicalUrl(parent_category, item.slug || "", state.rawSeoCategoryList || []),
      parent_category,
    });
  };

  const delete_category = (item: { id: number; name: string; depth: number }) => {
    setState({ deleteConfirmItem: item });
  };

  const confirm_delete_category = async () => {
    const item = state.deleteConfirmItem;
    if (!item) return;
    try {
      setState({ catLoading: true, deleteConfirmItem: null });
      if (item.depth === 0) {
        await Models.seo.delete_category(item.id);
      } else {
        await Models.seo.delete_sub_category(item.id);
      }
      const listRes: any = await Models.seo.list(1, {});
      const existingSelected = Array.isArray(state.seoCategorySelected)
        ? state.seoCategorySelected.filter((s: any) => s.id !== item.id)
        : [];
      const updatedList = transformCategoryData(listRes?.results || []);
      const parent_ids = existingSelected.filter((s: any) => s.depth === 0).map((s: any) => s.id);
      const child_ids = existingSelected.filter((s: any) => s.depth === 1).map((s: any) => s.id);
      const sub_child_ids = existingSelected.filter((s: any) => s.depth === 2).map((s: any) => s.id);
      setState({
        seoCategoryList: updatedList,
        rawSeoCategoryList: listRes?.results || [],
        seoCategorySelected: existingSelected,
        seoCategory: { parent_ids, child_ids, sub_child_ids },
        catLoading: false,
      });
    } catch (error) {
      setState({ catLoading: false });
      console.log("✌️delete_category error --->", error);
    }
  };

  const update_category = async () => {
    try {
      setState({ catLoading: true });
      const item = state.editItem;
      const body: any = { name: state?.name, slug: state.slug, description: state.catDescription, title: state.catTitle, canonical_url: state.canonical_url };
      if (item?.depth === 0) {
        await Models.seo.update_parent_cat(body, item.id);
      } else {
        const selected = state.parent_category;
        const subBody: any = { ...body };
        if (selected) {
          subBody.parent_id = selected.depth === 0 ? null : selected.id;
          subBody.category_id = selected.depth === 0 ? selected.id : selected.category_id;
        } else {
          subBody.category_id = item?.ancestors?.[0]?.id || item?.category_id;
          subBody.parent_id = item?.depth > 1 ? item?.ancestors?.[item.ancestors.length - 1]?.id : null;
        }
        if (!subBody.parent_id) delete subBody.parent_id;
        await Models.seo.update_sub_cat(subBody, item.id);
      }
      const listRes: any = await Models.seo.list(1, {});
      setState({
        seoCategoryList: transformCategoryData(listRes?.results || []),
        rawSeoCategoryList: listRes?.results || [],
        catLoading: false,
        isOpen: false,
        editItem: null,
        name: "",
        slug: "",
        catDescription: "",
        catTitle: "",
        canonical_url: "",
        parent_category: null,
      });
    } catch (error) {
      setState({ catLoading: false });
      console.log("✌️error --->", error);
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
        .ce-inline-toolbar {
          z-index: 40 !important;
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
            {/* <button
              type="button"
              onClick={() => setState({ aiAssistantOpen: !state.aiAssistantOpen })}
              className="inline-flex items-center gap-2 rounded-lg bg-dblue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              aria-expanded={state.aiAssistantOpen}
            >
              <Sparkles className="h-4 w-4" />
              AI create job
            </button> */}
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
            <div
              className={`mx-2 h-1 flex-1 ${
                state.activeStep >= 5 ? "bg-dblue" : "bg-gray-200"
              }`}
            ></div>
            <div
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
                {state.activeStep > 5 ? "✓" : "5"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${
                    state.activeStep >= 5 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  SEO
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`grid grid-cols-1 gap-4 ${state.aiAssistantOpen ? "xl:grid-cols-2" : ""}`}>
        <div className={state.aiAssistantOpen ? "xl:col-span-1" : "w-full"}>
          {state.editorLoadError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.editorLoadError}
            </div>
          )}
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
                      onChange={(option) =>
                        handleFieldChange("jobRole", option)
                      }
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
                        state.catNext &&
                        categoryList(state.catPage + 1, "", true)
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
                            options={state.profile?.college?.map(
                              (item: any) => ({
                                value: item.college_id,
                                label: item.short_name,
                              })
                            )}
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
                    {/* <CustomSelect
                  options={state.priorityList}
                  value={state.priority}
                  onChange={(option) => handleFieldChange("priority", option)}
                  placeholder="Job Urgency"
                  title="Job Urgency"
                  isClearable={true}
                  error={state.error?.priority}
                  required
                /> */}

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
                      onChange={(e) =>
                        handleFieldChange("endDate", e.target.value)
                      }
                      min={state.startDate}
                    />

                    <CustomSelect
                      options={state.priorityList}
                      value={state.priority}
                      onChange={(option) =>
                        handleFieldChange("priority", option)
                      }
                      placeholder="Select Job Validity Period"
                      title=" Job Validity Period"
                      isClearable={true}
                      error={state.error?.priority}
                      required
                    />

                    <CheckboxInput
                      label={
                        <span className="flex items-center gap-1">
                          Immediate Hiring{" "}
                          <BellRing className="h-4 w-4 text-success" />
                        </span>
                      }
                      className="mt-8 w-fit"
                      checked={state.immediateHiring}
                      labelStyle="font-bold text-md"
                      onChange={(e) =>
                        setState({
                          immediateHiring: e,
                        })
                      }
                    />

                    {/* <TextInput
                  name="deadline"
                  type="date"
                  title="Deadline"
                  value={state.deadline}
                  onChange={(e) =>
                    handleFieldChange("deadline", e.target.value)
                  }
                  min={state.startDate}
                  max={state.endDate}
                /> */}

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
                      onChange={(option) =>
                        handleFieldChange("experience", option)
                      }
                      placeholder="Select Experience"
                      error={state.error?.experience}
                      required
                    />
                    {/* <TextInput
                  name="qualification"
                  title="Qualification"
                  placeholder="Required qualifications..."
                  value={state.qualification}
                  onChange={(e) =>
                    handleFieldChange("qualification", e.target.value)
                  }
                  error={state.error?.qualification}
                  required
                /> */}

                    <CustomSelect
                      options={state.academicResponsibilityList}
                      value={state.academicResponsibility}
                      onChange={(selectedOption) =>
                        setState({ academicResponsibility: selectedOption })
                      }
                      placeholder="Select academic responsibilities"
                      isClearable={true}
                      isMulti={true}
                      loading={state.academicResponsibilityLoading}
                      title="Academic Responsibilities"
                    />
                  </div>

                  <div className="mt-5">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-[#374151] ">
                      Qualification
                    </h2>

                    <div className="pt-2">
                      <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors ">
                        <div
                          ref={qualificationEditorRef}
                          id="qualificationEditor"
                          className="max-h-[400px] min-h-[250px] overflow-y-auto p-4"
                        ></div>
                      </div>
                      {state.error?.qualification && (
                        <p className="mt-2 text-sm text-red-600">
                          {state.error.qualification}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5">
                    <CustomSelect
                      title="Apply Type"
                      options={[
                        { value: "internal", label: "Internal" },
                        { value: "external", label: "External" },
                      ]}
                      value={state.applyType}
                      onChange={(option) =>
                        handleFieldChange("applyType", option)
                      }
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Job Description
                  </h2>
                </div>
                <div className="p-6">
                  <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors">
                    <div
                      ref={editorRef}
                      id="jobDescriptionEditor"
                      className="max-h-[400px] min-h-[250px] overflow-y-auto p-4"
                    ></div>
                  </div>
                  {state.error?.description && (
                    <p className="mt-2 text-sm text-red-600">{state.error.description}</p>
                  )}
                </div>
              </div>

              {/* Card 3: Key Responsibility */}
              <div
                ref={section4Ref}
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

              <div
                ref={section5Ref}
                className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="border-b px-6 py-4 gap-5 flex items-center justify-between">
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
                    SEO
                  </h2>
                  <span
                    onClick={() => setState({ isOpen: true })}
                    className="cursor-pointer text-md font-bold underline text-dblue"
                  >
                    New Category
                  </span>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-5">
                    <div className="w-full overflow-hidden">
                      <CategorySelector
                        key={state.seoCategoryList?.length}
                        categoryData={state.seoCategoryList}
                        value={state.seoCategorySelected}
                        onChange={(payload, rawSelected) => setState({ seoCategory: payload, seoCategorySelected: rawSelected, error: { ...state.error, seoCategory: undefined } })}
                        onEdit={handleEdit}
                        onDelete={delete_category}
                      />
                    </div>
                    {state.error?.seoCategory && (
                      <p className="mt-2 text-sm text-red-600">{state.error.seoCategory}</p>
                    )}
                    <TextInput
                      title="Meta Title"
                      placeholder="Enter meta title"
                      value={state.meta_title}
                      onChange={(e) => setState({ meta_title: e.target.value, error: { ...state.error, meta_title: undefined } })}
                      error={state.error?.meta_title}
                      required
                    />
                    <TextArea
                      title="Meta Description"
                      placeholder="Enter meta description"
                      value={state.meta_description}
                      onChange={(e) => setState({ meta_description: e.target.value, error: { ...state.error, meta_description: undefined } })}
                      error={state.error?.meta_description}
                      required
                    />
                  </div>
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

        <aside className={`space-y-4 py-4 ${state.aiAssistantOpen ? "xl:col-span-1" : ""}`}>
          {state.aiAssistantOpen && (
            <div className="sticky top-32 overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-lg">              <div className="flex items-start justify-between bg-gradient-to-r from-[#243f90] to-[#506ee8] px-5 py-4 text-white">
                <div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="h-4 w-4" /> Quick job creator
                  </div>
                  <p className="mt-1 text-xs text-indigo-100">Choose answers instead of filling every field.</p>
                </div>
                <button type="button" onClick={() => setState({ aiAssistantOpen: false })} className="rounded p-1 hover:bg-white/15" aria-label="Close AI job creator">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(100vh-10rem)] space-y-5 overflow-y-auto p-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Describe the opening</label>
                  <input
                    value={state.aiPrompt}
                    onChange={(e) => setState({ aiPrompt: e.target.value })}
                    placeholder="e.g. Need a Food Technology faculty"
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#506ee8] focus:ring-2 focus:ring-indigo-100"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Faculty opening", "Immediate hiring", "New department role"].map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => setState({ aiPrompt: suggestion })} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={generateJobSuggestions}
                    disabled={state.aiLoading || !state.aiPrompt.trim()}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#243f90] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#1d3478] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {state.aiLoading ? "Generating…" : "Generate suggestions"}
                  </button>
                  {state.aiError && <p className="mt-2 text-xs text-red-600">{state.aiError}</p>}
                </div>

                <QuickOptionGroup label="Job role" required options={state.jobRoleList?.slice(0, 6)} value={state.jobRole} onSelect={(option: any) => selectQuickOption("jobRole", option)} />
                <QuickOptionGroup label="Category" optional options={state.categoryOption?.slice(0, 6)} value={state.category} onSelect={(option: any) => selectQuickOption("category", option)} onSkip={() => skipQuickField("category")} />
                {state.profile?.role === ROLES.SUPER_ADMIN && (
                  <QuickOptionGroup label="Institution" required options={state.institutionList?.slice(0, 5)} value={state.institution} onSelect={(option: any) => selectQuickOption("institution", option)} />
                )}
                {state.profile?.role !== ROLES.SUPER_ADMIN && state.profile?.institution?.name && (
                  <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Institution: <span className="font-semibold text-gray-800">{state.profile.institution?.name}</span>
                  </div>
                )}
                {(state.profile?.role === ROLES.SUPER_ADMIN || state.profile?.role === ROLES.INSTITUTION_ADMIN || state.profile?.college?.length > 0) && (
                  <QuickOptionGroup label="College" required options={state.collegeList?.length ? state.collegeList.slice(0, 6) : state.profile?.college?.map((item: any) => ({ value: item.college_id, label: item.short_name }))} value={state.college} onSelect={(option: any) => selectQuickOption("college", option)} />
                )}
                {state.profile?.role !== ROLES.HOD && (
                  <QuickOptionGroup label="Department" required options={state.departmentList?.slice(0, 6)} value={Array.isArray(state.department) ? state.department?.[0] : state.department} onSelect={(option: any) => handleFieldChange("department", [option])} />
                )}
                <QuickOptionGroup label="Salary range" optional options={state.salaryRangeList?.slice(0, 6)} value={state.salary} onSelect={(option: any) => selectQuickOption("salary", option)} onSkip={() => skipQuickField("salary")} />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Start date
                    <input type="date" value={state.startDate || ""} onChange={(e) => handleFieldChange("startDate", e.target.value)} className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8]" />
                  </label>
                  <label className="block text-sm font-semibold text-gray-800">
                    End date
                    <input type="date" min={state.startDate || undefined} value={state.endDate || ""} onChange={(e) => handleFieldChange("endDate", e.target.value)} className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8]" />
                  </label>
                </div>

                <QuickOptionGroup label="Validity period" required options={state.priorityList?.slice(0, 6)} value={state.priority} onSelect={(option: any) => selectQuickOption("priority", option)} />

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-gray-800">Immediate hiring</legend>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-gray-50/60 p-2">
                    {[true, false].map((option) => (
                      <label key={String(option)} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${state.immediateHiring === option ? "border-[#243f90] bg-indigo-50 text-[#243f90]" : "border-transparent bg-white text-gray-700"}`}>
                        <input type="radio" name="quick-immediate-hiring" checked={state.immediateHiring === option} onChange={() => setState({ immediateHiring: option })} className="h-4 w-4 text-[#243f90] focus:ring-[#243f90]" />
                        {option ? "Yes" : "No"}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-sm font-semibold text-gray-800">Number of openings</label>
                    <button type="button" onClick={() => skipQuickField("numberOfOpenings")} className="text-xs font-medium text-gray-500 hover:text-gray-800">Skip</button>
                  </div>
                  <input type="number" value={state.numberOfOpenings} onChange={(e) => handleFieldChange("numberOfOpenings", e.target.value)} placeholder="e.g., 5" className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8]" />
                  <div className="mt-2 flex gap-2">
                    {[1, 3, 5].map((count) => <button key={count} type="button" onClick={() => handleFieldChange("numberOfOpenings", String(count))} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:border-indigo-300 hover:text-indigo-700">{count}</button>)}
                  </div>
                </div>

                <QuickOptionGroup label="Experience" required options={state.experienceList?.slice(0, 6)} value={state.experience} onSelect={(option: any) => selectQuickOption("experience", option)} />

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-gray-800">Academic responsibilities</legend>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/60 p-2">
                    {(state.academicResponsibilityList || []).filter(Boolean).slice(0, 8).map((option: any) => {
                      const selected = (state.academicResponsibility || []).some((item: any) => item?.value === option.value);
                      return (
                        <label key={option.value} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${selected ? "border-[#243f90] bg-indigo-50 text-[#243f90]" : "border-transparent bg-white text-gray-700"}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setState({ academicResponsibility: selected ? state.academicResponsibility.filter((item: any) => item?.value !== option.value) : [...(state.academicResponsibility || []), option] })}
                            className="h-4 w-4 rounded border-gray-300 text-[#243f90] focus:ring-[#243f90]"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <QuickOptionGroup label="Apply type" options={[{ value: "internal", label: "Internal" }, { value: "external", label: "External" }]} value={state.applyType} onSelect={(option: any) => handleFieldChange("applyType", option)} />

                {state.applyType?.value === "internal" ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                    <p className="text-sm font-semibold text-gray-800">Use college email</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[true, false].map((option) => (
                        <label key={String(option)} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm ${state.isCollegeEmail === option ? "border-[#243f90] bg-indigo-50 text-[#243f90]" : "border-transparent bg-white text-gray-700"}`}>
                          <input type="radio" name="quick-college-email" checked={state.isCollegeEmail === option} onChange={() => setState({ isCollegeEmail: option, alternativeEmail: option ? "" : state.alternativeEmail })} className="h-4 w-4 text-[#243f90] focus:ring-[#243f90]" />
                          {option ? "Yes" : "No"}
                        </label>
                      ))}
                    </div>
                    {!state.isCollegeEmail && (
                      <label className="mt-3 block text-sm font-semibold text-gray-800">
                        Alternative email <span className="text-red-500">*</span>
                        <input type="email" value={state.alternativeEmail || ""} onChange={(e) => handleFieldChange("alternativeEmail", e.target.value)} placeholder="Alternative email" className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8]" />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="block rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-sm font-semibold text-gray-800">
                    Apply link <span className="text-red-500">*</span>
                    <input type="url" value={state.applyLink || ""} onChange={(e) => handleFieldChange("applyLink", e.target.value)} placeholder="https://example.com/apply" className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8]" />
                  </label>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-800">Key responsibility</label>
                  <p className="mt-1 text-xs text-gray-500">One responsibility per line. It will be saved as a bullet list.</p>
                  <textarea value={state.quickKeyResponsibilities} onChange={(e) => setState({ quickKeyResponsibilities: e.target.value })} onBlur={updateQuickResponsibilities} placeholder="Teach assigned courses&#10;Mentor students&#10;Support department activities" rows={5} className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#506ee8] focus:ring-2 focus:ring-indigo-100" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">Job image</p>
                  <div className="mt-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2">
                    <UpdatePropertyImagePreview
                      onImagesChange={(images) => setState({ newImages: images })}
                      maxFiles={1}
                      isSingleImage={true}
                      title="Upload job image"
                      description="JPEG, PNG, or WEBP"
                    />
                  </div>
                </div>

                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs leading-5 text-gray-500">Required selections are marked with <span className="font-semibold text-red-500">*</span>. You can safely skip salary and openings, then complete the detailed form whenever needed.</p>
              </div>
            </div>
          )}
        </aside>
      </div>

      <Modal
        closeIcon
        maxWidth="max-w-sm"
        subTitle="Delete Category"
        open={!!state.deleteConfirmItem}
        close={() => setState({ deleteConfirmItem: null })}
        renderComponent={() => (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">"{state.deleteConfirmItem?.name}"</span>?
              This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setState({ deleteConfirmItem: null })}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm_delete_category}
                disabled={state.catLoading}
                className="rounded-lg bg-dblue px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {state.catLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        closeIcon
        maxWidth="max-w-2xl"
        subTitle="Mistral job suggestions"
        open={state.aiSuggestionModalOpen}
        close={() => setState({ aiSuggestionModalOpen: false })}
        renderComponent={() => (
          <div className="space-y-5">
            <p className="text-sm text-gray-600">Choose a suggestion, then edit the final job description before applying it to the form.</p>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-gray-800">Suggestions</legend>
              {(state.aiSuggestions || []).map((suggestion: any, index: number) => {
                const selected = state.aiSelectedSuggestion?.title === suggestion.title && state.aiSelectedSuggestion?.role === suggestion.role;
                return (
                  <label key={`${suggestion.title}-${index}`} className={`block cursor-pointer rounded-lg border p-4 transition ${selected ? "border-[#243f90] bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="mistral-suggestion"
                        checked={selected}
                        onChange={() => setState({ aiSelectedSuggestion: suggestion, aiDraftDescription: suggestion.description || "" })}
                        className="mt-1 h-4 w-4 text-[#243f90] focus:ring-[#243f90]"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{suggestion.title}</p>
                        {suggestion.role && <p className="mt-0.5 text-xs text-indigo-700">Suggested role: {suggestion.role}</p>}
                        {suggestion.highlights?.length > 0 && <p className="mt-2 text-xs leading-5 text-gray-600">{suggestion.highlights.join(" · ")}</p>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </fieldset>

            <div>
              <label className="text-sm font-semibold text-gray-800">Final job description</label>
              <p className="mt-1 text-xs text-gray-500">HR can edit this before applying it.</p>
              <textarea
                rows={8}
                value={state.aiDraftDescription}
                onChange={(e) => setState({ aiDraftDescription: e.target.value })}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#506ee8] focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setState({ aiSuggestionModalOpen: false })} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button
                type="button"
                disabled={!state.aiSelectedSuggestion}
                onClick={() => {
                  applyJobSuggestion(state.aiSelectedSuggestion, state.aiDraftDescription);
                  setState({ aiSuggestionModalOpen: false });
                }}
                className="rounded-lg bg-[#243f90] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3478] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Apply to job form
              </button>
            </div>
          </div>
        )}
      />

      <Modal
        closeIcon
        maxWidth="max-w-3xl"
        subTitle={state.editItem ? `Edit "${state.editItem?.name}"` : "Add new category"}
        open={state.isOpen}
        close={handleCloseModal}
        renderComponent={() => (
          <div className="w-full">
            <div className="min-h-[400px]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                  <>
                    <TextInput
                      title="Category Name"
                      placeholder="Category Name"
                      value={state?.name}
                      onChange={(e) => setState({ name: e.target.value })}
                      required
                    />
                    <TextInput
                      title="Title"
                      placeholder="Title"
                      value={state.catTitle}
                      onChange={(e) => setState({ catTitle: e.target.value })}
                    />
                    {(!state.editItem || state.editItem?.depth > 0) && (
                      <AccordionSelect
                        title="Parent Category"
                        apiData={state.rawSeoCategoryList || []}
                        value={state.parent_category}
                        onChange={(option) => {
                          handleFieldChange("parent_category", option);
                          setState({ canonical_url: buildCanonicalUrl(option, state.slug, state.rawSeoCategoryList || []) });
                        }}
                        placeholder="Select parent category"
                        excludeId={state.editItem?.id}
                      />
                    )}
                    <TextInput
                      title="Slug"
                      placeholder="slug"
                      value={state.slug}
                      onChange={(e) => {
                        const slug = e.target.value;
                        setState({ slug, canonical_url: buildCanonicalUrl(state.parent_category, slug, state.rawSeoCategoryList || []) });
                      }}
                    />
                    <TextInput
                      title="Canonical URL"
                      placeholder="Canonical URL"
                      value={state.canonical_url}
                      onChange={(e) => setState({ canonical_url: e.target.value })}
                      disabled
                    />
                    <TextArea
                      title="Description"
                      placeholder="Description"
                      value={state.catDescription}
                      onChange={(e) => setState({ catDescription: e.target.value })}
                    />
                  </>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex gap-2">
                <button onClick={() => handleCloseModal()} className="rounded-lg border px-6 py-2">Cancel</button>
                <button
                  onClick={() => state.editItem ? update_category() : create_category()}
                  className="bg-dblue rounded-lg px-6 py-2 text-white"
                  disabled={state.catLoading}
                >
                  {state.catLoading ? (state.editItem ? "Updating..." : "Creating...") : (state.editItem ? "Update" : "Create")}
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
