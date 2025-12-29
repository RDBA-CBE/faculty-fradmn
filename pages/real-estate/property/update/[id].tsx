"use client";

import {
  MapPin,
  Info,
  Home,
  Star,
  Phone,
  File,
  Trash2,
  ChevronDown,
  Camera,
  Plus,
} from "lucide-react";
import TextInput from "@/components/FormFields/TextInput.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import {
  buildFormData,
  convertUrlToFile,
  Dropdown,
  Failure,
  formatNumber,
  getDropdownObject,
  StringDropdown,
  Success,
  urlToFile,
  useSetState,
} from "@/utils/function.utils";
import {
  facingDirection,
  FLOORPLANS_CATEGORY,
  FURNISHING_TYPE,
  LISTING_TYPE,
  LISTING_TYPE_LIST,
  ListType,
  PROPERTY_IMG,
  Property_status,
  PROPERTY_TYPE,
  propertyType,
  ROLES,
} from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import NumberInput from "@/components/FormFields/NumberInputs.component";
import { useEffect } from "react";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import { useRouter, useSearchParams } from "next/navigation";
import Models from "@/imports/models.import";
import Modal from "@/components/modal/modal.component";
import IconLoader from "@/components/Icon/IconLoader";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import VideoUpload from "@/components/videoUpload/videoUpload.compoent";
import PrivateRouter from "@/hook/privateRouter";
import UpdatePropertyImagePreview from "@/components/ImageUploadWithPreview/UpdatePropertyImagePreview.component";
import { isString } from "lodash";

