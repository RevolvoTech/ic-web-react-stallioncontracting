import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navigation/Navbar";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop";
import Home from "./Pages/Home";
import Contact from "./Pages/Contact";
import Services from "./Pages/Services";
import ServiceRoofing from "./Pages/ServiceRoofing";
import ServiceElectrical from "./Pages/ServiceElectrical";
import ServiceHVAC from "./Pages/ServiceHVAC";
import ServicePlumbing from "./Pages/ServicePlumbing";
import ServiceFraming from "./Pages/ServiceFraming";
import ServiceConcrete from "./Pages/ServiceConcrete";
import ServiceDrywall from "./Pages/ServiceDrywall";
import ServiceMore from "./Pages/ServiceMore";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsOfService from "./Pages/TermsOfService";
import SmsTerms from "./Pages/SmsTerms";
import Sitemap from "./Pages/Sitemap";

function App() {
  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/roofing" element={<ServiceRoofing />} />
          <Route path="/services/electrical" element={<ServiceElectrical />} />
          <Route path="/services/hvac" element={<ServiceHVAC />} />
          <Route path="/services/plumbing" element={<ServicePlumbing />} />
          <Route path="/services/framing" element={<ServiceFraming />} />
          <Route path="/services/concrete" element={<ServiceConcrete />} />
          <Route path="/services/drywall" element={<ServiceDrywall />} />
          <Route path="/services/more" element={<ServiceMore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/sms-terms" element={<SmsTerms />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
