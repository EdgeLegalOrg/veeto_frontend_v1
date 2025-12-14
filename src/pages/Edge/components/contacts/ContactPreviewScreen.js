import React from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import '../../stylesheets/PreviewScreen.css';

const ContactPreviewScreen = (props) => {
  const { previewScreen, previewImage, setPreviewScreen } = props;

  const handleClose = () => {
    setPreviewScreen(false);
  };
  return (
    <Modal
      fade={true}
      isOpen={previewScreen}
      toggle={handleClose}
      centered={true}
      size='lg'
    >
      <ModalHeader toggle={handleClose} className='bg-light p-3'>
        Preview
      </ModalHeader>
      <ModalBody className='py-3 px-5'>
        <div className='preview-imageDiv'>
          <img src={previewImage} alt='preview' className='preview-image' />
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ContactPreviewScreen;
