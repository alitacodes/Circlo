import React, { useState } from "react";

type AvailabilityCalendarProps = {
  availability: string[];
  onChange: (dates: string[]) => void;
};

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split("T")[0];

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  availability = [], // Default to empty array to prevent undefined errors
  onChange 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Ensure availability is always an array to prevent the includes error
  const safeAvailability = Array.isArray(availability) ? availability : [];

  // Get all days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1));
  };

  const days = getDaysInMonth(currentMonth);

  // Handle date selection
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    if (safeAvailability.includes(dateStr)) {
      onChange(safeAvailability.filter(d => d !== dateStr));
    } else {
      onChange([...safeAvailability, dateStr]);
    }
  };

  // Change month
  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button 
          type="button"
          onClick={() => changeMonth(-1)} 
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          &lt;
        </button>
        <span className="font-semibold text-lg text-gray-900">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </span>
        <button 
          type="button"
          onClick={() => changeMonth(1)} 
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          &gt;
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array(days[0].getDay()).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="w-10 h-10"></div>
        ))}
        {days.map(day => {
          const dateStr = formatDate(day);
          const isSelected = safeAvailability.includes(dateStr);
          const isToday = day.toDateString() === new Date().toDateString();
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
          
          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isPast 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : isSelected 
                    ? 'bg-[#FFD700] text-gray-900 shadow-md hover:shadow-lg' 
                    : isToday
                      ? 'bg-blue-100 text-blue-600 hover:bg-[#FFD700] hover:text-gray-900'
                      : 'bg-gray-50 text-gray-700 hover:bg-[#FFD700] hover:text-gray-900'
                }
              `}
              onClick={() => !isPast && handleDateClick(day)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Selected dates:</span>{' '}
          {safeAvailability.length > 0 ? (
            <span className="text-[#FFD700] font-medium">
              {safeAvailability.length} day{safeAvailability.length !== 1 ? 's' : ''} selected
            </span>
          ) : (
            <span className="text-gray-400">None selected</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;