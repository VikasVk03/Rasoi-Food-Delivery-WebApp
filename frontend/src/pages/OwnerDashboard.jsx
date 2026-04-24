import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import TopNav from "../components/TopNav";
import { Context } from "../main";

const defaultForm = {
	name: "",
	price: "",
	category: "",
	isVeg: false,
	isJain: false,
	image: "",
};

const OwnerDashboard = () => {
	const { isAuthenticated, user } = useContext(Context);
	const navigate = useNavigate();
	const [data, setData] = useState({ restaurant: null, menuItems: [], orders: [] });
	const [loading, setLoading] = useState(true);
	const [form, setForm] = useState(defaultForm);

	const fetchDashboard = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${serverUrl}/api/owner/dashboard`, {
				withCredentials: true,
			});
			setData(response.data);
		} catch (error) {
			if (error.response?.status === 404) {
				navigate("/owner/setup");
				return;
			}
			toast.error(error.response?.data?.message || "Failed to load owner dashboard");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}
		if (user?.role !== "RestaurantOwner") {
			navigate("/");
			return;
		}
		fetchDashboard();
	}, [isAuthenticated, navigate, user]);

	const createMenu = async () => {
		try {
			await axios.post(`${serverUrl}/api/owner/menu`, { ...form, price: Number(form.price) }, { withCredentials: true });
			toast.success("Menu item created");
			setForm(defaultForm);
			fetchDashboard();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create menu item");
		}
	};

	const deleteMenu = async (menuId) => {
		try {
			await axios.delete(`${serverUrl}/api/owner/menu/${menuId}`, {
				withCredentials: true,
			});
			toast.success("Menu item deleted");
			fetchDashboard();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to delete menu item");
		}
	};

	const updateOrderStatus = async (orderId, status) => {
		try {
			await axios.patch(`${serverUrl}/api/owner/orders/${orderId}/status`, { status }, { withCredentials: true });
			toast.success(`Order ${status}`);
			fetchDashboard();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update order");
		}
	};

	const nextActionsByStatus = {
		pending: [
			{ label: "Accept", value: "accepted", className: "bg-green-600" },
			{ label: "Reject", value: "rejected", className: "bg-red-600" },
		],
		accepted: [
			{ label: "Preparing", value: "preparing", className: "bg-yellow-600" },
			{ label: "Reject", value: "rejected", className: "bg-red-600" },
		],
		preparing: [
			{ label: "Ready", value: "ready", className: "bg-blue-600" },
			{ label: "Reject", value: "rejected", className: "bg-red-600" },
		],
	};

	const kpis = [
		{
			title: "Total Sales",
			value: `₹ ${Number(data.insights?.totalSales || 0).toFixed(2)}`,
		},
		{
			title: "Orders",
			value: data.insights?.totalDeliveredOrders || 0,
		},
		{
			title: "Avg Order",
			value: `₹ ${(data.insights?.totalSales / data.insights?.totalDeliveredOrders || 0).toFixed(2)}`,
		},
		{
			title: "Active Orders",
			value: data.orders?.length || 0,
		},
	];

	return (
		<main className="min-h-screen bg-[#fff9f6]">
			<TopNav title="Restaurant Owner Dashboard" />
			<section className="max-w-6xl mx-auto px-4 py-6">
				{loading ? (
					<p>Loading dashboard...</p>
				) : (
					<>
						<div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
							<h2 className="font-semibold text-lg">{data.restaurant?.name || "My Restaurant"}</h2>
							<p className="text-sm text-gray-500">{data.restaurant?.cuisineType}</p>
							<p className="text-sm text-gray-600 mt-2">
								Delivered: {data.insights?.totalDeliveredOrders || 0} | Sales: Rs {Number(data.insights?.totalSales || 0).toFixed(2)}
							</p>
						</div>

						<div className="grid lg:grid-cols-2 gap-6">
							<div className="bg-white border border-gray-100 rounded-xl p-4">
								<h3 className="font-semibold mb-4">Food CRUD</h3>
								<div className="grid gap-2">
									<input
										className="border border-gray-200 rounded-lg px-3 py-2"
										placeholder="Name"
										value={form.name}
										onChange={(event) => setForm({ ...form, name: event.target.value })}
									/>
									<input
										className="border border-gray-200 rounded-lg px-3 py-2"
										placeholder="Price"
										type="number"
										value={form.price}
										onChange={(event) => setForm({ ...form, price: event.target.value })}
									/>
									<input
										className="border border-gray-200 rounded-lg px-3 py-2"
										placeholder="Category"
										value={form.category}
										onChange={(event) => setForm({ ...form, category: event.target.value })}
									/>
									<input
										className="border border-gray-200 rounded-lg px-3 py-2"
										placeholder="Image URL (optional)"
										value={form.image}
										onChange={(event) => setForm({ ...form, image: event.target.value })}
									/>
									<div className="flex gap-4 text-sm">
										<label className="flex items-center gap-2">
											<input type="checkbox" checked={form.isVeg} onChange={(event) => setForm({ ...form, isVeg: event.target.checked })} />
											Veg
										</label>
										<label className="flex items-center gap-2">
											<input type="checkbox" checked={form.isJain} onChange={(event) => setForm({ ...form, isJain: event.target.checked })} />
											Jain
										</label>
									</div>
									<button type="button" className="bg-[#ff4d2d] text-white rounded-lg py-2 cursor-pointer" onClick={createMenu}>
										Add Food Item
									</button>
								</div>

								<div className="mt-4 space-y-2 max-h-80 overflow-auto">
									{data.menuItems?.map((item) => (
										<div key={item._id} className="border border-gray-100 rounded-lg p-3 flex justify-between gap-3">
											<div>
												<p className="font-medium">{item.name}</p>
												<p className="text-xs text-gray-500">
													Rs {item.price} | {item.category}
												</p>
											</div>
											<button type="button" className="text-sm text-red-600 cursor-pointer" onClick={() => deleteMenu(item._id)}>
												Delete
											</button>
										</div>
									))}
								</div>
							</div>

							<div className="bg-white border border-gray-100 rounded-xl p-4">
								<h3 className="font-semibold mb-4">Incoming Orders</h3>
								<div className="space-y-3 max-h-136 overflow-auto">
									{data.orders?.map((order) => (
										<div key={order._id} className="border border-gray-100 rounded-lg p-3">
											<p className="text-sm font-medium">Order #{order._id.slice(-6)}</p>
											<p className="text-xs text-gray-500">
												{order.userId?.fullName} | Rs {order.totalPrice}
											</p>
											<p className="text-xs mt-1">Status: {order.status}</p>
											<div className="mt-2 flex gap-2">
												{(nextActionsByStatus[order.status] || []).map((action) => (
													<button
														key={action.value}
														type="button"
														className={`px-3 py-1 rounded-md text-white text-xs cursor-pointer ${action.className}`}
														onClick={() => updateOrderStatus(order._id, action.value)}
													>
														{action.label}
													</button>
												))}
											</div>
										</div>
									))}
									{!data.orders?.length && <p className="text-sm text-gray-500">No orders yet.</p>}
								</div>
							</div>
						</div>
						<div className="bg-white border border-gray-100 rounded-xl p-4 mt-6">
							<h3 className="font-semibold mb-3">Sales Insights (Delivered Orders)</h3>
							<div className="space-y-2">
								{(data.insights?.daily || []).map((item) => (
									<div key={item.day} className="text-xs">
										<div className="flex justify-between">
											<span>{item.day}</span>
											<span>
												Rs {Number(item.sales).toFixed(2)} ({item.orders} orders)
											</span>
										</div>
										<div className="h-2 rounded bg-gray-100 mt-1">
											<div
												className="h-2 rounded bg-[#ff4d2d]"
												style={{
													width: `${Math.max(
														(Number(item.sales || 0) / Math.max(...(data.insights?.daily || []).map((d) => Number(d.sales || 0)), 1)) * 100,
														4,
													)}%`,
												}}
											/>
										</div>
									</div>
								))}

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									{kpis.map((kpi) => (
										<div key={kpi.title} className="bg-white p-4 rounded-xl shadow-sm">
											<p className="text-xs text-gray-500">{kpi.title}</p>
											<h2 className="text-xl font-bold mt-1">{kpi.value}</h2>
										</div>
									))}
								</div>
								{!data.insights?.daily?.length && <p className="text-sm text-gray-500">No delivered data available yet.</p>}
                
							</div>
						</div>
					</>
				)}
			</section>
		</main>
	);
};

export default OwnerDashboard;
