import Link from "next/link";
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import IconMail from "@/components/Icon/IconMail";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconInstagram from "@/components/Icon/IconInstagram";
import IconFacebookCircle from "@/components/Icon/IconFacebookCircle";
import IconTwitter from "@/components/Icon/IconTwitter";
import IconGoogle from "@/components/Icon/IconGoogle";
import IconX from "@/components/Icon/IconX";
import TextInput from "@/components/FormFields/TextInput.component";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Models from "@/imports/models.import";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import { userData } from "@/store/userConfigSlice";
import { CAPTCHA_SITE_KEY, ROLES } from "@/utils/constant.utils";
import ReCAPTCHA from "react-google-recaptcha";


const LoginBoxed = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [loginCaptchaToken, setLoginCaptchaToken] = useState("");
  const captchaRef = useRef<any>(null);
  const captchaVerifiedRef = useRef(false);
  const captchaPopupOpenRef = useRef(false);
  const [captchaPopupRect, setCaptchaPopupRect] = useState<DOMRect | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const isResettingRef = useRef(false);

  const resetCaptcha = () => {
    isResettingRef.current = true;
    captchaRef.current?.reset();
    setLoginCaptchaToken("");
    captchaVerifiedRef.current = false;
    captchaPopupOpenRef.current = false;
    setCaptchaPopupRect(null);
    setTimeout(() => { isResettingRef.current = false; }, 500);
  };

  // Detect when reCAPTCHA image popup opens/closes
  useEffect(() => {
    let debounceTimer: any = null;

    const updatePopupState = () => {
      if (isResettingRef.current) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const iframe = document.querySelector<HTMLIFrameElement>("iframe[src*='recaptcha'][src*='bframe']");
        if (iframe) {
          const rect = iframe.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          captchaPopupOpenRef.current = isVisible;
          setCaptchaPopupRect(isVisible ? rect : null);
        } else {
          captchaPopupOpenRef.current = false;
          setCaptchaPopupRect(null);
        }
      }, 100);
    };

    const observer = new MutationObserver(updatePopupState);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    return () => { observer.disconnect(); clearTimeout(debounceTimer); };
  }, []);

  // Outside click — only resets when image popup is open and user has NOT verified
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!captchaPopupOpenRef.current) return;
      if (captchaVerifiedRef.current) return;
      const iframe = document.querySelector<HTMLIFrameElement>("iframe[src*='recaptcha'][src*='bframe']");
      if (!iframe) return;
      const rect = iframe.getBoundingClientRect();
      const isInsidePopup =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!isInsidePopup) resetCaptcha();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [state, setState] = useSetState({
    showPassword: false,
    email: "",
    password: "",
    error: null,
    btnLoading: false,
  });

  useEffect(() => {
    dispatch(setPageTitle("Login"));
  });

  const submitForm = async (e: any) => {
    e.preventDefault();
    try {
      setState({ btnLoading: true });
      const body = {
        email: state.email.trim(),
        password: state.password,
        recaptcha_token: loginCaptchaToken,
      };

      const validationErrors: any = {};

      try {
        await Utils.Validation.login.validate(body, { abortEarly: false });
      } catch (yupError) {
        if (yupError instanceof Yup.ValidationError) {
          yupError.inner.forEach((err) => {
            validationErrors[err.path] = err?.message;
          });
        }
      }

      if (!loginCaptchaToken) {
        validationErrors.loginCaptchaInput = "Please complete the captcha";
      }

      if (Object.keys(validationErrors).length > 0) {
        setState({ error: validationErrors, btnLoading: false });
        return;
      }

      const res: any = await Models.auth.login(body);
      Success("Login Successfully");
      localStorage.setItem("token", res.access);
      localStorage.setItem("refresh", res.refresh);
      localStorage.setItem("userId", res.user?.id);
      localStorage.setItem("role", res.user?.role);
      if (res.user?.role == ROLES.HOD) {
        router.replace("/faculty/my_job");
      } else {
        router.replace("/");
      }
      setState({ btnLoading: false });
    } catch (error) {
      Failure(error?.error);
      setState({ btnLoading: false });
    }
  };

  return (
    <div>
      <div className="absolute inset-0">
        {/* <img
          src="/assets/images/auth/bg-gradient.png"
          alt="image"
          className="h-full w-full object-cover"
        /> */}
      </div>

      <div className="relative flex min-h-screen items-center justify-center bg-lblue bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
        {/* <img
          src="/assets/images/auth/coming-soon-object1.png"
          alt="image"
          className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2"
        />
        <img
          src="/assets/images/auth/coming-soon-object2.png"
          alt="image"
          className="absolute left-24 top-0 h-40 md:left-[30%]"
        />
        <img
          src="/assets/images/auth/coming-soon-object3.png"
          alt="image"
          className="absolute right-0 top-0 h-[300px]"
        />
        <img
          src="/assets/images/auth/polygon-object.svg"
          alt="image"
          className="absolute bottom-0 end-[28%]"
        /> */}
        
        <div className="relative w-full max-w-[600px]  rounded-lg">
          <div className="flex justify-center items-center">
            <img src="/assets/images/faculty-logo.png" alt="" className="w-[200px] h-10 mb-10 text-center"/>
          </div>
           
          <div className="relative flex flex-col justify-center rounded-lg bg-white px-6 py-10 backdrop-blur-lg dark:bg-black/50 ">
            <div className="mx-auto w-full max-w-[440px]">
             
              <div className="mb-6 text-center">
                <h1 className="text-xl  font-extrabold uppercase !leading-snug text-dblue ">
                  Sign in
                </h1>
                <p className="text-base font-bold leading-normal text-white-dark">
                  Enter your email and password to login
                </p>
              </div>
              <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                <TextInput
                  name="email"
                  type="text"
                  title="Email"
                  placeholder="Enter Email"
                  value={state.email}
                  onChange={(e) => setState({ email: e.target.value, error: { ...state.error, email: undefined } })}
                  error={state.error?.email}
                  icon={<IconMail fill={true} />}
                />
                <TextInput
                  id="Password"
                  title="Password"
                  type={state.showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="form-input ps-10 placeholder:text-white-dark"
                  onChange={(e) => setState({ password: e.target.value, error: { ...state.error, password: undefined } })}
                  value={state.password}
                  error={state.error?.password}
                  icon={<IconLockDots fill={true} />}
                  rightIcon={state.showPassword ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() =>
                    setState({ showPassword: !state.showPassword })
                  }
                />
                <div
                  className="flex cursor-pointer justify-end"
                 
                >
                  <p className="text-base font-medium leading-normal text-white-dark underline"  onClick={() => router.push("/auth/forget-password")}>
                    Forget Password
                  </p>
                </div>

                <div className="relative flex w-full flex-col items-center justify-center py-2">
                  <ReCAPTCHA
                    ref={captchaRef}
                    sitekey={CAPTCHA_SITE_KEY}
                    asyncScriptOnLoad={() => setCaptchaLoaded(true)}
                    onChange={(token) => {
                      setLoginCaptchaToken(token || "");
                      if (token) {
                        captchaVerifiedRef.current = true;
                        setState({ error: { ...state.error, loginCaptchaInput: undefined } });
                      }
                    }}
                    onExpired={() => resetCaptcha()}
                  />
                  {!captchaLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center rounded border border-gray-300 bg-gray-50">
                      <svg className="h-6 w-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  )}
                  {state.error?.loginCaptchaInput && (
                    <p className="mt-1 text-sm text-red-600">{state.error.loginCaptchaInput}</p>
                  )}
                </div>
                
                {/* <button
                  type="submit"
                  className="btn bg-dblue !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                >
                  Sign in
                </button> */}
                {/* <PrimaryButton text={"Sign In"} /> */}
                <PrimaryButton
                  type="submit"
                  text="Submit"
                  className="btn bg-dblue !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                  loading={state.btnLoading}
                />
              </form>
              {/* <div className="relative my-7 text-center md:mb-9">
                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">
                  or
                </span>
              </div> */}
              {/* <div className="mb-10 md:mb-[60px]">
                <ul className="flex justify-center gap-3.5 text-white">
                   <li>
                    <Link
                      href="#"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)",
                      }}
                    >
                      <IconInstagram />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)",
                      }}
                    >
                      <IconFacebookCircle />
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)",
                      }}
                    >
                      <IconTwitter fill={true} />
                    </Link>
                  </li> 
                  <li>
                    <Link
                      href="#"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 18, 98, 1) 0%, rgba(67, 97, 238, 1) 100%)",
                      }}
                    >
                      <IconGoogle />
                    </Link>
                  </li>
                </ul>
              </div> */}
              {/* <div className="text-center dark:text-white">
                Don't have an account ?&nbsp;
                <Link
                  href="/auth/signup"
                  className="uppercase text-primary underline transition hover:text-black dark:hover:text-white"
                >
                  SIGN UP
                </Link>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
LoginBoxed.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default LoginBoxed;
