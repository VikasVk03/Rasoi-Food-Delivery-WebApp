import React from "react";

const MenuCard = ({ item, onAdd, disabled }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <img
        src={
          item.image ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
        }
        alt={item.name}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-900">{item.name}</h4>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
        <span className="font-semibold text-orange-600">Rs {item.price}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded-full  bg-green-50 text-green-700 ${item.isVeg ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {item.isVeg ? "Veg" : "Non-Veg"}
        </span>
        {item.isJain && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
            Jain
          </span>
        )}
      </div>

      {onAdd && (
        <button
          type="button"
          onClick={() => onAdd(item)}
          disabled={disabled}
          className="mt-3 w-full px-3 py-2 rounded-lg bg-[#ff4d2d] text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
        >
          Add to Cart
        </button>
      )}
    </div>
  );
};

export default MenuCard;
