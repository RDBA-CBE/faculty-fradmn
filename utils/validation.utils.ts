import moment from "moment";
import * as Yup from "yup";
import { PROPERTY_TYPE } from "./constant.utils";

export const sessionCreate = Yup.object().shape({
  lounge_type: Yup.string().required("Lounge type is required"),
  start_time: Yup.string().when("lounge_type", {
    is: (val) => String(val) != "15",
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

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

export const property_type = Yup.object().shape({
  listing_type: Yup.string().required("Offer Type is required").nullable(),
  property_type: Yup.string().required("Property Type is required").nullable(),
  title: Yup.string().required("Property Name is required").nullable(),
  city: Yup.string().required("City is required").nullable(),
  state: Yup.string().required("State is required").nullable(),
  country: Yup.string().required("Country is required").nullable(),
  postal_code: Yup.string().required("Zip Code is required").nullable(),
  status: Yup.string().required("Status is required").nullable(),

  total_area: Yup.string().required("Total Area is required").nullable(),
  // built_up_area: Yup.string()
  //   .nullable()
  //   .when("validatePropertyType", {
  //     is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
  //     then: (schema) => schema.required("Built-up Area is required"),
  //     otherwise: (schema) => schema.nullable(),
  //   }),

  longitude: Yup.string()
    .required("Longitude is required")
    .matches(
      /^-?\d{1,2}(\.\d+)?$/,
      "Longitude must have at most 2 digits before the decimal point"
    )
    .nullable(),

  latitude: Yup.string()
    .required("Latitude is required")
    .matches(
      /^-?\d{1,2}(\.\d+)?$/,
      "Latitude must have at most 2 digits before the decimal point"
    )
    .nullable(),

  address: Yup.string().required("Address is required").nullable(),
  // images: Yup.array()
  //   .required("Property image is required")
  //   .min(1, "At least one image is required")
  //   .max(7, "Maximum 7 images allowed"),

  amenities: Yup.array()
    .required("Amenities is required")
    .min(1, "At least one amenities is required"),
  description: Yup.string().required("Description is required").nullable(),
  project: Yup.string().required("Project is required").nullable(),
});

export const propertySaleCreate = Yup.object().shape({
  validatePropertyType: Yup.object().nullable(),
  title: Yup.string().required("Property Name is required").nullable(),
  description: Yup.string().required("Description is required").nullable(),
  listing_type: Yup.string().required("Property Type is required").nullable(),

  city: Yup.string().required("City is required").nullable(),
  state: Yup.string().required("State is required").nullable(),
  country: Yup.string().required("Country is required").nullable(),
  postal_code: Yup.string().required("Zip Code is required").nullable(),
  status: Yup.string().required("Status is required").nullable(),

  total_area: Yup.string().required("Total Area is required").nullable(),
  furnishing: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Furnishing is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  built_up_area: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Built-up Area is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  project: Yup.string().required("Project is required").nullable(),
  // price_per_sqft: Yup.string()
  //   .required("Price Per Sq.ft is required")
  //   .nullable(),
  min_price: Yup.string().required("Min Price is required").nullable(),
  max_price: Yup.string().required("Max Price is required").nullable(),

  longitude: Yup.string()
    .required("Longitude is required")
    .matches(
      /^-?\d{1,2}(\.\d+)?$/,
      "Longitude must have at most 2 digits before the decimal point"
    )
    .nullable(),

  latitude: Yup.string()
    .required("Latitude is required")
    .matches(
      /^-?\d{1,2}(\.\d+)?$/,
      "Latitude must have at most 2 digits before the decimal point"
    )
    .nullable(),

  address: Yup.string().required("Address is required").nullable(),
  images: Yup.array()
    .required("Property image is required")
    .min(1, "At least one image is required")
    .max(7, "Maximum 7 images allowed"),

  amenities: Yup.array()
    .required("Amenities is required")
    .min(1, "At least one amenities is required"),

  group: Yup.string().nullable(),
  developer: Yup.string()
    .nullable()
    .when("group", {
      is: (val) => ["Admin", "Agent", "Seller"].includes(val),
      then: (schema) => schema.required("Developer is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  assignAgent: Yup.boolean().nullable(),
  agent: Yup.string()
    .nullable()
    .when("assignAgent", {
      is: true,
      then: (schema) => schema.required("Agent is required"),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const propertyLeaseCreate = Yup.object().shape({
  validatePropertyType: Yup.object().nullable(),
  title: Yup.string().required("Property Name is required").nullable(),
  description: Yup.string().required("Description is required").nullable(),
  listing_type: Yup.string().required("Property Type is required").nullable(),
  city: Yup.string().required("City is required").nullable(),
  state: Yup.string().required("State is required").nullable(),
  country: Yup.string().required("Country is required").nullable(),
  postal_code: Yup.string().required("Zip Code is required").nullable(),
  total_area: Yup.string().required("Total Area is required").nullable(),
  status: Yup.string().required("Status is required").nullable(),
  furnishing: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Furnishing is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  built_up_area: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Built-up Area is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  project: Yup.string().required("Project is required").nullable(),
  // price_per_sqft: Yup.string()
  //   .required("Price Per Sq.ft is required")
  //   .nullable(),

  longitude: Yup.string().required("Longitude is required").nullable(),
  latitude: Yup.string().required("Latitude is required").nullable(),
  address: Yup.string().required("Address is required").nullable(),
  images: Yup.array()
    .required("Property image is required")
    .min(1, "At least one image is required")
    .max(7, "Maximum 7 images allowed"),

  amenities: Yup.array()
    .required("Amenities is required")
    .min(1, "At least one amenities is required"),
  min_price: Yup.string().required("Min Price is required").nullable(),
  max_price: Yup.string().required("Max Price is required").nullable(),
  lease_duration: Yup.string()
    .required("Lease Duration is required")
    .nullable(),
  group: Yup.string().nullable(),
  developer: Yup.string()
    .nullable()
    .when("group", {
      is: (val) => ["Admin", "Agent", "Seller"].includes(val),
      then: (schema) => schema.required("Developer is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  assignAgent: Yup.boolean().nullable(),
  agent: Yup.string()
    .nullable()
    .when("assignAgent", {
      is: true,
      then: (schema) => schema.required("Agent is required"),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const propertyRentCreate = Yup.object().shape({
  validatePropertyType: Yup.object().nullable(),
  title: Yup.string().required("Property Name is required").nullable(),
  description: Yup.string().required("Description is required").nullable(),
  listing_type: Yup.string().required("Property Type is required").nullable(),
  city: Yup.string().required("City is required").nullable(),
  state: Yup.string().required("State is required").nullable(),
  country: Yup.string().required("Country is required").nullable(),
  postal_code: Yup.string().required("Zip Code is required").nullable(),
  total_area: Yup.string().required("Total Area is required").nullable(),
  status: Yup.string().required("Status is required").nullable(),
  furnishing: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Furnishing is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  built_up_area: Yup.string()
    .nullable()
    .when("validatePropertyType", {
      is: (val) => val?.label !== PROPERTY_TYPE.AGRICULTURAL,
      then: (schema) => schema.required("Built-up Area is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  project: Yup.string().required("Project is required").nullable(),

  longitude: Yup.string().required("Longitude is required").nullable(),
  latitude: Yup.string().required("Latitude is required").nullable(),
  address: Yup.string().required("Address is required").nullable(),
  images: Yup.array()
    .required("Property image is required")
    .min(1, "At least one image is required")
    .max(7, "Maximum 7 images allowed"),

  amenities: Yup.array()
    .required("Amenities is required")
    .min(1, "At least one amenities is required"),
  min_price: Yup.string().required("Min Price is required").nullable(),
  max_price: Yup.string().required("Max Price is required").nullable(),
  rent_duration: Yup.string().required("Rent duration is required").nullable(),
  group: Yup.string().nullable(),
  developer: Yup.string()
    .nullable()
    .when("group", {
      is: (val) => ["Admin", "Agent", "Seller"].includes(val),
      then: (schema) => schema.required("Developer is required"),
      otherwise: (schema) => schema.nullable(),
    }),
  assignAgent: Yup.boolean().nullable(),
  agent: Yup.string()
    .nullable()
    .when("assignAgent", {
      is: true,
      then: (schema) => schema.required("Agent is required"),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const category = Yup.object().shape({
  name: Yup.string().required("Category Name is required"),
});

export const project = Yup.object().shape({
  name: Yup.string().required("Project Name is required"),
  location: Yup.string().required("Location is required"),
});

export const amenity = Yup.object().shape({
  name: Yup.string().required("Amenity Name is required"),
});

export const user = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const lead = Yup.object().shape({
  first_name: Yup.string().required("First Name is required"),

  last_name: Yup.string().required("Last Name is required"),
  phone: Yup.string()
    .required("Phone Number is required")
    .test("is-valid-phone", "Enter a valid phone number", (value) => {
      // Allow both formats: 10 digits OR 91 followed by 10 digits
      return /^(91)?[0-9]{10}$/.test(value);
    }),

  email: Yup.string()
    .required("Email is required")
    .email("Enter a valid email"),

  interested_property: Yup.string().required("Please select a property"),

  lead_source: Yup.string().required("Lead Source is required"),

  next_follow_up: Yup.string().required("Next Follow Up Date is required"),

  status: Yup.string().required("Status is required"),

  requirements: Yup.string().required("Inquiry Details are required"),
  assigned_to: Yup.string().required("Assigned to are required"),
});
