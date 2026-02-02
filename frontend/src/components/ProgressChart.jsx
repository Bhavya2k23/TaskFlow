import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart ke parts register karna zaroori hai
ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressChart = ({ tasks }) => {
  // Logic: Kitne tasks complete hain aur kitne pending?
  const completed = tasks.filter(task => task.isCompleted).length;
  const pending = tasks.length - completed;

  // Agar koi task nahi hai, toh chart khali dikhayein
  if (tasks.length === 0) {
    return <p className="text-slate-500 text-sm text-center">Add tasks to see chart</p>;
  }

  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: [
          '#10b981', // Green (Completed)
          '#334155', // Slate-700 (Pending)
        ],
        borderWidth: 0, // Border hata diya cleaner look ke liye
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#94a3b8' } // Text color
      }
    },
    cutout: '70%', // Beech ka hole size (Doughnut style)
  };

  return (
    <div className="w-full max-w-xs mx-auto mt-4">
      <h3 className="text-slate-400 text-center mb-2 font-semibold">Today's Progress</h3>
      <div className="relative">
        <Doughnut data={data} options={options} />
        {/* Beech mein Percentage dikhane ke liye */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-white">
            {Math.round((completed / tasks.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;