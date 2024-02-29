import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

const StatisticsChart = () => {
  const [chartData, setChartData] = useState<ChartData>();
  const [loading, setLoading] = useState(true);
  const [conversionRate, setconversionRate] = useState<number>();

  const fetchStatistics = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/statistics/conversion-rate');
        const { totalProspects, totalClients, conversionRate } = await response.json();
        setconversionRate(conversionRate);
        setChartData({
          labels: ['Prospects', 'Clients'],
          datasets: [
            {
              label: 'Count',
              data: [totalProspects, totalClients],
              backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
              borderWidth: 1,
            },
          ],
        });
    } catch (error) {
        console.error('Erreur lors du chargement des statistics', error);
      } finally {
        setLoading(false);
      }
  };

  
  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-50 text-gray-800 py-10 min-h-screen">
      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold text-center mb-6">Statistiques</h2>
        <div className="mb-8">
          {chartData ? <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} /> : <p>No data available</p>}
        </div>
        <div className="text-center mb-6">
          <p className="text-lg">Taux de conversion: {conversionRate ? `${conversionRate.toFixed(2)}%` : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
  
  
  
};

export default StatisticsChart;
