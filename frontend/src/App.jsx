import { Routes, Route } from "react-router-dom";

import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaymentPage />} />
      <Route path="/ticket" element={<TicketPage />} />
    </Routes>
  );
}

export default App;