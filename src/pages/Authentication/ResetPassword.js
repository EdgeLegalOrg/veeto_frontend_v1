import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
  Alert,
} from "reactstrap";
import { useSearchParams, Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";
import * as Yup from "yup";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import logoLight from "../../assets/images/logo-light.png";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { resetPassword, updateTempPassword } from "../Edge/apis";

const ResetPasswordPage = (props) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isTempPasswordFlow = !token && !!userId;

  const extractMessage = (resData, fallback) => {
    return resData?.error?.message || resData?.message || fallback;
  };

  const handlePasswordSubmit = async (newPassword) => {
    if (isTempPasswordFlow) {
      const res = await updateTempPassword({
        userId: Number.parseInt(userId),
        newPassword,
      });
      const resData = res?.data;
      if (resData?.success === false || resData?.error || resData?.status === "ERROR") {
        throw new Error(extractMessage(resData, "Failed to update password"));
      }
      sessionStorage.removeItem("forcePasswordReset");
      toast.success("Password updated successfully! Please log in.");
    } else {
      const res = await resetPassword({
        token,
        userId: Number.parseInt(userId),
        newPassword,
      });
      const resData = res?.data;
      if (
        resData?.success === false ||
        resData?.error ||
        resData?.status === "ERROR"
      ) {
        throw new Error(extractMessage(resData, "Failed to reset password"));
      }
      toast.success("Password reset successfully!");
    }
  };

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .required("Please confirm your password")
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await handlePasswordSubmit(values.password);
        setTimeout(() => props.router.navigate("/login"), 2000);
      } catch (error) {
        const data = error.response?.data;
        const msg =
          data?.error?.message ||
          data?.message ||
          error.message ||
          "Something went wrong. Please try again.";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
  });

  document.title = "Reset Password | EdgeLegal";

  const isInvalidLink = !token && !userId;
  const passwordHasError = !!(
    validation.touched.password && validation.errors.password
  );
  const confirmHasError = !!(
    validation.touched.confirmPassword && validation.errors.confirmPassword
  );
  const actionLabel = isTempPasswordFlow
    ? "Set New Password"
    : "Reset Password";
  const buttonLabel = isLoading ? "Updating..." : actionLabel;

  return (
    <ParticlesAuth>
      <div className="auth-page-content mt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <div>
                  <Link to="/" className="d-inline-block auth-logo">
                    <img src={logoLight} alt="" height="20" />
                  </Link>
                </div>
                <p className="mt-3 fs-15 fw-medium"></p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="text-center mt-2">
                    <h5 className="text-primary">
                      {isTempPasswordFlow
                        ? "Set New Password"
                        : "Reset Password"}
                    </h5>
                    <p className="text-muted">
                      {isTempPasswordFlow
                        ? "Your account uses a temporary password. Please set a new password to continue."
                        : "Enter your new password below."}
                    </p>

                    <lord-icon
                      src="https://cdn.lordicon.com/rhvddzym.json"
                      trigger="loop"
                      colors="primary:#0ab39c"
                      className="avatar-xl"
                      style={{ width: "120px", height: "120px" }}
                    ></lord-icon>
                  </div>

                  {isInvalidLink ? (
                    <Alert color="danger" className="mt-3">
                      Invalid or expired link. Please request a new password
                      reset.
                    </Alert>
                  ) : (
                    <div className="p-2">
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          validation.handleSubmit();
                          return false;
                        }}
                      >
                        <div className="mb-4">
                          <Label className="form-label">New Password</Label>
                          <div className="position-relative">
                            <Input
                              name="password"
                              className="form-control"
                              placeholder="Enter new password"
                              type={showPassword ? "text" : "password"}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.password || ""}
                              invalid={passwordHasError}
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3"
                              style={{ zIndex: 5 }}
                              onClick={() => setShowPassword((v) => !v)}
                              tabIndex={-1}
                            >
                              <i
                                className={
                                  showPassword
                                    ? "ri-eye-off-line"
                                    : "ri-eye-line"
                                }
                              />
                            </button>
                            {passwordHasError ? (
                              <FormFeedback type="invalid">
                                <div>{validation.errors.password}</div>
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="form-label">Confirm Password</Label>
                          <div className="position-relative">
                            <Input
                              name="confirmPassword"
                              className="form-control"
                              placeholder="Confirm your password"
                              type={showConfirmPassword ? "text" : "password"}
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.confirmPassword || ""}
                              invalid={confirmHasError}
                            />
                            <button
                              type="button"
                              className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3"
                              style={{ zIndex: 5 }}
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              tabIndex={-1}
                            >
                              <i
                                className={
                                  showConfirmPassword
                                    ? "ri-eye-off-line"
                                    : "ri-eye-line"
                                }
                              />
                            </button>
                            {confirmHasError ? (
                              <FormFeedback type="invalid">
                                <div>{validation.errors.confirmPassword}</div>
                              </FormFeedback>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-center mt-4">
                          <button
                            className="btn btn-success w-100"
                            type="submit"
                            disabled={isLoading}
                          >
                            {buttonLabel}
                          </button>
                        </div>
                      </Form>
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                <p className="mb-0">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="fw-semibold text-primary text-decoration-underline"
                  >
                    Click here
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </ParticlesAuth>
  );
};

ResetPasswordPage.propTypes = {
  router: PropTypes.shape({
    navigate: PropTypes.func,
  }),
};

export default withRouter(ResetPasswordPage);
