import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Menu item name is required"],
			trim: true,
			minlength: [2, "Menu item name must be at least 2 characters"],
			maxlength: [120, "Menu item name cannot exceed 120 characters"],
		},
		price: {
			type: Number,
			required: [true, "Menu item price is required"],
			min: [0, "Price cannot be negative"],
		},
		category: {
			type: String,
			required: [true, "Menu category is required"],
			trim: true,
			maxlength: [50, "Menu category cannot exceed 50 characters"],
		},
		isVeg: {
			type: Boolean,
			default: false,
		},
		isJain: {
			type: Boolean,
			default: false,
		},
		// Each menu item belongs to one restaurant.
		restaurantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Restaurant",
			required: [true, "Restaurant reference is required"],
			index: true,
		},
		image: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

menuSchema.index({ restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", index: true } });

const Menu = mongoose.model("Menu", menuSchema);

export default Menu;
