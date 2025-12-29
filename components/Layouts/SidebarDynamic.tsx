import PerfectScrollbar from "react-perfect-scrollbar";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "../../store/themeConfigSlice";
import AnimateHeight from "react-animate-height";
import { IRootState } from "../../store";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import IconCaretsDown from "@/components/Icon/IconCaretsDown";
import IconCaretDown from "@/components/Icon/IconCaretDown";
import IconMinus from "@/components/Icon/IconMinus";
import { menuConfig } from "@/utils/constant.utils";
import Icons from "@/utils/icons.utils"; // all your icons exported as a map

const SidebarDynamic = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const [group, setGroup] = useState<string>("");

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector(
    (state: IRootState) => state.themeConfig.semidark
  );

  const toggleMenu = (key: string) => {
    setCurrentMenu((old) => (old === key ? "" : key));
  };

  // Set active route class
  const setActiveRoute = () => {
    const allLinks = document.querySelectorAll(".sidebar ul a.active");
    allLinks.forEach((el) => el.classList.remove("active"));
    const selector = document.querySelector(
      `.sidebar ul a[href="${window.location.pathname}"]`
    );
    selector?.classList.add("active");
  };

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [router.pathname]);

  useEffect(() => {
    role();
  }, []);

  const role = () => {
    const group = localStorage.getItem("group");
    setGroup(group);
  };

  // Recursive render function
  const renderMenu = (menu) =>
    menu.map((item, idx) => {
      const Icon = Icons[item.icon];

      if (item.type === "section") {
        return (
          <div key={idx}>
            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
              <IconMinus className="hidden h-5 w-4 flex-none" />
              <span>{t(item.label)}</span>
            </h2>
            <li className="nav-item">
              <ul>{item.children && renderMenu(item.children)}</ul>
            </li>
          </div>
        );
      }

      if (item.type === "link") {
        return (
          <li key={idx} className=" nav-item">
            <Link
              href={item.href || "#"}
              target={item.external ? "_blank" : "_self"}
              className="group"
            >
              <div className="flex items-center">
                {Icon && (
                  <Icon className="shrink-0 group-hover:!text-primary" />
                )}
                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                  {t(item.label)}
                </span>
              </div>
            </Link>
          </li>
        );
      }

      if (item.type === "submenu") {
        return (
          <li key={idx} className="menu nav-item">
            <button
              type="button"
              className={`${
                currentMenu === item.key ? "active" : ""
              } nav-link group w-full`}
              onClick={() => toggleMenu(item.key)}
            >
              <div className="flex items-center">
                {Icon && (
                  <Icon className="shrink-0 group-hover:!text-primary" />
                )}
                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">
                  {t(item.label)}
                </span>
              </div>
              <div
                className={
                  currentMenu !== item.key ? "-rotate-90 rtl:rotate-90" : ""
                }
              >
                <IconCaretDown />
              </div>
            </button>

            <AnimateHeight
              duration={300}
              height={currentMenu === item.key ? "auto" : 0}
            >
              <ul className="sub-menu text-gray-500">
                {item.children.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href}>{t(item.label)}</Link>
                  </li>
                ))}
              </ul>
            </AnimateHeight>
          </li>
        );
      }

      return null;
    });

  const getUserMenu = () => {
    if (!group) return menuConfig.admin;
    return menuConfig[group] || menuConfig.default;
  };

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${
          semidark ? "text-white-dark" : ""
        }`}
      >
        <div className="h-full bg-white dark:bg-black">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              <img
                className="ml-[5px] w-8 flex-none"
                src="/assets/images/logo.svg"
                alt="logo"
              />
              <span className="align-middle text-2xl font-semibold dark:text-white-light lg:inline ltr:ml-1.5 rtl:mr-1.5">
                {t("VRISTO")}
              </span>
            </Link>
            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>

          {/* Menu */}
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
              {getUserMenu()?.length > 0 && renderMenu(getUserMenu())}
            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default SidebarDynamic;
