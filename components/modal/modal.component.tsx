import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
import IconX from "../Icon/IconX";

export default function Modal(props: any) {
  const {
    open,
    close,
    renderComponent,
    edit,
    addHeader,
    updateHeader,
    subTitle,
    isFullWidth,
  } = props;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        open={open}
        onClose={() => close()}
        className="relative z-50"
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[black]/60" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`panel w-full ${
                  isFullWidth ? "" : "max-w-lg"
                } overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark`}
              >
                {/* HEADER */}
                <div className="flex items-center justify-between bg-[#fbfbfb] dark:bg-[#121c2c] px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium">
                    {edit ? updateHeader : addHeader}
                  </h3>
                  <button
                    type="button"
                    onClick={() => close()}
                    className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-600"
                  >
                    <IconX />
                  </button>
                </div>

                {/* SUBTITLE */}
                {subTitle && (
                  <div className="bg-[#fbfbfb] dark:bg-[#121c2c] px-5 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{subTitle}</p>
                  </div>
                )}

                {/* CONTENT */}
                <div className="p-5">{renderComponent()}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
