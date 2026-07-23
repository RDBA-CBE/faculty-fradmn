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
import IconLoader from "@/components/Icon/IconLoader";
import { BellRing } from "lucide-react";
import ParentChildCat, {
  transformToGroupedOptions,
} from "@/components/FormFields/parent_child_dropdown";
import CategorySelector, { transformCategoryData } from "@/components/FormFields/categorySelect";
import AccordionSelect from "@/components/FormFields/AccordionSelect";
import Modal from "@/components/modal/modal.component";

export default function UpdateJob() {
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
  const section6Ref = useRef(null);


  const qualificationEditorRef = useRef(null);
  const isEditorInitialized = useRef(false);
  const isKeyResponsibilityEditorInitialized = useRef(false);
  const isProfessionalSkillsEditorInitialized = useRef(false);
  const isQualificationEditorInitialized = useRef(false);

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
    qualificationData: null,
    editorData: {
      time: Date.now(),
      blocks: [],
      version: "2.19.0",
    },
    error: {},
    applyType: { value: "internal", label: "Internal" },
    isCollegeEmail: true,
    immediateHiring: false,
    alternativeEmail: "",
    applyLink: "",
    academicResponsibility: [],
    academicResponsibilityList: [],
    academicResponsibilityLoading: false,
    loading: true,
    isOpen: false,
    editItem: null,
    catTitle: "",
    canonical_url: "",
  });

  useEffect(() => {
    fetchInstitutions();
    locationList(1);
    salaryRangeList(1);
    priorityList(1);
    typeList();
    categoryList(1);
    skillList(1);
    tagList(1);
    fetchExperience(1);
    jobRoleList();
    academicResponsibilityList();
    seoCategoryList();
  }, []);

  useEffect(() => {
    if (id) {
      profile();
    }
  }, [id]);

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
        fetchColleges(res?.institution?.institution?.id, 1);
      } else if (res?.role == ROLES.HR) {
        setState({
          profile: res,
          // institution: {
          //   value: res?.institution?.id,
          //   label: res?.institution?.name,
          // },
          // college: {
          //   value: res?.college?.college_id,
          //   label: res?.college?.college_name,
          // },
        });
        // fetchDepartments(
        //   res?.college?.map((item) => item?.college_id),
        //   1
        // );
      }
      getJobDetails(res);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const getJobDetails = async (profileResponse) => {
    try {
      if (id) {
        const res: any = await Models.job.details(id);
        console.log("getJobDetails --->", res);
        setState({
          title: res?.job_title || "",
          company: res?.company || "",
          company_detail: res?.company_detail,
          description: res?.job_description,
          priority: {
            value: res?.priority_obj?.id,
            label: res?.priority_obj?.name,
          },
          immediateHiring: res?.immediate_join || false,
          jobType: {
            value: res?.job_type_obj?.id,
            label: res?.job_type_obj?.name,
          },
          salary: res?.salary_range_obj
            ? {
              value: res?.salary_range_obj?.id,
              label: res?.salary_range_obj?.name,
            }
            : null,
          job_status: {
            value: res?.job_status_obj?.id,
            label: res?.job_status_obj?.name,
          },

          institution: {
            value: res?.institution?.id,
            label: res?.institution?.name,
          },
          college: { value: res?.college?.id, label: res?.college?.short_name },
          department:
            res?.department?.length > 0
              ? res?.department?.map((dept: any) => ({
                value: dept?.id,
                label: dept?.name,
              }))
              : [],

          deadline: res?.deadline
            ? moment(res?.deadline).format("YYYY-MM-DD")
            : null,
          startDate: res?.start_date
            ? moment(res?.start_date).format("YYYY-MM-DD")
            : null,
          endDate: res?.last_date
            ? moment(res?.last_date).format("YYYY-MM-DD")
            : null,
          numberOfOpenings: res?.number_of_openings || "",
          qualification: res?.qualification || "",
          qualificationData: res?.new_job_qualification || null,
          experience: {
            value: res?.experiences?.id,
            label: res?.experiences?.name,
          },
          responsibilityData: res?.responsibility || null,
          images: res?.company_logo ? [res?.company_logo] : [],
          tags:
            res?.tags?.length > 0
              ? res?.tags?.map((tag: any) => ({
                value: tag?.id,
                label: tag?.name,
              }))
              : [],
          location:
            res?.locations?.length > 0
              ? res?.locations?.map((location: any) => ({
                value: location?.id,
                label: location?.city,
              }))
              : [],
          category:
            res?.categories?.length > 0
              ? {
                value: res?.categories?.[0]?.id,
                label: res?.categories?.[0]?.name,
              }
              : null,
          skills:
            res?.skills?.length > 0
              ? res?.skills?.map((skills: any) => ({
                value: skills?.id,
                label: skills?.name,
              }))
              : [],
          is_approved: res?.is_approved,
          // jobRole:
          //   res?.roles?.length > 0
          //     ? res?.roles?.map((role: any) => ({
          //         value: role?.id,
          //         label: role?.role_name,
          //       }))
          //     : [],
          jobRole:
            res?.roles?.length > 0
              ? {
                value: res?.roles?.[0]?.id,
                label: res?.roles?.[0]?.role_name,
              }
              : [],
          academicResponsibility:
            res?.additional_academic_responsibilities?.length > 0
              ? res.additional_academic_responsibilities.map((item: any) => ({
                value: item.id,
                label: item.responsibility_title,
              }))
              : [],
        });
        if (res?.job_image) {
          setState({
            newImages: [res?.job_image],
          });
        } else {
          setState({
            newImages: [],
          });
        }

        if (profileResponse?.role == ROLES.SUPER_ADMIN) {
          fetchColleges(res?.institution?.id, 1);
          fetchDepartments(res?.college?.id, 1);
        }
        fetchDepartments(res?.college?.id, 1);

        if (res.apply_link) {
          console.log("✌️ if  --->");
          setState({
            isCollegeEmail: false,
            alternativeEmail: "",
            applyLink: res.apply_link,
            applyType: {
              value: "external",
              label: "External",
            },
          });
        } else {
          console.log("✌️ else  --->");

          if (res?.user_collage_email) {
            setState({ isCollegeEmail: true, alternativeEmail: "" });
          } else {
            setState({
              isCollegeEmail: false,
              alternativeEmail: res?.alternative_email || "",
            });
          }
        }
        // Pre-fill SEO categories - all explicitly selected ids
        const allSelected = [
          ...(res?.master_category_ids || []).map((id: number) => ({ id, depth: 0 })),
          ...(res?.subcategory_ids || []).map((id: number) => ({ id, depth: 1 })),
          ...(res?.subcategory_child_ids || []).map((id: number) => ({ id, depth: 2 })),
        ];

        const seoPreFill = {
          parent_ids: res?.master_category_ids || [],
          child_ids: res?.subcategory_ids || [],
          sub_child_ids: res?.subcategory_child_ids || [],
        };

        setState({
          seoCategorySelected: allSelected,
          seoCategory: seoPreFill,
        });
        setState({ loading: false });
      }
    } catch (error) {
      console.log("Error fetching institutions:", error);
      setState({ loading: false });
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

  const seoCategoryList = async (page = 1, search = "", loadMore = false) => {
    try {
      setState({ catLoading: true });
      const body = {
        search,
      };
      const res: any = await Models.seo.list(1, body);
      console.log("seoCategoryList --->", res);

      const parent = res?.results?.map((item) => ({
        value: item?.id,
        label: capitalizeFLetter(item?.name),
      }));

      // const dropdown = Dropdown(res?.results, "name");
      setState({
        seoCategoryList: transformCategoryData(res?.results || []),
        rawSeoCategoryList: res?.results || [],
        parentSeoCategoryList: [
          // Parents
          ...res?.results?.map((item: any) => ({
            value: `parent_${item.id}`,
            label: capitalizeFLetter(item.name),
            type: "parent",
            id: item.id,
          })),
          // Subcategories (top-level only, no parent_id)
          ...(res?.results?.flatMap((item: any) =>
            (item.subcategories || [])
              .filter((s: any) => !s.parent_id)
              .map((s: any) => ({
                value: `sub_${s.id}`,
                label: `${capitalizeFLetter(item.name)} > ${capitalizeFLetter(s.name)}`,
                type: "subcategory",
                id: s.id,
                parent_id: item.id,
              }))
          ) || []),
        ],
        // ,
        //   catLoading: false,
        //   catPage: page,
        //   catNext: res?.next,
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
      const dropdown = res?.map((item: any) => ({
        value: item.id,
        label: item.responsibility_title,
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
        pagination: "No",
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
      const section3 = section3Ref.current?.getBoundingClientRect();
      const section4 = section4Ref.current?.getBoundingClientRect();
      const section5 = section5Ref.current?.getBoundingClientRect();
      const section6 = section6Ref.current?.getBoundingClientRect();


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

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: editorRef.current,
          data: state.editorData,
          placeholder: "Start typing your job description...",
          tools: {
            list: {
              class: require("@editorjs/list"),
              inlineToolbar: true,
            },
          },
        });
        setState({ editorInstance: editor });
      });
    }

    if (
      typeof window !== "undefined" &&
      qualificationEditorRef.current &&
      !isQualificationEditorInitialized.current &&
      !state.loading
    ) {
      isQualificationEditorInitialized.current = true;

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: qualificationEditorRef.current,
          data: state.qualificationData,
          placeholder: "List required qualifications...",
          tools: {
            list: {
              class: require("@editorjs/list"),
              inlineToolbar: true,
            },
          },
        });
        setState({ qualificationEditorInstance: editor });
      });
    }

    if (
      typeof window !== "undefined" &&
      keyResponsibilityEditorRef.current &&
      !isKeyResponsibilityEditorInitialized.current &&
      !state.loading
    ) {
      isKeyResponsibilityEditorInitialized.current = true;

      import("@editorjs/editorjs").then(({ default: EditorJS }) => {
        const editor = new EditorJS({
          holder: keyResponsibilityEditorRef.current,
          data: state.responsibilityData,
          placeholder: "List key responsibilities...",
          tools: {
            list: {
              class: require("@editorjs/list"),
              inlineToolbar: true,
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
              inlineToolbar: true,
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
  }, [state.loading]);

  const scrollToSection = (ref: any) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    setState({ btnLoading: true });
    const keyResponsibilityData =
      await state.keyResponsibilityEditorInstance?.save();
    const qualificationData = await state.qualificationEditorInstance?.save();

    try {
      const validation = {
        title: state.title,

        location: state.location,

        institution: state.institution,
        college: state.college,
        department: state.department,

        // salary: state.salary?.value,

        priority: state.priority?.value,
        deadline: state.deadline ? state.deadline : null,
        startDate: state.startDate ? state.startDate : null,
        endDate: state.endDate ? state.endDate : null,

        experience: state.experience?.value,
        qualification: qualificationData,
        // keyResponsibility: keyResponsibilityData,

        description: state.description,
        applyType: state.applyType?.value,
        isCollegeEmail: state.isCollegeEmail,
        immediateHiring: state.immediateHiring,
        alternativeEmail: state.alternativeEmail,
        applyLink: state.applyLink,
        jobRole: state.jobRole?.value,
        job_title: state.jobRole?.label,
      };
      console.log("✌️validation --->", validation);

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
        job_description: capitalizeFLetter(state.description),

        job_type_id: state.jobType?.value,
        experiences: state.experience?.value,
        new_job_qualification: qualificationData,
        salary_range_id: state.salary?.value,
        location_ids: state.location?.map((item) => item?.value),
        job_title: state.jobRole?.label,

        number_of_openings: Number(state.numberOfOpenings),
        last_date: state.endDate
          ? moment(state.endDate).format("YYYY-MM-DD")
          : null,
        // job_status_id: state.job_status?.value,
        deadline: state.deadline
          ? moment(state.deadline).format("YYYY-MM-DD")
          : null,
        start_date: state.startDate
          ? moment(state.startDate).format("YYYY-MM-DD")
          : null,
        responsibility: keyResponsibilityData,

        is_approved:
          state.is_approved ?? state.profile?.role == ROLES.HR ? true : false,
        priority_id: state.priority?.value,
        immediate_join: state.immediateHiring,
      };

      if (state.profile?.role == ROLES.SUPER_ADMIN) {
        body.institution = state.institution?.value;
        body.college = state.college?.value;
        // body.department = state.department?.value;
        body.department = state.department?.map((dept: any) => dept.value);
      } else if (state.profile?.role == ROLES.INSTITUTION_ADMIN) {
        body.institution = state.profile?.institution?.id;
        body.college = state.college?.value;
        // body.department = state.department?.value;
        body.department = state.department?.map((dept: any) => dept.value);
      } else if (state.profile?.role == ROLES.HR) {
        body.institution = state.profile?.institution?.id;
        body.college =
          state.profile?.college?.length > 0
            ? state.college?.value
            : state.profile?.college?.college_id;
        // body.department = state.department?.value;
        body.department = state.department?.map((dept: any) => dept.value);
      } else {
        body.institution = state.profile?.institution?.id;
        body.college = state.profile?.college?.college_id;
        body.department = state.profile?.department?.department_id;
      }
      if (state.newImages?.length > 0) {
        body.job_image = state.newImages?.[0];
      } else {
        body.job_image = null;
      }
      console.log("✌️body --->", body);

      if (state.applyType?.value == "internal") {
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

      if (state.category?.value) {
        body.category_ids = [state.category?.value];
      } else {
        body.category_ids = [];
      }

      // const seoCategory = state.seoCategory || {};
      body.master_category_ids = seoCategory.parent_ids || [];
      body.subcategory_ids = seoCategory.child_ids || [];
      body.subcategory_child_ids = seoCategory.sub_child_ids || [];

      if (state.jobRole?.value) {
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
      const formData: any = buildFormData(body);

      if (state.newImages?.length > 0) {
        formData.append("job_image", state.newImages?.[0]);
      } else {
        formData.append("job_image", null);
      }

      const res = await Models.job.update(formData, id);
      console.log("✌️res --->", res);

      setState({ error: {} });
      setState({ btnLoading: false });
      Success("Job updated successfully.");
      router.back();
    } catch (err: any) {
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

  const buildJobCanonicalUrl = (seoCategory: any, rawList: any[]): string => {
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    if (!seoCategory || !rawList?.length) return "";

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
        const body: any = {
          name: state.name,
          slug: state.slug,
          description: state.catDescription,
          title: state.catTitle,
          canonical_url: state.canonical_url,
        };
        const selected = state.parent_category;
        if (selected.depth === 0) {
          // Selected main category → new sub is direct child, category_id = selected.id
          body.category_id = selected.id;
        } else {
          // Selected a sub/child → parent_id = selected.id, category_id from its category_id
          body.parent_id = selected.id;
          body.category_id = selected.category_id;
        }
        res = await Models.seo.create_sub_category(body);
      } else {
        const body = { name: state.name, slug: state.slug, description: state.description, title: state.catTitle, canonical_url: state.canonical_url };
        res = await Models.seo.create_category(body);
      }

      // Refresh list and auto-select newly created item
      const listRes: any = await Models.seo.list(1, {});
      const updatedList = transformCategoryData(listRes?.results || []);
      const existingSelected = Array.isArray(state.seoCategorySelected) ? state.seoCategorySelected : [];
      const newDepth = state.parent_category ? (state.parent_category.depth ?? 0) + 1 : 0;
      const newSelected = res?.id ? { id: res.id, name: res.name, depth: newDepth } : null;
      setState({
        seoCategoryList: updatedList,
        rawSeoCategoryList: listRes?.results || [],
        seoCategorySelected: newSelected ? [...existingSelected, newSelected] : existingSelected,
        catLoading: false,
        isOpen: false,
        name: "",
        slug: "",
        description: "",
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
      description: "",
      catTitle: "",
      canonical_url: "",
      parent_category: null,
    });
  };

  const handleEdit = (item: { id: number; name: string; slug?: string; description?: string; title?: string; category_id?: number; depth: number; ancestors?: any[]; type?: string; parent_id?: number; child_id?: number }) => {
    let parent_category = null;
    if (item.ancestors?.length) {
      const label = item.ancestors.map((a: any) => a.name).join(" > ");
      const last = item.ancestors[item.ancestors.length - 1];
      // category_id of the last ancestor = main cat id (ancestors[0].id)
      parent_category = { id: last.id, label, type: `level${item.depth - 1}`, depth: item.depth - 1, category_id: item.ancestors[0]?.id };
    }
    setState({
      isOpen: true,
      editItem: item,
      name: item.name,
      slug: item.slug || "",
      description: item.description || "",
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
      const body: any = { name: state.name, slug: state.slug, description: state.description, title: state.catTitle, canonical_url: state.canonical_url };
      if (item?.depth === 0) {
        await Models.seo.update_parent_cat(body, item.id);
      } else {
        const selected = state.parent_category;
        const subBody: any = { ...body };
        if (selected) {
          // selected.depth=0 means main cat selected as parent → parent_id = selected.id, category_id = main cat id (selected itself is main cat)
          // selected.depth>0 means sub selected → parent_id = selected.id, category_id = selected.category_id (main cat)
          subBody.parent_id = selected.depth === 0 ? null : selected.id;
          subBody.category_id = selected.depth === 0 ? selected.id : selected.category_id;
        } else {
          // no change to parent, keep existing
          subBody.category_id = item?.ancestors?.[0]?.id || item?.category_id;
          subBody.parent_id = item?.depth > 1 ? item?.ancestors?.[item.ancestors.length - 1]?.id : null;
        }
        // remove null parent_id
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
        description: "",
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
        .ce-toolbar__actions {
          right: 0 !important;
        }
        .ce-inline-toolbar {
          z-index: 40 !important;
        }
      `}</style>
      {/* Header */}
      <div className=" z-10">
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-ti text-transparent">Update Job Posting</h1>
              <p className="mt-1 text-sm text-gray-500">Update a opportunity</p>
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
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${state.activeStep >= 1
                    ? "bg-dblue text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {state.activeStep > 1 ? "✓" : "1"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${state.activeStep >= 1 ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  Basic
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${state.activeStep >= 2 ? "bg-dblue" : "bg-gray-200"
                }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section2Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${state.activeStep >= 2
                    ? "bg-dblue text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {state.activeStep > 2 ? "✓" : "2"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${state.activeStep >= 2 ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  Details
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${state.activeStep >= 3 ? "bg-dblue" : "bg-gray-200"
                }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section3Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${state.activeStep >= 3
                    ? "bg-dblue text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {state.activeStep > 3 ? "✓" : "3"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${state.activeStep >= 3 ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  Description
                </p>
              </div>
            </div>
            <div
              className={`mx-2 h-1 flex-1 ${state.activeStep >= 4 ? "bg-dblue" : "bg-gray-200"
                }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section4Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${state.activeStep >= 4
                    ? "bg-dblue text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {state.activeStep > 4 ? "✓" : "4"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${state.activeStep >= 4 ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  Responsibility
                </p>
              </div>
            </div>

            <div
              className={`mx-2 h-1 flex-1 ${state.activeStep >= 5 ? "bg-dblue" : "bg-gray-200"
                }`}
            ></div>

            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => scrollToSection(section5Ref)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${state.activeStep >= 5
                    ? "bg-dblue text-white"
                    : "bg-gray-200 text-gray-600"
                  }`}
              >
                {state.activeStep > 5 ? "✓" : "5"}
              </div>
              <div className="ml-2 hidden lg:block">
                <p
                  className={`text-xs font-semibold ${state.activeStep >= 5 ? "text-gray-900" : "text-gray-500"
                    }`}
                >
                  SEO
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid  gap-2">
        <div className="">
          <div className=" py-4 ">
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
                  title="Select location"
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

                {state.profile?.role == ROLES.INSTITUTION_ADMIN && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.name}
                      onChange={(e) => { }}
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
                      onChange={(e) => { }}
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
                        onChange={(option) => {
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
                    ) : (
                      <TextInput
                        title="College"
                        placeholder="College"
                        value={state.profile?.college?.college_name}
                        onChange={(e) => { }}
                        disabled
                      />
                    )}
                    {/* <TextInput
                      title="College"
                      placeholder="College"
                      value={state.profile?.college?.college_name}
                      onChange={(e) => {}}
                      disabled
                    /> */}
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
                {state.profile?.role == ROLES.HOD && (
                  <>
                    <TextInput
                      title="Institution"
                      placeholder="Institution"
                      value={state.profile?.institution?.name}
                      onChange={(e) => { }}
                      disabled
                    />
                    <TextInput
                      title="College"
                      placeholder="College"
                      value={state?.college?.label}
                      onChange={(e) => { }}
                      disabled
                    />
                    <TextInput
                      title="Department"
                      placeholder="Department"
                      value={state.profile?.department?.department_name}
                      onChange={(e) => { }}
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
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                  min={state.startDate}
                />

                <CustomSelect
                  options={state.priorityList}
                  value={state.priority}
                  onChange={(option) => handleFieldChange("priority", option)}
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
                  options={state.experienceList}
                  value={state.experience}
                  onChange={(option) => handleFieldChange("experience", option)}
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
                  <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors">
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
                  onChange={(option) => {
                    handleFieldChange("applyType", option);
                    setState({ isCollegeEmail: true });
                  }}
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
          <div className="pt-4">
            <UpdatePropertyImagePreview
              existingImages={state.newImages}
              onImagesChange={(newImages) => setState({ newImages })}
              onDeleteImage={(imageUrl) => {
                setState({
                  newImages: state.newImages.filter((img) => img !== imageUrl),
                });
              }}
              maxFiles={1}
              title="Job Image"
              description="Upload job logo (JPEG or PNG)"
              validateDimensions={false}
              isSingleImage={true}
            />
          </div>
          <div className="py-4">

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
                <TextArea
                  name="description"
                  placeholder="Job descriptions..."
                  value={state.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  rows={10}
                />
              </div>
            </div>
          </div>


          {/* Card 4: Key Responsibility */}
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
              <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300 transition-colors">
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

          <div className="py-4">
            <div
              ref={section5Ref}
              className="scroll-mt-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="border-b px-6 py-4 gap-5 flex items-center">
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
                  className="cursor-pointer text-md font-bold  underline text-dblue"
                >
                  New Category
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-5">

                  <div className="w-full overflow-hidden">
                    <CategorySelector
                      key={`${state.seoCategoryList?.length}`}
                      categoryData={state.seoCategoryList}
                      value={state.seoCategorySelected}
                      onChange={(payload, rawSelected) => {
                        setState({ seoCategory: payload, seoCategorySelected: rawSelected, error: { ...state.error, seoCategory: undefined } });
                      }}
                      onEdit={handleEdit}
                      onDelete={delete_category}
                    />
                  </div>
                  {state.error?.seoCategory && (
                    <p className="mt-1 text-sm text-red-600">
                      {state.error.seoCategory}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Professional Skills
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
          </div> */}

          {/* Card 5: Skills */}
          {/* <div className="scroll-mt-32 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => router.back()}
              type="button"
              className="w-full rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-dblue w-full rounded-lg px-8 py-2 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-xl sm:w-auto"
              onClick={() => handleSubmit()}
              disabled={state.btnLoading}
            >
              {state.btnLoading ? (
                <IconLoader className="animate-spin" />
              ) : (
                " Update Job"
              )}
            </button>
          </div>
        </div>


      </div>

      <Modal
        closeIcon
        maxWidth="max-w-3xl"
        subTitle={state.editItem ? `Edit "${state.editItem.name}"` : "Add new category"}
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
                      value={state.name}
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
                      value={state.description}
                      onChange={(e) => {
                        setState({ description: e.target.value });
                      }}
                    />
                  </>
                </div>
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-end ">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCloseModal()}
                  className="rounded-lg border px-6 py-2"
                >
                  Cancel
                </button>
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
    </div>
  );
}
