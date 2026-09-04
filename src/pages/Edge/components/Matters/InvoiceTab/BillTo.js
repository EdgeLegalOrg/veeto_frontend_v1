import React, { useState, useEffect } from "react";
import { Table } from "reactstrap";
import CustomSideDrawer from "../../customComponents/CustomSideDrawer";
import { TextInputField } from "pages/Edge/components/InputField";

const BillTo = (props) => {
  const [contactList, setContactList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (props.contactList) {
      setContactList(props.contactList);
      setFilteredList(props.contactList);
    }
  }, [props.contactList]);

  useEffect(() => {
    if (props?.selectedList?.length && props.contactList?.length) {
      prepareSelectedContact(props.contactList);
    } else if (!props?.selectedList?.length) {
      setSelected([]);
    }
  }, [props.selectedList, props.contactList]);

  const prepareSelectedContact = (allContacts) => {
    if (!allContacts || !props.selectedList) {
      setSelected([]);
      return;
    }
    const selectedBillTos = props.selectedList
      .map((billTo) => {
        return allContacts.find(
          (contact) =>
            contact.display === billTo.billTo ||
            (billTo.contactId &&
              contact.value === billTo.contactId &&
              contact.type === billTo.contactType)
        );
      })
      .filter(Boolean);

    setSelected(selectedBillTos);
  };

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleFilter = (e) => {
    const { value } = e.target;

    if (value) {
      let newArr = contactList.filter((c) =>
        c?.display?.toLowerCase().includes(value?.toLowerCase())
      );
      setFilteredList(newArr);
    } else {
      setFilteredList(contactList);
    }
  };

  const handleSelect = (val) => {
    let arr = [];
    const isAlreadySelected = selected.some(
      (item) =>
        item?.valueKey === val.valueKey ||
        (item?.value === val.value && item?.type === val.type)
    );

    if (isAlreadySelected) {
      arr = selected.filter(
        (item) =>
          item?.valueKey !== val.valueKey &&
          !(item?.value === val.value && item?.type === val.type)
      );
    } else {
      arr = [...selected, val];
    }

    setSelected(arr);
    updateValue(arr);
  };

  const updateValue = (arg) => {
    let arr = [];

    arg.forEach((a) => {
      arr.push({
        billTo: a.display,
        contactId: a.value,
        contactType: a.type,
        address1: a.address1,
        address2: a.address2,
        address3: a.address3,
        city: a.city,
        state: a.state,
        postCode: a.postCode,
        country: a.country,
        fullAddress: a.fullAddress,
      });
    });

    if (props.onChange) {
      props.onChange("billToList", arr);
    }

    if (props.onSelectAddress && arg.length > 0) {
      const primary = arg[0];
      if (primary.fullAddress || primary.address1) {
        props.onSelectAddress({
          address1: primary.address1,
          address2: primary.address2,
          address3: primary.address3,
          country: primary.country,
          state: primary.state,
          city: primary.city,
          postCode: primary.postCode,
          fullAddress: primary.fullAddress,
        });
      }
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
            />
          </div>
        </div>
        <Table responsive={true} striped={true} hover={true}>
          <tbody>
            {filteredList.map((contact) => {
              const isChecked = selected.some(
                (item) =>
                  item?.valueKey === contact.valueKey ||
                  (item?.value === contact.value && item?.type === contact.type)
              );
              return (
                <tr
                  key={contact.valueKey}
                  onClick={() => handleSelect(contact)}
                  className="pe-cursor"
                  style={isChecked ? { backgroundColor: "#e8f4fd" } : {}}
                >
                  <td style={{ width: "40px" }} className="align-middle">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isChecked}
                      onChange={() => {}}
                    />
                  </td>
                  <td>
                    <p className="m-0 mx-1 fw-bold">{contact.display}</p>
                    {contact.fullAddress && (
                      <small className="text-muted mx-1 d-block">
                        {contact.fullAddress}
                      </small>
                    )}
                  </td>
                </tr>
              );
            })}
            {!filteredList.length && (
              <tr>
                <td colSpan="2">
                  <p className="p-2 fw-bold text-center mb-0">No contact found</p>
                </td>
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
        heading={"Contact"}
        body={body}
        doneBtn={true}
      />
    </div>
  );
};

export default BillTo;
