import React from "react";
import { Loader } from "@mantine/core";
import IconLoader from "../Icon/IconLoader";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // button text
  loading?: boolean; // show loader
}

const PrimaryButton: React.FC<CustomButtonProps> = ({
  text,
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        text || children
      )}
    </button>
  );
};

export default PrimaryButton;
