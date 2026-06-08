import dotenv from "dotenv";
import mongoose from "mongoose";
import Menu from "../models/menu.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/users.model.js";

dotenv.config();

const connectForSeed = async () => {
	if (!process.env.MONGO_URI) {
		throw new Error("MONGO_URI is missing in .env");
	}

	await mongoose.connect(process.env.MONGO_URI, {
		dbName: "RasoiDb",
	});
};

// 🔐 Admin - save this admin directly in the database
const admin = {
	fullName: "Rasoi Admin",
	email: "admin@rasoi.com",
	password: "123456789",
	mobile: "9999999999",
	role: "Admin",
	accountVerified: true,
};

const ownerSeed = [
	{
		fullName: "Andheri Spice Hub Owner",
		email: "owner.andheri@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000001",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Bandra Bites Owner",
		email: "owner.bandra@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000002",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Dadar Tadka Owner",
		email: "owner.dadar@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000003",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Colaba Coast Owner",
		email: "owner.colaba@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000004",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Powai Delight Owner",
		email: "owner.powai@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000005",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Borivali Treat Owner",
		email: "owner.borivali@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000006",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Kurla Kitchen Owner",
		email: "owner.kurla@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000007",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Vashi Vibes Owner",
		email: "owner.vashi@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000008",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Chembur Curry Owner",
		email: "owner.chembur@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000009",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Malad Meals Owner",
		email: "owner.malad@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000010",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Thane Feast Owner",
		email: "owner.thane@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000011",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Khar Kitchen Owner",
		email: "owner.khar@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000012",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Santacruz Spice Owner",
		email: "owner.santacruz@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000013",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Lower Parel Dining Owner",
		email: "owner.lowerparel@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000014",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Ghatkopar Street Owner",
		email: "owner.ghatkopar@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000015",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Mulund Meals Owner",
		email: "owner.mulund@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000016",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Worli Bay Owner",
		email: "owner.worli@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000017",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Marine Drive Cafe Owner",
		email: "owner.marinedrive@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000018",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Juhu Beach Bites Owner",
		email: "owner.juhu@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000019",
		role: "RestaurantOwner",
		accountVerified: true,
	},
	{
		fullName: "Navi Mumbai Hub Owner",
		email: "owner.navimumbai@rasoi.app",
		password: "Owner@12345",
		mobile: "9000000020",
		role: "RestaurantOwner",
		accountVerified: true,
	},
];

/* const restaurantSeed = [
	{
		name: "Punjabi Tadka",
		cuisineType: "North Indian",
		rating: 4.5,
		location: { lat: 28.6139, lng: 77.209 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "South Spice House",
		cuisineType: "South Indian",
		rating: 4.3,
		location: { lat: 12.9716, lng: 77.5946 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
	},
	{
		name: "Mumbai Street Bowl",
		cuisineType: "Fast Food",
		rating: 4.1,
		location: { lat: 19.076, lng: 72.8777 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
	},
]; */

/* const menuSeedFactory = (restaurants) => [
	{
		restaurantId: restaurants[0]._id,
		name: "Paneer Butter Masala",
		price: 289,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
	},
	{
		restaurantId: restaurants[0]._id,
		name: "Dal Makhani",
		price: 249,
		category: "Main Course",
		isVeg: true,
		isJain: true,
	},
	{
		restaurantId: restaurants[0]._id,
		name: "Butter Chicken",
		price: 349,
		category: "Main Course",
		isVeg: false,
		isJain: false,
	},
	{
		restaurantId: restaurants[1]._id,
		name: "Masala Dosa",
		price: 179,
		category: "Breakfast",
		isVeg: true,
		isJain: false,
	},
	{
		restaurantId: restaurants[1]._id,
		name: "Jain Uttapam",
		price: 199,
		category: "Breakfast",
		isVeg: true,
		isJain: true,
	},
	{
		restaurantId: restaurants[1]._id,
		name: "Chicken Chettinad",
		price: 329,
		category: "Main Course",
		isVeg: false,
		isJain: false,
	},
	{
		restaurantId: restaurants[2]._id,
		name: "Vada Pav",
		price: 89,
		category: "Snacks",
		isVeg: true,
		isJain: false,
	},
	{
		restaurantId: restaurants[2]._id,
		name: "Jain Bhel",
		price: 119,
		category: "Snacks",
		isVeg: true,
		isJain: true,
	},
	{
		restaurantId: restaurants[2]._id,
		name: "Chicken Kathi Roll",
		price: 199,
		category: "Rolls",
		isVeg: false,
		isJain: false,
	},
]; */

