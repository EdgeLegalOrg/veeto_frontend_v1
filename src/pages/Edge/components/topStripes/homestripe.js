import React, { useEffect, useState } from "react";
import "../../stylesheets/stripes.css";
import Bell from "../../icons/bell.png";
import { Avatar } from "@mui/material";
import Photo from "../../icons/avatar-4 (1).png";
import { AiOutlineLogout } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { Modal } from "react-bootstrap";
import "../../stylesheets/profileCard.css";
import { MdSearch } from "react-icons/md";
import { v1 as uuidv1 } from "uuid";
import Cookies from "js-cookie";
import { userProfile, siteChange, changePassword } from "../../apis";
import LoadingPage from "../../utils/LoadingPage";
import { toast } from "react-toastify";
import { removeAllStorage } from "../../utils/utilFunc";

const initialPass = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function HomeStipe() {
  const [user, setUser] = useState(undefined);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState(initialPass);

  function logout() {
    Cookies.remove("userJWT");
    Cookies.remove("userId");

    removeAllStorage();
    setTimeout(() => {
      window.location.href = "/";
    }, 10);
  }

  useEffect(() => {
    if (
      !window.localStorage.getItem("userDetails") ||
      Object.keys(JSON.parse(window.localStorage.getItem("userDetails")))
        ?.length === 0
    ) {
      userProfile()
        .then((response) => {
          setUser(response.data);
          window.localStorage.setItem(
            "userDetails",
            JSON.stringify(response.data)
          );
        })
        .catch((error) => {
          toast.error("Error in fetching user profile, please try later!");
        });
    } else {
      setUser(JSON.parse(window.localStorage.getItem("userDetails")));
    }
  }, []);

  function showProfile() {
    const profile = document.querySelector(".profilecard");
    const backdrop = document.querySelector(".backdroppp");

    if (profile) {
      profile.classList.toggle("show");
    }
    if (backdrop) {
      backdrop.classList.toggle("show");
    }
  }

  const handleShow = () => {
    setShow(true);
  };
  const handleClose = () => {
    setPassword(initialPass);
    setError("");
    setShow(false);
  };

  const handleSiteChange = async (e) => {
    try {
      await siteChange({
        requestId: uuidv1(),
        data: JSON.parse(e.target.value),
      });
      removeAllStorage();
      window.location.href = "/Matters";
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (
      password.newPassword === "" ||
      password.currentPassword === "" ||
      password.confirmPassword === ""
    ) {
      setError("* field is required");
    } else {
      if (password.newPassword !== password.confirmPassword) {
        setError("New Password and Confirm Password mismatch");
      } else {
        try {
          setLoading(true);
          let formData = {
            currentPassword: password.currentPassword,
            newPassword: password.newPassword,
          };
          const { data } = await changePassword(formData);
          if (data.success) {
            handleClose();
            toast.info("Password updated!");
          } else {
            setError(
              data?.error?.message
                ? data?.error?.message
                : "Something went wrong"
            );
          }
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      }
    }
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    if (error !== "") {
      setError("");
    }
    setPassword({ ...password, [name]: value });
  };

  return (
    <div className="homestripe">
      <div className="backdroppp" onClick={showProfile}></div>
      <div className="safestrip">
        <div className="searchhdiv">
          <input style={{ outline: "none" }} placeholder="Search" />
          <div
            style={{
              backgroundColor: "lightgray",
              width: "fit-content",
              padding: "2px 2px",
              cursor: "pointer",
            }}
          >
            <MdSearch size={25} />
          </div>
        </div>
        <div className="safe_iconsDiv">
          <img className="safe_iconsDivimg" src={Bell} alt="notifications" />
          <div onClick={showProfile} className="avatarr">
            <Avatar sx={{ width: 56, height: 56 }} src={Photo} />
          </div>
        </div>
      </div>
      <div className="profilecard">
        <div
          onClick={handleShow}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
          }}
        >
          <FiEdit />
        </div>
        <div className="avatarDiv">
          <Avatar sx={{ width: 56, height: 56 }} src={Photo} />
          <div className="nameDiv">
            <h3>
              {user?.firstName} {user?.lastName}
            </h3>
            <p>{user?.login}</p>
          </div>
          <Modal show={show} onHide={handleClose}>
            <Modal.Body>
              <div className="editprofileDiv">
                <h3>Change Password</h3>
                {error !== "" && <div className="password-error">{error}</div>}
                <p
                  style={{
                    fontSize: "20px",
                    cursor: "pointer",
                    position: "absolute",
                    top: "10px",
                    right: "20px",
                  }}
                  onClick={handleClose}
                >
                  &#10006;
                </p>
                <div className="editnamediv">
                  <div className="row">
                    <div className="col-12">
                      <label className="password-label">
                        Current Password <span>*</span>
                      </label>
                      <input
                        className="editProfile-input"
                        placeholder="Current Password"
                        type="password"
                        name="currentPassword"
                        value={password.currentPassword}
                        onChange={handleChangePassword}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <label className="password-label">
                        New Password <span>*</span>
                      </label>
                      <input
                        className="editProfile-input"
                        placeholder="New Password"
                        type="password"
                        name="newPassword"
                        value={password.newPassword}
                        onChange={handleChangePassword}
                      />
                      <br />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <label className="password-label">
                        Confirm Password <span>*</span>
                      </label>
                      <input
                        className="editProfile-input"
                        placeholder="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={password.confirmPassword}
                        onChange={handleChangePassword}
                      />
                    </div>
                  </div>

                  <button
                    className="EditProfileBtn"
                    onClick={handleUpdatePassword}
                  >
                    Update
                  </button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
        <div className="cardDiv">
          <h3>Company Name</h3>
          <p>{user?.organizationName} </p>
          <h3>Role</h3>
          <p>System administrator</p>
          <h3>Version</h3>
          <p>2.0.102</p>
          <hr></hr>
          <h3>My profile</h3>
          <select
            name="siteId"
            className="profile-siteInfo"
            onChange={handleSiteChange}
          >
            {user?.siteInfoList.map((site) => (
              <option
                key={site.siteId}
                value={JSON.stringify({
                  siteId: site.siteId,
                  siteName: site.siteName,
                })}
                selected={site.siteId === user.siteId}
              >
                {site.siteName}
              </option>
            ))}
          </select>
          <div
            onClick={() => {
              logout();
            }}
            className="logoutdivv"
          >
            <h2>
              Logout <AiOutlineLogout />
            </h2>
          </div>
        </div>
      </div>
      {loading && <LoadingPage />}
    </div>
  );
}

export default HomeStipe;
