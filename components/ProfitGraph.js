// import React, { useState } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { VictoryChart, VictoryLine, VictoryAxis, VictoryVoronoiContainer } from 'victory-native';

// const ProfitGraph = ({ data }) => {
//   const [selectedPoint, setSelectedPoint] = useState(null);

//   return (
//     <View style={styles.container}>
//       {selectedPoint && (
//         <View style={styles.tooltip}>
//           <Text style={styles.tooltipText}>Date: {selectedPoint.date}</Text>
//           <Text style={styles.tooltipText}>Balance: ${selectedPoint.balance.toFixed(2)}</Text>
//         </View>
//       )}
//       <VictoryChart
//         domainPadding={{ x: 20 }}
//         containerComponent={
//           <VictoryVoronoiContainer
//             voronoiDimension="x"
//             labels={({ datum }) => `Balance: $${datum.balance.toFixed(2)}`}
//             onActivated={(points) => setSelectedPoint(points[0])}
//           />
//         }
//       >
//         <VictoryAxis
//           tickFormat={(t) => t.slice(5)} // Format date to show only MM-DD
//           style={{
//             axis: { stroke: '#ccc' },
//             ticks: { stroke: '#ccc' },
//             tickLabels: { fontSize: 10, padding: 5 },
//           }}
//         />
//         <VictoryAxis
//           dependentAxis
//           tickFormat={(t) => `$${t}`}
//           style={{
//             axis: { stroke: '#ccc' },
//             grid: { stroke: '#eee' },
//             tickLabels: { fontSize: 10, padding: 5 },
//           }}
//         />
//         <VictoryLine
//           data={data}
//           x="date"
//           y="balance"
//           style={{
//             data: { stroke: '#4a90e2', strokeWidth: 2 },
//           }}
//         />
//       </VictoryChart>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 16,
//   },
//   tooltip: {
//     position: 'absolute',
//     top: 10,
//     left: 10,
//     backgroundColor: '#000',
//     padding: 8,
//     borderRadius: 5,
//   },
//   tooltipText: {
//     color: '#fff',
//     fontSize: 12,
//   },
// });

// export default ProfitGraph;
