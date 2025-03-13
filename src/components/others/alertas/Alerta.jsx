import React from "react";

const Alerta = ({ message, type = "info" }) => {
  let bgColor = "";
  let borderColor = "";
  let textColor = "";
  switch (type) {
    case "success":
      bgColor = "bg-green-100";
      borderColor = "border-green-400";
      textColor = "text-green-700";
      break;
    case "error":
      bgColor = "bg-red-100";
      borderColor = "border-red-400";
      textColor = "text-red-700";
      break;
    default:
      bgColor = "bg-blue-100";
      borderColor = "border-blue-400";
      textColor = "text-blue-700";
  }
  return (
    <div className={`border-l-4 p-4 ${bgColor} ${borderColor} ${textColor}`}>
      <p>{message}</p>
    </div>
  );
};
export default Alerta;