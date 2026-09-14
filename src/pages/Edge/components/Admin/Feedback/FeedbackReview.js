import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Nav,
  NavItem,
  NavLink,
  Row,
  Table,
} from "reactstrap";
import classnames from "classnames";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../../utils/LoadingPage";
import { fetchAllFeedback, fetchFeedbackSummary } from "../../../apis";
import { formatDateFunc } from "../../../utils/utilFunc";

const formatDateTime = (value) =>
  formatDateFunc(value, "DD-MM-YYYY h:mm A") || "-";

// Null means nobody rated it. Shown as a dash rather than 0, which is off the
// scale and would read as the worst possible score rather than as no score.
const formatAverage = (value) =>
  value == null ? "-" : Number(value).toFixed(2);

// Red through amber to green across the 1-5 scale, so a table of averages can
// be read at a glance without hunting for the low numbers.
const averageClass = (value) => {
  if (value == null) return "text-muted";
  if (value < 2.5) return "text-danger fw-semibold";
  if (value < 3.5) return "text-warning fw-semibold";
  return "text-success fw-semibold";
};

const StatTile = ({ label, value, hint }) => (
  <Col md={3} sm={6}>
    <Card className="card-animate mb-3">
      <CardBody>
        <p className="text-uppercase fw-medium text-muted mb-2 fs-12">{label}</p>
        <h4 className="mb-1">{value}</h4>
        {hint ? <small className="text-muted">{hint}</small> : null}
      </CardBody>
    </Card>
  </Col>
);

// A plain stacked bar. No chart library is pulled in for this: the distribution
// is five numbers and a div per number reads the same as a rendered chart.
const Distribution = ({ distribution }) => {
  const entries = Object.keys(distribution || {}).map((key) => ({
    key,
    count: distribution[key] || 0,
  }));
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  if (!total) {
    return <small className="text-muted">No answers yet</small>;
  }

  const colours = [
    "bg-danger",
    "bg-warning",
    "bg-secondary",
    "bg-info",
    "bg-success",
  ];

  return (
    <div>
      <div className="progress" style={{ height: "18px" }}>
        {entries.map((entry, index) => (
          <div
            key={entry.key}
            className={`progress-bar ${colours[index % colours.length]}`}
            style={{ width: `${(entry.count / total) * 100}%` }}
            title={`${entry.key}: ${entry.count}`}
          >
            {entry.count > 0 ? entry.count : ""}
          </div>
        ))}
      </div>
      <div className="d-flex flex-wrap gap-2 mt-1">
        {entries.map((entry, index) => (
          <small key={entry.key} className="text-muted">
            <span
              className={`d-inline-block rounded-circle me-1 ${
                colours[index % colours.length]
              }`}
              style={{ width: "8px", height: "8px" }}
            />
            {entry.key} ({entry.count})
          </small>
        ))}
      </div>
    </div>
  );
};

