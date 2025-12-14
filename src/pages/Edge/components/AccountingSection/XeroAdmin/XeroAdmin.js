import React, { Fragment, useState } from "react";
import { getXeroSetting, XERO_APP_CONNECTION_URL } from "../../../apis";
import "../../../stylesheets/XeroAdmin.css";
import LoadingPage from "../../../utils/LoadingPage";
import XeroSetting from "./XeroSetting";
import {
  Container,
  Card,
  CardHeader,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";

const XeroAdmin = () => {
  const [xeroDetail, setXeroDetail] = useState({});
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const session = window.localStorage.getItem('xeroSession');
  //   if (session) {
  //     validateTime(session);
  //   }
  // }, []);

  const validateTime = () => {
    const now = Date.now();
    const session = window.localStorage.getItem("xeroSession");

    if (session && now < parseInt(session)) {
      return true;
    } else {
      window.localStorage.removeItem("xeroSession");
      return false;
    }
  };

  const handleDetail = async () => {
    setLoading(true);
    try {
      const { data } = await getXeroSetting();
      if (data.success) {
        setXeroDetail(data.data);
        setTimeout(() => {
          setShowDetail(true);
        }, 10);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const connectToXero = () => {
    const isConnected = validateTime();
    if (isConnected) {
      window.location.href = "/account-xero-admin-connected";
    } else {
      // skey
      window.open(XERO_APP_CONNECTION_URL, "_blank");
    }
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Matter Management" pageTitle="Matter" />
          <Card>
            <CardHeader>
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Xero Admin
              </h5>
            </CardHeader>
            <Table responsive={true} striped={true} hover={true}>
              <thead className="table-light"></thead>
              <tbody>
                <tr>
                  <td>
                    <div className="p-2 pe-cursor" onClick={handleDetail}>
                      <p className="m-0 text-primary text-bold">
                        XERO SETTINGS
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="p-2 pe-cursor" onClick={connectToXero}>
                      <p className="m-0 text-primary text-bold">
                        {/* {validateTime() ? 'DISCONNECT XERO' : 'CONNECT TO XERO'} */}
                        {"CONNECT TO XERO"}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Container>
      </div>

      {showDetail && (
        <Modal
          isOpen={showDetail}
          toggle={() => setShowDetail(false)}
          backdrop="static"
          scrollable={true}
          size="lg"
          centered
        >
          <ModalHeader
            toggle={() => setShowDetail(false)}
            className="bg-light p-3"
          >
            Add new Template
          </ModalHeader>
          <ModalBody>
            <XeroSetting
              setShowDetail={setShowDetail}
              data={xeroDetail}
              refresh={() => handleDetail()}
            />
          </ModalBody>
        </Modal>
      )}
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default XeroAdmin;
