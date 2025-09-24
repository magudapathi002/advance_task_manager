import { useQuery } from "@tanstack/react-query";
import { Card, Text, Box, Flex, Link } from "@radix-ui/themes";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import API from "../api/axios";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fetchDashboardData = async () => {
  const response = await API.get("tasks/dashboard");
  return response.data;
};

const Dashboard = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (isLoading)
    return (
      <Box style={{ padding: "20px", textAlign: "center" }}>Loading...</Box>
    );
  if (isError)
    return (
      <Box style={{ padding: "20px", textAlign: "center", color: "red" }}>
        Error: {error.message}
      </Box>
    );

  const {
    total_tasks,
    tasks_by_status,
    tasks_by_priority,
    tasks_due_today,
    tasks_assigned_to_user,
  } = data;

  const statusChartData = {
    labels: Object.keys(tasks_by_status),
    datasets: [
      {
        label: "Tasks by Status",
        data: Object.values(tasks_by_status),
        backgroundColor: [
          "#4CAF50",
          "#FF9800",
          "#F44336",
          "#2196F3",
          "#9C27B0",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: Object.keys(tasks_by_priority),
    datasets: [
      {
        label: "Tasks by Priority",
        data: Object.values(tasks_by_priority),
        backgroundColor: ["#FFC107", "#03A9F4", "#8BC34A", "#E91E63"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box
      style={{
        maxWidth: "auto",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f0f2f5",
      }}
    >
      {/* Summary Cards */}
      <Flex
        justify="between"
        style={{
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <Card>
          <Flex gap="3" align="center">
            <Text as="div" size="3">
              Total Tasks
            </Text>
            <Text size="4" weight="bold">
              {total_tasks}
            </Text>
          </Flex>
        </Card>
        <Card>
          <Flex gap="3" align="center">
            <Text as="div" size="3">
              Due Today
            </Text>
            <Text size="4" weight="bold">
              {tasks_due_today}
            </Text>
          </Flex>
        </Card>
        <Card>
          <Flex gap="3" align="center">
            <Text as="div" size="3">
              Assigned to You
            </Text>
            <Text size="4" weight="bold">
              {tasks_assigned_to_user}
            </Text>
          </Flex>
        </Card>
      </Flex>
      <Flex>
        
      </Flex>
      {/* Charts Section */}
      <Box style={{ marginTop: "10px" }}>
        {/* Tasks by Status */}
        <Text size="3" style={{ marginBottom: "20px", fontWeight: "bold" }}>
          Tasks by Status
        </Text>
        <Box
          style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxHeight: "300px",
            overflow: "hidden",
            marginBottom: "30px",
          }}
        >
          <Bar
            data={statusChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              scales: {
                y: { ticks: { stepSize: 1 } },
              },
            }}
            style={{ height: "250px" }}
          />
        </Box>

        {/* Tasks by Priority */}
        <Text size="3" style={{ marginBottom: "10px", fontWeight: "bold" }}>
          Tasks by Priority
        </Text>
        <Box
          style={{
            background: "#fff",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            maxHeight: "300px",
            overflow: "hidden",
          }}
        >
          <Bar
            data={priorityChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              scales: {
                y: { ticks: { stepSize: 1 } },
              },
            }}
            style={{ height: "250px" }}
          />
        </Box>
      </Box>

      {/* View All Tasks Button */}
      <Box style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          href="/my_task"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            fontSize: "14px",
            borderRadius: "6px",
            backgroundColor: "#007bff",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          View All Tasks
        </Link>
      </Box>
    </Box>
  );
};

export default Dashboard;
