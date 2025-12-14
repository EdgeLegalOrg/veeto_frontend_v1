import React from "react";
import "./styles/CustomSideDrawer.css";
import { Button, Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import SimpleBar from "simplebar-react";

const CustomSideDrawer = (props) => {
  const onClose = () => {
    ohClass(true);
    if (props.onClose) {
      props.onClose();
    }
  };

  const body = () => {
    if (props.body) {
      return props.body();
    } else {
      return <></>;
    }
  };

  const ohClass = (remove) => {
    if (remove) {
      document.body.classList.remove("oh");
    } else {
      document.body.classList.add("oh");
    }
  };

  return (
    <Offcanvas isOpen={props.active} toggle={onClose} direction="end">
      <OffcanvasHeader
        className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark"
        toggle={onClose}
      >
        <span className="m-0 me-2 text-white">
          {props.heading ? props.heading : ""}
        </span>
      </OffcanvasHeader>
      <OffcanvasBody className="p-0">
        <SimpleBar className="h-100">
          {body()}
        </SimpleBar>
      </OffcanvasBody>
    </Offcanvas>
  );
};

export default CustomSideDrawer;
