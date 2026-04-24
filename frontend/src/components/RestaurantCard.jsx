import React from "react";

const fallbackImage =
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80";

const RestaurantCard = ({ restaurant }) => {
  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <img
        src={restaurant.image || fallbackImage}
        alt={restaurant.name}
        className="h-40 w-full object-cover"
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
          <span className="text-sm font-medium bg-green-100 text-green-700 px-2 py-1 rounded-md">
            {Number(restaurant.rating || 0).toFixed(1)} ★
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1">{restaurant.cuisineType}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {(restaurant.menuPreview || []).slice(0, 3).map((item) => (
            <span
              key={item._id}
              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
            >
              {item.name}
            </span>
          ))}
          {!restaurant.menuPreview?.length && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              No menu preview available
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default RestaurantCard;
