import React from 'react';

interface InputProps {
    type?: 'checkbox' | 'radio'; // Added type prop
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    name?: string;
    className?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

const CheckboxInput: React.FC<InputProps> = ({
    type = 'checkbox', // default is checkbox
    checked,
    onChange,
    label,
    name,
    className = '',
    error,
    required,
    disabled,
}) => {
    return (
        <div className={` ${className}`}>
            <label className="flex cursor-pointer items-center">
                <input
                    type={type} // can be checkbox or radio
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    name={name}
                    required={required}
                    disabled={disabled}
                    className={`form-${type} ${error ? 'border-red-500' : ''}`}
                />
                <span className="ml-1 text-sm font-medium text-gray-700">{label}</span>
            </label>
            {error && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default CheckboxInput;
