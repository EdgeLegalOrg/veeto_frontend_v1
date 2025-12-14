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
    if (props?.selectedList?.length) {
      prepareSelectedContact(props.contactList);
    }
  }, [props.selectedList]);

  const prepareSelectedContact = (allContacts) => {
    const selectedBillTos = props.selectedList.map((billTo) => {
      return allContacts.find((contact) => contact.display === billTo.billTo);
    });

    setSelected(selectedBillTos);
  };

  const handleClose = () => {
    if (props.close) {
      props.close();
    }
  };

  const handleFilter = (e) => {
    const { value } = e.target;

    let newArr = contactList.filter((c) =>
      c?.display?.toLowerCase().includes(value?.toLowerCase())
    );
    setFilteredList(newArr);
  };

  const handleSelect = (val) => {
    let arr = [];
    const present = selected.find((item) => item.valueKey === val.valueKey);

    if (!present) {
      arr = [...selected, val];
      setSelected(arr);

      setTimeout(() => {
        updateValue(arr);
      }, 10);
    }
  };

  const updateValue = (arg) => {
    let arr = [];

    arg.forEach((a) => {
      arr.push({ billTo: a.display });
    });

    if (props.onChange) {
      props.onChange("billToList", arr);
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
            {filteredList.map((contact) => (
              <tr
                key={contact.valueKey}
                onClick={() => handleSelect(contact)}
                className="pe-cursor"
              >
                <p className="m-0 mx-1">{contact.display}</p>
              </tr>
            ))}
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
