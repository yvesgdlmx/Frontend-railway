import React from 'react';

const CardMobile = ({ registro }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <div className="bg-blue-600 text-white p-4">
        <div className="font-semibold text-lg">{registro.enterDate}</div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">ID:</span>
          <span className="font-bold text-gray-500">{registro.id}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Tray Number:</span>
          <span className="font-bold text-gray-500">{registro.trayNumber}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Current Station:</span>
          <span className="font-bold text-gray-500">{registro.currentStation}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Division:</span>
          <span className="font-bold text-gray-500">{registro.division}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Current Stn Date:</span>
          <span className="font-bold text-gray-500">{registro.currentStnDate}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Current Stn Time:</span>
          <span className="font-bold text-gray-500">{registro.currentStnTime}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">F/S:</span>
          <span className="font-bold text-gray-500">{registro.fs}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-2">
          <span className="text-gray-600">Transcurrido:</span>
          <span className="font-bold text-gray-500">{registro.transcurrido}</span>
        </div>
      </div>
    </div>
  );
};
export default CardMobile;