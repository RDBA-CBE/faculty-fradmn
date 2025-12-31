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
