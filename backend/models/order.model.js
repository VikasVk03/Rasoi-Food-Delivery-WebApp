import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
	{
		// itemId points to a menu item snapshot reference.
		itemId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Menu",
			required: [true, "Ordered item reference is required"],
		},
		quantity: {
			type: Number,
			required: [true, "Item quantity is required"],
			min: [1, "Quantity must be at least 1"],
		},
	},
	{ _id: false },
);

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User reference is required"],
			index: true,
		},
		restaurantId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Restaurant",
			required: [true, "Restaurant reference is required"],
			index: true,
		},
		// Flexible array of order lines with quantity per menu item.
		items: {
			type: [orderItemSchema],
			validate: {
				validator: (value) => Array.isArray(value) && value.length > 0,
				message: "Order must contain at least one item",
			},
			required: [true, "Order items are required"],
		},
		totalPrice: {
			type: Number,
			required: [true, "Total price is required"],
			min: [0, "Total price cannot be negative"],
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "preparing", "ready", "picked", "delivered", "rejected"],
			default: "pending",
			required: true,
		},
		deliveryBoyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		deliveryLocation: {
			lat: {
				type: Number,
				required: [true, "Delivery latitude is required"],
				min: [-90, "Latitude must be between -90 and 90"],
				max: [90, "Latitude must be between -90 and 90"],
			},
			lng: {
				type: Number,
				required: [true, "Delivery longitude is required"],
				min: [-180, "Longitude must be between -180 and 180"],
				max: [180, "Longitude must be between -180 and 180"],
			},
		},
		deliveryAddress: {
			type: String,
			required: [true, "Delivery address is required"],
			trim: true,
			maxlength: [250, "Delivery address cannot exceed 250 characters"],
		},
		restaurantLocation: {
			lat: {
				type: Number,
				required: [true, "Restaurant latitude is required"],
			},
			lng: {
				type: Number,
				required: [true, "Restaurant longitude is required"],
			},
		},
		deliveryBoyLocation: {
			lat: {
				type: Number,
			},
			lng: {
				type: Number,
			},
			updatedAt: {
				type: Date,
			},
		},
		routePath: {
			type: [
				{
					lat: Number,
					lng: Number,
				},
			],
			default: [],
		},
		deliveredAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
