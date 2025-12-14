import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Collapse,
} from "reactstrap";
import SimpleBar from "simplebar-react";
import { v1 as uuidv1 } from "uuid";
import { createSelector } from "reselect";
import classnames from "classnames";
import { toast } from "react-toastify";
//import Constant
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  sidebarVisibilitytypes,
} from "../constants/layout";
import { userProfile, siteChange } from "./../../pages/Edge/apis";
//redux
import {
  changeLayout,
  changeSidebarTheme,
  changeLayoutMode,
  changeLayoutWidth,
  changeLayoutPosition,
  changeTopbarTheme,
  changeLeftsidebarSizeType,
  changeLeftsidebarViewType,
  changeSidebarImageType,
  changePreLoader,
  changeSidebarVisibility,
  // resetValue
} from "../../slices/thunks";
import { updateFormStatusAction } from "slices/layouts/reducer";
//import images
import avatarImg from "../../assets/images/users/user-dummy-img.jpg";
import img01 from "../../assets/images/sidebar/img-1.jpg";
import img02 from "../../assets/images/sidebar/img-2.jpg";
import img03 from "../../assets/images/sidebar/img-3.jpg";
import img04 from "../../assets/images/sidebar/img-4.jpg";
import { removeAllStorage } from "pages/Edge/utils/utilFunc";

