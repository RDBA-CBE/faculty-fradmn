
export const CLIENT_ID =
  "625052261407-4p8ihs05c67d778mr5d91lqjvnvpkd8k.apps.googleusercontent.com";

// export const BACKEND_URL = "http://31.97.206.165/api/";

export const BACKEND_URL = "http://88.222.213.249/api/";

// menuConfig.ts
export const menuConfig = {
  super_admin: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "Institutions",
      href: "/faculty/institution",
    },
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "Colleges & Departments",
      href: "/faculty/college_and_department",
    },

    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "HR Management",
      href: "/",
    },
    
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "Job Postings",
      href: "/",
    },

    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "Applications",
      href: "/",
    },
    {
      type: "link",
      icon: "IconMenuCharts",
      label: "Reports",
      href: "/",

    },
  
    
  ],

  InstitutionAdmin: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/real-estate/project/list" },
            // { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/real-estate/property/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Catergories",
              href: "/real-estate/property/categories",
            },
            {
              type: "link",
              label: "Amenities",
              href: "/real-estate/property/amenities",
            },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/real-estate/property/myProperty",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Create",
        //   href: "/real-estate/users/create",
        // },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Assign Leads",
          href: "/real-estate/lead/assignLead",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
       

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Reports",
      children: [
        {
          type: "link",
          icon: "IconMenuCharts",
          label: "Reports",
          href: "/real-estate/report",
        },
      ],
    },
  ],

  Seller: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/real-estate/project/list" },
            // { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/real-estate/property/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Catergories",
              href: "/real-estate/property/categories",
            },
            {
              type: "link",
              label: "Amenities",
              href: "/real-estate/property/amenities",
            },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        // {
        //   type: "link",
        //   icon: "IconMenuNotes",
        //   label: "My Properties",
        //   href: "/real-estate/property/myProperty",
        // },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
    //     // {
    //     //   type: "link",
    //     //   icon: "IconMenuScrumboard",
    //     //   label: "Create",
    //     //   href: "/real-estate/users/create",
    //     // },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuForms",
        //   label: "Assign Leads",
        //   href: "/real-estate/lead/assignLead",
        // },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Leads",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuTables",
    //       label: "List",
    //       href: "/real-estate/lead/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuForms",
    //       label: "Assign Leads",
    //       href: "/real-estate/lead/assignLead",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create Leads",
    //       href: "/real-estate/lead/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Bookings",
    //       href: "/real-estate/inquiry/bookingList",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Reports",
      children: [
        {
          type: "link",
          icon: "IconMenuCharts",
          label: "Reports",
          href: "/real-estate/report",
        },
      ],
    },
  ],

  Developer: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/real-estate/project/list" },
            // { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/real-estate/property/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Catergories",
              href: "/real-estate/property/categories",
            },
            {
              type: "link",
              label: "Amenities",
              href: "/real-estate/property/amenities",
            },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/real-estate/property/myProperty",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create",
    //       href: "/real-estate/users/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Leads",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuTables",
    //       label: "List",
    //       href: "/real-estate/lead/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuForms",
    //       label: "Assign Leads",
    //       href: "/real-estate/lead/assignLead",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create Leads",
    //       href: "/real-estate/lead/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Bookings",
    //       href: "/real-estate/inquiry/bookingList",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Assign Leads",
          href: "/real-estate/lead/assignLead",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    {
      type: "section",
      label: "Reports",
      children: [
        {
          type: "link",
          icon: "IconMenuCharts",
          label: "Reports",
          href: "/real-estate/report",
        },
      ],
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
  {value: "off_market", label: "Off Market"},
  {value:"under_contract", label:"Under Contract"},
  {value:"pending", label:"pending"}
]

export const ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  BUYER: "buyer",
  DEVELOPER: "developer",
  AGENT: "agent",
  ALL: "All",
};

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
