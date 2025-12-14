import { getCustodyListOfContact } from "pages/Edge/apis";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Table } from "reactstrap";
import "../../stylesheets/contact-details.css";
import { toast } from "react-toastify";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { navigationEditFormAction } from "slices/layouts/reducer";

const Safecustody = (props) => {
  const { contactDetails } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [custodyList, setCustodyList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustodyList();
  }, []);

  const fetchCustodyList = async () => {
    const { contactId, contactType } = contactDetails || {};
    setLoading(true);
    try {
      const { data } = await getCustodyListOfContact(
        contactId,
        contactType === "PERSON" ? "person" : "org"
      );
      if (data.success) {
        setCustodyList(data?.data?.safeCustodyPackets || []);
      } else {
        toast.error("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditRowDetail = (row) => {
    const formValue = {
      ...row,
      safeCustodyPacketId: row.id,
    };
    dispatch(
      navigationEditFormAction({
        currentValue: { ...contactDetails, tab: "safe custody" },
        newValue: formValue,
      })
    );
    navigate("/safe-custody");
  };

  return (
    <div className="mt-2">
      <div className="">
        <Table responsive={true} striped={true} hover={true}>
          <thead className="table-light">
            <tr>
              <th>Packet Number</th>
              <th>Comment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {custodyList.map((item, index) => {
              return (
                <tr
                  key={index}
                  className="pe-cursor"
                  onClick={() => {
                    handleEditRowDetail(item);
                  }}
                >
                  <td>
                    {/* <Link
                      to={{
                        pathname: `/safe-custody`,
                        aboutProps: {
                          selectedId: item.id,
                          source: "singlecontact",
                          contact: props?.aboutProps,
                        },
                      }}
                    > */}
                    <div
                      className="contactDetail-val"
                      style={{ fontWeight: "600" }}
                    >
                      {item.packetNumber}
                    </div>
                    {/* </Link> */}
                  </td>
                  <td>{item.comments}</td>
                  <td>{item.status}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {loading && <LoadingPage />}
    </div>
  );
};

export default Safecustody;
