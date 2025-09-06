import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home";
import Roofing from "./Pages/Roofing";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roofing" element={<Roofing />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
