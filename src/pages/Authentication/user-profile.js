import { TextInputField } from "pages/Edge/components/InputField";
import React, { Fragment, useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Button, Form } from "reactstrap";
import avatarImg from "../../assets/images/users/user-dummy-img.jpg";
import { toast } from "react-toastify";
import { changePassword } from "pages/Edge/apis";

const initState = {
  old: "",
  new: "",
  confirm: "",
};

const initErrorState = {
  old: "",
  new: "",
  confirm: "",
  alert: "",
};

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState({});
  const [formData, setFormData] = useState(initState);
  const [error, setError] = useState(initErrorState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("userDetails")) {
      const obj = JSON.parse(localStorage.getItem("userDetails"));

      setUserDetails(obj);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let rval = { ...initErrorState };
    let isValid = true;

    if (!formData.old) {
      isValid = false;
      rval.old = "This field is required";
    }

    if (!formData.new) {
      isValid = false;
      rval.new = "This field is required";
    }

    if (!formData.confirm) {
      isValid = false;
      rval.confirm = "This field is required";
    }

    if (formData.new !== formData.confirm) {
      isValid = false;
      rval.confirm = "Confirm password should match with new password";
    }

    if (
      !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/.test(
        formData.confirm
      )
    ) {
      isValid = false;
      rval.alert =
        "Your password must be alphanumeric, start with a capital letter, include a special character (e.g., @, $, !), be longer than 8 characters, and not be empty.";
    }

    setError(rval);

    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = validate();

    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await changePassword({
        currentPassword: formData.old,
        newPassword: formData.confirm,
      });

      if (data.success) {
        toast.success("Password changed successfully.");
        setError(initErrorState);
        setFormData(initState);
      } else {
        toast.error("Something went wrong, please try later");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong, please try later");
    } finally {
      setLoading(true);
    }
  };

  return (
    <Fragment>
      <div className="page-content mt-lg-5">
        <Container fluid>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="mx-3">
                      <img
                        src={userDetails.profileImageUrl || avatarImg}
                        alt=""
                        className="avatar-md rounded-circle img-thumbnail"
                      />
                    </div>
                    <div className="flex-grow-1 align-self-center">
                      <div className="text-muted">
                        <h5>{`${userDetails.firstName} ${userDetails.lastName}`}</h5>
                        <p className="mb-1">Email ID : {userDetails.login}</p>
                        <p className="mb-1">
                          Site name :{" "}
                          {userDetails.siteName
                            ? `${userDetails.siteName}`
                            : "NA"}
                        </p>
                        <p className="mb-0">
                          Site location :{" "}
                          {userDetails.siteLocation
                            ? `${userDetails.siteLocation}`
                            : "NA"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <h4 className="card-title mb-4">Change User Password</h4>

          <Card>
            <CardBody>
              <Form
                className="form-horizontal"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                  return false;
                }}
              >
                <div className="form-group mb-3 w-50">
                  <TextInputField
                    name="old"
                    label="Old password"
                    value={formData.old}
                    onChange={handleChange}
                    invalid={error.old || error.alert}
                    invalidMessage={error.old}
                    required={true}
                    skipValueCheck={true}
                  />
                </div>
                <div className="form-group mb-3 w-50">
                  <TextInputField
                    name="new"
                    label="New password"
                    value={formData.new}
                    onChange={handleChange}
                    invalid={error.new || error.alert}
                    invalidMessage={error.new}
                    required={true}
                    skipValueCheck={true}
                  />
                </div>
                <div className="form-group mb-3 w-50">
                  <TextInputField
                    name="confirm"
                    label="Confirm password"
                    value={formData.confirm}
                    onChange={handleChange}
                    invalid={error.confirm || error.alert}
                    invalidMessage={error.confirm}
                    required={true}
                    skipValueCheck={true}
                  />
                </div>
                {error.alert && (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "rgb(255, 105, 105)",
                      width: "50%",
                      color: "#fff",
                      fontSize: "14px",
                      borderRadius: "4px",
                      marginBottom: "1.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <p>{error.alert}</p>
                  </div>
                )}
                <div className="d-flex my-4">
                  <Button type="submit">Update password</Button>
                  <Button
                    type="button"
                    className="ms-4"
                    color="dark"
                    onClick={() => {
                      setFormData(initState);
                      setError(initErrorState);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Container>
      </div>
    </Fragment>
  );
};

export default UserProfile;
