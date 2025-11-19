import { useState } from "react";

const interswitchTestCards = [
  { number: "5061050254756707864", label: "Verve – Success" },
  { number: "5060990580000217499", label: "Verve – Success" },
  { number: "4000000000002503", label: "VISA – Success" },
  { number: "5123450000000008", label: "Mastercard – Success" },
  { number: "5061830100001895", label: "Verve – Failure: Timeout" },
  {
    number: "5060990580000000390",
    label: "Verve – Failure: Insufficient Funds",
  },
  { number: "5612330000000000412", label: "Verve – Failure: No Card Record" },
];
const labelColors: Record<string, string> = {
  Success: "bg-green-600 text-white hover:bg-green-700",
  Timeout: "bg-red-600 text-white hover:bg-red-700",
  "Insufficient Funds": "bg-orange-500 text-white hover:bg-orange-600",
  "No Card Record": "bg-gray-500 text-white hover:bg-gray-600",
};

export default function Sidebar() {
  const [copiedCard, setCopiedCard] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCard(text);
      setTimeout(() => setCopiedCard(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <aside className="space-y-4  p-4">
      <h3 className="font-bold text-lg mb-2">Test Cards</h3>
      <div className="flex flex-col gap-2">
        {interswitchTestCards.map((card) => {
          // Determine color based on label
          let colorClass = "bg-gray-400 text-white hover:bg-gray-500";
          for (const key in labelColors) {
            if (card.label.includes(key)) colorClass = labelColors[key];
          }

          const isCopied = copiedCard === card.number;

          return (
            <div
              key={card.number}
              onClick={() => handleCopy(card.number)}
              className={`px-3 py-2 rounded text-sm flex justify-between items-center cursor-pointer ${colorClass}`}
              title="Click to copy"
            >
              <span>
                {card.label}: {card.number}
              </span>
              {isCopied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m0 4h2a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-6a2 2 0 012-2h2z"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
