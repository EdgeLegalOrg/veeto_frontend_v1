import React from "react";
import "../../stylesheets/contact-details.css";
import EditPersonDetails from "./EditPersonDetails";

function PersonDetail(props) {
  const {
    contactDetails,
    changeBool,
    allCountries,
    setUpdatedData,
    updatedData,
    companyList,
    roles,
    postalList,
    tempSearchField,
    setTempSearchField,
    isLoading,
    submitted,
    disabled,
  } = props;

  return (
    <div className="main-contact-detail-div">
      <EditPersonDetails
        contactDetails={contactDetails}
        changeBool={changeBool}
        allCountries={allCountries}
        setUpdatedData={setUpdatedData}
        updatedData={updatedData}
        companyList={companyList}
        roles={roles}
        postalList={postalList}
        tempSearchField={tempSearchField}
        setTempSearchField={setTempSearchField}
        isLoading={isLoading}
        submitted={submitted}
        disabled={disabled}
      />
    </div>
  );
}

export default PersonDetail;
