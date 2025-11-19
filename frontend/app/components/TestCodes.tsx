// Type for a single test code
interface TestCode {
  number: string;
  label: string;
  description?: string;
}

// Props for the component
interface TestCodesProps {
  testCodes: TestCode[];
  onSelect?: (number: string) => void; // Called when button is clicked
  text?: string;
}

// Mapping labels to Tailwind color classes
const labelColors: Record<string, string> = {
  Success: "bg-green-600 text-white hover:bg-green-700",
  Pending: "bg-yellow-500 text-black hover:bg-yellow-600",
  "Unexpected Response": "bg-orange-500 text-white hover:bg-orange-600",
  "No Response": "bg-gray-500 text-white hover:bg-gray-600",
  Timeout: "bg-red-600 text-white hover:bg-red-700",
};

export default function TestCodes({
  testCodes,
  onSelect,
  text,
}: TestCodesProps) {
  return (
    <div className="mb-4 p-3 rounded border border-blue-300 bg-blue-100 dark:bg-blue-900">
      <p className="font-semibold mb-2">{text || "Test Codes:"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {testCodes.map((item) => (
          <button
            key={item.number}
            type="button"
            onClick={() => onSelect?.(item.number)}
            className={`px-2 py-1 text-sm rounded cursor-pointer ${
              labelColors[item.label] || "bg-gray-400 text-white"
            }`}
          >
            {item.label}
            {item.description && `(${item.description})`}: {item.number}
          </button>
        ))}
      </div>
    </div>
  );
}
