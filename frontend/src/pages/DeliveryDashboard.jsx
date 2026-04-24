import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import TopNav from "../components/TopNav";
import DeliveryMap from "../components/DeliveryMap";
import { Context } from "../main";
import { getSocket } from "../socket";
import EarningsChart from "../components/EarningsChart";

const DeliveryDashboard = () => {
	const { isAuthenticated, user } = useContext(Context);
	const navigate = useNavigate();
	const [data, setData] = useState({ availableOrders: [], myDeliveries: [] });
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [tracking, setTracking] = useState(null);

	const daily = data.earningsInsights?.daily || [];

	const best = daily.reduce((a, b) => (b.earning > (a?.earning || 0) ? b : a), null);

	const avg = daily.reduce((sum, d) => sum + Number(d.earning || 0), 0) / (daily.length || 1);

	const fetchDashboard = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${serverUrl}/api/delivery/dashboard`, {
				withCredentials: true,
			});
			setData(response.data);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to load delivery dashboard");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}
		if (user?.role !== "DeliveryBoy") {
			navigate("/");
			return;
		}
		fetchDashboard();
	}, [isAuthenticated, navigate, user]);

	const activeOrders = useMemo(() => [...(data.myDeliveries || []), ...(data.availableOrders || [])], [data]);

	useEffect(() => {
		if (!selectedOrder && activeOrders.length) {
			setSelectedOrder(activeOrders[0]);
		}
	}, [activeOrders, selectedOrder]);

	useEffect(() => {
		if (!selectedOrder?._id) return undefined;
		const socket = getSocket();
		socket.emit("tracking:join", { orderId: selectedOrder._id });
		const onTracking = (payload) => {
			if (String(payload.orderId) !== String(selectedOrder._id)) return;
			setTracking((previous) => ({ ...(previous || {}), ...payload }));
		};
		socket.on("order:tracking:update", onTracking);
		return () => {
			socket.emit("tracking:leave", { orderId: selectedOrder._id });
			socket.off("order:tracking:update", onTracking);
		};
	}, [selectedOrder?._id]);

	const acceptOrder = async (orderId) => {
		try {
			await axios.patch(`${serverUrl}/api/delivery/orders/${orderId}/accept`, {}, { withCredentials: true });
			toast.success("Order accepted for delivery");
			fetchDashboard();
		} catch (error) {
			toast.error(error.response?.data?.message || "Could not accept order");
		}
	};

	const markDelivered = async (orderId) => {
		try {
			await axios.patch(`${serverUrl}/api/delivery/orders/${orderId}/delivered`, {}, { withCredentials: true });
			toast.success("Order marked delivered");
			fetchDashboard();
		} catch (error) {
			toast.error(error.response?.data?.message || "Could not update delivery");
		}
	};

	const updateLiveLocation = async (orderId) => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported");
			return;
		}
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					await axios.patch(
						`${serverUrl}/api/delivery/orders/${orderId}/live-location`,
						{
							lat: Number(position.coords.latitude.toFixed(6)),
							lng: Number(position.coords.longitude.toFixed(6)),
						},
						{ withCredentials: true },
					);
					const trackingResponse = await axios.get(`${serverUrl}/api/orders/${orderId}/tracking`, {
						withCredentials: true,
					});
					setTracking(trackingResponse.data.tracking);
					toast.success("Live location updated");
				} catch (error) {
					toast.error(error.response?.data?.message || "Unable to update location");
				}
			},
			() => toast.error("Unable to capture location"),
		);
	};

	return (
		<main className="min-h-screen bg-[#fff9f6]">
			<TopNav title="DeliveryBoy Dashboard" />
			<section className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
				<div className="bg-white border border-gray-100 rounded-xl p-4">
					<h2 className="font-semibold mb-3">Orders for Delivery</h2>
					{loading ? (
						<p>Loading orders...</p>
					) : (
						<div className="space-y-3 max-h-136 overflow-auto">
							{activeOrders.map((order) => (
								<div key={order._id} className="border border-gray-100 rounded-lg p-3 cursor-pointer" onClick={() => setSelectedOrder(order)}>
									<p className="font-medium text-sm">{order.restaurantId?.name}</p>
									<p className="text-xs text-gray-500">
										Customer: {order.userId?.fullName} | Rs {order.totalPrice}
									</p>
									<p className="text-xs mt-1">Status: {order.status}</p>
									<div className="mt-2 flex gap-2">
										{!order.deliveryBoyId && (
											<button
												type="button"
												className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white cursor-pointer"
												onClick={(event) => {
													event.stopPropagation();
													acceptOrder(order._id);
												}}
											>
												Accept
											</button>
										)}
										{order.status === "picked" && (
											<>
												<button
													type="button"
													className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white cursor-pointer"
													onClick={(event) => {
														event.stopPropagation();
														updateLiveLocation(order._id);
													}}
												>
													Update Live Location
												</button>
												<button
													type="button"
													className="px-3 py-1 text-xs rounded-md bg-green-600 text-white cursor-pointer"
													onClick={(event) => {
														event.stopPropagation();
														markDelivered(order._id);
													}}
												>
													Mark Delivered
												</button>
											</>
										)}
									</div>
								</div>
							))}
							{!activeOrders.length && <p className="text-sm text-gray-500">No delivery orders right now.</p>}
						</div>
					)}
				</div>

				<div className="bg-white border border-gray-100 rounded-xl p-4">
					<h2 className="font-semibold mb-3">Delivery Location Map</h2>
					{selectedOrder?.deliveryLocation ? (
						<DeliveryMap
							lat={Number((tracking || selectedOrder).deliveryLocation?.lat || selectedOrder.deliveryLocation.lat)}
							lng={Number((tracking || selectedOrder).deliveryLocation?.lng || selectedOrder.deliveryLocation.lng)}
							markers={[
								{
									label: "Customer",
									lat: Number((tracking || selectedOrder).deliveryLocation?.lat || selectedOrder.deliveryLocation.lat),
									lng: Number((tracking || selectedOrder).deliveryLocation?.lng || selectedOrder.deliveryLocation.lng),
								},
								{
									label: "Restaurant",
									lat: Number(
										(tracking || selectedOrder).restaurantLocation?.lat ||
											selectedOrder.restaurantLocation?.lat ||
											selectedOrder.deliveryLocation.lat,
									),
									lng: Number(
										(tracking || selectedOrder).restaurantLocation?.lng ||
											selectedOrder.restaurantLocation?.lng ||
											selectedOrder.deliveryLocation.lng,
									),
								},
								...((tracking || selectedOrder).deliveryBoyLocation?.lat !== undefined
									? [
											{
												label: "Delivery Boy",
												lat: Number((tracking || selectedOrder).deliveryBoyLocation.lat),
												lng: Number((tracking || selectedOrder).deliveryBoyLocation.lng),
											},
										]
									: []),
							]}
							routePath={(tracking || selectedOrder).routePath || []}
						/>
					) : (
						<p className="text-sm text-gray-500">Select an order to view location.</p>
					)}
				</div>
			</section>
			<section className="max-w-6xl mx-auto px-4 pb-8">
				<div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
					{/* HEADER */}
					<div className="flex justify-between items-center mb-4">
						<h2 className="font-semibold text-lg">Earnings Overview</h2>
						<span className="text-xs text-gray-500">Last {daily.length} days</span>
					</div>

					{/* KPI ROW */}
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div>
							<p className="text-xs text-gray-500">Total</p>
							<p className="font-bold text-lg">₹ {Number(data.earningsInsights?.totalEarning || 0).toFixed(2)}</p>
						</div>

						<div>
							<p className="text-xs text-gray-500">Deliveries</p>
							<p className="font-bold text-lg">{data.earningsInsights?.totalDeliveries || 0}</p>
						</div>

						<div>
							<p className="text-xs text-gray-500">Avg / Day</p>
							<p className="font-bold text-lg">₹ {avg.toFixed(2)}</p>
						</div>
					</div>

					{/* CHART */}
					<div className="mb-6">
						<EarningsChart data={daily} />
					</div>

					{/* INSIGHTS */}
					<div className="bg-[#fff4f1] p-3 rounded-lg text-sm space-y-1">
						{best && (
							<p>
								🔥 Best Day: {best.day} (₹ {Number(best.earning).toFixed(2)})
							</p>
						)}
						<p>📊 Avg Daily Earning: ₹ {avg.toFixed(2)}</p>
						<p>📦 Total Deliveries: {data.earningsInsights?.totalDeliveries}</p>
					</div>

					{/* EMPTY STATE */}
					{!daily.length && <p className="text-sm text-gray-500 mt-4">No earnings data yet.</p>}
				</div>
			</section>
		</main>
	);
};

export default DeliveryDashboard;
