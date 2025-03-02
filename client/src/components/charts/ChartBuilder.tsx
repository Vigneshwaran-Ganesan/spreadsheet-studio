
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, BarChart2, LineChart, PieChart } from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartBuilderProps {
  getData: (range: string) => { labels: string[]; values: number[] };
  currentCell: string | null;
}

export const ChartBuilder: React.FC<ChartBuilderProps> = ({ getData, currentCell }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [dataRange, setDataRange] = useState('');
  const [labelRange, setLabelRange] = useState('');
  const [title, setTitle] = useState('');
  const [previewData, setPreviewData] = useState<{ labels: string[]; values: number[] } | null>(null);
  
  const generatePreview = () => {
    if (dataRange) {
      const data = getData(dataRange);
      const labels = labelRange ? getData(labelRange).values.map(String) : data.labels;
      setPreviewData({ labels, values: data.values });
    }
  };
  
  const insertChart = () => {
    // Logic to insert chart into the spreadsheet
    // This would typically generate an image or embed the chart configuration
    if (!currentCell) return;
    
    // For simplicity, we'll just add a placeholder
    // In a real implementation, this would store the chart configuration
    console.log('Inserting chart at cell', currentCell);
  };
  
  const renderChart = () => {
    if (!previewData) return <div className="h-64 flex items-center justify-center">Preview will appear here</div>;
    
    const chartData = {
      labels: previewData.labels,
      datasets: [
        {
          label: title || 'Data',
          data: previewData.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: !!title,
          text: title,
        },
      },
    };
    
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} />;
      default:
        return null;
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <BarChart2 className="h-4 w-4" />
          Charts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Chart</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select onValueChange={(value: any) => setChartType(value)} defaultValue={chartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      Bar Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="line">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Line Chart
                    </div>
                  </SelectItem>
                  <SelectItem value="pie">
                    <div className="flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      Pie Chart
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data Range</Label>
              <Input 
                placeholder="e.g. A1:A10" 
                value={dataRange} 
                onChange={(e) => setDataRange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Label Range (optional)</Label>
              <Input 
                placeholder="e.g. B1:B10" 
                value={labelRange} 
                onChange={(e) => setLabelRange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Chart Title (optional)</Label>
              <Input 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <Button onClick={generatePreview}>Generate Preview</Button>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="h-64">
              {renderChart()}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => {}}>Cancel</Button>
          <Button onClick={insertChart} disabled={!previewData}>Insert Chart</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
