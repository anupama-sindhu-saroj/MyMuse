import React from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeDisplay = ({ value }) => {
  return (
    <div className="flex justify-center bg-white p-4 rounded-xl shadow-md">
      <QRCodeCanvas
        value={value}
        size={180}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
      />
    </div>
  );
};

export default QRCodeDisplay;