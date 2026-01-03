import moment from "moment";
import * as Yup from "yup";
import { PROPERTY_TYPE } from "./constant.utils";

export const login = Yup.object().shape({
  username: Yup.string().required("Username is required"),
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
    .min(6, "Password must be at least 6 characters")
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

export const CreateJob = Yup.object().shape({
  job_title: Yup.string().required("Job title is required"),
  job_description: Yup.string().required("Job description is required"),
  college: Yup.number().required("Please select a college"),
  department: Yup.number().required("Please select a department"),
  job_type: Yup.string().required("Please select job type"),
  experience_required: Yup.string().required("Please select experience required"),
  qualification: Yup.string().required("Qualification is required"),
  salary_range: Yup.string().required("Salary range is required"),
  last_date: Yup.date().required("Last date is required"),
  priority: Yup.string().required("Please select priority"),
});
