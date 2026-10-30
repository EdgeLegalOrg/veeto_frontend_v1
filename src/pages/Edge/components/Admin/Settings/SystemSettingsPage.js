import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import BreadCrumb from "Components/Common/BreadCrumb";
import {
  resetFormStatusAction,
  updateFormStatusAction,
} from "slices/layouts/reducer";
import { fetchGstSettings, saveGstSettings } from "../../../apis";
import { VIEWADMINTAB } from "../../../utils/RightConstants";
import { checkHasPermission } from "../../../utils/utilFunc";

const errorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  "Unable to load or save the GST rate. Please retry.";

/** Edits the active site's GST percentage without recalculating previously recorded billing. */
const SystemSettingsPage = () => {
  const dispatch = useDispatch();
  const permitted = checkHasPermission(VIEWADMINTAB);
  const [rate, setRate] = useState("");
  const [savedRate, setSavedRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [site, setSite] = useState(null);
  const [reload, setReload] = useState(0);
  const mounted = useRef(false);
  const dirty = rate !== savedRate;
  const valid =
    /^\d+(?:\.\d{1,2})?$/.test(rate) &&
    Number(rate) >= 0 &&
    Number(rate) <= 100;

  useEffect(() => {
    document.title = "System Settings | Veeto";
    mounted.current = true;
    const controller = new AbortController();
    setLoading(true);
    setAvailable(false);
    setSite(null);
    setError("");
    setRate("");
    setSavedRate("");
    setSubmitted(false);
    if (!permitted) {
      setLoading(false);
      return () => {
        mounted.current = false;
        controller.abort();
      };
    }
    fetchGstSettings({ signal: controller.signal })
      .then(({ data }) => {
        if (!mounted.current || controller.signal.aborted) return;
        if (!data.success || !data.data?.siteId)
          throw new Error("The site's GST settings could not be loaded.");
        const value =
          data.data.gstRate == null ? "" : String(data.data.gstRate);
        setSite({ id: data.data.siteId, name: data.data.siteName });
        setRate(value);
        setSavedRate(value);
        setAvailable(true);
      })
      .catch((err) => {
        if (!mounted.current || controller.signal.aborted) return;
        setError(errorMessage(err));
        setAvailable(false);
      })
      .finally(() => {
        if (mounted.current && !controller.signal.aborted) setLoading(false);
      });
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [permitted, reload]);

  useEffect(() => {
    dispatch(updateFormStatusAction({ key: "isFormChanged", value: dirty }));
    const warn = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, dispatch]);
  useEffect(() => () => dispatch(resetFormStatusAction()), [dispatch]);

  const save = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid || !available || !permitted || !site || saving) return;
    setSaving(true);
    try {
      const { data } = await saveGstSettings({
        siteId: site.id,
        gstRate: Number(rate),
      });
      if (!data.success || data.data?.gstRate == null)
        throw new Error("The GST rate could not be saved.");
      if (!mounted.current) return;
      const value = String(data.data.gstRate);
      setRate(value);
      setSavedRate(value);
      setError("");
      setSubmitted(false);
      toast.success(`GST rate updated for ${site.name || "this site"}.`);
    } catch (err) {
      if (mounted.current) setError(errorMessage(err));
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="System Settings" pageTitle="Admin" />
        {!permitted ? (
          <Alert color="danger">
            You do not have permission to manage system settings.
          </Alert>
        ) : (
          <Row>
            <Col lg={7} xl={6}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">GST Settings</h5>
                </CardHeader>
                <CardBody>
                  {error && (
                    <Alert color="danger" role="alert">
                      {error}
                    </Alert>
                  )}
                  {loading ? (
                    <p role="status">
                      <Spinner size="sm" className="me-2" />
                      Loading GST settings...
                    </p>
                  ) : (
                    <Form onSubmit={save} noValidate>
                      <p className="mb-3">
                        <strong>Site:</strong>{" "}
                        {site?.name ||
                          (site ? `Office ${site.id}` : "Unavailable")}
                      </p>
                      {site && savedRate === "" && (
                        <Alert color="warning">
                          GST is not configured for this site. Enter and save a
                          rate before adding taxable billing entries.
                        </Alert>
                      )}
                      <Label for="gstRate">GST Rate (%)</Label>
                      <Input
                        id="gstRate"
                        name="gstRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={rate}
                        onChange={(event) => setRate(event.target.value)}
                        disabled={saving || !available}
                        invalid={submitted && !valid}
                        aria-describedby="gst-rate-help gst-rate-validation"
                        required
                      />
                      <FormFeedback id="gst-rate-validation">
                        Enter a percentage from 0 to 100, with up to two decimal
                        places.
                      </FormFeedback>
                      <p id="gst-rate-help" className="text-muted small mt-2">
                        Applies only to {site?.name || "this site"} for new
                        invoice items and time-billing entries. Existing entries
                        keep their recorded rate. GST Not Applicable remains 0%.
                      </p>
                      <p className="text-muted small">
                        If you export invoices to Xero, its tax codes must match
                        the rates used on those invoices.
                      </p>
                      <Button
                        color="success"
                        type="submit"
                        disabled={saving || !available || !dirty}
                      >
                        {saving && <Spinner size="sm" className="me-2" />}
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        color="light"
                        type="button"
                        className="ms-2"
                        disabled={saving}
                        onClick={() => {
                          if (
                            !dirty ||
                            window.confirm(
                              "Discard unsaved GST changes and reload the current site's settings?",
                            )
                          )
                            setReload((value) => value + 1);
                        }}
                      >
                        Reload
                      </Button>
                    </Form>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default SystemSettingsPage;
