import React from "react";
import Select from "react-select";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: Option | null;
  onChange: (selectedOption: Option | null) => void;
  placeholder?: string;
  title?: string;
  isSearchable?: boolean;
  className?: string;
  error?: string;
  isMulti?: boolean;
  required?: boolean;
  loadMore?: any;
  borderRadius?: number;
  menuOpen?: any;
  disabled?: boolean;
  isClearable?: boolean;
  leftIcon?: React.ReactNode;
}

const CustomSelect = (props: SelectProps) => {
  const {
    borderRadius,
    disabled,
    options,
    value,
    onChange,
    placeholder = "Select...",
    title,
    isSearchable = true,
    className,
    error,
    isMulti,
    required,
    loadMore,
    menuOpen,
    isClearable,
    leftIcon,
  } = props;

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: error ? "border-red-500" : state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: error ? "0 0 0 0.9px red" : state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: error ? "border-red-500" : state.isFocused ? "#3b82f6" : "#d1d5db",
      },
      borderRadius: borderRadius ? borderRadius : "6px",
      paddingLeft: leftIcon ? "40px" : "12px",
      minHeight: "38px",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      paddingLeft: "0px",
    }),
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: 160, 
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base: any) => ({
      ...base,
      fontSize: "14px",
      padding: "8px 12px",
      minHeight: "36px",
      cursor: "pointer",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: "4px 8px",
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding: "4px 8px",
    }),
  };

  const CustomDropdownIndicator = (props: any) => {
    return (
      <div {...props.innerProps} className="px-2">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <label className="block text-sm font-bold text-gray-700 mb-1">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <Select
          isDisabled={disabled}
          placeholder={placeholder}
          options={options}
          value={value}
          onChange={onChange}
          isSearchable={isSearchable}
          isMulti={isMulti}
          isClearable={isClearable !== undefined ? isClearable : true}
          styles={customStyles}
          onMenuOpen={() => menuOpen && menuOpen(true)}
          onMenuClose={() => menuOpen && menuOpen(false)}
          components={{
            DropdownIndicator: CustomDropdownIndicator,
          }}
          classNamePrefix="react-select"
          onMenuScrollToBottom={loadMore}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default CustomSelect;