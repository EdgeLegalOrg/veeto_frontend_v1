import React from "react";
import "../../stylesheets/contact-details.css";
import EditOrgDetails from "./EditOrgDetails";

function OrganisationDetail(props) {
  const {
    contactDetails,
    changeBool,
    allCountries,
    setUpdatedData,
    updatedData,
    postalList,
    personList,
    roles,
    tempSearchField,
    setTempSearchField,
    isLoading,
    disabled,
  } = props;

  return (
    <div className="main-contact-detail-div">
      <EditOrgDetails
        contactDetails={contactDetails}
        changeBool={changeBool}
        allCountries={allCountries}
        setUpdatedData={setUpdatedData}
        updatedData={updatedData}
        personList={personList}
        roleList={roles}
        postalList={postalList}
        tempSearchField={tempSearchField}
        setTempSearchField={setTempSearchField}
        isLoading={isLoading}
        disabled={disabled}
      />
    </div>
  );
}

export default OrganisationDetail;
