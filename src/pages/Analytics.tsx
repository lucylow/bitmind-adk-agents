import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import NavigationBar from '@/components/NavigationBar';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;
