import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import IconEdit from "./Icon/IconEdit";
import Tippy from "@tippyjs/react";
import ReadMore from "./readMore";
import { capitalizeFLetter, getFileNameFromUrl } from "@/utils/function.utils";
import { Send } from "lucide-react";

const LogCard = (props: any) => {
  const { data, onEdit, onDelete, editIcon, onSendMessage, title, onClose } =
    props;
  console.log("✌️data --->", data);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[600px] flex-col p-5">
      {title && (
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {title}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      <div ref={scrollRef} className="mb-5 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[900px]">
          {data?.map((item) => (
            <div className="flex">
              <p className="mr-2 min-w-[100px] max-w-[100px] py-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">
                {moment(item?.created_at).format("DD-MM-YYYY")}
              </p>
              <div className="relative before:absolute before:left-1/2 before:top-[15px] before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:border-2 before:border-primary after:absolute after:-bottom-[15px] after:left-1/2 after:top-[25px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2 after:border-primary"></div>
              <div className="self-center p-2.5 ltr:ml-2.5 rtl:ml-2.5 rtl:ltr:mr-2.5">
                <div className="flex items-center">
                  <div
                    className={`"w-full pr-0"
                    `}
                  >
                    <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                      <h3 className="text-lg font-semibold text-blue-700">
                        {item.action_display}
                      </h3>
                      <p className="text-sm">
                        <strong>Performed By :</strong>{" "}
                        {`${capitalizeFLetter(item?.created_by?.username)} `}
                      </p>
                      <p className="text-sm">
                        <strong>Role :</strong>
                        {`${capitalizeFLetter(item?.created_by?.role)} `}
                      </p>
                      <p className="text-sm">
                        <strong>Email :</strong>
                        {`${capitalizeFLetter(item?.created_by?.email)} `}
                      </p>
                      <p className="text-sm">
                        <strong>Ph.no :</strong>
                        {`${capitalizeFLetter(item?.created_by?.phone)} `}
                      </p>
                      <p className="text-sm">
                        <strong>Message :</strong> {item?.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Textarea and Send Button */}
      <div className="border-t bg-white p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogCard;
