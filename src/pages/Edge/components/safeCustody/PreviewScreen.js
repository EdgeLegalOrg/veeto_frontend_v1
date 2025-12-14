import React from 'react';
import '../../stylesheets/PreviewScreen.css';

const PreviewScreen = (props) => {
  const { previewImage, setPreviewScreen } = props;
  return (
    <div className='preview-popup-container'>
      <div className='preview-popup-grid'>
        <button
          className='preview-closeBtn'
          onClick={() => setPreviewScreen(false)}
        >
          +
        </button>
        <div className='preview-imageDiv'>
          <img src={previewImage} alt='preview' className='preview-image' />
        </div>
      </div>
    </div>
  );
};

export default PreviewScreen;
