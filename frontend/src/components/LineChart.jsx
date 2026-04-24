import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const LineChart = ({ data = [], keyName = "sales", label = "" }) => {
  const chartData = {
    labels: data.map((item) =>
      new Date(item.day).toLocaleDateString()
    ),
    datasets: [
      {
        label,
        data: data.map((item) => Number(item[keyName] || 0)),
        borderColor: "#ff4d2d",
        backgroundColor: "rgba(255,77,45,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;