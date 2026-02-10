import React from "react";
import moment from "moment";
import IconEdit from "./Icon/IconEdit";
import Tippy from "@tippyjs/react";
import ReadMore from "./readMore";
import { capitalizeFLetter, getFileNameFromUrl } from "@/utils/function.utils";

const LogCard = (props: any) => {
  const { data, onEdit, onDelete, editIcon } = props;

  return (
    <div className="w-full ">
      <div className="mb-5">
        <div className="mx-auto max-w-[900px]">
          {data?.map((item) => (
            <div className="flex">
              <p className="mr-2 min-w-[100px] max-w-[100px] py-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">
                {moment(item?.created_on).format("DD-MM-YYYY")}
              </p>
              <div className="relative before:absolute before:left-1/2 before:top-[15px] before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:border-2 before:border-primary after:absolute after:-bottom-[15px] after:left-1/2 after:top-[25px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2 after:border-primary"></div>
              <div className="self-center p-2.5 ltr:ml-2.5 rtl:ml-2.5 rtl:ltr:mr-2.5">
                <div className="flex items-center">
                  <div
                    className={`${
                      item?.details || item?.opportunity?.remark
                        ? "w-1/2 pr-2"
                        : "w-full pr-0"
                    }`}
                  >
                    <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {item.action_display}
                      </h3>
                      <p className="text-sm">
                        <strong>Performed By:</strong>{" "}
                        {`${capitalizeFLetter(
                          item?.performed_by?.first_name
                        )} ${item?.performed_by?.last_name}`}
                      </p>

                      <p className="text-sm">
                        <strong>Description:</strong> {item?.description}
                      </p>
                      {item?.file_url && (
                        <p className=" flex text-sm">
                          <strong>File:</strong>
                          <div
                            className="cursor-pointer text-primary underline"
                            onClick={() =>
                              window.open(item?.file_url, "_blank")
                            }
                          >
                            {" "}
                            {getFileNameFromUrl(item?.file_url)}
                          </div>
                        </p>
                      )}
                    </div>
                  </div>
                  {(item?.details || item?.opportunity?.remark) && (
                    <div className="w-1/2">
                      <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                        {(item?.details || item?.opportunity?.remark) && (
                          <Tippy
                            content={item?.detail || item?.opportunity?.remark}
                            placement="top"
                            className="rounded bg-black p-1 text-white"
                          >
                            <p className=" flex text-sm">
                              <strong>Details:</strong>
                              <ReadMore
                                children={
                                  item?.details || item?.opportunity?.remark
                                }
                              />
                            </p>
                          </Tippy>
                        )}

                        {editIcon && (
                          <div className="mt-2 flex justify-end">
                            <button
                              className="flex items-center text-blue-500 hover:text-blue-700"
                              onClick={() => onEdit(item)}
                            >
                              <IconEdit className="mr-1 h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogCard;
