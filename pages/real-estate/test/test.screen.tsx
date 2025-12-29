
// import Utils from "@/imports/utils.import";
import { useSetState } from "@/utils/function.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import * as Yup from "yup";

export default function page(props) {
  // props
  const {} = props;

  // Router
  const router = useRouter();

  // Ref
  const sampleRef = useRef(null);

  // State

  const [state, setState] = useSetState({});

  // Hook
  useEffect(() => {}, []);

  // Api Call
  const sampleFun = async () => {
    try {
      const body = {};
    //   await Utils.Validation.signin.validate(body),
    //     {
    //       abortEarly: false,
    //     };
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

        setState({ error: validationErrors, submitLoading: false });
      } else {
        setState({ submitLoading: false });
      }
      console.log("✌️error --->", error);
    }
  };

  // Logic
  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: any } }
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setState({
      [name]: type === "checkbox" ? checked : value,
      error: { ...state.error, [name]: "" },
    });
  };

  // Sample Data

  const data="Hello"

  return <div>page
   
  </div>;
}