const ProfileDropdown = () => {
  // const profiledropdownData = createSelector(
  //   (state) => state.Profile.user,
  //   (user) => user
  // );
  // // Inside your component
  // const user = useSelector(profiledropdownData);

  // useEffect(() => {
  //   if (sessionStorage.getItem("authUser")) {
  //     const obj = JSON.parse(sessionStorage.getItem("authUser"));
  //     setUserName(
  //       process.env.REACT_APP_DEFAULTAUTH === "fake"
  //         ? obj.username === undefined
  //           ? user.first_name
  //             ? user.first_name
  //             : obj.data.first_name
  //           : "Admin" || "Admin"
  //         : process.env.REACT_APP_DEFAULTAUTH === "firebase"
  //         ? obj.email && obj.email
  //         : "Admin"
  //     );
  //   }
  // }, [userName, user]);
  // const [userName, setUserName] = useState("Admin");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectLayoutState = (state) => state.Layout;
  const selectLayoutProperties = createSelector(
    selectLayoutState,
    (layout) => ({
      layoutType: layout.layoutType,
      leftSidebarType: layout.leftSidebarType,
      layoutModeType: layout.layoutModeType,
      layoutWidthType: layout.layoutWidthType,
      layoutPositionType: layout.layoutPositionType,
      topbarThemeType: layout.topbarThemeType,
      leftsidbarSizeType: layout.leftsidbarSizeType,
      leftSidebarViewType: layout.leftSidebarViewType,
      leftSidebarImageType: layout.leftSidebarImageType,
      preloader: layout.preloader,
      sidebarVisibilitytype: layout.sidebarVisibilitytype,
    })
  );
  // Inside your component
  const {
    layoutType,
    leftSidebarType,
    layoutModeType,
    layoutWidthType,
    layoutPositionType,
    topbarThemeType,
    leftsidbarSizeType,
    leftSidebarViewType,
    leftSidebarImageType,
    preloader,
    sidebarVisibilitytype,
  } = useSelector(selectLayoutProperties);

  const { formStatus } = useSelector((state) => state.Layout);

  const [user, setUser] = useState(undefined);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      !window.localStorage.getItem("userDetails") ||
      Object.keys(JSON.parse(window.localStorage.getItem("userDetails")))
        .length === 0
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

  const toggleProfileDropdown = () => {
    if (formStatus.isFormChanged) {
      return dispatch(
        updateFormStatusAction({
          key: "isShowModal",
          value: true,
          callback: () => setIsProfileDropdown(!isProfileDropdown),
        })
      );
    }
    setIsProfileDropdown(!isProfileDropdown);
  };

  const handleSiteChange = async (e) => {
    try {
      await siteChange({
        requestId: uuidv1(),
        data: JSON.parse(e.target.value),
      });
      removeAllStorage();
      window.location.href = "/home/matters";
    } catch (error) {
      console.error(error);
    }
  };

  window.onscroll = function () {
    scrollFunction();
  };

  const scrollFunction = () => {
    const element = document.getElementById("back-to-top");
    if (element) {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  };

  const toggleLeftCanvas = () => {
    setOpen(!open);
  };

  function tog_show() {
    setShow(!show);
    dispatch(changeSidebarTheme("gradient"));
  }

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-1 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            <img
              className="rounded-circle header-profile-user"
              src={avatarImg}
              alt="Avatar"
              style={{ border: "1px solid #ccc" }}
            />
            {/* <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                {user?.login}
              </span>
            </span> */}
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">
            Welcome, {user?.firstName} {user?.lastName}!
          </h6>
          <DropdownItem className="p-0">
            <Link
              to={process.env.PUBLIC_URL + "/profile"}
              className="dropdown-item"
            >
              <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Profile</span>
            </Link>
          </DropdownItem>
          <div className="dropdown-divider"></div>
          {/* <DropdownItem className='p-0'>
            <Link
              to={process.env.PUBLIC_URL + '/pages-profile-settings'}
              className='dropdown-item'
            >

              <i className='mdi mdi-cog-outline text-muted fs-16 align-middle me-1'></i>{' '}
              <span className='align-middle'>Settings</span>
            </Link>
          </DropdownItem> */}
          <DropdownItem className="p-0">
            <Link to="#" className="dropdown-item" onClick={toggleLeftCanvas}>
              <i className="mdi mdi-cog-outline text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Theme Setting</span>
            </Link>
          </DropdownItem>
          {/* <DropdownItem className="p-0">
            <Link
              to={process.env.PUBLIC_URL + "/auth-lockscreen-basic"}
              className="dropdown-item"
            >
              <i className="mdi mdi-lock text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle">Lock screen</span>
            </Link>
          </DropdownItem> */}
          <DropdownItem className="p-0">
            <div className="d-flex align-items-center dropdown-item">
              <i className="mdi mdi-school text-muted fs-16 align-middle me-1"></i>{" "}
              <Input
                type="select"
                name="siteId"
                className="profile-siteInfo mx-1"
                onClick={(e) => e.stopPropagation()}
                onChange={handleSiteChange}
                size="sm"
              >
                {user?.siteInfoList?.map((site) => (
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
              </Input>
            </div>
          </DropdownItem>
          <DropdownItem className="p-0">
            <div
              className="dropdown-item"
              onClick={() => {
                toast.success("You are Logged out", { autoClose: 1000 });
                setTimeout(() => {
                  navigate(process.env.PUBLIC_URL + "/logout");
                }, 1000);
              }}
            >
              <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{" "}
              <span className="align-middle" data-key="t-logout">
                Logout
              </span>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Offcanvas isOpen={open} toggle={toggleLeftCanvas} direction="end">
        <OffcanvasHeader
          className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark"
          toggle={toggleLeftCanvas}
        >
          <span className="m-0 me-2 text-white">Theme Customizer</span>
        </OffcanvasHeader>
        <OffcanvasBody className="p-0">
          <SimpleBar className="h-100">
            <div className="p-4">
              <h6 className="mb-0 fw-semibold text-uppercase">Layout</h6>
              <p className="text-muted">Choose your layout</p>

              <div className="row gy-3">
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout01"
                      name="data-layout"
                      type="radio"
                      value={layoutTypes.VERTICAL}
                      checked={layoutType === layoutTypes.VERTICAL}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeLayout(e.target.value));
                        }
                      }}
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout01"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1"></span>
                            <span className="bg-light d-block p-1 mt-auto"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Vertical</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout02"
                      name="data-layout"
                      type="radio"
                      value={layoutTypes.HORIZONTAL}
                      checked={layoutType === layoutTypes.HORIZONTAL}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeLayout(e.target.value));
                        }
                      }}
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout02"
                    >
                      <span className="d-flex h-100 flex-column gap-1">
                        <span className="bg-light d-flex p-1 gap-1 align-items-center">
                          <span className="d-block p-1 bg-primary-subtle rounded me-1"></span>
                          <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>
                          <span className="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                        </span>
                        <span className="bg-light d-block p-1"></span>
                        <span className="bg-light d-block p-1 mt-auto"></span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Horizontal</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout03"
                      name="data-layout"
                      type="radio"
                      value={layoutTypes.TWOCOLUMN}
                      checked={layoutType === layoutTypes.TWOCOLUMN}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeLayout(e.target.value));
                        }
                      }}
                      className="form-check-input"
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout03"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1">
                            <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1"></span>
                            <span className="bg-light d-block p-1 mt-auto"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Two Column</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      id="customizer-layout04"
                      name="data-layout"
                      type="radio"
                      className="form-check-input"
                      value={layoutTypes.SEMIBOX}
                      checked={layoutType === layoutTypes.SEMIBOX}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeLayout(e.target.value));
                        }
                      }}
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="customizer-layout04"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0 p-1">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column pt-1 pe-2">
                            <span className="bg-light d-block p-1"></span>
                            <span className="bg-light d-block p-1 mt-auto"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Semi Box</h5>
                </div>
              </div>

              <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                Color Scheme
              </h6>
              <p className="text-muted">Choose Light or Dark Scheme.</p>

              <div className="colorscheme-cardradio">
                <div className="row">
                  <div className="col-4">
                    <div className="form-check card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-bs-theme"
                        id="layout-mode-light"
                        value={layoutModeTypes.LIGHTMODE}
                        checked={layoutModeType === layoutModeTypes.LIGHTMODE}
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changeLayoutMode(e.target.value));
                          }
                        }}
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="layout-mode-light"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1"></span>
                              <span className="bg-light d-block p-1 mt-auto"></span>
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Light</h5>
                  </div>

                  <div className="col-4">
                    <div className="form-check card-radio dark">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-bs-theme"
                        id="layout-mode-dark"
                        value={layoutModeTypes.DARKMODE}
                        checked={layoutModeType === layoutModeTypes.DARKMODE}
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changeLayoutMode(e.target.value));
                          }
                        }}
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100 bg-dark"
                        htmlFor="layout-mode-dark"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-white bg-opacity-10 d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-white bg-opacity-10 d-block p-1"></span>
                              <span className="bg-white bg-opacity-10 d-block p-1 mt-auto"></span>
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Dark</h5>
                  </div>
                </div>
              </div>
              {layoutType === layoutTypes.SEMIBOX && (
                <div id="sidebar-visibility">
                  <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                    Sidebar Visibility
                  </h6>
                  <p className="text-muted">Choose show or Hidden sidebar.</p>

                  <div className="row">
                    <div className="col-4">
                      <div className="form-check card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-visibility"
                          id="sidebar-visibility-show"
                          value={sidebarVisibilitytypes.SHOW}
                          checked={
                            sidebarVisibilitytype ===
                            sidebarVisibilitytypes.SHOW
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarVisibility(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-md w-100"
                          htmlFor="sidebar-visibility-show"
                        >
                          <span className="d-flex gap-1 h-100">
                            <span className="flex-shrink-0 p-1">
                              <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              </span>
                            </span>
                            <span className="flex-grow-1">
                              <span className="d-flex h-100 flex-column pt-1 pe-2">
                                <span className="bg-light d-block p-1"></span>
                                <span className="bg-light d-block p-1 mt-auto"></span>
                              </span>
                            </span>
                          </span>
                        </label>
                      </div>
                      <h5 className="fs-13 text-center mt-2">Show</h5>
                    </div>
                    <div className="col-4">
                      <div className="form-check card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-visibility"
                          id="sidebar-visibility-hidden"
                          value={sidebarVisibilitytypes.HIDDEN}
                          checked={
                            sidebarVisibilitytype ===
                            sidebarVisibilitytypes.HIDDEN
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarVisibility(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-md w-100 px-2"
                          htmlFor="sidebar-visibility-hidden"
                        >
                          <span className="d-flex gap-1 h-100">
                            <span className="flex-grow-1">
                              <span className="d-flex h-100 flex-column pt-1 px-2">
                                <span className="bg-light d-block p-1"></span>
                                <span className="bg-light d-block p-1 mt-auto"></span>
                              </span>
                            </span>
                          </span>
                        </label>
                      </div>
                      <h5 className="fs-13 text-center mt-2">Hidden</h5>
                    </div>
                  </div>
                </div>
              )}
              {layoutType !== layoutTypes.TWOCOLUMN && (
                <React.Fragment>
                  {(layoutType === layoutTypes.VERTICAL ||
                    layoutType === layoutTypes.HORIZONTAL) && (
                    <div id="layout-width">
                      <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                        Layout Width
                      </h6>
                      <p className="text-muted">
                        Choose Fluid or Boxed layout.
                      </p>

                      <div className="row">
                        <div className="col-4">
                          <div className="form-check card-radio">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="data-layout-width"
                              id="layout-width-fluid"
                              value={layoutWidthTypes.FLUID}
                              checked={
                                layoutWidthType === layoutWidthTypes.FLUID
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  dispatch(changeLayoutWidth(e.target.value));
                                  dispatch(changeLeftsidebarSizeType("lg"));
                                }
                              }}
                            />
                            <label
                              className="form-check-label p-0 avatar-md w-100"
                              htmlFor="layout-width-fluid"
                            >
                              <span className="d-flex gap-1 h-100">
                                <span className="flex-shrink-0">
                                  <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                    <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  </span>
                                </span>
                                <span className="flex-grow-1">
                                  <span className="d-flex h-100 flex-column">
                                    <span className="bg-light d-block p-1"></span>
                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                  </span>
                                </span>
                              </span>
                            </label>
                          </div>
                          <h5 className="fs-13 text-center mt-2">Fluid</h5>
                        </div>
                        <div className="col-4">
                          <div className="form-check card-radio">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="data-layout-width"
                              id="layout-width-boxed"
                              value={layoutWidthTypes.BOXED}
                              checked={
                                layoutWidthType === layoutWidthTypes.BOXED
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  dispatch(changeLayoutWidth(e.target.value));
                                  dispatch(
                                    changeLeftsidebarSizeType("sm-hover")
                                  );
                                }
                              }}
                            />
                            <label
                              className="form-check-label p-0 avatar-md w-100 px-2"
                              htmlFor="layout-width-boxed"
                            >
                              <span className="d-flex gap-1 h-100 border-start border-end">
                                <span className="flex-shrink-0">
                                  <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                    <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  </span>
                                </span>
                                <span className="flex-grow-1">
                                  <span className="d-flex h-100 flex-column">
                                    <span className="bg-light d-block p-1"></span>
                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                  </span>
                                </span>
                              </span>
                            </label>
                          </div>
                          <h5 className="fs-13 text-center mt-2">Boxed</h5>
                        </div>
                      </div>
                    </div>
                  )}

                  <div id="layout-position">
                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                      Layout Position
                    </h6>
                    <p className="text-muted">
                      Choose Fixed or Scrollable Layout Position.
                    </p>

                    <div className="btn-group radio" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="data-layout-position"
                        id="layout-position-fixed"
                        value={layoutPositionTypes.FIXED}
                        checked={
                          layoutPositionType === layoutPositionTypes.FIXED
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changeLayoutPosition(e.target.value));
                          }
                        }}
                      />
                      <label
                        className="btn btn-light w-sm"
                        htmlFor="layout-position-fixed"
                      >
                        Fixed
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="data-layout-position"
                        id="layout-position-scrollable"
                        value={layoutPositionTypes.SCROLLABLE}
                        checked={
                          layoutPositionType === layoutPositionTypes.SCROLLABLE
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changeLayoutPosition(e.target.value));
                          }
                        }}
                      />
                      <label
                        className="btn btn-light w-sm ms-0"
                        htmlFor="layout-position-scrollable"
                      >
                        Scrollable
                      </label>
                    </div>
                  </div>
                </React.Fragment>
              )}

              <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                Topbar Color
              </h6>
              <p className="text-muted">Choose Light or Dark Topbar Color.</p>

              <div className="row">
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-topbar"
                      id="topbar-color-light"
                      value={topbarThemeTypes.LIGHT}
                      checked={topbarThemeType === topbarThemeTypes.LIGHT}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeTopbarTheme(e.target.value));
                        }
                      }}
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="topbar-color-light"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-light d-block p-1"></span>
                            <span className="bg-light d-block p-1 mt-auto"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Light</h5>
                </div>
                <div className="col-4">
                  <div className="form-check card-radio">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="data-topbar"
                      id="topbar-color-dark"
                      value={topbarThemeTypes.DARK}
                      checked={topbarThemeType === topbarThemeTypes.DARK}
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(changeTopbarTheme(e.target.value));
                        }
                      }}
                    />
                    <label
                      className="form-check-label p-0 avatar-md w-100"
                      htmlFor="topbar-color-dark"
                    >
                      <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                          <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                            <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                          </span>
                        </span>
                        <span className="flex-grow-1">
                          <span className="d-flex h-100 flex-column">
                            <span className="bg-primary d-block p-1"></span>
                            <span className="bg-light d-block p-1 mt-auto"></span>
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                  <h5 className="fs-13 text-center mt-2">Dark</h5>
                </div>
              </div>

              {(layoutType === "vertical" ||
                (layoutType === "semibox" &&
                  sidebarVisibilitytype === "show")) && (
                <React.Fragment>
                  <div id="sidebar-size">
                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                      Sidebar Size
                    </h6>
                    <p className="text-muted">Choose a size of Sidebar.</p>

                    <div className="row">
                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar-size"
                            id="sidebar-size-default"
                            value={leftsidbarSizeTypes.DEFAULT}
                            checked={
                              leftsidbarSizeType === leftsidbarSizeTypes.DEFAULT
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(
                                  changeLeftsidebarSizeType(e.target.value)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-size-default"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                  <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">Default</h5>
                      </div>

                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar-size"
                            id="sidebar-size-compact"
                            value={leftsidbarSizeTypes.COMPACT}
                            checked={
                              leftsidbarSizeType === leftsidbarSizeTypes.COMPACT
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(
                                  changeLeftsidebarSizeType(e.target.value)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-size-compact"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                  <span className="d-block p-1 bg-primary-subtle rounded mb-2"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">Compact</h5>
                      </div>

                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar-size"
                            id="sidebar-size-small"
                            value={leftsidbarSizeTypes.SMALLICON}
                            checked={
                              leftsidbarSizeType ===
                              leftsidbarSizeTypes.SMALLICON
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(
                                  changeLeftsidebarSizeType(e.target.value)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-size-small"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-light d-flex h-100 flex-column gap-1">
                                  <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">
                          Small (Icon View)
                        </h5>
                      </div>

                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar-size"
                            id="sidebar-size-small-hover"
                            value={leftsidbarSizeTypes.SMALLHOVER}
                            checked={
                              leftsidbarSizeType ===
                              leftsidbarSizeTypes.SMALLHOVER
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(
                                  changeLeftsidebarSizeType(e.target.value)
                                );
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-size-small-hover"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-light d-flex h-100 flex-column gap-1">
                                  <span className="d-block p-1 bg-primary-subtle mb-2"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 pb-0 bg-primary-subtle"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">
                          Small Hover View
                        </h5>
                      </div>
                    </div>
                  </div>

                  {layoutType !== "semibox" && (
                    <div id="sidebar-view">
                      <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                        Sidebar View
                      </h6>
                      <p className="text-muted">
                        Choose Default or Detached Sidebar view.
                      </p>

                      <div className="row">
                        <div className="col-4">
                          <div className="form-check sidebar-setting card-radio">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="data-layout-style"
                              id="sidebar-view-default"
                              value={leftSidebarViewTypes.DEFAULT}
                              checked={
                                leftSidebarViewType ===
                                leftSidebarViewTypes.DEFAULT
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  dispatch(
                                    changeLeftsidebarViewType(e.target.value)
                                  );
                                }
                              }}
                            />
                            <label
                              className="form-check-label p-0 avatar-md w-100"
                              htmlFor="sidebar-view-default"
                            >
                              <span className="d-flex gap-1 h-100">
                                <span className="flex-shrink-0">
                                  <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                    <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  </span>
                                </span>
                                <span className="flex-grow-1">
                                  <span className="d-flex h-100 flex-column">
                                    <span className="bg-light d-block p-1"></span>
                                    <span className="bg-light d-block p-1 mt-auto"></span>
                                  </span>
                                </span>
                              </span>
                            </label>
                          </div>
                          <h5 className="fs-13 text-center mt-2">Default</h5>
                        </div>
                        <div className="col-4">
                          <div className="form-check sidebar-setting card-radio">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="data-layout-style"
                              id="sidebar-view-detached"
                              value={leftSidebarViewTypes.DETACHED}
                              checked={
                                leftSidebarViewType ===
                                leftSidebarViewTypes.DETACHED
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  dispatch(
                                    changeLeftsidebarViewType(e.target.value)
                                  );
                                }
                              }}
                            />
                            <label
                              className="form-check-label p-0 avatar-md w-100"
                              htmlFor="sidebar-view-detached"
                            >
                              <span className="d-flex h-100 flex-column">
                                <span className="bg-light d-flex p-1 gap-1 align-items-center px-2">
                                  <span className="d-block p-1 bg-primary-subtle rounded me-1"></span>
                                  <span className="d-block p-1 pb-0 px-2 bg-primary-subtle ms-auto"></span>
                                  <span className="d-block p-1 pb-0 px-2 bg-primary-subtle"></span>
                                </span>
                                <span className="d-flex gap-1 h-100 p-1 px-2">
                                  <span className="flex-shrink-0">
                                    <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                      <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                      <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                      <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                    </span>
                                  </span>
                                </span>
                                <span className="bg-light d-block p-1 mt-auto px-2"></span>
                              </span>
                            </label>
                          </div>
                          <h5 className="fs-13 text-center mt-2">Detached</h5>
                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}

              {(layoutType === "vertical" ||
                layoutType === "twocolumn" ||
                (layoutType === "semibox" &&
                  sidebarVisibilitytype === "show")) && (
                <React.Fragment>
                  <div id="sidebar-color">
                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                      Sidebar Color
                    </h6>
                    <p className="text-muted">
                      Choose Ligth or Dark Sidebar Color.
                    </p>

                    <div className="row">
                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-light"
                            value={leftSidebarTypes.LIGHT}
                            checked={leftSidebarType === leftSidebarTypes.LIGHT}
                            onChange={(e) => {
                              setShow(false);
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-color-light"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-white border-end d-flex h-100 flex-column gap-1 p-1">
                                  <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">Light</h5>
                      </div>
                      <div className="col-4">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-dark"
                            value={leftSidebarTypes.DARK}
                            checked={leftSidebarType === leftSidebarTypes.DARK}
                            onChange={(e) => {
                              setShow(false);
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-md w-100"
                            htmlFor="sidebar-color-dark"
                          >
                            <span className="d-flex gap-1 h-100">
                              <span className="flex-shrink-0">
                                <span className="bg-primary d-flex h-100 flex-column gap-1 p-1">
                                  <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                  <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                </span>
                              </span>
                              <span className="flex-grow-1">
                                <span className="d-flex h-100 flex-column">
                                  <span className="bg-light d-block p-1"></span>
                                  <span className="bg-light d-block p-1 mt-auto"></span>
                                </span>
                              </span>
                            </span>
                          </label>
                        </div>
                        <h5 className="fs-13 text-center mt-2">Dark</h5>
                      </div>

                      <div className="col-4">
                        <button
                          className={classnames(
                            "btn btn-link avatar-md w-100 p-0 overflow-hidden border ",
                            { collapsed: !show, active: show === true }
                          )}
                          type="button"
                          data-bs-target="#collapseBgGradient"
                          data-bs-toggle="collapse"
                          aria-controls="collapseBgGradient"
                          onClick={tog_show}
                        >
                          <span className="d-flex gap-1 h-100">
                            <span className="flex-shrink-0">
                              <span className="bg-vertical-gradient d-flex h-100 flex-column gap-1 p-1">
                                <span className="d-block p-1 px-2 bg-white bg-opacity-10 rounded mb-2"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-white bg-opacity-10"></span>
                              </span>
                            </span>
                            <span className="flex-grow-1">
                              <span className="d-flex h-100 flex-column">
                                <span className="bg-light d-block p-1"></span>
                                <span className="bg-light d-block p-1 mt-auto"></span>
                              </span>
                            </span>
                          </span>
                        </button>
                        <h5 className="fs-13 text-center mt-2">Gradient</h5>
                      </div>
                    </div>
                    <Collapse
                      isOpen={show}
                      className="collapse"
                      id="collapseBgGradient"
                    >
                      <div className="d-flex gap-2 flex-wrap img-switch p-2 px-3 bg-light rounded">
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-gradient"
                            value={leftSidebarTypes.GRADIENT}
                            checked={
                              leftSidebarType === leftSidebarTypes.GRADIENT
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-xs rounded-circle"
                            htmlFor="sidebar-color-gradient"
                          >
                            <span className="avatar-title rounded-circle bg-vertical-gradient"></span>
                          </label>
                        </div>
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-gradient-2"
                            value={leftSidebarTypes.GRADIENT_2}
                            checked={
                              leftSidebarType === leftSidebarTypes.GRADIENT_2
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-xs rounded-circle"
                            htmlFor="sidebar-color-gradient-2"
                          >
                            <span className="avatar-title rounded-circle bg-vertical-gradient-2"></span>
                          </label>
                        </div>
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-gradient-3"
                            value={leftSidebarTypes.GRADIENT_3}
                            checked={
                              leftSidebarType === leftSidebarTypes.GRADIENT_3
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-xs rounded-circle"
                            htmlFor="sidebar-color-gradient-3"
                          >
                            <span className="avatar-title rounded-circle bg-vertical-gradient-3"></span>
                          </label>
                        </div>
                        <div className="form-check sidebar-setting card-radio">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="data-sidebar"
                            id="sidebar-color-gradient-4"
                            value={leftSidebarTypes.GRADIENT_4}
                            checked={
                              leftSidebarType === leftSidebarTypes.GRADIENT_4
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                dispatch(changeSidebarTheme(e.target.value));
                              }
                            }}
                          />
                          <label
                            className="form-check-label p-0 avatar-xs rounded-circle"
                            htmlFor="sidebar-color-gradient-4"
                          >
                            <span className="avatar-title rounded-circle bg-vertical-gradient-4"></span>
                          </label>
                        </div>
                      </div>
                    </Collapse>
                  </div>
                  <div id="sidebar-img">
                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                      Sidebar Images
                    </h6>
                    <p className="text-muted">Choose a image of Sidebar.</p>

                    <div className="d-flex gap-2 flex-wrap img-switch">
                      <div className="form-check sidebar-setting card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-image"
                          id="sidebarimg-none"
                          value={leftSidebarImageTypes.NONE}
                          checked={
                            leftSidebarImageType === leftSidebarImageTypes.NONE
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarImageType(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-sm h-auto"
                          htmlFor="sidebarimg-none"
                        >
                          <span className="avatar-md w-auto bg-light d-flex align-items-center justify-content-center">
                            <i className="ri-close-fill fs-20"></i>
                          </span>
                        </label>
                      </div>

                      <div className="form-check sidebar-setting card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-image"
                          id="sidebarimg-01"
                          value={leftSidebarImageTypes.IMG1}
                          checked={
                            leftSidebarImageType === leftSidebarImageTypes.IMG1
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarImageType(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-sm h-auto"
                          htmlFor="sidebarimg-01"
                        >
                          <img
                            src={img01}
                            alt=""
                            className="avatar-md w-auto object-fit-cover"
                          />
                        </label>
                      </div>

                      <div className="form-check sidebar-setting card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-image"
                          id="sidebarimg-02"
                          value={leftSidebarImageTypes.IMG2}
                          checked={
                            leftSidebarImageType === leftSidebarImageTypes.IMG2
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarImageType(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-sm h-auto"
                          htmlFor="sidebarimg-02"
                        >
                          <img
                            src={img02}
                            alt=""
                            className="avatar-md w-auto object-fit-cover"
                          />
                        </label>
                      </div>
                      <div className="form-check sidebar-setting card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-image"
                          id="sidebarimg-03"
                          value={leftSidebarImageTypes.IMG3}
                          checked={
                            leftSidebarImageType === leftSidebarImageTypes.IMG3
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarImageType(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-sm h-auto"
                          htmlFor="sidebarimg-03"
                        >
                          <img
                            src={img03}
                            alt=""
                            className="avatar-md w-auto object-fit-cover"
                          />
                        </label>
                      </div>
                      <div className="form-check sidebar-setting card-radio">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="data-sidebar-image"
                          id="sidebarimg-04"
                          value={leftSidebarImageTypes.IMG4}
                          checked={
                            leftSidebarImageType === leftSidebarImageTypes.IMG4
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              dispatch(changeSidebarImageType(e.target.value));
                            }
                          }}
                        />
                        <label
                          className="form-check-label p-0 avatar-sm h-auto"
                          htmlFor="sidebarimg-04"
                        >
                          <img
                            src={img04}
                            alt=""
                            className="avatar-md w-auto object-fit-cover"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}

              <div id="preloader-menu">
                <h6 className="mt-4 mb-0 fw-semibold text-uppercase">
                  Preloader
                </h6>
                <p className="text-muted">Choose a preloader.</p>

                <div className="row">
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-preloader"
                        id="preloader-view-custom"
                        value={preloaderTypes.ENABLE}
                        checked={preloader === preloaderTypes.ENABLE}
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changePreLoader(e.target.value));
                          }
                        }}
                      />

                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="preloader-view-custom"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1"></span>
                              <span className="bg-light d-block p-1 mt-auto"></span>
                            </span>
                          </span>
                        </span>
                        {/* <!-- <div id="preloader"> --> */}
                        <div
                          id="status"
                          className="d-flex align-items-center justify-content-center"
                        >
                          <div
                            className="spinner-border text-primary avatar-xxs m-auto"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                        {/* <!-- </div> --> */}
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Enable</h5>
                  </div>
                  <div className="col-4">
                    <div className="form-check sidebar-setting card-radio">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="data-preloader"
                        id="preloader-view-none"
                        value={preloaderTypes.DISABLE}
                        checked={preloader === preloaderTypes.DISABLE}
                        onChange={(e) => {
                          if (e.target.checked) {
                            dispatch(changePreLoader(e.target.value));
                          }
                        }}
                      />
                      <label
                        className="form-check-label p-0 avatar-md w-100"
                        htmlFor="preloader-view-none"
                      >
                        <span className="d-flex gap-1 h-100">
                          <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                              <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                              <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            </span>
                          </span>
                          <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                              <span className="bg-light d-block p-1"></span>
                              <span className="bg-light d-block p-1 mt-auto"></span>
                            </span>
                          </span>
                        </span>
                      </label>
                    </div>
                    <h5 className="fs-13 text-center mt-2">Disable</h5>
                  </div>
                </div>
              </div>
            </div>
          </SimpleBar>
        </OffcanvasBody>
      </Offcanvas>
    </React.Fragment>
  );
};

export default ProfileDropdown;
