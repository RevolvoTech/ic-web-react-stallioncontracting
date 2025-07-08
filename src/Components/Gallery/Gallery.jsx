import React, { useState } from 'react';
import './Gallery.scss';

import after1 from '../../assets/img/after-1.jpg';
import after2 from '../../assets/img/after-2.jpg';
import after3 from '../../assets/img/after-3.jpg';
import before1 from '../../assets/img/before-1.jpg';
import before2 from '../../assets/img/before-2.jpg';
import before3 from '../../assets/img/before-3.jpg';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    { id: 1, src: before1, alt: 'Before 1' },
    { id: 2, src: after1, alt: 'After 1' },
    { id: 3, src: before2, alt: 'Before 2' },
    { id: 4, src: after2, alt: 'After 2' },
    { id: 5, src: before3, alt: 'Before 3' },
    { id: 6, src: after3, alt: 'After 3' },
  ];

  const openPopup = (image) => {
    setSelectedImage(image);
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <div className="gallery-header">
          <div className="section-label">Our Work</div>
          <h2>A Glimpse of Our Quality</h2>
          <p>We take pride in our work, here are some of our recent projects.</p>
        </div>
        <div className="gallery-grid">
          {images.map(image => (
            <div key={image.id} className="gallery-item" onClick={() => openPopup(image)}>
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closePopup}>&times;</span>
            <img src={selectedImage.src} alt={selectedImage.alt} />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;