
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
  return (
    <aside className="space-y-4 bg-gray-100 dark:bg-gray-900 p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-2">Test Cards</h3>
      <div className="flex flex-col gap-2">
        {interswitchTestCards.map((card) => {
          // Determine color based on label
          let colorClass = "bg-gray-400 text-white hover:bg-gray-500";
          for (const key in labelColors) {
            if (card.label.includes(key)) colorClass = labelColors[key];
          }

          return (
            <button
              key={card.number}
              type="button"
              className={`px-3 py-2 rounded text-sm cursor-pointer ${colorClass}`}
            >
              {card.label}: {card.number} 
            </button>
          );
        })}
      </div>
    </aside>
  );
}
