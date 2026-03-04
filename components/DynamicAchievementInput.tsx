import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { capitalizeFLetter } from "@/utils/function.utils";

export default function DynamicAchievementInput({
  defaultValue = [],
  onChange,
  title = "",
  required = false,
  placeholder = "Enter achievements",
}) {
  const [items, setItems] = useState([{ achievement: "" }]);

  // Set default values from props
  useEffect(() => {
    if (defaultValue.length > 0) {
      setItems(defaultValue);
    }
  }, [defaultValue]);



  const handleChange = (index, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, achievement: capitalizeFLetter(value) } : item
    );
    setItems(updated);
    onChange && onChange(updated);
  };
  
  const addMore = () => {
    const updated = [...items, { achievement: "" }];
    setItems(updated);
    onChange && onChange(updated);
  };
  
  const removeItem = (index) => {
    if (items.length === 1) return;
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange && onChange(updated);
  };

  return (
    <>
      {title && (
        <label
          htmlFor={title}
          className="block text-sm font-bold text-gray-700"
        >
          {title} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border p-4 mb-3"
          >
            <input
              type="text"
              value={item.achievement}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={placeholder ?? "Enter achievement"}
              className="flex-1 outline-none"
            />

            {items.length > 1 && (
              <Trash2
                size={10}
                className="h-4 w-4 cursor-pointer text-red-500"
                onClick={() => removeItem(index)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-5 mt-2 flex w-full items-center justify-end">
        <button
          type="button"
          onClick={addMore}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white"
        >
          <Plus size={18} />
          Add More
        </button>
      </div>
    </>
  );
}
