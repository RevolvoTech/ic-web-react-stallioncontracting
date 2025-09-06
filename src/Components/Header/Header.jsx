import "./Header.scss";
import bgVideo from "../../assets/Videos/0708.mp4";
import logo from "../../assets/logo_hero.svg";

const Header = () => {
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
    smoothScrollTo("contact");
  };

  const handleServicesClick = () => {
    smoothScrollTo("services");
  };

  return (
    <header id="home" className="header">
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={bgVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="header-overlay"></div>

      <div className="header-content">
        <div className="header-logo">
          <img src={logo} alt="Stallion Contracting" />
        </div>
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
