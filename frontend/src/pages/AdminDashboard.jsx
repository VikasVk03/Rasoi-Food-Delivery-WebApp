import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import TopNav from "../components/TopNav";
import { Context } from "../main";
import LineChart from "../components/LineChart";
const MiniBars = ({ data, keyName = "sales" }) => {
	const max = Math.max(...data.map((item) => Number(item[keyName] || 0)), 1);
	return (
		<div className="space-y-2">
			{data.map((item) => (
				<div key={`${item.day}-${keyName}`} className="text-xs">
					<div className="flex justify-between mb-1">
						<span>{item.day}</span>
						<span>{Number(item[keyName] || 0).toFixed(2)}</span>
					</div>
					<div className="h-2 rounded bg-gray-100">
						<div className="h-2 rounded bg-[#ff4d2d]" style={{ width: `${Math.max((Number(item[keyName] || 0) / max) * 100, 4)}%` }} />
					</div>
				</div>
			))}
		</div>
	);
};

const AdminDashboard = () => {
	const { isAuthenticated, user } = useContext(Context);
	const navigate = useNavigate();
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}
		if (user?.role !== "Admin") {
			navigate("/");
			return;
		}

		axios
			.get(`${serverUrl}/api/admin/dashboard`, { withCredentials: true })
			.then((response) => setData(response.data))
			.catch((error) => toast.error(error.response?.data?.message || "Failed to load admin dashboard"))
			.finally(() => setLoading(false));
	}, [isAuthenticated, navigate, user]);

	return (
		<main className="min-h-screen bg-[#fff9f6]">
			<TopNav title="Admin Dashboard" />
			<section className="max-w-6xl mx-auto px-4 py-6">
				{loading ? (
					<p>Loading admin data...</p>
				) : (
					<div className="space-y-6">
						<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-white p-4 rounded-xl border border-gray-100">Users: {data?.overview?.totalUsers || 0}</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100">Restaurants: {data?.overview?.totalRestaurants || 0}</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100">Delivered: {data?.overview?.totalOrdersDelivered || 0}</div>
							<div className="bg-white p-4 rounded-xl border border-gray-100">Sales: Rs {data?.overview?.grossSales || 0}</div>
						</div>

						<div className="bg-white p-4 rounded-xl border border-gray-100">
							<h3 className="font-semibold mb-3">Owner Earnings</h3>
							<LineChart data={data?.insights?.ownerRevenueDaily || []} keyName="earning" label="Owner Earnings ₹" />
						</div>

						<div className="bg-white p-4 rounded-xl border border-gray-100">
							<h3 className="font-semibold mb-3">Delivery Earnings</h3>
							<LineChart data={data?.insights?.deliveryRevenueDaily || []} keyName="earning" label="Delivery Earnings ₹" />
						</div>
					</div>
				)}
			</section>
		</main>
	);
};

export default AdminDashboard;
