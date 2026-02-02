import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import axios from 'axios';

const ActivityGraph = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const today = new Date();
  
  // Show full last 12 months (365 days)
  const startDate = new Date();
  startDate.setDate(today.getDate() - 365);

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tasks/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Heatmap Error:", err);
    }
  };

  const getClassForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count >= 5) return 'color-scale-4'; 
    if (value.count >= 3) return 'color-scale-3';
    if (value.count >= 1) return 'color-scale-2';
    return 'color-scale-1'; 
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header with Year */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h4 className="text-sm font-semibold text-slate-400">
          Activity: <span className="text-white">{startDate.getFullYear()} - {today.getFullYear()}</span>
        </h4>
        <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Less</span>
            <div className="w-3 h-3 bg-[#1e293b] rounded-sm"></div>
            <div className="w-3 h-3 bg-[#0e4429] rounded-sm"></div>
            <div className="w-3 h-3 bg-[#26a641] rounded-sm"></div>
            <div className="w-3 h-3 bg-[#39d353] rounded-sm"></div>
            <span>More</span>
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[800px]"> {/* Min width ensures graph doesn't shrink/overlap */}
            <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={history}
            classForValue={getClassForValue}
            tooltipDataAttrs={(value) => ({
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': value.date ? `${value.date}: ${value.count} Tasks` : 'No Activity',
            })}
            showWeekdayLabels={true} // Shows Mon, Wed, Fri
            gutterSize={3} // Gap between boxes
            />
        </div>
        <ReactTooltip id="heatmap-tooltip" className="heatmap-tooltip-custom" />
      </div>
    </div>
  );
};

export default ActivityGraph;