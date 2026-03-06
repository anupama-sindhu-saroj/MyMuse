import React from "react";

const AIChatBubble = () => {
  return (
    <div className="space-y-2 mb-8">

      <div className="bg-neutral-800 text-white px-4 py-2 rounded-lg w-fit text-sm">
        [User]: Pay for my Modern Wing ticket using my best method.
      </div>

      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg w-fit text-sm">
        [Museo AI]: Selecting UPI / Google Pay as it is fastest.
      </div>

    </div>
  );
};

export default AIChatBubble;