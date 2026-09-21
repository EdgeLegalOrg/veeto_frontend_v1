import React, { Fragment, useState } from "react";
import { XERO_APP_CONNECTION_URL } from "../../../apis";
import "../../../stylesheets/XeroAdmin.css";
import LoadingPage from "../../../utils/LoadingPage";
import {
  Container,
  Card,
  CardHeader,
  Table,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";

const XeroAdmin = () => {
  const [loading, setLoading] = useState(false);

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

  const connectToXero = () => {
    const isConnected = validateTime();
    if (isConnected) {
      window.location.href = "/account-xero-admin-connected";
    } else {
      window.open(XERO_APP_CONNECTION_URL, "_blank");
    }
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Xero Connect" pageTitle="Accounting" />
          <Card>
            <CardHeader>
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Xero Connect
              </h5>
            </CardHeader>
            <Table responsive={true} striped={true} hover={true}>
              <thead className="table-light"></thead>
              <tbody>
                <tr>
                  <td>
                    <div className="p-2 pe-cursor" onClick={connectToXero}>
                      <p className="m-0 text-primary text-bold">
                        CONNECT TO XERO
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </Container>
      </div>
      {loading && <LoadingPage />}
    </Fragment>
  );
};

export default XeroAdmin;
