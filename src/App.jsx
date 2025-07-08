import "./App.css";
import Navbar from "./Components/Navigation/Navbar";
import Header from "./Components/Header/Header";
import Services from "./Components/Services/Services";
import Projects from "./Components/Projects/Projects";
import About from "./Components/About/About";
import Testimonials from "./Components/Testimonials/Testimonials";
import Gallery from "./Components/Gallery/Gallery";
import Footer from "./Components/Footer/Footer";
import Contact from "./Components/Contact/Contact";

function App() {
  return (
    <>
      <Navbar />
      <Header />
      <Services />
      <Projects />
      <About />
      <Gallery />
      {/* <Testimonials /> */}
      <Contact />
      <Footer />
    </>
  );
}

export default App;