const restaurantSeed = [
	{
		name: "Andheri Spice Hub",
		cuisineType: "North Indian",
		rating: 4.4,
		location: { lat: 19.1136, lng: 72.8697 },
		isOpen: true,
		image: "https://d3h1lg3ksw6i6b.cloudfront.net/media/image/2016/10/25/d460622c56b24ee990936e157491fc3b_Veeraswamy.jpg",
	},
	{
		name: "Bandra Bites",
		cuisineType: "Italian",
		rating: 4.5,
		location: { lat: 19.0596, lng: 72.8295 },
		isOpen: true,
		image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/c4/cb/7d/authentic-italian-gathering.jpg?w=900&h=500&s=1",
	},
	{
		name: "Dadar Tadka",
		cuisineType: "Street Food",
		rating: 4.2,
		location: { lat: 19.0176, lng: 72.8562 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
	},
	{
		name: "Colaba Coast",
		cuisineType: "Seafood",
		rating: 4.6,
		location: { lat: 18.9067, lng: 72.8147 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee",
	},
	{
		name: "Powai Delight",
		cuisineType: "Chinese",
		rating: 4.3,
		location: { lat: 19.1176, lng: 72.906 },
		isOpen: true,
		image: "https://www.pagodared.com/blog/wp-content/uploads/2018/02/WonFun-InteriorPR-copy.jpg",
	},
	{
		name: "Borivali Treat",
		cuisineType: "Fast Food",
		rating: 4.1,
		location: { lat: 19.2307, lng: 72.8567 },
		isOpen: true,
		image: "https://assets.architecturaldigest.in/photos/671f4498bab720c3b573ea2e/16:9/w_2560%2Cc_limit/feature%2520image.jpg",
	},
	{
		name: "Kurla Kitchen",
		cuisineType: "Mughlai",
		rating: 4.3,
		location: { lat: 19.0728, lng: 72.8826 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Vashi Vibes",
		cuisineType: "South Indian",
		rating: 4.4,
		location: { lat: 19.0771, lng: 72.9986 },
		isOpen: true,
		image: "https://blog.karlrock.com/wp-content/uploads/2017/07/p2726-14639998865742dd8ebc217.jpg",
	},
	{
		name: "Chembur Curry",
		cuisineType: "North Indian",
		rating: 4.2,
		location: { lat: 19.0626, lng: 72.9011 },
		isOpen: true,
		image: "https://stores.thedasaprakash.com/wp-content/uploads/2024/06/WhatsApp-Image-2024-06-24-at-3.44.19-PM.jpeg",
	},
	{
		name: "Malad Meals",
		cuisineType: "Continental",
		rating: 4.3,
		location: { lat: 19.1864, lng: 72.8493 },
		isOpen: true,
		image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/73/76/d3/caption.jpg?w=900&h=500&s=1",
	},
	{
		name: "Thane Feast",
		cuisineType: "Indian",
		rating: 4.5,
		location: { lat: 19.2183, lng: 72.9781 },
		isOpen: true,
		image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/60/e5/07/second-floor-dining-area.jpg?w=900&h=500&s=1",
	},
	{
		name: "Khar Kitchen",
		cuisineType: "Mexican",
		rating: 4.1,
		location: { lat: 19.0728, lng: 72.8265 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
	},
	{
		name: "Santacruz Spice",
		cuisineType: "Thai",
		rating: 4.2,
		location: { lat: 19.081, lng: 72.8417 },
		isOpen: true,
		image:
			"https://img-cdn.publive.online/fit-in/1280x720/filters:format(webp)/elle-india/media/post_attachments/wp-content/uploads/2024/08/BANNER-IMG-2024-08-23T145018.355.png",
	},
	{
		name: "Lower Parel Dining",
		cuisineType: "Fine Dining",
		rating: 4.6,
		location: { lat: 18.9988, lng: 72.83 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
	},
	{
		name: "Ghatkopar Street",
		cuisineType: "Street Food",
		rating: 4.0,
		location: { lat: 19.085, lng: 72.908 },
		isOpen: true,
		image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
	},
	{
		name: "Mulund Meals",
		cuisineType: "Gujarati",
		rating: 4.3,
		location: { lat: 19.1726, lng: 72.9425 },
		isOpen: true,
		image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/e3/58/cf/india-king-r-indian-restaurant.jpg?w=900&h=500&s=1",
	},
	{
		name: "Worli Bay",
		cuisineType: "Seafood",
		rating: 4.5,
		location: { lat: 19.0176, lng: 72.8181 },
		isOpen: true,
		image: "https://quark-studio.com/wp-content/uploads/2019/07/DijlahVillage-2-uai-1280x853.jpg",
	},
	{
		name: "Marine Drive Cafe",
		cuisineType: "Cafe",
		rating: 4.7,
		location: { lat: 18.943, lng: 72.8238 },
		isOpen: true,
		image: "https://ansainteriors.com/wp-content/uploads/2019/11/cafe-interior-design.jpg",
	},
	{
		name: "Juhu Beach Bites",
		cuisineType: "Snacks",
		rating: 4.4,
		location: { lat: 19.1075, lng: 72.8263 },
		isOpen: true,
		image:
			"https://assets.cntraveller.in/photos/62833755b4ee3e5281042f29/master/w_1600%2Cc_limit/Koishii%2520at%2520The%2520Penthouse%2C%2520Level%252037%2C%2520St.%2520Regis%2C%2520Mumbai%2520(3).jpg",
	},
	{
		name: "Navi Mumbai Hub",
		cuisineType: "Multi Cuisine",
		rating: 4.3,
		location: { lat: 19.033, lng: 73.0297 },
		isOpen: true,
		image: "https://www.hoteltheroyalplaza.com/images/dinebanner3.jpg",
	},
];

const northIndianMenu = [
	{
		name: "Paneer Butter Masala",
		price: 289,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
	},
	{
		name: "Dal Makhani",
		price: 249,
		category: "Main Course",
		isVeg: true,
		isJain: true,
		image: "https://www.cookwithmanali.com/wp-content/uploads/2019/04/Restaurant-Style-Dal-Makhani-500x500.jpg",
	},
	{
		name: "Butter Chicken",
		price: 349,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
	},
	{
		name: "Chole Bhature",
		price: 199,
		category: "Breakfast",
		isVeg: true,
		isJain: false,
		image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8swU8bZ2QBXg15bygXH4_JMAFwd_cxjhyWw&s",
	},
	{
		name: "Aloo Paratha",
		price: 149,
		category: "Breakfast",
		isVeg: true,
		isJain: false,
		image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2020/08/aloo-paratha-recipe.jpg",
	},
	{
		name: "Paneer Tikka",
		price: 259,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
	},
	{
		name: "Chicken Tikka",
		price: 299,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Veg Thali",
		price: 299,
		category: "Lunch",
		isVeg: true,
		isJain: false,
		image:
			"https://content.jdmagicbox.com/v2/comp/mumbai/k9/022pxx22.xx22.220811094333.w9k9/catalogue/the-royal-thali-pure-veg-andheri-east-mumbai-north-indian-delivery-restaurants-y6dsqh4upa.jpg",
	},
	{
		name: "Chicken Biryani",
		price: 319,
		category: "Lunch",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec",
	},
	{
		name: "Tandoori Roti",
		price: 39,
		category: "Bread",
		isVeg: true,
		isJain: true,
		image: "https://www.indianrecipeinfo.com/wp-content/uploads/2011/12/Tandoori-Roti.jpg",
	},
	{
		name: "Naan",
		price: 59,
		category: "Bread",
		isVeg: true,
		isJain: true,
		image: "https://www.pachakam.com/wp-content/uploads/2009/05/new-butter-naan-500x375.jpg",
	},
	{
		name: "Jeera Rice",
		price: 149,
		category: "Main Course",
		isVeg: true,
		isJain: true,
		image: "https://palatesdesire.com/wp-content/uploads/2019/02/Jeera-_rice_Restaurant@palates_desire-scaled.jpg",
	},
	{
		name: "Rajma Chawal",
		price: 199,
		category: "Lunch",
		isVeg: true,
		isJain: false,
		image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9itaiPc8nM1_CprPv387wUWanz5GMzF8S4g&s",
	},
	{
		name: "Lassi",
		price: 99,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://cdn.uengage.io/uploads/28289/image-2PRPYP-1767352241.jpg",
	},
	{
		name: "Gulab Jamun",
		price: 109,
		category: "Dessert",
		isVeg: true,
		isJain: true,
		image: "https://www.vegrecipesofindia.com/wp-content/uploads/2022/10/gulab-jamun-recipe-01.jpg",
	},
	{
		name: "Rasgulla",
		price: 99,
		category: "Dessert",
		isVeg: true,
		isJain: true,
		image: "https://exotikalhub.com/wp-content/uploads/2022/09/rasgulla.jpg",
	},
	{
		name: "Paneer Lababdar",
		price: 279,
		category: "Dinner",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
	},
	{
		name: "Chicken Curry",
		price: 299,
		category: "Dinner",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
	},
	{
		name: "Samosa",
		price: 49,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{ name: "Papad", price: 29, category: "Snacks", isVeg: true, isJain: true, image: "https://chandravilas.com/wp-content/uploads/2022/09/1.jpg" },
];

const italianMenu = [
	{
		name: "Margherita Pizza",
		price: 299,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://lilluna.com/wp-content/uploads/2025/10/margherita-pizza-resize-8-1.jpg",
	},
	{
		name: "Farmhouse Pizza",
		price: 349,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image:
			"https://images.raasakarts.com/insecure/fit/1000/1000/ce/0/plain/https://rasakart-assets.s3.ap-south-1.amazonaws.com/3fa229/prods/BBIrfQULepacqA8jkktm7OffO7p1ph1MavlZ58TF.jpg@webp",
	},
	{
		name: "Pepperoni Pizza",
		price: 399,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image:
			"https://static.wixstatic.com/media/597497_39dfa709d3d845eeaf43eb692e93b31b~mv2.jpg/v1/fill/w_6240,h_4160,al_c,q_90/Pepperoni%20Pizza_1_compressed.jpg",
	},
	{
		name: "White Sauce Pasta",
		price: 279,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
	},
	{
		name: "Red Sauce Pasta",
		price: 259,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_960,w_960//InstamartAssets/1/red_sauce_pasta.webp",
	},
	{
		name: "Lasagna",
		price: 349,
		category: "Dinner",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
	},
	{
		name: "Garlic Bread",
		price: 129,
		category: "Starter",
		isVeg: true,
		isJain: true,
		image:
			"https://stordfkenticomedia.blob.core.windows.net/df-us/rms/media/recipemediafiles/recipe%20images%20and%20files/retail/desktop%20(600x600)/2024.nov/2024_df_ultra-cheesy-garlic-bread_600x600.jpg?ext=.jpg",
	},
	{
		name: "Bruschetta",
		price: 179,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add",
	},
	{
		name: "Risotto",
		price: 329,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Spaghetti Carbonara",
		price: 379,
		category: "Dinner",
		isVeg: false,
		isJain: false,
		image: "https://fibercreme.com/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-29-at-17.04.02-2-scaled-e1746504545588.webp",
	},
	{
		name: "Tiramisu",
		price: 199,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
	},
	{
		name: "Panna Cotta",
		price: 189,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Cold Coffee",
		price: 129,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
	},
	{
		name: "Lemonade",
		price: 99,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
	},
	{
		name: "Veg Pizza Slice",
		price: 149,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://c8.alamy.com/comp/R7G1MR/slice-of-fresh-italian-classic-original-vegetarian-pizza-isolated-on-white-background-R7G1MR.jpg",
	},
	{
		name: "Chicken Pizza Slice",
		price: 179,
		category: "Snacks",
		isVeg: false,
		isJain: false,
		image: "https://www.alaskafromscratch.com/wp-content/uploads/2013/06/IMG_7167.jpg",
	},
	{
		name: "Mushroom Soup",
		price: 149,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Grilled Chicken",
		price: 399,
		category: "Dinner",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1553621042-f6e147245754",
	},
	{
		name: "Cheese Balls",
		price: 199,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
	},
	{
		name: "French Fries",
		price: 129,
		category: "Snacks",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1550547660-d9450f859349",
	},
];

const chineseMenu = [
	{
		name: "Veg Hakka Noodles",
		price: 189,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
	},
	{
		name: "Chicken Hakka Noodles",
		price: 229,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Veg Fried Rice",
		price: 179,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://iwantimages.s3.amazonaws.com/wp-content/uploads/2020/06/19001245/veg-fried-rice-recipe.jpg",
	},
	{
		name: "Chicken Fried Rice",
		price: 219,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Paneer Chilli",
		price: 239,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
	},
	{
		name: "Chicken Chilli",
		price: 269,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Spring Rolls",
		price: 149,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Chicken Spring Rolls",
		price: 179,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Manchurian (Veg)",
		price: 199,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Manchurian (Chicken)",
		price: 249,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Schezwan Noodles",
		price: 209,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
	},
	{
		name: "Hot & Sour Soup",
		price: 129,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Sweet Corn Soup",
		price: 119,
		category: "Starter",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Chicken Soup",
		price: 149,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Chilli Garlic Noodles",
		price: 199,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
	},
	{
		name: "Dragon Chicken",
		price: 279,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Veg Momos",
		price: 139,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Chicken Momos",
		price: 169,
		category: "Snacks",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Cold Drink",
		price: 60,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
	},
	{
		name: "Ice Cream",
		price: 120,
		category: "Dessert",
		isVeg: true,
		isJain: true,
		image:
			"https://www.southernliving.com/thmb/EBBY00OUG-AgOn3N1lANR0JkaFI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Strawberry_Shortcake_IceCream_010-0820b2a72950463999a5ce1723c12c2c.jpg",
	},
];

const mexicanMenu = [
	{
		name: "Veg Tacos",
		price: 199,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
	},
	{
		name: "Chicken Tacos",
		price: 249,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924582975-7d1e8f8f3c6f",
	},
	{
		name: "Nachos",
		price: 179,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Loaded Nachos",
		price: 229,
		category: "Snacks",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Veg Burrito",
		price: 239,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Chicken Burrito",
		price: 279,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Quesadilla",
		price: 219,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924582975-7d1e8f8f3c6f",
	},
	{
		name: "Chicken Quesadilla",
		price: 259,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924582975-7d1e8f8f3c6f",
	},
	{
		name: "Mexican Rice",
		price: 199,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Churros",
		price: 149,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5",
	},
	{
		name: "Chocolate Churros",
		price: 179,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5",
	},
	{
		name: "Mexican Salad",
		price: 149,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
	},
	{
		name: "Chicken Salad",
		price: 199,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
	},
	{
		name: "Corn Chips",
		price: 99,
		category: "Snacks",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1601924638867-3ec2d1a1d67f",
	},
	{
		name: "Veg Wrap",
		price: 149,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1628294896533-7c2f5b6a91b0",
	},
	{
		name: "Chicken Wrap",
		price: 179,
		category: "Snacks",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1628294896533-7c2f5b6a91b0",
	},
	{
		name: "Cold Coffee",
		price: 129,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
	},
	{
		name: "Lemon Soda",
		price: 99,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
	},
	{
		name: "Brownie",
		price: 149,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c",
	},
	{
		name: "Ice Cream",
		price: 170,
		category: "Dessert",
		isVeg: true,
		isJain: true,
		image: "https://www.nestleprofessional.in/sites/default/files/2024-10/Coconut-Ice-cream-756x471_5_11zon.jpg",
	},
];

const thaiMenu = [
	{
		name: "Pad Thai",
		price: 299,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Chicken Pad Thai",
		price: 339,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
	},
	{
		name: "Green Curry",
		price: 289,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
	},
	{
		name: "Chicken Green Curry",
		price: 329,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
	},
	{
		name: "Red Curry",
		price: 289,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
	},
	{
		name: "Thai Fried Rice",
		price: 219,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908177225-6c9c6e0d2d0f",
	},
	{
		name: "Chicken Thai Rice",
		price: 259,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1604908177225-6c9c6e0d2d0f",
	},
	{
		name: "Tom Yum Soup",
		price: 149,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Veg Soup",
		price: 129,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1547592180-85f173990554",
	},
	{
		name: "Spring Rolls",
		price: 149,
		category: "Starter",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Chicken Satay",
		price: 279,
		category: "Starter",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1553621042-f6e147245754",
	},
	{
		name: "Thai Noodles",
		price: 219,
		category: "Main Course",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
	},
	{
		name: "Chicken Noodles",
		price: 259,
		category: "Main Course",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
	},
	{
		name: "Mango Sticky Rice",
		price: 199,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1598514982757-45d2b47bba3e",
	},
	{
		name: "Thai Tea",
		price: 129,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
	},
	{
		name: "Coconut Water",
		price: 99,
		category: "Beverages",
		isVeg: true,
		isJain: true,
		image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc",
	},
	{
		name: "Fried Banana",
		price: 149,
		category: "Dessert",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1589712235278-5c91f99d2f8b",
	},
	{
		name: "Veg Dumplings",
		price: 159,
		category: "Snacks",
		isVeg: true,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Chicken Dumplings",
		price: 189,
		category: "Snacks",
		isVeg: false,
		isJain: false,
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
	},
	{
		name: "Ice Cream",
		price: 150,
		category: "Dessert",
		isVeg: true,
		isJain: true,
		image: "https://www.keep-calm-and-eat-ice-cream.com/wp-content/uploads/2023/09/Rainbow-ice-cream-hero-10.jpg",
	},
];

const menuMap = {
	"North Indian": northIndianMenu,
	Indian: northIndianMenu,
	Mughlai: northIndianMenu,
	Italian: italianMenu,
	Chinese: chineseMenu,
	Mexican: mexicanMenu,
	Thai: thaiMenu,
	"Street Food": northIndianMenu,
	Cafe: italianMenu,
	Continental: italianMenu,
	Seafood: chineseMenu,
	Gujarati: northIndianMenu,
	Snacks: northIndianMenu,
	"Multi Cuisine": [...northIndianMenu, ...chineseMenu.slice(0, 5)],
};

const menuSeedFactory = (restaurants) => {
	const menu = [];

	restaurants.forEach((restaurant) => {
		const items = menuMap[restaurant.cuisineType] || northIndianMenu;

		items.slice(0, 20).forEach((item) => {
			menu.push({
				restaurantId: restaurant._id,
				...item,
			});
		});
	});

	return menu;
};

/* const seedHomeData = async () => {
	await connectForSeed();

	console.log("Connected to MongoDB. Seeding home data...");

	// Keeps the environment deterministic for API/UI checks.
	await Promise.all([
		Menu.deleteMany({}),
		Restaurant.deleteMany({}),
		User.deleteMany({
			email: {
				$in: ownerSeed.map((owner) => owner.email),
			},
		}),
	]);

	const owners = [];
	for (const ownerData of ownerSeed) {
		const owner = await User.create(ownerData);
		owners.push(owner);
	}

	const restaurantPayload = restaurantSeed.map((restaurant, index) => ({
		...restaurant,
		owner: owners[index]._id,
	}));

	const restaurants = await Restaurant.insertMany(restaurantPayload);
	await Menu.insertMany(menuSeedFactory(restaurants));

	console.log("Seed completed successfully.");
	console.log(
		"Created:",
		JSON.stringify(
			{
				owners: owners.length,
				restaurants: restaurants.length,
				menuItems: 9,
			},
			null,
			2,
		),
	);
}; */

const seedHomeData = async () => {
	await connectForSeed();

	console.log("Connected to MongoDB. Seeding home data...");

	// 🧹 Drop collections safely (avoids E11000 index issues)
	await mongoose.connection.db.dropCollection("menus").catch(() => {});
	await mongoose.connection.db.dropCollection("restaurants").catch(() => {});

	// 🧹 Clean DB
	await Promise.all([
		Menu.deleteMany({}),
		Restaurant.deleteMany({}),
		User.deleteMany({
			email: {
				$in: ownerSeed.map((owner) => owner.email),
			},
		}),
	]);

	// ⚡ Create owners in parallel
	const owners = await User.insertMany(ownerSeed);

	// 🛑 Safety check (VERY IMPORTANT)
	if (owners.length < restaurantSeed.length) {
		throw new Error("Owners count is less than restaurants. Mapping will break.");
	}

	// 🔗 Map owners → restaurants
	const restaurantPayload = restaurantSeed.map((restaurant, index) => ({
		...restaurant,
		owner: owners[index]._id,
	}));

	const restaurants = await Restaurant.insertMany(restaurantPayload);

	// 🍽️ Insert menu
	const menuData = menuSeedFactory(restaurants);
	await Menu.insertMany(menuData);

	// 📊 Logs
	console.log("Seed completed successfully.");
	console.log(
		"Created:",
		JSON.stringify(
			{
				owners: owners.length,
				restaurants: restaurants.length,
				menuItems: menuData.length, // ✅ dynamic
			},
			null,
			2,
		),
	);
};

seedHomeData()
	.then(async () => {
		await mongoose.disconnect();
		process.exit(0);
	})
	.catch(async (error) => {
		console.error("Seed failed:", error.message);
		await mongoose.disconnect();
		process.exit(1);
	});
