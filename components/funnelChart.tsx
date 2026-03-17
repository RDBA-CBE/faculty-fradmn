import React from "react";
import { FunnelChart } from "react-funnel-pipeline";
import "react-funnel-pipeline/dist/index.css";

export default function Funnel(props: any) {
  const { data, height, width } = props;

  const colors = [
    "#a3ddff",
    "#edfaa2",
    "#f76c62",
    "#14b8a57e",
    "#e5e7eb", // empty row color
  ];

  const wrapText = (text: string) => text.replace(/ /g, "\n");

  const formattedData = data.map((item: any) => ({
    name: wrapText(item.name),
    value: item.value,
  }));

  const lastValue = formattedData[formattedData.length - 1]?.value || 1;

  // add empty bottom row
  const finalData = [
    ...formattedData,
    {
      name: "",
      value: lastValue, // keep same width so shape renders
    },
  ];

  return (
    <div style={{ width: width || "auto", height: height || "auto" }}>
      <FunnelChart
        chartWidth={width || "auto"}
        chartHeight={height || "auto"}
        data={finalData}
        pallette={colors}
        showNames
        showValues

        getRowStyle={() => ({
          height: 70,
        })}

        getRowNameStyle={(row: any) => ({
          fontSize: "15px",
          
        //   whiteSpace: "pre-line",
          textAlign: "center",
          color: row.name ? "#000" : "transparent",
          wordWrap:"break-word"
        })}

        getRowValueStyle={(row: any) => ({
          fontSize: "16px",
          fontWeight: 600,
          color: row.name ? "#000" : "transparent",
        })}
      />
    </div>
  );
}