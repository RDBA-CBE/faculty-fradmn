import React from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

interface CustomeDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  title?: string;
  name?: string;
  required?: boolean;
  className?: string;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  showTimeSelect?:boolean
  [key: string]: any;
}

const CustomeDatePicker: React.FC<CustomeDatePickerProps> = (props) => {
  const {
    value,
    onChange,
    title,
    name,
    required,
    className,
    error,
    placeholder,
    minDate,
    showTimeSelect,
    ...rest
  } = props;

  const CustomInput = ({ value, onClick }: any) => (
    <div className="relative w-full ">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>
      <input
        className={`w-full rounded-md border px-3 py-2 pl-7 outline-none focus:ring-2 focus:ring-primary ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-primary"
        } ${className || ""}`}
        onClick={onClick}
        value={value}
        readOnly
        placeholder={placeholder ? placeholder : "Follow Up Date"}
      />
    </div>
  );

  return (
    <div className="w-full">
      {title && (
        <label className="mb-1 block text-sm font-bold text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="w-full">
        <DatePicker
          selected={value}
          onChange={onChange}
          showTimeSelect = {showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          // dateFormat="MMMM d, yyyy h:mm aa"
          dateFormat={showTimeSelect ? "MMMM d, yyyy h:mm aa" : "MMMM d, yyyy"}
          name={name}
          isClearable={!!value}
          shouldCloseOnSelect={true}
          customInput={<CustomInput />}
          required={required}
          minDate={minDate || undefined}
          wrapperClassName="w-full"
          
          {...rest}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomeDatePicker;
