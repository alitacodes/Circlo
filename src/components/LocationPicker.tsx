import React, { useState, useEffect } from "react";

interface LocationPickerProps {
  location: string; // This is the selected location
  onChange: (location: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ location = "", onChange }) => {
  const [query, setQuery] = useState(location); // The text currently in the input
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync the input's text if the parent's location changes
  useEffect(() => {
    if (location !== query) {
      setQuery(location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchSuggestions = async (q: string) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    setSuggestions(data.map((item: any) => item.display_name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
    setShowDropdown(true);
    // Always update the parent's state with the current input value
    onChange(val);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setQuery(suggestion); // Show the selected suggestion in the input
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query} // The input is always controlled by the internal `query` state
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Hide dropdown on blur
        placeholder="Search for a location..."
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-all shadow-sm hover:shadow-md"
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow max-h-48 overflow-y-auto mt-1">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              onClick={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationPicker; 