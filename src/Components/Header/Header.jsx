import { useNavigate } from "react-router-dom";
import "./Header.scss";
import bgVideo from "../../assets/Videos/0708.mp4";

const Header = () => {
  const navigate = useNavigate();
  
  const smoothScrollTo = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleFreeEstimateClick = () => {
    navigate("/contact");
  };

  const handleServicesClick = () => {
    navigate("/services");
  };

  return (
    <header id="home" className="header">
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="header-overlay"></div>

      <div className="header-content">
        <h1>COMPLETE CONTRACTING & CONSTRUCTION SOLUTIONS</h1>
        <p className="services-line">CONSTRUCTION • REMODELING • RENOVATION</p>
        <p>One Call. One Team. Zero Stress.</p>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={handleFreeEstimateClick}>
            Get your Quote
          </button>
          <button className="btn btn-secondary" onClick={handleServicesClick}>
            Our Services
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
