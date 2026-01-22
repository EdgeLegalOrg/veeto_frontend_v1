import React, { useEffect, useState } from "react";
import InvoiceList from "./InvoiceList";
import PaymentList from "./PaymentList";
import { Button, Card, Container, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { getQuery } from "pages/Edge/utils/utilFunc";
import { toast } from "react-toastify";
import { set } from "lodash";

const XeroListing = () => {
  document.title = "Xero Connect | EdgeLegal";
  const [selectedTab, setSelectedTab] = useState("invoices");
  const [refreshBothList, setRefreshBothList] = useState(false);

  useEffect(() => {
    const session = window.localStorage.getItem("xeroSession");
    if (session) {
      validateTime(session);
    } else {
      const query = getQuery();
      if (query.session) {
        window.localStorage.setItem("xeroSession", query.session);
      }
    }
  }, []);

  const validateTime = (session) => {
    const now = Date.now();
    if (now > parseInt(session)) {
      toast.warning("Xero Export Session Ends!");

      window.localStorage.removeItem("xeroSession");

      window.location.href = "/account-xero-admin";
    }
  };

  const changeTab = (tab) => {
    if (tab === selectedTab) {
      return;
    }

    setSelectedTab(tab);
  };

  const disconnect = () => {
    toast.warning("Xero Export Session Disconnected!");

    window.localStorage.removeItem("xeroSession");

    window.location.href = "/account-xero-admin";
  };

  const handleRefresh = (doRefresh = true) => {
    if (!doRefresh) {
      setRefreshBothList(false);
      return;
    }

    if (!refreshBothList) {
      setRefreshBothList(true);
      setTimeout(() => {
        setRefreshBothList(false);
      }, 10000);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Card>
          <div className="xero-container">
            <div className="d-flex align-items-center border py-2">
              <h5 className="mb-0 mx-4">Xero Export</h5>
              <Button
                color="danger"
                className="mx-2"
                // disabled={isArchiveDisable()}
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
            <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success m-4">
              <NavItem key={"invoice"} className="py-2">
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    // active: getSelectedClass('invoices'),
                    active: selectedTab === "invoices",
                  })}
                  onClick={() => changeTab("invoices")}
                >
                  Invoices
                </NavLink>
              </NavItem>
              <NavItem key={"payments"} className="py-2">
                <NavLink
                  style={{ cursor: "pointer" }}
                  className={classnames({
                    // active: getSelectedClass('payments'),
                    active: selectedTab === "payments",
                  })}
                  onClick={() => changeTab("payments")}
                >
                  Payments
                </NavLink>
              </NavItem>
            </Nav>
            <InvoiceList
              active={selectedTab === "invoices"}
              refreshList={refreshBothList}
              handleRefresh={handleRefresh}
            />
            <PaymentList
              active={selectedTab === "payments"}
              refreshList={refreshBothList}
              handleRefresh={handleRefresh}
            />
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default XeroListing;
