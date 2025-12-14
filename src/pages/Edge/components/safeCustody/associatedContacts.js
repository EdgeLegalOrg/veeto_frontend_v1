import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import "../../stylesheets/safeCustody.css";
import { Input } from "reactstrap";
import { navigationEditFormAction, resetNavigationEditFormAction } from "slices/layouts/reducer";

function AssociatedContacts(props) {
  const { contacts, handleSelectContact, isContactSelected, safecustodyId } =
    props;
  const dispatch = useDispatch();
  // const [selectedIndex, setSelectedIndex] = useState('');

  const handleClick = (data, index) => {
    handleSelectContact(data, index);
  };

  const handleEditRowDetail = (row) => {
    dispatch(resetNavigationEditFormAction());
    dispatch(
      navigationEditFormAction({
        currentValue: row,
        newValue: row,
      })
    );
  };

  return (
    <>
      {contacts?.map((contact, index) => {
        if (index % 2 === 0)
          return (
            <tr key={index}>
              <td>
                <Input
                  type="checkbox"
                  onChange={() => handleClick(contact, index)}
                  checked={isContactSelected(index)}
                />
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.contactCode}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.firstName}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.lastName}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.companyName}</p>
                </Link>
              </td>
              {/**<div className='col-1'>
                  <Link
                    style={{ textDecoration: 'none', color: 'black' }}
                    to={{
                      pathname: '/Contacts',
                      aboutProps: contact,
                    }}
                  >
                    <p>{contact.contactType}</p>
                  </Link>
                </div> */}
              <td>
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {contact?.contactDetails?.emailAddress}
                      </p>
                    </Tooltip>
                  }
                >
                  <Link
                    style={{ textDecoration: "none" }}
                    to={{
                      pathname: "/Contacts",
                      aboutProps: contact,
                      source: {
                        route: "/safe-custody",
                        details: safecustodyId,
                      },
                    }}
                    onClick={() => handleEditRowDetail(contact)}
                  >
                    <p
                      style={{ textAlign: "left" }}
                      className="mb-0"
                    >
                      {contact?.contactDetails?.emailAddress}
                    </p>
                  </Link>
                </OverlayTrigger>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">
                    {contact?.contactDetails?.telephoneNumber}
                  </p>
                </Link>
              </td>
            </tr>
          );
        else {
          return (
            <tr
              className=""
              key={index}
            >
              <td>
                <Input
                  onChange={() => handleClick(contact, index)}
                  checked={isContactSelected(index)}
                  type="checkbox"
                />
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.contactCode}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.firstName}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.lastName}</p>
                </Link>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">{contact?.contactDetails?.companyName}</p>
                </Link>
              </td>
              {/**<div className='col-1'>
                  <Link
                    style={{ textDecoration: 'none', color: 'black' }}
                    to={{
                      pathname: '/Contacts',
                      aboutProps: contact,
                    }}
                  >
                    <p>{contact.contactType}</p>
                  </Link>
                </div> */}
              <td>
                <OverlayTrigger
                  key="bottom"
                  placement="bottom-start"
                  overlay={
                    <Tooltip id={`tooltip-bottom`}>
                      <p
                        style={{ textAlign: "left" }}
                        className="mb-0"
                      >
                        {contact.contactDetails.emailAddress}
                      </p>
                    </Tooltip>
                  }
                >
                  <Link
                    style={{ textDecoration: "none" }}
                    to={{
                      pathname: "/Contacts",
                      aboutProps: contact,
                      source: {
                        route: "/safe-custody",
                        details: safecustodyId,
                      },
                    }}
                    onClick={() => handleEditRowDetail(contact)}
                  >
                    <p
                      style={{ textAlign: "left" }}
                      className="mb-0"
                    >
                      {contact?.contactDetails?.emailAddress}
                    </p>
                  </Link>
                </OverlayTrigger>
              </td>
              <td>
                <Link
                  style={{ textDecoration: "none" }}
                  to={{
                    pathname: "/Contacts",
                    aboutProps: contact,
                    source: {
                      route: "/safe-custody",
                      details: safecustodyId,
                    },
                  }}
                  onClick={() => handleEditRowDetail(contact)}
                >
                  <p className="mb-0">
                    {contact?.contactDetails?.telephoneNumber}
                  </p>
                </Link>
              </td>
            </tr>
          );
        }
      })}
    </>
  );
}

export default AssociatedContacts;
