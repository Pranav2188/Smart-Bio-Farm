import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnimalChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-gray-500">No data available for chart.</div>;
  }

  // Assuming data has 'date' and 'quantity' or similar fields
  // For simplicity, let's use 'quantity' from the provided pigData/chickenData structure
  // We might need to transform the data if the structure is different
  const chartData = data.map(item => ({
    name: item.date, // Or some other relevant field for X-axis
    quantity: item.quantity,
    price: item.price
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Animal Data Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="quantity" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="price" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnimalChart;
