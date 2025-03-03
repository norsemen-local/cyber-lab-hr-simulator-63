
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

interface ChartCardProps {
  title: string;
  chartType: "bar" | "line";
  data: any[];
  dataKey: string;
  height?: number;
}

const ChartCard = ({ title, chartType, data, dataKey, height = 200 }: ChartCardProps) => {
  return (
    <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {chartType === "bar" ? (
            <BarChart data={data}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }} 
              />
              <Bar dataKey={dataKey} fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
