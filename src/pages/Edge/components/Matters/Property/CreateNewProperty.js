import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import AddProperty from "../../property/AddProperty";

const CreateNewProperty = (props) => {
  const [countries, setCountries] = useState([]);
  const [postalList, setPostalList] = useState([]);
  const [fieldLength, setFieldLength] = useState({});
  const [requiredGeneral, setRequiredGeneral] = useState([]);
  const [requiredRegistered, setRequiredRegistered] = useState([]);
  const [requiredUnregistered, setRequiredUnregistered] = useState([]);

  const fetchMetaData = () => {
    let general = [];
    JSON.parse(window.localStorage.getItem("metaData"))?.property?.fields?.map(
      (f) => {
        if (f.mandatory) {
          general.push(f.fieldName.toLowerCase());
        }
      }
    );
    setRequiredGeneral(general);
    let reg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.registered_property?.fields?.map((f) => {
      if (f?.mandatory) {
        reg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredRegistered(reg);
    let unreg = [];
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.unregistered_property?.fields?.map((f) => {
      if (f.mandatory) {
        unreg.push(f.fieldName.toLowerCase());
      }
    });
    setRequiredUnregistered(unreg);

    let allLengths = {};
    JSON.parse(window.localStorage.getItem("metaData"))?.property?.fields?.map(
      (f) => {
        allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
      }
    );
    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.registered_property?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });

    JSON.parse(
      window.localStorage.getItem("metaData")
    )?.unregistered_property?.fields?.map((f) => {
      allLengths = { ...allLengths, [f.fieldName.toLowerCase()]: f.dataSize };
    });
    setFieldLength(allLengths);

    setCountries(JSON.parse(window.localStorage.getItem("countryList")));
    setPostalList(JSON.parse(window.localStorage.getItem("postalList")));
  };

  useEffect(() => {
    fetchMetaData();
  }, []);
  return (
    <Modal
      isOpen={props.open}
      toggle={() => props.closeForm}
      backdrop="static"
      scrollable={true}
      size="xl"
      centered
    >
      <ModalHeader toggle={() => props.closeForm()} className="bg-light p-3">
        Add new property
      </ModalHeader>
      <ModalBody className="">
        <AddProperty
          close={() => {
            props.closeForm();
            props.refresh();
          }}
          refreshList={() => {}}
          allCountries={countries}
          postalList={postalList}
          requiredGeneral={requiredGeneral}
          requiredRegistered={requiredRegistered}
          requiredUnregistered={requiredUnregistered}
          fieldLength={fieldLength}
          skip={true}
        />
      </ModalBody>
    </Modal>
  );
};

export default CreateNewProperty;