const GroupTable = ({ title, rows }) => (
  <Card>
    <CardHeader>
      <h5 className="mb-0">{title}</h5>
    </CardHeader>
    <CardBody>
      {rows && rows.length ? (
        <div className="table-responsive">
          <Table className="table-nowrap align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>{title.replace("By ", "")}</th>
                <th className="text-center">Responses</th>
                <th className="text-center">Overall satisfaction</th>
                <th className="text-center">vs old version</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.groupName}>
                  <td>{row.groupName}</td>
                  <td className="text-center">{row.responseCount}</td>
                  <td
                    className={`text-center ${averageClass(
                      row.averageSatisfaction
                    )}`}
                  >
                    {formatAverage(row.averageSatisfaction)}
                  </td>
                  <td
                    className={`text-center ${averageClass(
                      row.averageVersusOldVersion
                    )}`}
                  >
                    {formatAverage(row.averageVersusOldVersion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <p className="text-muted mb-0">No responses yet.</p>
      )}
    </CardBody>
  </Card>
);

const FeedbackReview = () => {
  document.title = "Feedback Review | Veeto";

  const [tab, setTab] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [responses, setResponses] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, listRes] = await Promise.all([
        fetchFeedbackSummary(),
        fetchAllFeedback(),
      ]);

      if (summaryRes?.data?.success) {
        setSummary(summaryRes.data.data);
      } else {
        toast.warning(
          summaryRes?.data?.error?.message || "Could not load the summary."
        );
      }

      if (listRes?.data?.success) {
        setResponses(listRes.data.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.warning("Could not load the feedback.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <LoadingPage />;
  }

  const offices = [
    ...new Set(responses.map((r) => r.officeName).filter(Boolean)),
  ];
  const roles = [
    ...new Set(responses.map((r) => r.roleDescription).filter(Boolean)),
  ];

  const filtered = responses.filter(
    (response) =>
      (!officeFilter || response.officeName === officeFilter) &&
      (!roleFilter || response.roleDescription === roleFilter)
  );

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Feedback Review" pageTitle="Admin" />

        <Row>
          <StatTile
            label="Responses"
            value={summary?.responseCount ?? 0}
            hint={`${summary?.respondentCount ?? 0} people`}
          />
          <StatTile
            label="Overall satisfaction"
            value={formatAverage(
              summary?.questionSummaryList?.find((q) => q.questionKey === "Q1")
                ?.averageRating
            )}
            hint="Q1, out of 5"
          />
          <StatTile
            label="Vs old version"
            value={formatAverage(
              summary?.questionSummaryList?.find((q) => q.questionKey === "Q2")
                ?.averageRating
            )}
            hint="Q2, out of 5"
          />
          <StatTile
            label="Latest response"
            value={
              summary?.lastSubmittedAt
                ? formatDateFunc(summary.lastSubmittedAt, "DD-MM-YYYY")
                : "-"
            }
            hint={
              summary?.firstSubmittedAt
                ? `since ${formatDateFunc(
                    summary.firstSubmittedAt,
                    "DD-MM-YYYY"
                  )}`
                : ""
            }
          />
        </Row>

        <Nav tabs className="nav-tabs-custom mb-3">
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: tab === "summary" })}
              onClick={(e) => {
                e.preventDefault();
                setTab("summary");
              }}
            >
              By question
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: tab === "groups" })}
              onClick={(e) => {
                e.preventDefault();
                setTab("groups");
              }}
            >
              By office &amp; role
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              className={classnames({ active: tab === "responses" })}
              onClick={(e) => {
                e.preventDefault();
                setTab("responses");
              }}
            >
              Individual responses
            </NavLink>
          </NavItem>
        </Nav>

        {tab === "summary" && (
          <Card>
            <CardBody>
              {(summary?.questionSummaryList || []).map((question, index) => (
                <div
                  key={question.questionKey}
                  className={index ? "border-top pt-3 mt-3" : ""}
                >
                  <Row className="align-items-start">
                    <Col md={7}>
                      <div className="fw-semibold">
                        {index + 1}. {question.questionText}
                      </div>
                      <small className="text-muted">
                        {question.answeredCount} answered
                        {question.notApplicableCount
                          ? `, ${question.notApplicableCount} don't use this area`
                          : ""}
                        {question.comments?.length
                          ? `, ${question.comments.length} commented`
                          : ""}
                      </small>
                    </Col>
                    <Col md={2} className="text-center">
                      {question.answerType === "RATING" && (
                        <h4
                          className={`mb-0 ${averageClass(
                            question.averageRating
                          )}`}
                        >
                          {formatAverage(question.averageRating)}
                        </h4>
                      )}
                    </Col>
                    <Col md={3}>
                      {question.answerType === "RATING" && (
                        <Distribution
                          distribution={question.ratingDistribution}
                        />
                      )}
                      {question.answerType === "CHOICE" && (
                        <Distribution
                          distribution={question.choiceDistribution}
                        />
                      )}
                    </Col>
                  </Row>

                  {question.comments?.length ? (
                    <details className="mt-2">
                      <summary className="text-primary" role="button">
                        Read {question.comments.length} comment
                        {question.comments.length === 1 ? "" : "s"}
                      </summary>
                      <ul className="mt-2 mb-0 ps-3">
                        {question.comments.map((comment, i) => (
                          // Comments have no id of their own, and two people can
                          // write the same thing, so the index is the only stable
                          // key available here. The list is never reordered.
                          <li key={i} className="text-muted">
                            {comment}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {tab === "groups" && (
          <Row>
            <Col lg={6}>
              <GroupTable
                title="By office"
                rows={summary?.officeSummaryList}
              />
            </Col>
            <Col lg={6}>
              <GroupTable title="By role" rows={summary?.roleSummaryList} />
            </Col>
          </Row>
        )}

        {tab === "responses" && (
          <Card>
            <CardHeader>
              <Row className="g-2">
                <Col md={3}>
                  <Input
                    type="select"
                    value={officeFilter}
                    onChange={(e) => setOfficeFilter(e.target.value)}
                  >
                    <option value="">All offices</option>
                    {offices.map((office) => (
                      <option key={office} value={office}>
                        {office}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={6} className="text-md-end">
                  <small className="text-muted">
                    Showing {filtered.length} of {responses.length}
                  </small>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {filtered.length ? (
                <div className="table-responsive">
                  <Table className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Submitted</th>
                        <th>Who</th>
                        <th>Office</th>
                        <th>Role</th>
                        <th>Answers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((response) => (
                        <tr key={response.id}>
                          <td className="text-nowrap">
                            {formatDateTime(response.submittedAt)}
                          </td>
                          <td>
                            {response.fullName || response.username}
                            <div>
                              <small className="text-muted">
                                {response.username}
                              </small>
                            </div>
                          </td>
                          <td>{response.officeName || "-"}</td>
                          <td>{response.roleDescription || "-"}</td>
                          <td>
                            <details>
                              <summary className="text-primary" role="button">
                                View
                              </summary>
                              <ul className="mt-2 mb-0 ps-3">
                                {(response.answerList || []).map((answer) => (
                                  <li
                                    key={answer.questionKey}
                                    className="mb-1"
                                  >
                                    <small className="text-muted d-block">
                                      {answer.questionText}
                                    </small>
                                    <span>
                                      {answer.notApplicable
                                        ? "Doesn't use this area"
                                        : answer.rating != null
                                        ? `${answer.rating} / 5`
                                        : answer.answerText || ""}
                                    </span>
                                    {answer.comments ? (
                                      <em className="d-block">
                                        {answer.comments}
                                      </em>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No responses match this filter.
                </p>
              )}
            </CardBody>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default FeedbackReview;
