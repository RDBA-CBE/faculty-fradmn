import moment from "moment";
import * as Yup from "yup";
import { PROPERTY_TYPE } from "./constant.utils";

export const login = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const signin = Yup.object().shape({
  password: Yup.string().required("Password is required"),
  user_type: Yup.string().required("Role is required"),
  phone: Yup.string().required("Phone Number is required"),
  email: Yup.string().required("Email is required"),
  last_name: Yup.string().required("Last name is required"),
  first_name: Yup.string().required("First name is required"),
});

export const user = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const CreateInstituion = Yup.object().shape({
  institution_name: Yup.string().required("Institution name is required"),
  institution_code: Yup.string().required("Institution code is required"),
  institution_email: Yup.string()
    .email("Please enter a valid email address")
    .required("Institution email is required"),
  institution_phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Institution phone is required"),
  address: Yup.string().required("Address is required"),
});

export const CreateCollege = Yup.object().shape({
  institution: Yup.number().required("Institution is required"),
  college_name: Yup.string().required("College name is required"),
  college_code: Yup.string().required("College code is required"),
  college_email: Yup.string()
    .email("Please enter a valid email address")
    .required("College email is required"),
  college_phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("College phone is required"),
  college_address: Yup.string().required("College address is required"),
});

export const CreateCollegeForm = Yup.object().shape({
  college_name: Yup.string().required("College name is required"),
  college_code: Yup.string().required("College code is required"),
  college_email: Yup.string()
    .email("Please enter a valid email address")
    .required("College email is required"),
  college_phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("College phone is required"),
  college_address: Yup.string().required("College address is required"),
});

export const CreateUser = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords must match")
    .required("Confirm password is required"),
  phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  role: Yup.string().required("Role is required"),
  gender: Yup.string().required("Gender is required"),
  education_qualification: Yup.string().required("Education qualification is required"),
  institution: Yup.number().when('role', {
    is: 'institution_admin',
    then: (schema) => schema.required("Institution is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  college: Yup.number().when('role', {
    is: 'hr',
    then: (schema) => schema.required("College is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  department: Yup.number().when('role', {
    is: 'hod',
    then: (schema) => schema.required("Department is required"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const CreateInstitutionAdmin = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
   
    password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], "Passwords must match")
    .required("Confirm password is required"),
  phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),
  education_qualification: Yup.string().required("Education qualification is required"),
});

export const CreateHR = Yup.object().shape({
  hr_username: Yup.string().required("Username is required"),
  hr_email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  hr_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  hr_password_confirm: Yup.string()
    .oneOf([Yup.ref('hr_password')], "Passwords must match")
    .required("Confirm password is required"),
  hr_phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  hr_gender: Yup.string().required("Gender is required"),
  hr_education_qualification: Yup.string().required("Education qualification is required"),
});

export const CreateHOD = Yup.object().shape({
  hod_username: Yup.string().required("Username is required"),
  hod_email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  hod_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  hod_confirm_password: Yup.string()
    .oneOf([Yup.ref('hod_password')], "Passwords must match")
    .required("Confirm password is required"),
  hod_phone: Yup.string()
    .matches(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number")
    .required("Phone number is required"),
  hod_gender: Yup.string().required("Gender is required"),
  hod_qualification: Yup.string().required("Qualification is required"),
});

export const CreateDepartment = Yup.object().shape({
  department_name: Yup.string().required("Department name is required"),
  department_code: Yup.string().required("Department code is required"),
});

export const CreateNewJob = Yup.object().shape({
  title: Yup.string().required("Job title is required"),
  company: Yup.string().required("Company name is required"),
  location: Yup.array()
    .min(1, "At least one location is required")
    .required("Location is required"),
  institution: Yup.object().nullable().required("Institution is required"),
  college: Yup.object().nullable().required("College is required"),
  department: Yup.object().nullable().required("Department is required"),
  jobType: Yup.string().required("Job type is required"),
  salary: Yup.string().required("Salary range is required"),
  category: Yup.array()
    .min(1, "At least one category is required")
    .required("Category is required"),
  priority: Yup.string().required("Priority is required"),
  deadline: Yup.string().required("Deadline is required"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required"),
  numberOfOpenings: Yup.number()
    .typeError("Must be a number")
    .positive("Must be a positive number")
    .required("Number of openings is required"),
  experience: Yup.string().required("Experience is required"),
  qualification: Yup.string().required("Qualification is required"),
  keyResponsibility: Yup.object()
    .test('has-blocks', 'Key responsibilities are required', (value: any) => {
      if (!value || !value.blocks || !Array.isArray(value.blocks) || value.blocks.length === 0) {
        return false;
      }
      return value.blocks.some((block: any) => {
        if (block.type === 'list' && block.data && block.data.items && Array.isArray(block.data.items)) {
          return block.data.items.some((item: string) => item && item.trim().length > 0);
        }
        if (block.data && block.data.text) {
          return block.data.text.trim().length > 0;
        }
        return false;
      });
    })
    .required("Key responsibilities are required"),
  skills: Yup.array()
    .min(1, "At least one skill is required")
    .required("Skills are required"),
  company_detail: Yup.string().required("Company detail is required"),
  job_status: Yup.string().required("Job status is required"),
  description: Yup.string().required("Job description is required"),
});