import React, { useState, useEffect, useRef } from "react";
import { Table } from "reactstrap";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { TextInputField } from "pages/Edge/components/InputField";

const Address = (props) => {
  const [filteredList, setFilteredList] = useState([]);
  const contactFilter = useRef(null);

  useEffect(() => {
    if (props.contactList && props.active) {
      setFilteredList(props.contactList);
    }
  }, [props.contactList, props.active]);

  useEffect(() => {
    if (contactFilter.current) {
      contactFilter.current.value = "";
    }
  }, []);

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleSelect = (arg) => {
    if (props.onChange) {
      props.onChange({
        address1: arg.address1,
        address2: arg.address2,
        address3: arg.address3,
        country: arg.country,
        state: arg.state,
        city: arg.city,
        postCode: arg.postCode,
        fullAddress: arg.fullAddress,
      });
    }

    handleClose();
  };

  const handleFilter = (e) => {
    const { value } = e.target;

    if (value) {
      const list = props.contactList.filter((contact) =>
        contact?.display?.toLowerCase()?.includes(value?.toLowerCase())
      );
      setFilteredList(list);
    } else {
      setFilteredList(props.contactList);
    }
  };

  const body = () => {
    return (
      <div className="bt-container">
        <div className="bt-searchDiv">
          <div className="bt-inputDiv">
            <TextInputField
              placeholder="Search contact by name"
              onChange={handleFilter}
              ref={contactFilter}
            />
          </div>
        </div>
        <Table responsive={true} striped={true} hover={true}>
          <tbody>
            {filteredList.map((contact) => {
              const hasFullAddress = (contact.fullAddress || "")?.trim();
              return (
                <tr
                  key={contact.valueKey}
                  onClick={() => {
                    if (hasFullAddress) {
                      handleSelect(contact);
                    }
                  }}
                  className={`m-1 ${
                    hasFullAddress ? "pe-cursor" : "pe-none opacity-50"
                  }`}
                >
                  <p className="pb-0 fw-bold">{contact.display}</p>
                  <p class={`${hasFullAddress ? "" : "text-danger"}`}>
                    {hasFullAddress
                      ? contact.fullAddress
                      : "Address not available"}
                  </p>
                </tr>
              );
            })}
            {!filteredList.length && (
              <tr>
                <p className="p-2 fw-bold text-center">No contact found</p>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      <CustomSideDrawer
        active={props.active}
        onClose={handleClose}
        heading={"Bill to Address"}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default Address;
