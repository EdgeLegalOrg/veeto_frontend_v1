import React, { useEffect } from "react";
import { Card, CardBody, Container } from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import TeamPrecedentBrowser from "./TeamPrecedentBrowser";

/** Company-wide master library; generation and copy actions live only in Matter Details. */
const DocumentPage = () => {
  useEffect(() => { document.title = "Team Precedents | Veeto"; }, []);
  return <div className="page-content"><Container fluid>
    <BreadCrumb title="Team Precedents" pageTitle="Team Precedents" />
    <Card><CardBody>
      <p className="text-muted small">Manage the company's shared master documents. Use them from Matter Details → Precedents to generate or copy a document.</p>
      <TeamPrecedentBrowser />
    </CardBody></Card>
  </Container></div>;
};
export default DocumentPage;
