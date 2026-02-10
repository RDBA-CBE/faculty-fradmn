export const CLIENT_ID =
  "625052261407-4p8ihs05c67d778mr5d91lqjvnvpkd8k.apps.googleusercontent.com";

// export const BACKEND_URL = "http://31.97.206.165/api/";

// export const BACKEND_URL = "http://88.222.213.249/api/";
export const BACKEND_URL = "https://user-service.88.222.213.249.nip.io/api/";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  INSTITUTION_ADMIN: "institution_admin",
  HR: "hr",
  HOD: "hod",
  APPLICANT: "applicant",
};

// menuConfig.ts
export const menuConfig = {
  super_admin: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

  
    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Colleges & Departments",
      href: "/faculty/admin_college_and_departments",
    },

    // {
    //   type: "link",
    //   icon: "IconMenuUsers",
    //   label: "Users",
    //   href: "/faculty/users",
    // },

    // {
    //   type: "link",
    //   icon: "IconMenuScrumboard",
    //   label: "HOD Management",
    //   href: "/faculty/hod_management",
    // },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],

  institution_admin: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Colleges & Departments",
      href: "/faculty/institute_college_and_departments",
    },

    // {
    //   type: "link",
    //   icon: "IconMenuUsers",
    //   label: "Users",
    //   href: "/faculty/my_users",
    // },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],

  hr: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Departments",
      href: "/faculty/departments",
    },

    // {
    //   type: "link",
    //   icon: "IconMenuUsers",
    //   label: "Users",
    //   href: "/faculty/users",
    // },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],
  hod: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    // {
    //   type: "link",
    //   icon: "IconMenuNotes",
    //   label: "Departments",
    //   href: "/faculty/departments",
    // },

    // {
    //   type: "link",
    //   icon: "IconMenuUsers",
    //   label: "Users",
    //   href: "/faculty/users",
    // },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ]

 
};

export const OwnmenuConfig = {
  super_admin: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuApps",
      label: "Institutions",
      href: "/faculty/my_institution",
    },
    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Colleges & Departments",
      href: "/faculty/admin_college_and_department",
    },

    {
      type: "link",
      icon: "IconMenuUsers",
      label: "Users",
      href: "/faculty/my_users",
    },

    // {
    //   type: "link",
    //   icon: "IconMenuScrumboard",
    //   label: "HOD Management",
    //   href: "/faculty/hod_management",
    // },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/my_job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/my_application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],

  institution_admin: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Colleges & Departments",
      href: "/faculty/institute_college_and_department",
    },
    {
      type: "link",
      icon: "IconMenuUsers",
      label: "Users",
      href: "/faculty/my_users",
    },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/my_job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/my_application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],

  hr: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuNotes",
      label: "Departments",
      href: "/faculty/my_department",
    },
    {
      type: "link",
      icon: "IconMenuUsers",
      label: "Users",
      href: "/faculty/my_users",
    },
  
    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/my_job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/my_application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],

  hod: [
    {
      type: "link",
      icon: "IconMenuDashboard",
      label: "dashboard",
      href: "/",
    },
    //   {
    //   type: "link",
    //   icon: "IconMenuNotes",
    //   label: "Departments",
    //   href: "/faculty/hr_department",
    // },
    {
      type: "link",
      icon: "IconMenuUsers",
      label: "Users",
      href: "/faculty/my_users",
    },

    {
      type: "link",
      icon: "IconMenuForms",
      label: "Job Postings",
      href: "/faculty/my_job",
    },

    {
      type: "link",
      icon: "IconMenuTables",
      label: "Applications",
      href: "/faculty/application",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",
    },
  ],
};

export const propertyType = [
  { value: 1, label: "Sale" },
  { value: 2, label: "Rent" },
  { value: 3, label: "Lease" },

  { value: 4, label: "Plot" },
];

export const FURNISHING_TYPE = [
  { value: "furnished", label: "Furnished" },
  {
    value: "semi_furnished",
    label: "Semi-Furnished",
  },
  { value: "unfurnished", label: "Unfurnished" },
];

export const ListType = [
  { value: "sale", label: "Sale" },
  { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
];

export const commemrcialType = [
  { value: 1, label: "Buy" },
  { value: 2, label: "Lease" },
];

export const facingDirection = [
  { value: 1, label: "North" },
  { value: 2, label: "East" },
  { value: 3, label: "West" },
  { value: 4, label: "South" },
  { value: 5, label: "North-East" },
  { value: 6, label: "South-East" },
  { value: 7, label: "South-West" },
  { value: 8, label: "North-West" },
  { value: 9, label: "East-Facing Corner" },
  { value: 10, label: "West-Facing Corner" },
];

export const Furnishing = [
  { value: 1, label: "Furnished" },
  {
    value: 2,
    label: "Semi-Furnished",
  },
  { value: 3, label: "Unfurnished" },
];

export const FLOORPLANS_CATEGORY = [
  { value: "plots", label: "Plots" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "4bhk", label: "4 BHK" },
];

export const Property_status = [
  { value: "available", label: "Available" },
  {
    value: "sold",
    label: "Sold",
  },
  { value: "rented", label: "Rented" },
  { value: "off_market", label: "Off Market" },
  { value: "under_contract", label: "Under Contract" },
  { value: "pending", label: "pending" },
];

export const PROPERTY_TYPE = {
  COMMERCIAL: "Commercial",
  RESIDENTIAL: "Residential",
  INDUSTRY: "Industry",
  AGRICULTURAL: "Agricultural",
};

export const LISTING_TYPE = {
  SALE: "Sale",
  RENT: "Rent",
  LEASE: "Lease",
};

export const LISTING_TYPE_LIST = {
  LEASE: "lease",
  SALE: "sale",
  RENT: "rent",
};

export const roleList = [
  {
    value: "developer",
    label: "Developer",
  },
  {
    value: "agent",
    label: "Agent",
  },
  {
    value: "seller",
    label: "Seller",
  },
  {
    value: "buyer",
    label: "Buyer",
  },
];

export const PROPERTY_IMG = [
  "https://www.pexels.com/photo/sun-piercing-of-brown-concrete-house-near-sea-1732414/",
  "https://www.pexels.com/photo/high-angle-photography-of-village-280221/",
  "https://www.pexels.com/photo/white-and-gray-wooden-house-near-grass-field-and-trees-280222/",
  "https://www.pexels.com/photo/lighted-beige-house-1396132/",
];

export const LEAD_SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "advertisement", label: "Advertisement" },
  { value: "cold_call", label: "Cold Call" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "walk_in", label: "Walk In" },
  // { value: "other", label: "Other" }
];

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const FILTER_ROLES = [
  {
    value: "developer",
    label: "Developer",
  },
  {
    value: "agent",
    label: "Agent",
  },
  {
    value: "seller",
    label: "Seller",
  },
];

export const GENDER_OPTION = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE = [
  { value: "fresher", label: "Fresher" },
  { value: "0 – 1 Year", label: "0 – 1 Year" },
  { value: "1 – 3 Years", label: "1 – 3 Years" },
  { value: "3 – 5 Years", label: "3 – 5 Years" },
  { value: "5 – 10 Years", label: "5 – 10 Years" },
  { value: "10+ Years", label: "10+ Years" },
];

export const JOB_TYPE = [
  { value: "Full Time", label: "Full Time" },
  { value: "Part Time", label: "Part Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];
