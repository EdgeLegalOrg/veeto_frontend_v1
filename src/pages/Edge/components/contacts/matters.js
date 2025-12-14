import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Table } from "reactstrap";
import "../../stylesheets/contact-details.css";
import { toast } from "react-toastify";
import { getMatterListOfContact } from "pages/Edge/apis";
import { findDisplayname } from "pages/Edge/utils/utilFunc";
import LoadingPage from "pages/Edge/utils/LoadingPage";
import { navigationEditFormAction } from "slices/layouts/reducer";

function matters(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [matterList, setMatterList] = useState([]);
  const [type, setType] = useState([]);
  const [subType, setSubType] = useState([]);
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnums();
    fetchMatterList();
  }, []);

  const fetchEnums = () => {
    let enumsList = JSON.parse(window.localStorage.getItem("enumList"));
    let typeList = JSON.parse(window.localStorage.getItem("matterTypeList"));

    if (typeList && typeList.length > 0) {
      setType(typeList);
    }
    let status = [];
    let subType = [];
    if (enumsList) {
      status =
        enumsList["MatterStatus"] && enumsList["MatterStatus"].length > 0
          ? enumsList["MatterStatus"]
          : [];
      setStatus(status);
      subType =
        enumsList["MatterSubType"] && enumsList["MatterSubType"].length > 0
          ? enumsList["MatterSubType"]
          : [];
      setSubType(subType);
    }
  };

  const fetchMatterList = async () => {
    const { contactId, contactType } = props?.contactDetails || {};
    setLoading(true);
    try {
      const { data } = await getMatterListOfContact(
        contactId,
        contactType === "PERSON" ? "person" : "org"
      );
      if (data.success) {
        setMatterList(data?.data?.matterList || []);
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
      matterId: row.id,
    };
    dispatch(
      navigationEditFormAction({
        currentValue: {
          ...props?.contactDetails,
          ...formValue,
          tab: "matters",
          original: "Contacts",
        },
        newValue: formValue,
      })
    );
    navigate("/Matters");
  };

  return (
    <div className="mt-2">
      <div className="">
        <Table responsive={true} striped={true} hover={true}>
          <thead className="table-light">
            <tr>
              <th>Matter No.</th>
              <th>Matter Type</th>
              <th>Matter Sub-type</th>
              <th>Re</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matterList.map((matter) => (
              <tr
                key={matter.id}
                className="pe-cursor"
                onClick={() => {
                  handleEditRowDetail(matter);
                }}
              >
                <td>{matter.matterNumber}</td>
                <td>{findDisplayname(type, matter.type)}</td>
                <td>{findDisplayname(subType, matter.subType)}</td>
                <td>{matter.letterSubject}</td>
                <td>{findDisplayname(status, matter.status)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      {loading && <LoadingPage />}
    </div>
  );
}

export default matters;
