import useWorkerDashboard from "./useWorkerDashboard";
import useRecentJobs from "./useRecentJobs";
import useWorkerProducts from "./useWorkerProducts";

export default function useWorkerHomeDashboard() {

  const dashboard =
    useWorkerDashboard();

  const recentJobs =
    useRecentJobs();

  const products =
    useWorkerProducts();

  const loading =
    dashboard.loading ||
    recentJobs.loading ||
    products.loading;

  return {

    loading,

    pending:
      dashboard.pending,

    active:
      dashboard.active,

    completed:
      dashboard.completed,

    rating:
      dashboard.rating,

    jobs:
      recentJobs.jobs,

    products:
      products.products,

  };

}