import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Label,
  Row,
} from "reactstrap";
import { toast } from "react-toastify";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../utils/LoadingPage";
import { fetchFeedbackForm, submitFeedback } from "../../apis";

// The role list ends with "Other"; picking it reveals a text box, and whatever
// is typed there is what gets stored and grouped.
const OTHER_ROLE = "Other";

const GiveFeedback = () => {
  document.title = "Give Feedback | Veeto";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [officeSiteId, setOfficeSiteId] = useState("");
  const [role, setRole] = useState("");
  const [otherRole, setOtherRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const loadForm = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchFeedbackForm();
      if (data?.success) {
        setForm(data.data);
        setOfficeSiteId(
          data.data?.currentSiteId != null ? String(data.data.currentSiteId) : ""
        );
      } else {
        toast.warning(data?.error?.message || "Could not load the feedback form.");
      }
    } catch (error) {
      console.error(error);
      toast.warning("Could not load the feedback form.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadForm();
  }, [loadForm]);

  const setAnswer = (questionKey, patch) =>
    setAnswers((current) => ({
      ...current,
      [questionKey]: { ...(current[questionKey] || {}), ...patch },
    }));

  const handleRating = (question, value) => {
    const existing = answers[question.questionKey] || {};
    // Clicking the selected value again clears it, so a mis-click is
    // recoverable without reloading the page. There is no "unanswered" button
    // to go back to otherwise.
    setAnswer(question.questionKey, {
      rating: existing.rating === value ? null : value,
      notApplicable: false,
    });
  };

  const handleNotApplicable = (question) => {
    const existing = answers[question.questionKey] || {};
    setAnswer(question.questionKey, {
      notApplicable: !existing.notApplicable,
      rating: null,
    });
  };

  const answeredCount = (form?.questionList || []).filter((question) => {
    const answer = answers[question.questionKey] || {};
    if (question.answerType === "RATING") {
      return answer.rating != null || answer.notApplicable;
    }
    if (question.answerType === "CHOICE") {
      return !!answer.answerText;
    }
    return !!(answer.comments || "").trim();
  }).length;

  const handleSubmit = async () => {
    const resolvedRole = role === OTHER_ROLE ? otherRole.trim() : role;

    if (!officeSiteId) {
      toast.warning("Please choose which office you work in.");
      return;
    }
    if (!resolvedRole) {
      toast.warning("Please choose your role.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await submitFeedback({
        officeSiteId: Number(officeSiteId),
        roleDescription: resolvedRole,
        answerList: (form?.questionList || []).map((question) => {
          const answer = answers[question.questionKey] || {};
          return {
            questionKey: question.questionKey,
            rating: answer.rating ?? null,
            answerText: answer.answerText ?? null,
            comments: (answer.comments || "").trim() || null,
            notApplicable: !!answer.notApplicable,
          };
        }),
      });

      if (data?.success) {
        setSubmitted(true);
      } else {
        toast.warning(data?.error?.message || "Your feedback could not be saved.");
      }
    } catch (error) {
      console.error(error);
      toast.warning("Your feedback could not be saved.");
    }
    setSaving(false);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (submitted) {
    return (
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Give Feedback" pageTitle="Feedback" />
          <Card>
            <CardBody className="text-center py-5">
              <i className="ri-checkbox-circle-line display-4 text-success" />
              <h4 className="mt-3">Thank you</h4>
              <p className="text-muted mb-4">
                Your feedback has been recorded and will be read as part of the
                post-migration review.
              </p>
              <Button
                color="light"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  loadForm();
                }}
              >
                Give more feedback
              </Button>
            </CardBody>
          </Card>
        </Container>
      </div>
    );
  }

  const questions = form?.questionList || [];
  const offices = form?.officeList || {};

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Give Feedback" pageTitle="Feedback" />

        <Card>
          <CardHeader>
            <h5 className="mb-1">How is the new version working for you?</h5>
            <p className="text-muted mb-0">
              You used the old version, often for years, and were moved onto this
              one. This is a genuine review — unfavourable answers are as useful
              as favourable ones, and every question has a comment box if the
              rating alone doesn&apos;t tell the story.
            </p>
          </CardHeader>
          <CardBody>
            {/* Said plainly and up front. Recording who said what while looking
                anonymous would get less honest answers and would not be a fair
                thing to do to the people answering. */}
            <div className="alert alert-info d-flex align-items-center" role="alert">
              <i className="ri-information-line me-2 fs-18" />
              <div>
                Your responses are recorded against your username
                {form?.username ? ` (${form.username})` : ""}, so they are not
                anonymous.
                {form?.alreadySubmitted
                  ? " You have given feedback before — this will be added alongside it, not replace it."
                  : ""}
              </div>
            </div>

            <Row className="g-3 mb-4">
              <Col md={6}>
                <Label className="form-label fw-semibold" for="feedbackOffice">
                  Which office do you work in? <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  id="feedbackOffice"
                  value={officeSiteId}
                  onChange={(e) => setOfficeSiteId(e.target.value)}
                >
                  <option value="">Please choose…</option>
                  {Object.keys(offices).map((siteId) => (
                    <option key={siteId} value={siteId}>
                      {offices[siteId]}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md={6}>
                <Label className="form-label fw-semibold" for="feedbackRole">
                  What is your role? <span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  id="feedbackRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Please choose…</option>
                  {(form?.roleList || []).map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </Input>
                {role === OTHER_ROLE && (
                  <Input
                    className="mt-2"
                    placeholder="Please tell us your role"
                    value={otherRole}
                    onChange={(e) => setOtherRole(e.target.value)}
                  />
                )}
              </Col>
            </Row>

            {questions.map((question, index) => {
              const answer = answers[question.questionKey] || {};
              return (
                <div
                  key={question.questionKey}
                  className="border-top pt-3 mt-3"
                >
                  <Label className="form-label fw-semibold d-block">
                    {index + 1}. {question.questionText}
                  </Label>

                  {question.answerType === "RATING" && (
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <small className="text-muted me-1">
                        {question.lowLabel}
                      </small>
                      {Array.from(
                        { length: question.ratingScaleMax },
                        (_, i) => i + 1
                      ).map((value) => (
                        <Button
                          key={value}
                          type="button"
                          color={answer.rating === value ? "primary" : "light"}
                          onClick={() => handleRating(question, value)}
                        >
                          {value}
                        </Button>
                      ))}
                      <small className="text-muted ms-1">
                        {question.highLabel}
                      </small>
                      {question.allowNotApplicable && (
                        <Button
                          type="button"
                          color={answer.notApplicable ? "secondary" : "light"}
                          className="ms-2"
                          onClick={() => handleNotApplicable(question)}
                        >
                          I don&apos;t use this area
                        </Button>
                      )}
                    </div>
                  )}

                  {question.answerType === "CHOICE" && (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {(question.options || []).map((option) => (
                        <Button
                          key={option}
                          type="button"
                          color={
                            answer.answerText === option ? "primary" : "light"
                          }
                          onClick={() =>
                            setAnswer(question.questionKey, {
                              answerText:
                                answer.answerText === option ? null : option,
                            })
                          }
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  <Input
                    type="textarea"
                    rows={question.answerType === "FREE_TEXT" ? 4 : 2}
                    placeholder={
                      question.answerType === "FREE_TEXT"
                        ? "Your answer"
                        : "Additional comments (optional)"
                    }
                    value={answer.comments || ""}
                    onChange={(e) =>
                      setAnswer(question.questionKey, {
                        comments: e.target.value,
                      })
                    }
                  />
                </div>
              );
            })}

            <div className="d-flex align-items-center justify-content-between border-top mt-4 pt-3">
              <small className="text-muted">
                {answeredCount} of {questions.length} questions answered. Every
                question is optional except your office and role.
              </small>
              <Button color="primary" disabled={saving} onClick={handleSubmit}>
                {saving ? "Sending…" : "Submit feedback"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default GiveFeedback;