const AddPropertyPage = () => {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [state, setState] = useSetState({
    propertyTypeList: propertyType,
    group: null,
    btnLoading: false,
    isOpenAmenit: false,
    amenityLoading: false,
    plot: true,
    categoryList: [],
    developerList: [],
    projectList: [],
    categoryPage: 1,
    categoryNext: null,
    status: null,
    //Form
    property_type: null,
    property_name: "",
    description: "",
    virtual_tour: "",
    virtual_tourList: [],
    //Buy,
    built_up_area: null,
    carpet_area: null,
    bedroom: null,
    bathroom: null,
    balconie: null,
    floor_no: null,
    total_floor: null,
    build_year: null,
    facing_direction: null,
    furnishing_type: null,
    price: null,

    //Media
    images: [],
    video: null,
    latitude: null,
    longitude: null,
    country: null,
    state: null,
    city: null,
    postal_code: null,
    amenities: [],
    project: null,
    developer: null,
    isAssignAgent: false,
    agent: null,
    //Lease
    lease_price: null,
    lease_duration: null,
    //Rent
    monthly_rent: null,
    rent_duration: null,
    hasNext: false,
    currentPageAamenities: 1,
    newImages: [],
    existingImages: [],
    imageList: [],
    videoLoading: false,
    floorPlans: [
      {
        id: null,
        category: null,
        squareFeet: "",
        price: "",
        reraId: "",
        floorNo: "",
        image: null,
      },
    ],
    deleteFloorPlan: null,
  });

  useEffect(() => {
    const group = localStorage.getItem("group") || "";

    setState({ group: group });
  }, [state.group]);

  useEffect(() => {
    if (id) {
      propertyDetails();
      imageList();
    }
  }, [id]);

  useEffect(() => {
    propertyDetails();
    // amenityList(1);
    categoryList(1);
    projectList(1);
    developerList(1);
    agentList(1);
  }, []);

  const propertyDetails = async () => {
    try {
      const res: any = await Models.property.details(id);

      const amenity: any = await Models.amenity.list(1, {});
      const dropdown = Dropdown(amenity, "name");
      setState({
        amenityList: dropdown,
        hasNext: amenity?.next,
        currentPageAamenities: 2,
      });

      if (res?.amenities?.length > 0) {
        const existingAmenities = Dropdown(res?.amenities, "name");
        setState({
          amenities: existingAmenities?.map((item) => item?.value),
        });
      }
      setState({
        title: res?.title,
        description: res?.description,
        // total_area: formatNumber(res?.total_area),
        // built_up_area: formatNumber(res?.built_up_area),
        bedrooms: res?.bedrooms,
        bathrooms: res?.bathrooms,
        balconies: res?.balconies,
        floor_number: res?.floor_number,
        total_floors: res?.total_floors,
        built_year: res?.built_year,
        address: res?.address,
        city: res?.city,
        state: res?.state,
        country: res?.country,
        postal_code: res?.postal_code,

        ...(res?.total_area && { total_area: formatNumber(res.total_area) }),
        ...(res?.built_up_area && {
          built_up_area: formatNumber(res.built_up_area),
        }),
        ...(res?.longitude && { longitude: formatNumber(res.longitude) }),
        ...(res?.latitude && { latitude: formatNumber(res.latitude) }),
        ...(res?.monthly_rent && {
          monthly_rent: formatNumber(res.monthly_rent),
        }),
        ...(res?.rent_duration && {
          rent_duration: formatNumber(res.rent_duration),
        }),
        ...(res?.lease_total_amount && {
          lease_total_amount: formatNumber(res.lease_total_amount),
        }),
        ...(res?.lease_duration && {
          lease_duration: formatNumber(res.lease_duration),
        }),
      });

      if (res?.property_type) {
        setState({
          property_type: {
            value: res?.property_type?.id,
            label: res?.property_type?.name,
          },
        });
      }

      if (res?.price_range && res?.price_range?.minimum_price) {
        setState({
          min_price: formatNumber(res?.price_range?.minimum_price),
          max_price: formatNumber(res?.price_range?.maximum_price),
        });
      }

      if (res?.status) {
        const statusObj = getDropdownObject(res?.status, Property_status);
        setState({
          status: statusObj,
        });
      }

      if (res?.project) {
        setState({
          project: {
            value: res?.project?.id,
            label: res?.project?.name,
          },
        });
      }

      if (res?.developer) {
        setState({
          developer: {
            value: res?.developer?.id,
            label: `${res?.developer?.first_name} ${res?.developer?.last_name}`,
          },
        });
      }
      if (res?.agent) {
        setState({
          agent: {
            value: res?.agent?.id,
            label: `${res?.agent?.first_name} ${res?.agent?.last_name}`,
          },
          assignAgent: true,
        });
      }

      if (res?.listing_type) {
        setState({
          listing_type: StringDropdown(res?.listing_type),
        });
      }
      if (res?.furnishing) {
        const furnishingObj = getDropdownObject(
          res?.furnishing,
          FURNISHING_TYPE
        );
        setState({
          furnishing: furnishingObj,
        });
      }

      if (res?.listing_type == LISTING_TYPE_LIST.SALE) {
        setState({
          price: formatNumber(res?.price),
          // price_per_sqft: formatNumber(res?.price_per_sqft),
        });
      }

      if (res?.virtual_tours?.length > 0) {
        const id = res?.virtual_tours[0].id;
        setState({
          virtual_tourList: res.virtual_tours,
          // virtual_tour: res.virtual_tours[0]
        });
        getVirtualTour(id);
      } else {
        setState({
          virtual_tourList: [],
        });
      }

      if (res?.videos?.length > 0) {
        setState({
          existingVideo: res?.videos?.[0],
        });
      }

      if (res?.floor_plans?.length > 0) {
        const floorPlansData = res.floor_plans.map((plan) => ({
          id: plan?.id,
          category: getDropdownObject(plan?.category, FLOORPLANS_CATEGORY),
          squareFeet: plan?.square_feet,
          price: plan?.price,
          reraId: plan?.rera_id, // Fixed: changed from reraId to rera_id
          floor_no: plan?.floorNo,
          image: plan?.image,
        }));

        setState({
          floorPlans: floorPlansData,
        });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const agentList = async (page) => {
    try {
      const body = {
        user_type: ROLES.AGENT,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        agentList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const amenityList = async (page) => {
    try {
      const res: any = await Models.amenity.list(page, {});
      const dropdown = Dropdown(res, "name");
      setState({
        amenityList: dropdown,
        hasNext: res?.next,
        currentPageAamenities: page + 1,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const imageList = async () => {
    try {
      const body = {
        property: id,
      };
      const res: any = await Models.image.list(1, body);
      setState({
        imageList: res?.results,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const getVirtualTour = async (vr_id) => {
    try {
      const res: any = await Models.virtualTour.details(vr_id);
      console.log("virtual tour res", res);

      setState({
        virtual_tour: res?.tour_url,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const categoryList = async (page) => {
    try {
      const res: any = await Models.category.list(page, {});

      const droprdown = Dropdown(res?.results, "name");

      setState({
        categoryList: droprdown,
        categoryPage: page,
        categoryNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const projectList = async (page) => {
    try {
      const res: any = await Models.project.list(page, {});

      const droprdown = Dropdown(res?.results, "name");

      setState({
        projectList: droprdown,
        projectPage: page,
        projectNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const developerList = async (page) => {
    try {
      const body = {
        group: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        developerList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const catListLoadMore = async () => {
    try {
      if (state.categoryNext) {
        const res: any = await Models.category.list(state.categoryPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          categoryList: [...state.categoryList, ...newOptions],
          categoryNext: res.next,
          categoryPage: state.categoryPage + 1,
        });
      } else {
        setState({
          categoryList: state.categoryList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const projectLoadMore = async () => {
    try {
      if (state.projectNext) {
        const res: any = await Models.project.list(state.projectPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          projectList: [...state.projectList, ...newOptions],
          projectNext: res.next,
          projectPage: state.projectPage + 1,
        });
      } else {
        setState({
          projectList: state.projectList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const createAmenity = async () => {
    try {
      setState({ amenityLoading: true });

      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.amenity.validate(body, { abortEarly: false });

      const res: any = await Models.amenity.create(body);
      console.log("createAmenity --->", res);

      // state.amenities

      setState({
        amenities: [...state.amenities, res?.id],
        isOpenAmenit: false,
        name: "",
        description: "",
        amenityLoading: false,
      });
      amenityList(state.currentPageAamenities);
      Success("Amenity created succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, amenityLoading: false });
      } else {
        if (Array.isArray(error.name)) {
          if (error.name.length > 0) {
            Failure(error.name?.[0]);
          }
        } else {
          Failure(error?.error);
        }
        setState({ amenityLoading: false });
      }
    }
  };

  const onSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        property_type: state.property_type?.value,
        listing_type: state.listing_type?.value,
        title: state.title,
        description: state.description,
        status: state.status?.value,
        total_area: state.total_area,
        // built_up_area: state.built_up_area,
        longitude: state.longitude,
        latitude: state.latitude,
        address: state.address,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.imageList,
        amenities: state.amenities,
        project: state.project?.value,
      };

      await Utils.Validation.property_type.validate(body, {
        abortEarly: false,
      });

      if (state.listing_type?.label == LISTING_TYPE.SALE) {
        createSaleProperty();
      } else if (state.listing_type?.label == LISTING_TYPE.LEASE) {
        createLeaseProperty();
      } else if (state.listing_type?.label == LISTING_TYPE.RENT) {
        createRentProperty();
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);
        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };



  const createSaleProperty = async () => {
    try {
      const saleBody: any = {
        group: state.group,
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,
        listing_type: "sale",

        project: state.project?.value,
        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.imageList,
        longitude: state.longitude,
        latitude: state.latitude,
        address: state.address,
        status: state.status?.value,
        validatePropertyType: state.property_type,
        min_price: state.min_price,
        max_price: state.max_price,
        // price: state.max_price,
      };

      if (state.group !== "Developer") {
        saleBody.developer = state.developer?.value;
      }

      if (state.group !== "Agent") {
        saleBody.assignAgent = state.assignAgent;
        saleBody.agent = state.agent?.value;
      }

      
      

      await Utils.Validation.propertySaleCreate.validate(saleBody, {
        abortEarly: false,
      });
      delete saleBody.images;
      delete saleBody.validatePropertyType;
      delete saleBody.assignAgent;
      delete saleBody.group;
      saleBody.minimum_price = state.min_price;
      saleBody.maximum_price = state.max_price;

      const formData = buildFormData(saleBody);

      const res: any = await Models.property.update(formData, id);

      // if (state.newImages?.length > 0) {
      //   state.newImages?.map((item, index) =>
      //     createImage(id, item, imageLength + index + 1)
      //   );
      // }
      

      if (state.virtual_tour) {
        if (state.virtual_tourList?.length > 0) {
          const vr_id = state.virtual_tourList?.[0]?.id;

          updateVirtualTour(vr_id);
        }

        if (state.virtual_tourList?.length == 0) {
          createVirtualTour(id);
        }
      } else {
        const vr_id = state.virtual_tourList?.[0]?.id;
        deleteVirtualTour(vr_id);
      }

      if (state.floorPlans.length > 0) {
       
        state.floorPlans?.forEach((item, index) => {
          if (item.id) {
            patchFloorPlans(item.id, item, index);
          } else {
            createFloorPlans(id, item, index);
          }
        });
      }

      if (state.deleteFloorPlan) {
        deleteFloorPlans();
      }

      Success("Property Updated Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {

      
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        Failure("Please Fill all the required fields");
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        if (error && typeof error === "object") {
          console.log(error);

          const errorMessages = Object.entries(error)
            .map(([field, messages]: any) => `${field}: ${messages.join(", ")}`)
            .join("; ");

          Failure(errorMessages || error);
        } else {
          Failure(error || "Something went wrong");
        }
        setState({ btnLoading: false });
      }
    }
  };

  const createLeaseProperty = async () => {
    try {
      // setState({ btnLoading: true });

      const buyBody: any = {
        group: state.group,
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,

        listing_type: "lease",
        lease_total_amount: state.lease_total_amount,
        lease_duration: state.lease_duration,

        project: state.project?.value,

        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.imageList,
        longitude: state.longitude,
        latitude: state.latitude,
        address: state.address,
        status: state.status?.value,
        validatePropertyType: state.property_type,
        min_price: state.min_price,
        max_price: state.max_price,
        // price: state.max_price,
      };

      if (state.group !== "Developer") {
        buyBody.developer = state.developer?.value;
      }

      if (state.group !== "Agent") {
        buyBody.assignAgent = state.assignAgent;
        buyBody.agent = state.agent?.value;
      }

      await Utils.Validation.propertyLeaseCreate.validate(buyBody, {
        abortEarly: false,
      });
      delete buyBody.images;
      delete buyBody.validatePropertyType;
      delete buyBody.assignAgent;
      delete buyBody.group;
      buyBody.minimum_price = state.min_price;
      buyBody.maximum_price = state.max_price;

      console.log("✌️buyBody --->", buyBody);

      const formData = buildFormData(buyBody);

      const res: any = await Models.property.update(formData, id);

      if (state.virtual_tour) {
        if (state.virtual_tourList?.length > 0) {
          const vr_id = state.virtual_tourList?.[0]?.id;

          updateVirtualTour(vr_id);
        }

        if (state.virtual_tourList?.length == 0) {
          createVirtualTour(id);
        }
      } else {
        const vr_id = state.virtual_tourList?.[0]?.id;
        deleteVirtualTour(vr_id);
      }

      if (state.floorPlans?.length > 0) {
        
        state.floorPlans?.forEach((item, index) => {
          if (item.id) {
            patchFloorPlans(item.id, item, index);
          } else {
            createFloorPlans(id, item, index);
          }
        });
      }

      if (state.deleteFloorPlan) {
        deleteFloorPlans();
      }

      Success("Property Updated Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        Failure("Please Fill all the required fields");
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        if (error && typeof error === "object") {
          console.log(error);

          const errorMessages = Object.entries(error)
            .map(([field, messages]: any) => `${field}: ${messages.join(", ")}`)
            .join("; ");

          Failure(errorMessages);
        } else {
          Failure(error || "Something went wrong");
        }
        setState({ btnLoading: false });
      }
    }
  };

  const createRentProperty = async () => {
    try {
      // setState({ btnLoading: true });

      const buyBody: any = {
        group: state.group,
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,
        listing_type: "rent",
        project: state.project?.value,

        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.imageList,
        longitude: state.longitude,
        latitude: state.latitude,
        address: state.address,
        monthly_rent: state.monthly_rent,
        rent_duration: state.rent_duration,
        status: state.status?.value,
        validatePropertyType: state.property_type,
        min_price: state.min_price,
        max_price: state.max_price,
        // price: state.max_price,
      };

      if (state.group !== "Developer") {
        buyBody.developer = state.developer?.value;
      }

      if (state.group !== "Agent") {
        buyBody.assignAgent = state.assignAgent;
        buyBody.agent = state.agent?.value;
      }

      await Utils.Validation.propertyRentCreate.validate(buyBody, {
        abortEarly: false,
      });
      delete buyBody.images;
      delete buyBody.assignAgent;
      delete buyBody.validatePropertyType;
      delete buyBody.group;
      buyBody.minimum_price = state.min_price;
      buyBody.maximum_price = state.max_price;
      console.log("✌️buyBody --->", buyBody);

      const formData = buildFormData(buyBody);

      const res: any = await Models.property.update(formData, id);

      if (state.virtual_tour) {
        if (state.virtual_tourList?.length > 0) {
          const vr_id = state.virtual_tourList?.[0].id;

          updateVirtualTour(vr_id);
        }

        if (state.virtual_tourList?.length == 0) {
          createVirtualTour(id);
        }
      } else {
        const vr_id = state.virtual_tourList?.[0].id;
        deleteVirtualTour(vr_id);
      }

      if (state.floorPlans?.length > 0) {
       
        state.floorPlans?.forEach((item, index) => {
          if (item.id) {
            patchFloorPlans(item.id, item, index);
          } else {
            createFloorPlans(id, item, index);
          }
        });
      }

      if (state.deleteFloorPlan) {
        deleteFloorPlans();
      }

      Success("Property Updated Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        Failure("Please Fill all the required fields");
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        if (error && typeof error === "object") {
          console.log(error);

          const errorMessages = Object.entries(error)
            .map(([field, messages]: any) => `${field}: ${messages.join(", ")}`)
            .join("; ");

          Failure(errorMessages);
        } else {
          Failure(error || "Something went wrong");
        }
        setState({ btnLoading: false });
      }
    }
  };

 

  const createImage = async (
    propertyId: number,
    imageFile: File,
    order: number
  ) => {
    try {
      const body = {
        property: propertyId,
        image: imageFile,
        order: order,
      };
      const formData = buildFormData(body);

      await Models.image.create(formData);
      await imageList();
    } catch (error) {
      console.log("✌️error --->", error);
      throw error; // Re-throw to handle in component
    }
  };

  const deleteImage = async (imageId: number) => {
    try {
      await Models.image.delete(imageId);
      await imageList();
    } catch (error) {
      console.log("✌️error --->", error);
      throw error;
    }
  };

  const updateImageOrders = async (images: any) => {
    try {
      await Promise.all(
        images.map(async (item) => {
          const body = {
            order: item.order,
          };
          await Models.image.update(item.id, body);
        })
      );
      await imageList();
    } catch (error) {
      console.log("✌️error --->", error);
      throw error;
    }
  };

  const handleVideoChange = async (videoFile: any) => {
    if (!videoFile) return;
    try {
      setState({ videoLoading: true });

      if (state.existingVideo) {
        await Models.video.delete(state.existingVideo?.id);
      }
      const formData = new FormData();
      formData.append("property", id);
      formData.append("video", videoFile);

      const response = await Models.video.create(formData);
      setState({ existingVideo: response, videoLoading: true });
    } catch (error) {
    } finally {
      setState({ videoLoading: false });
    }
  };

  const handleVideoRemove = async () => {
    try {
      setState({ videoLoading: true });

      await Models.video.delete(state.existingVideo?.id);
      setState({ existingVideo: null });
      setState({ videoLoading: false });
    } catch (error) {
      console.error("Error removing video:", error);
      throw error;
    } finally {
      setState({ videoLoading: false });
    }
  };

  const updateVirtualTour = async (vr_id) => {
    try {
      const body = {
        tour_url: state.virtual_tour,
      };

      const res = await Models.virtualTour.update(body, vr_id);
      console.log("virtual tour update", res);
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createVirtualTour = async (property) => {
    try {
      const body = {
        property: property,
        tour_url: state.virtual_tour,
      };

      const res = await Models.virtualTour.create(body);
     
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const deleteVirtualTour = async (vr_id) => {
    try {
      const res = await Models.virtualTour.delete(vr_id);
      
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const patchFloorPlans = async (property, plan, index) => {
    // console.log("property,", property);
    // console.log("plan,", plan);

    try {

      const body = {
        property: property,
        category: plan.category?.value,
        square_feet: plan.squareFeet,
        price: plan.price,
        rera_id: plan.reraId,
        floor_no: plan.floorNo,
        ...(!isString(plan.image) && { image: plan.image }),
      };

      const formData = buildFormData(body);
      const res = await Models.floorPlans.update(formData, property);
      console.log("res", res);
    } catch (error) {
    
      console.log("✌️error --->", error);
    }
  };

  const createFloorPlans = async (property, plan, index) => {
    try {
      const body = {
        property: property,
        category: plan.category?.value,
        square_feet: plan.squareFeet,
        price: plan.price,
        rera_id: plan.reraId,
        floor_no: plan.floorNo,
        image: plan.image,
      };

      const formData = buildFormData(body);

      // console.log("Request body:", JSON.stringify(body, null, 2));

      const res = await Models.floorPlans.create(formData);
      console.log("res", res);
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const deleteFloorPlans = async () => {
    
    try {
      const res = await Models.floorPlans.delete(state.deleteFloorPlan);
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
      error: { ...state.error, [name]: "" },
    });
  };

  const steps = [
    { id: 1, title: "Basic Detail", icon: MapPin },
    { id: 2, title: "Property Information", icon: Info },
    ...(state.property_type?.label !== PROPERTY_TYPE.AGRICULTURAL
      ? [{ id: 5, title: "Floor Plans", icon: Star }]
      : []),
    { id: 7, title: "Media", icon: File },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Amenities", icon: Home },
    { id: 6, title: "Contact Information", icon: Phone },
  ];

  const addFloorPlan = () => {
    setState({
      floorPlans: [
        ...state.floorPlans,
        {
          id: null,
          category: null,
          squareFeet: "",
          price: "",
          reraId: "",
          floorNo: "",
          image: null,
        },
      ],
    });
  };

  // const removeFloorPlan = (index) => {
  //   if (state.floorPlans.length > 1) {
  //     // Clean up object URLs if any
  //     const plan = state.floorPlans[index];
  //     if (plan.image && typeof plan.image !== "string") {
  //       URL.revokeObjectURL(plan.image);
  //     }
  //     setState({ floorPlans: state.floorPlans.filter((_, i) => i !== index) ,
  //       deleteFloorPlan: index
  //     });
  //   }
  // };


  const removeFloorPlan = (index) => {
    if (state.floorPlans.length > 1) {
      const plan = state.floorPlans[index];

      // Clean up object URLs if any
      if (plan.image && typeof plan.image !== "string") {
        URL.revokeObjectURL(plan.image);
      }

      setState({
        floorPlans: state.floorPlans.filter((_, i) => i !== index),
        deleteFloorPlan: plan.id, // Set to the actual ID, not the index
      });
    }
  };

  const updateFloorPlan = (index, field, value) => {
    setState({
      floorPlans: state.floorPlans.map((plan, i) =>
        i === index ? { ...plan, [field]: value } : plan
      ),
    });
  };

  const toggleAccordion = (index) => {
    if (state.openAccordions?.includes(index)) {
      setState({ openAccordions: [] });
    } else {
      setState({ openAccordions: [index] });
    }
  };

  return (
    <>
      <div className="panel mb-5 flex flex flex-col justify-between gap-5  md:flex-row md:items-center">
        <h5 className="text-lg font-semibold dark:text-white-light ">
          Update Property
        </h5>
        {/* <PrimaryButton
          type="submit"
          text="Post Property"
          className="border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
          onClick={onSubmit}
        /> */}
      </div>

      <div className="space-y-5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="grid grid-cols-1 gap-6 md:gap-5 xl:grid-cols-10"
          >
            <div className="relative flex items-start xl:col-span-2">
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500">
                <step.icon size={18} />
              </div>

              {index !== steps.length - 1 && (
                <div className="absolute left-5 top-11 h-full w-0.5 bg-gray-300" />
              )}

              <span className="text-md ml-4 mt-2 font-bold text-gray-700">
                {step.title}
              </span>
            </div>

            {/* Form section (right) */}
            <div className="xl:col-span-8">
              {/* Step 1: Basic Detail */}
              {step.id === 1 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">Basic Detail</h2>
                  <div className={`${"mt-4 grid grid-cols-2 gap-4"}`}>
                    <CustomSelect
                      title="Property type"
                      value={state.property_type}
                      onChange={(e) => {
                        setState({
                          property_type: e,
                          contact: "",
                          error: { ...state.error, property_type: "" },
                          floorPlans:
                            e?.label === PROPERTY_TYPE.AGRICULTURAL
                              ? []
                              : state.floorPlans,
                        });
                      }}
                      placeholder={"Select Property type "}
                      options={state.categoryList}
                      error={state.error?.property_type}
                      required
                      isClearable={false}
                      loadMore={() => catListLoadMore()}
                    />

                    <CustomSelect
                      title="Offer type"
                      value={state.listing_type}
                      onChange={(e) => {
                        setState({
                          listing_type: e,
                          contact: "",
                          error: { ...state.error, listing_type: "" },
                        });
                      }}
                      placeholder={"Select Offer type "}
                      options={ListType}
                      error={state.error?.listing_type}
                      required
                      isClearable={false}
                      // loadMore={() => catListLoadMore()}
                    />
                    <TextInput
                      name="title"
                      title="Property Name"
                      placeholder="Enter Property Name"
                      value={state.title}
                      onChange={handleInputChange}
                      required
                      error={state.error?.title}
                    />

                    <CustomSelect
                      title="Property Status"
                      value={state.status}
                      onChange={(e) => {
                        setState({
                          status: e,
                          error: { ...state.error, status: "" },
                        });
                      }}
                      placeholder={"Select Property type "}
                      options={Property_status}
                      error={state.error?.status}
                      required
                      isClearable={false}
                      loadMore={() => catListLoadMore()}
                    />
                  </div>

                  <div className="mt-4 flex w-full">
                    <TextArea
                      name="description"
                      title="Description"
                      placeholder="Enter Description"
                      value={state.description}
                      onChange={(e) =>
                        setState({
                          description: e.target.value,
                          error: { ...state.error, description: "" },
                        })
                      }
                      required
                      error={state.error?.description}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Property Information */}
              {step.id === 2 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="text-lg font-semibold">
                    Property Information
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* {state.property_type?.label == PROPERTY_TYPE.PLOT ? ( */}
                    {/* <>
                        <NumberInput
                          name="plot_area"
                          title="Plot Area (sq.ft.)"
                          placeholder="Enter total plot area"
                          value={state.plot_area}
                          onChange={handleInputChange}
                          required
                          error={state.error?.plot_area}
                        />
                        <CustomSelect
                          title="Land Type / Zone"
                          placeholder="Select Land Type / Zone"
                          options={[
                            { value: "residential", label: "Residential" },
                            { value: "commercial", label: "Commercial" },
                            { value: "agricultural", label: "Agricultural" },
                            { value: "industrial", label: "Industrial" },
                          ]}
                          value={state.land_type}
                          onChange={(selectedOption) =>
                            setState({
                              land_type: selectedOption,
                              error: {
                                ...state.error,
                                land_type: null,
                              },
                            })
                          }
                          isClearable
                          required
                          error={state.error?.land_type}
                        />
                        <NumberInput
                          name="price"
                          title="Plot Price"
                          placeholder="Enter Plot Price"
                          value={state.price}
                          onChange={handleInputChange}
                          required
                          error={state.error?.price}
                        />
                        <NumberInput
                          name="price_per_sqft"
                          title="Price Per Sq.ft."
                          placeholder="Price Per Sq.ft."
                          value={state.price_per_sqft}
                          onChange={handleInputChange}
                          required
                          error={state.error?.price_per_sqft}
                        />
                      </> */}
                    {/* ) : ( */}
                    <>
                      <NumberInput
                        name="total_area"
                        title="Total Area (sq.ft.)"
                        placeholder="Enter total area"
                        value={state.total_area}
                        onChange={handleInputChange}
                        required
                        error={state.error?.total_area}
                      />

                      {state.property_type?.label !==
                        PROPERTY_TYPE.AGRICULTURAL && (
                        <NumberInput
                          name="built_up_area"
                          title="Built-up Area (sq.ft.)"
                          placeholder="Enter total built-up area"
                          value={state.built_up_area}
                          onChange={handleInputChange}
                          required
                          error={state.error?.built_up_area}
                        />
                      )}

                      {state.property_type?.label ==
                        PROPERTY_TYPE.RESIDENTIAL && (
                        <>
                          <TextInput
                            name="bedrooms"
                            title="Bedrooms (Number Only)"
                            placeholder="Enter number of bedrooms"
                            value={state.bedrooms}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="bathrooms"
                            title="Bathrooms (Number Only)"
                            placeholder="Enter number of bathrooms"
                            value={state.bathrooms}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="balconies"
                            title="Balconies (Number Only)"
                            placeholder="Enter number of balconies"
                            value={state.balconies}
                            onChange={handleInputChange}
                          />
                        </>
                      )}

                      {state.property_type?.label !==
                        PROPERTY_TYPE.AGRICULTURAL && (
                        <>
                          <TextInput
                            name="floor_number"
                            title="Floor No (Number Only)"
                            placeholder="Enter floor number"
                            value={state.floor_number}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="total_floors"
                            title="Total Floors (Number Only)"
                            placeholder="Enter total number of floors"
                            value={state.total_floors}
                            onChange={handleInputChange}
                          />
                          <NumberInput
                            name="built_year"
                            title="Built Year"
                            placeholder="Enter the built year"
                            value={state.built_year}
                            onChange={handleInputChange}
                          />

                          <CustomSelect
                            title="Furnishing Type"
                            placeholder="Select furnishing type"
                            options={[
                              { value: "furnished", label: "Furnished" },
                              {
                                value: "semi_furnished",
                                label: "Semi-Furnished",
                              },
                              { value: "unfurnished", label: "Unfurnished" },
                            ]}
                            value={state.furnishing}
                            onChange={(selectedOption) =>
                              setState({
                                furnishing: selectedOption,
                                error: { ...state.error, furnishing: "" },
                              })
                            }
                            required
                            isClearable
                            error={state.error?.furnishing}
                          />
                        </>
                      )}

                      <CustomSelect
                        title="Property Facing Direction"
                        placeholder="Select facing direction"
                        options={facingDirection}
                        value={state.facing}
                        onChange={(selectedOption) =>
                          setState({ facing: selectedOption })
                        }
                        isClearable
                      />

                      {state.listing_type?.label == LISTING_TYPE.RENT ? (
                        <>
                          <NumberInput
                            name="min_price"
                            title="Minimum Monthly Rent"
                            placeholder="Enter min monthly rent"
                            value={state.min_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.min_price}
                          />
                          <NumberInput
                            name="max_price"
                            title="Maximum Monthly Rent"
                            placeholder="Enter max monthly rent"
                            value={state.max_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.max_price}
                          />
                          <NumberInput
                            name="rent_duration"
                            title="Rent Duration"
                            placeholder="Enter rent duration"
                            value={state.rent_duration}
                            onChange={handleInputChange}
                            required
                            error={state.error?.rent_duration}
                          />
                        </>
                      ) : state.listing_type?.label == LISTING_TYPE.SALE ? (
                        <>
                          {/* <NumberInput
                            name="price"
                            title="Price"
                            placeholder="Enter Price"
                            value={state.price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.price}
                          /> */}
                          {/* <NumberInput
                            name="price_per_sqft"
                            title="Price Per Sq.ft"
                            placeholder="Enter Price Per Sq.ft"
                            value={state.price_per_sqft}
                            onChange={handleInputChange}
                            required
                            error={state.error?.price_per_sqft}
                          /> */}
                          <NumberInput
                            name="min_price"
                            title="Minimum Price"
                            placeholder="Enter Min Price"
                            value={state.min_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.min_price}
                          />

                          <NumberInput
                            name="max_price"
                            title="Maximum Price"
                            placeholder="Enter Max Price"
                            value={state.max_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.max_price}
                          />
                        </>
                      ) : state.listing_type?.label == LISTING_TYPE.LEASE ? (
                        <>
                          {/* <NumberInput
                            name="lease_total_amount"
                            title="Lease Price"
                            placeholder="Enter Lease Price"
                            value={state.lease_total_amount}
                            onChange={handleInputChange}
                            required
                            error={state.error?.lease_total_amount}
                          /> */}

                          <NumberInput
                            name="min_price"
                            title="Lease Minimum Price"
                            placeholder="Enter Lease Min Price"
                            value={state.min_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.min_price}
                          />

                          <NumberInput
                            name="max_price"
                            title="Lease Maximum Price"
                            placeholder="Enter Lease Max Price"
                            value={state.max_price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.max_price}
                          />
                          <NumberInput
                            name="lease_duration"
                            title="Lease Duration (Year)"
                            placeholder="Enter lease duration"
                            value={state.lease_duration}
                            onChange={handleInputChange}
                            required
                            error={state.error?.lease_duration}
                          />
                        </>
                      ) : null}
                    </>
                    {/* )} */}
                  </div>
                </div>
              )}

              {state.property_type?.label !== PROPERTY_TYPE.AGRICULTURAL &&
                step.id === 5 && (
                  <div className="panel rounded-lg p-6">
                    <h2 className="text-lg font-semibold">Floor Plans</h2>

                    <div className="mt-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                        {state.floorPlans?.map((plan, index) => (
                          <div key={index} className="rounded-lg border">
                            <div
                              className="flex cursor-pointer items-center justify-between bg-gray-50 p-4"
                              onClick={() => toggleAccordion(index)}
                            >
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {plan.category?.label ||
                                    `Floor Plan ${index + 1}`}
                                </h3>
                                {plan.squareFeet && (
                                  <span className="text-sm text-gray-500">
                                    ({plan.squareFeet} sq.ft)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {state.floorPlans.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFloorPlan(index);
                                    }}
                                    className="rounded p-1 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </div>

                            <div className="border-t p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <CustomSelect
                                  title="Category"
                                  value={plan.category}
                                  onChange={(e) =>
                                    updateFloorPlan(index, "category", e)
                                  }
                                  placeholder="Select Category"
                                  options={[
                                    { value: "plots", label: "Plots" },
                                    { value: "1bhk", label: "1 BHK" },
                                    { value: "2bhk", label: "2 BHK" },
                                    { value: "3bhk", label: "3 BHK" },
                                    { value: "4bhk", label: "4 BHK" },
                                  ]}
                                />

                                <TextInput
                                  name={`squareFeet-${index}`}
                                  title="Square Feet"
                                  placeholder="Enter Square Feet"
                                  type="number"
                                  value={plan.squareFeet}
                                  onChange={(e) =>
                                    updateFloorPlan(
                                      index,
                                      "squareFeet",
                                      e.target.value
                                    )
                                  }
                                  required={plan.category ? true : false}
                                />

                                <TextInput
                                  name={`price-${index}`}
                                  title="Price"
                                  placeholder="Enter Price"
                                  type="number"
                                  value={plan.price}
                                  onChange={(e) =>
                                    updateFloorPlan(
                                      index,
                                      "price",
                                      e.target.value
                                    )
                                  }
                                  required={plan.category ? true : false}
                                />

                                {/* <TextInput
                                  name={`reraId-${index}`}
                                  title="RERA ID"
                                  placeholder="Enter RERA ID"
                                  value={plan.reraId}
                                  onChange={(e) =>
                                    updateFloorPlan(
                                      index,
                                      "reraId",
                                      e.target.value
                                    )
                                  }
                                  required={plan.category ? true : false}
                                /> */}

                                <TextInput
                                  name={`floorNo-${index}`}
                                  title="Floor Number"
                                  placeholder="Enter Floor Number"
                                  value={plan.floorNo}
                                  onChange={(e) =>
                                    updateFloorPlan(
                                      index,
                                      "floorNo",
                                      e.target.value
                                    )
                                  }
                                  required={plan.category ? true : false}
                                />
                              </div>

                              <h5 className="text-md mt-5 font-bold">
                                Upload Floor Plan Image
                              </h5>

                              <div
                                className={`mb-4 mt-3 flex h-80 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                                  plan.image
                                    ? "border-green-300 bg-green-50"
                                    : "border-gray-300 hover:border-gray-400"
                                } relative`}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.add(
                                    "border-blue-400",
                                    "bg-blue-50"
                                  );
                                }}
                                onDragLeave={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove(
                                    "border-blue-400",
                                    "bg-blue-50"
                                  );
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.currentTarget.classList.remove(
                                    "border-blue-400",
                                    "bg-blue-50"
                                  );

                                  const files = e.dataTransfer.files;
                                  if (files.length > 0) {
                                    const file = files[0];
                                    if (file.type.startsWith("image/")) {
                                      updateFloorPlan(index, "image", file);
                                    }
                                  }
                                }}
                                onClick={() =>
                                  document
                                    .getElementById(`file-input-${index}`)
                                    ?.click()
                                }
                              >
                                {plan.image ? (
                                  <>
                                    <img
                                      src={
                                        typeof plan.image === "string"
                                          ? plan.image
                                          : URL.createObjectURL(plan.image)
                                      }
                                      alt="Floor plan"
                                      className="h-full w-full rounded-lg object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-0 transition-all duration-200 hover:bg-opacity-30">
                                      <div className="text-center text-white opacity-0 transition-opacity duration-200 hover:opacity-100">
                                        <Camera className="mx-auto mb-1 h-6 w-6" />
                                        <span className="text-xs">
                                          Change Image
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateFloorPlan(index, "image", null);
                                      }}
                                      className="absolute -right-2 -top-2 z-10 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-8 w-8 text-gray-400" />
                                    <span className="mt-2 text-sm text-gray-500">
                                      Drag & drop or click to upload
                                    </span>
                                    <span className="mt-1 text-xs text-gray-400">
                                      PNG, JPG, WEBP up to 5MB
                                    </span>
                                  </>
                                )}

                                <input
                                  id={`file-input-${index}`}
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      updateFloorPlan(index, "image", file);
                                    }
                                  }}
                                  required={plan.category ? true : false}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Floor Plan Button */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={addFloorPlan}
                          className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                        >
                          <Plus className="h-5 w-5" />
                          Add Floor Plan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {step.id === 7 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="text-lg font-semibold">
                    Upload photos of your property
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <UpdatePropertyImagePreview
                        existingImages={state.imageList}
                        onImageCreate={createImage}
                        onImageDelete={deleteImage}
                        maxFiles={10}
                        propertyId={id}
                        onImageReorder={updateImageOrders}
                      />

                      {state.error?.images && (
                        <p
                          className="mt-1 text-sm text-red-600"
                          id={`${name}-error`}
                        >
                          {state.error?.images}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <VideoUpload
                        onVideoChange={handleVideoChange}
                        onVideoRemove={handleVideoRemove}
                        existingVideo={state.existingVideo}
                        isLoading={state.videoLoading}
                        maxSizeMB={20}
                        acceptedFormats={["mp4", "mov", "avi"]}
                      />
                    </div>
                  </div>

                  <div className="mt-4 ">
                    <TextInput
                      name="virtual_tour"
                      title="Virtual Tour"
                      placeholder="Enter virtual tour url"
                      value={state.virtual_tour}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Price */}
              {step.id === 3 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="mb-4 text-lg font-semibold">Location</h2>
                  <TextArea
                    name="Address"
                    title="Address"
                    placeholder="Enter Address"
                    value={state.address}
                    onChange={(e) => setState({ address: e.target.value })}
                    required
                    error={state.error?.address}
                  />
                  {/* <CustomSelect
                    title="Address"
                    placeholder="Search Address"
                    options={state.propertyTypeList}
                    value={state.city}
                    onChange={(selectedOption) =>
                      setState({
                        city: selectedOption,
                        error: {
                          ...state.error,
                          city: null,
                        },
                      })
                    }
                    isClearable
                  /> */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <NumberInput
                      name="latitude"
                      title="Latitude of the Location"
                      placeholder="Enter location"
                      value={state.latitude}
                      onChange={handleInputChange}
                      required
                      error={state.error?.latitude}
                    />
                    <NumberInput
                      name="longitude"
                      title="Longitude of the Location"
                      placeholder="Enter location"
                      value={state.longitude}
                      onChange={handleInputChange}
                      required
                      error={state.error?.longitude}
                    />
                  </div>
                  <div className="mt-4 flex h-60 w-full items-center justify-center rounded rounded-md bg-gray-100 text-gray-400">
                    <iframe
                      className="h-64 w-full rounded-2xl"
                      src={`https://maps.google.com/maps?q=${state?.latitude},${state?.longitude}&z=13&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput
                      name="city"
                      title="City"
                      placeholder="Enter city"
                      value={state.city}
                      onChange={handleInputChange}
                      error={state.error?.city}
                      required
                    />
                    <TextInput
                      name="state"
                      title="State"
                      placeholder="Enter state"
                      value={state.state}
                      onChange={handleInputChange}
                      error={state.error?.state}
                      required
                    />

                    {/* <CustomSelect
                      title="City"
                      placeholder="Enter City"
                      options={state.propertyTypeList}
                      value={state.city}
                      onChange={(selectedOption) =>
                        setState({
                          city: selectedOption,
                          error: {
                            ...state.error,
                            city: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.city}
                    />
                    <CustomSelect
                      title="State"
                      placeholder="Enter State"
                      options={state.propertyTypeList}
                      value={state.state}
                      onChange={(selectedOption) =>
                        setState({
                          state: selectedOption,
                          error: {
                            ...state.error,
                            state: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.state}
                    /> */}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput
                      name="country"
                      title="Country"
                      placeholder="Enter country"
                      value={state.country}
                      onChange={handleInputChange}
                      error={state.error?.country}
                      required
                    />
                    {/* <CustomSelect
                      title="Country"
                      placeholder="Enter Country"
                      options={state.propertyTypeList}
                      value={state.country}
                      onChange={(selectedOption) =>
                        setState({
                          country: selectedOption,
                          error: {
                            ...state.error,
                            country: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.country}
                    /> */}
                    <TextInput
                      name="postal_code"
                      title="Zip Code"
                      placeholder="Enter Zip Code"
                      value={state.postal_code}
                      onChange={handleInputChange}
                      required
                      error={state.error?.postal_code}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Features & Amenities */}
              {step.id === 4 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Features & Amenities
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    {state.amenityList?.map((amenity) => (
                      <CheckboxInput
                        key={amenity.value}
                        type="checkbox"
                        name="amenities"
                        label={amenity.label}
                        checked={state.amenities?.includes(amenity.value)}
                        onChange={() => {
                          const updatedAmenities = state.amenities?.includes(
                            amenity.value
                          )
                            ? state.amenities.filter(
                                (item) => item !== amenity.value
                              )
                            : [...(state.amenities || []), amenity.value];
                          setState({
                            amenities: updatedAmenities,
                            error: { ...state.error, amenities: "" },
                          });
                        }}
                      />
                    ))}
                  </div>

                  {state.error?.amenities && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id={`${name}-error`}
                    >
                      {state.error?.amenities}
                    </p>
                  )}
                  <div className="mt-6 flex justify-end">
                    <PrimaryButton
                      type="button"
                      text="New Amenities"
                      className="!mt-6 border-0 shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                      onClick={() =>
                        setState({
                          isOpenAmenit: true,
                          name: "",
                          description: "",
                          amenityLoading: false,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Contact Information */}
              {step.id === 6 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomSelect
                      title="Project"
                      placeholder="Select Project"
                      options={state.projectList}
                      value={state.project}
                      onChange={(selectedOption) =>
                        setState({
                          project: selectedOption,
                          error: {
                            ...state.error,
                            project: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.project}
                      loadMore={() => projectLoadMore()}
                    />

                    {state.group !== "Developer" && (
                      <CustomSelect
                        title="Assign Developer"
                        placeholder="Select Developer"
                        options={state.developerList}
                        value={state.developer}
                        onChange={(selectedOption) =>
                          setState({
                            developer: selectedOption,
                            error: {
                              ...state.error,
                              developer: null,
                            },
                          })
                        }
                        isClearable
                        required
                        error={state.error?.developer}
                      />
                    )}

                    {state.group !== "Agent" && (
                      <>
                        <CheckboxInput
                          className="mt-8"
                          key={"assign"}
                          type="checkbox"
                          name="amenities"
                          label={"Assign Agent"}
                          checked={state.assignAgent}
                          onChange={() => {
                            setState({ assignAgent: !state.assignAgent });
                          }}
                        />
                        {state.assignAgent && (
                          <CustomSelect
                            title="Authorize Agent"
                            placeholder="Select Agent"
                            options={state.agentList}
                            value={state.agent}
                            onChange={(selectedOption) =>
                              setState({
                                agent: selectedOption,
                                error: {
                                  ...state.error,
                                  agent: null,
                                },
                              })
                            }
                            isClearable
                            required
                            error={state.error?.agent}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <PrimaryButton
                      type="submit"
                      text="Update Property"
                      className="!mt-6 border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                      onClick={onSubmit}
                      loading={state.btnLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        addHeader={"Create Amenity"}
        open={state.isOpenAmenit}
        close={() => {
          setState({ isOpenAmenit: false, name: "", description: "" });
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="name"
                  title="Amenity Name"
                  placeholder="Enter amenity name"
                  value={state.name}
                  onChange={(e) => {
                    setState({
                      name: e.target.value,
                      error: { ...state.error, name: "" },
                    });
                  }}
                  error={state.error?.name}
                  required
                />

                <TextArea
                  name="description"
                  title="Description"
                  placeholder="Enter Description"
                  value={state.description}
                  onChange={(e) => setState({ description: e.target.value })}
                />
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  type="button"
                  className="btn btn-outline-primary gap-2"
                  onClick={() => {
                    setState({
                      isOpenAmenit: false,
                      name: "",
                      description: "",
                      amenityLoading: false,
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createAmenity()}
                  className="btn btn-primary ltr:ml-4 rtl:mr-4"
                >
                  {state.amenityLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />
    </>
  );
};
export default PrivateRouter(AddPropertyPage);
