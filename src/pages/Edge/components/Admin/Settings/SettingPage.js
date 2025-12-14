import React, { Fragment, useState, useEffect } from "react";
import { Container, Card, Input } from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import SettingStripe from "../../topStripes/SettingStripe";
import LoadingPage from "../../../utils/LoadingPage";
import { fetchNumbering, editNumbering } from "../../../apis";
import "../../../stylesheets/SettingPage.css";
import { toast } from "react-toastify";
import { TextInputField } from "pages/Edge/components/InputField";

const initialData = {
  baseArchivedMatterSeriesNumber: 0,
  baseInvoiceSeriesNumber: 0,
  baseMatterSeriesNumber: 0,
  basePacketSeriesNumber: 0,
  basePaymentSeriesNumber: 0,
  ceilingArchivedMatterSeriesNumber: 0,
  ceilingInvoiceSeriesNumber: 0,
  ceilingMatterSeriesNumber: 0,
  ceilingPacketSeriesNumber: 0,
  ceilingPaymentSeriesNumber: 0,
  useArchivedMatterSeries: true,
  useInvoiceSeries: true,
  useMatterSeries: true,
  usePacketSeries: true,
  usePaymentSeries: true,
};

const SettingPage = () => {
  document.title = "System Numerals | EdgeLegal";
  const [content, setContent] = useState(initialData);
  const [error, setError] = useState({
    baseArchivedMatterSeriesNumber: "",
    baseInvoiceSeriesNumber: "",
    baseMatterSeriesNumber: "",
    basePacketSeriesNumber: "",
    basePaymentSeriesNumber: "",
  });

  const [boolVal, setBoolVal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);

  const getNumberings = async () => {
    try {
      setLoading(true);
      const { data } = await fetchNumbering();
      if (data.success) {
        setContent(data.data);
      } else {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    if (!boolVal) {
      getNumberings();
      setBoolVal(true);
    }
  }, [boolVal]);

  const checkNumbering = (name, val) => {
    if (name === "baseArchivedMatterSeriesNumber") {
      if (val < content.ceilingArchivedMatterSeriesNumber) {
        setError({ ...error, baseArchivedMatterSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseArchivedMatterSeriesNumber:
            "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "ceilingArchivedMatterSeriesNumber") {
      if (val > content.ceilingArchivedMatterSeriesNumber) {
        setError({ ...error, baseArchivedMatterSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseArchivedMatterSeriesNumber:
            "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "baseInvoiceSeriesNumber") {
      if (val < content.ceilingInvoiceSeriesNumber) {
        setError({ ...error, baseInvoiceSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseInvoiceSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "ceilingInvoiceSeriesNumber") {
      if (val > content.baseInvoiceSeriesNumber) {
        setError({ ...error, baseInvoiceSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseInvoiceSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "baseMatterSeriesNumber") {
      if (val < content.ceilingMatterSeriesNumber) {
        setError({ ...error, baseMatterSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseMatterSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "ceilingMatterSeriesNumber") {
      if (val > content.baseMatterSeriesNumber) {
        setError({ ...error, baseMatterSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          baseMatterSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "basePacketSeriesNumber") {
      if (val < content.ceilingPacketSeriesNumber) {
        setError({ ...error, basePacketSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          basePacketSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "ceilingPacketSeriesNumber") {
      if (val > content.basePacketSeriesNumber) {
        setError({ ...error, basePacketSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          basePacketSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else if (name === "basePaymentSeriesNumber") {
      if (val < content.ceilingPaymentSeriesNumber) {
        setError({ ...error, basePaymentSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          basePaymentSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    } else {
      if (val > content.basePaymentSeriesNumber) {
        setError({ ...error, basePaymentSeriesNumber: "" });
        setDisable(false);
      } else {
        setError({
          ...error,
          basePaymentSeriesNumber: "Base value must be less than ceiling",
        });
        setDisable(true);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (parseInt(value) >= 0 || value === "") {
      setContent({ ...content, [name]: value !== "" ? parseInt(value) : "" });
    }
    checkNumbering(name, value);
  };

  const handleChangeChecked = (e) => {
    const { name, checked } = e.target;
    setContent({ ...content, [name]: checked });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { data } = await editNumbering(content);
      if (!data.success) {
        toast.error(
          "There is some problem from server side, please try later."
        );
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="System Numerals" pageTitle="Admin" />
          <Card>
            <SettingStripe update={handleUpdate} disable={disable} />
            <div className="settingPage-body">
              {/******** First Content Div ******** */}
              <div className="row mt-2">
                <div className="col-md-4 d-flex align-items-center my-2">
                  <Input
                    type="checkbox"
                    className="setting-checkbox"
                    checked={content.useArchivedMatterSeries}
                    name="useArchivedMatterSeries"
                    onChange={handleChangeChecked}
                  />
                  <p className="mb-0">Archived Matter Sequence Number</p>
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="baseArchivedMatterSeriesNumber"
                    placeholder="Base Archived Matter Sequence Number"
                    width="100%"
                    value={content.baseArchivedMatterSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.baseArchivedMatterSeriesNumber}
                    invalid={!error.baseArchivedMatterSeriesNumber}
                    invalidMessage={error.baseArchivedMatterSeriesNumber}
                    maxLength={7}
                  />
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="ceilingArchivedMatterSeriesNumber"
                    placeholder="Ceiling Archived Matter Sequence Number"
                    width="46%"
                    value={content.ceilingArchivedMatterSeriesNumber}
                    onChange={handleFormChange}
                    maxLength={7}
                    required={!error.useArchivedMatterSeries}
                    invalid={!error.useArchivedMatterSeries}
                    invalidMessage={error.useArchivedMatterSeries}
                  />
                </div>
              </div>

              {/******** Second Content Div ******** */}
              <div className="row mt-2">
                <div className="col-md-4 d-flex align-items-center my-2">
                  <Input
                    type="checkbox"
                    className="setting-checkbox"
                    checked={content.useInvoiceSeries}
                    onChange={handleChangeChecked}
                    name="useInvoiceSeries"
                  />
                  <p className="mb-0">Invoice Sequence Number</p>
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="baseInvoiceSeriesNumber"
                    placeholder="Base Invoice Sequence Number"
                    width="100%"
                    value={content.baseInvoiceSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.baseInvoiceSeriesNumber}
                    invalid={!error.baseInvoiceSeriesNumber}
                    invalidMessage={error.baseInvoiceSeriesNumber}
                    maxLength={7}
                  />
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="ceilingInvoiceSeriesNumber"
                    placeholder="Ceiling Invoice Sequence Number"
                    width="46%"
                    value={content.ceilingInvoiceSeriesNumber}
                    onChange={handleFormChange}
                    maxLength={7}
                    required={!error.useInvoiceSeries}
                    invalid={!error.useInvoiceSeries}
                    invalidMessage={error.useInvoiceSeries}
                    disabled={!content.useInvoiceSeries}
                  />
                </div>
              </div>

              {/******** Third Content Div ******** */}
              <div className="row mt-2">
                <div className="col-md-4 d-flex align-items-center my-2">
                  <Input
                    type="checkbox"
                    className="setting-checkbox"
                    checked={content.useMatterSeries}
                    onChange={handleChangeChecked}
                    name="useMatterSeries"
                  />
                  <p className="mb-0">Matter Sequence Number</p>
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="baseMatterSeriesNumber"
                    placeholder="Base Matter Sequence Number"
                    width="100%"
                    value={content.baseMatterSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.baseMatterSeriesNumber}
                    invalid={!error.baseMatterSeriesNumber}
                    invalidMessage={error.baseMatterSeriesNumber}
                    maxLength={7}
                    disabled={!content.useMatterSeries}
                  />
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="ceilingMatterSeriesNumber"
                    placeholder="Ceiling Matter Sequence Number"
                    width="46%"
                    value={content.ceilingMatterSeriesNumber}
                    onChange={handleFormChange}
                    maxLength={7}
                    required={!error.ceilingMatterSeriesNumber}
                    invalid={!error.ceilingMatterSeriesNumber}
                    invalidMessage={error.ceilingMatterSeriesNumber}
                    disabled={!content.useMatterSeries}
                  />
                </div>
              </div>

              {/******** Fourth Content Div ******** */}
              <div className="row mt-2">
                <div className="col-md-4 d-flex align-items-center my-2">
                  <Input
                    type="checkbox"
                    className="setting-checkbox"
                    checked={content.usePaymentSeries}
                    onChange={handleChangeChecked}
                    name="usePaymentSeries"
                  />
                  <p className="mb-0">Payment Sequence Number</p>
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="basePaymentSeriesNumber"
                    placeholder="Base Payment Sequence Number"
                    width="100%"
                    value={content.basePaymentSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.basePaymentSeriesNumber}
                    invalid={!error.basePaymentSeriesNumber}
                    invalidMessage={error.basePaymentSeriesNumber}
                    maxLength={7}
                    disabled={!content.usePaymentSeries}
                  />
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="ceilingPaymentSeriesNumber"
                    placeholder="Ceiling Payment Sequence Number"
                    width="46%"
                    value={content.ceilingPaymentSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.ceilingPaymentSeriesNumber}
                    invalid={!error.ceilingPaymentSeriesNumber}
                    invalidMessage={error.ceilingPaymentSeriesNumber}
                    maxLength={7}
                    disabled={!content.usePaymentSeries}
                  />
                </div>
              </div>

              {/******** Fifth Content Div ******** */}
              <div className="row mt-2">
                <div className="col-md-4 d-flex align-items-center my-2">
                  <Input
                    type="checkbox"
                    className="setting-checkbox"
                    checked={content.usePacketSeries}
                    onChange={handleChangeChecked}
                    name="usePacketSeries"
                  />
                  <p className="mb-0">Packet Sequence Number</p>
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="basePacketSeriesNumber"
                    placeholder="Base Packet Sequence Number"
                    width="100%"
                    value={content.basePacketSeriesNumber}
                    onChange={handleFormChange}
                    required={!error.basePacketSeriesNumber}
                    invalid={!error.basePacketSeriesNumber}
                    invalidMessage={error.basePacketSeriesNumber}
                    maxLength={7}
                    disabled={!content.usePacketSeries}
                  />
                </div>
                <div className="col-md-4 my-2">
                  <TextInputField
                    name="ceilingPacketSeriesNumber"
                    placeholder="Ceiling Packet Sequence Number"
                    width="46%"
                    value={content.ceilingPacketSeriesNumber}
                    onChange={handleFormChange}
                    maxLength={7}
                    disabled={!content.usePacketSeries}
                  />
                </div>
              </div>
            </div>
            {loading && <LoadingPage />}
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default SettingPage;
