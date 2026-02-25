import React, { useRef, useState, useEffect, Fragment } from "react";
import {
  FormControl,
  TextField,
  InputAdornment,
  InputBase,
} from "@mui/material";
import { Button, Card, Input } from "reactstrap";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { withStyles } from "@mui/styles";
import closeBtn from "../../images/close-white-btn.svg";
import { GrClose } from "react-icons/gr";
import "./styles/CustomStyles.css";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    height: 16,
    borderRadius: 4,
    position: "relative",
    // color: theme.palette.mode === "light" ? "#000" : "#fff",
    // border: "1px",
    // borderColor: theme.palette.mode === "light" ? "#fff" : "#000",
    fontSize: 13,
    lineHeight: 400,
    width: "100%",
    padding: "10px 12px",
    transition: theme.transitions.create([
      "border-color",
      "background-color",
      "box-shadow",
    ]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      // boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      // borderColor: theme.palette.primary.main,
    },
  },
}));

export const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#1890FF !important",
    },

    "& label.MuiFormLabel-root": {
      color: "rgba(0,0,0,1)",
      fontWeight: "500",
    },
    "& label.MuiFormLabel-root.Mui-disabled": {
      color: "rgba(0,0,0,0.5)",
      fontWeight: "500",
    },
    "& label .MuiFormLabel-asterisk.MuiInputLabel-asterisk": {
      color: "#eb3d30",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#1890FF",
    },
    "& .MuiInput-underline.Mui-disabled:before": {
      borderBottomStyle: "solid",
      borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
    },
    "& .MuiInputBase-input.Mui-disabled": {
      opacity: 0.5,
    },
    "& .MuiInputBase-input": {
      fontWeight: 600,
    },
  },
})(TextField);

export const CssFormInput = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "#1890FF",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#1890FF",
    },
  },
})(FormControl);

export const SearchableDropDown = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  const close = () => {
    setOpenDropDown(false);
  };

  const resetList = () => {
    setFilteredOptions(props.optionArray);
  };

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    } else {
      if (searchVal !== props.selected && props.selected) {
        setSearchVal(props.selected);
      }
      setTimeout(() => {
        resetList();
      }, 1);
    }
  }, [openDropDown]);

  useEffect(() => {
    setFilteredOptions(props.optionArray);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    setTimeout(() => {
      setSearchVal(props.fieldVal ? props.fieldVal : "");
    }, 10);
  }, [props.fieldVal]);

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    const filteredData = props.optionArray?.filter((option) =>
      option?.toLowerCase()?.includes(e.target.value?.toLowerCase())
    );

    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val) => {
    setSearchVal(val);
    props.setDetails({
      ...props.details,
      [props.name]: val === "None" || val === "none" ? null : val,
    });
    if (props.update) {
      props.handleUpdate(props.name, val);
    }
  };

  const open = () => {
    setOpenDropDown(true);
  };

  return (
    <div className="" ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group">
        <input
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          label={
            searchVal?.length === props?.maxLength ||
            (props?.value && props?.value?.length === props?.maxLength)
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          required={props.required}
          style={{ height: "2.344rem" }}
          className="form-control"
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions?.map((option) => (
                <p
                  className={`searchField-option mb-1 pe-cursor ${
                    props.selected === option ? "selected-option" : ""
                  }`}
                  key={option}
                  onClick={() => {
                    close();
                    handleClickOption(option);
                  }}
                >
                  {option}
                </p>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableRoleDropDown = (props) => {
  const wrapperRef = useRef(null);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  const useOutsideAlerter = (ref, selected) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
          if (selected) {
            setSearchVal(props.fieldVal);
          }
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, selected]);
  };

  useOutsideAlerter(wrapperRef, props.selected);

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    // filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    // filterOptionArray(props.fieldVal);
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    }
  }, [openDropDown]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.roleName?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    const filteredData = props.optionArray?.filter((option) =>
      option?.roleName?.toLowerCase()?.includes(e.target.value?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val) => {
    setSearchVal(val);
    props.setDetails({
      ...props.details,
      [props.name]: val === "None" || val === "none" ? null : val,
    });

    if (props.update) {
      props.handleUpdate(props.name, val);
    }
    const filteredData = props.optionArray?.filter((option) =>
      option?.roleName?.toLowerCase()?.includes(val?.toLowerCase())
    );
    setFilteredOptions(props.optionArray);
  };

  const handleOpen = () => {
    if (!openDropDown) {
      setOpenDropDown(true);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group" style={{ flexWrap: "nowrap" }}>
        <BootstrapInput
          {...props}
          fullWidth
          autoComplete="off"
          label={
            (props?.maxLength && searchVal?.length === props?.maxLength) ||
            (props?.maxLength &&
              props?.value &&
              props?.value?.length === props.maxLength)
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          placeholder={props.placeholder ?? ""}
          onClick={() => handleOpen()}
          onChange={handleChange}
          value={searchVal}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {openDropDown ? (
                  <ExpandLessIcon
                    onClick={close}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <ExpandMoreIcon
                    onClick={handleOpen}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </InputAdornment>
            ),
          }}
          required={props.required}
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon onClick={close} style={{ cursor: "pointer" }} />
            ) : (
              <ExpandMoreIcon
                onClick={handleOpen}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <Fragment>
              {filteredOptions?.map((option) => (
                <p
                  className={`searchField-option mb-1 pe-cursor ${
                    props.selected === option.roleName ? "selected-option" : ""
                  }`}
                  key={option.id}
                  onClick={() => {
                    close();
                    handleClickOption(option.roleName);
                  }}
                  id={
                    props.selected === option[props.valueKey]
                      ? "selected-option"
                      : ""
                  }
                >
                  {option.roleName}
                </p>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableCompanyDropDown = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    filterOptionArray(props.fieldVal);
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.organisation?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    const filteredData = props.optionArray?.filter((option) =>
      option?.organisation
        ?.toLowerCase()
        ?.includes(e.target.value?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val, id) => {
    setSearchVal(val ? val : "");
    props.setDetails({
      ...props.details,
      [props.name]: val === "None" || val === "none" ? null : id,
    });
    if (props.update) {
      props.handleUpdate(props.name, id);
    }
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.organisation?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  return (
    <div className="searchField-containerDiv" ref={wrapperRef}>
      <label>
        {props?.maxLength &&
        (searchVal?.length === props?.maxLength ||
          (props?.value && props?.value?.length === props?.maxLength))
          ? `${props.label} (Maximum limit reached)`
          : props.label}
      </label>
      <div className="searchField-inputDiv">
        <BootstrapInput
          {...props}
          fullWidth
          autoComplete="off"
          label={
            props?.maxLength &&
            (searchVal?.length === props?.maxLength ||
              (props?.value && props?.value?.length === props?.maxLength))
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          placeholder={props.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          // style={{
          //   width: 256,
          //   height: 50,
          //   // marginRight: 7,
          //   marginLeft: 9,
          //   // marginBottom: 10,
          //   outline: "none",
          // }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {openDropDown ? (
                  <ExpandLessIcon
                    onClick={close}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <ExpandMoreIcon
                    onClick={open}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </InputAdornment>
            ),
          }}
          // InputLabelProps={{
          //   style: {
          //     fontSize: 14,
          //     fontFamily: "inherit",
          //     // color: 'rgb(94, 94, 94)',
          //     color: `${
          //       props?.maxLength &&
          //       props?.value &&
          //       props?.value?.length === props?.maxLength
          //         ? "red"
          //         : ""
          //     }`,
          //     marginLeft: 10,
          //   },
          // }}
          // inputProps={{
          //   style: {
          //     fontSize: 14,
          //     fontFamily: "inherit",
          //     color: "rgb(94, 94, 94)",
          //     marginLeft: 10,
          //     cursor: "pointer",
          //   },
          //   inputMode: `${props.type ? props.type : "text"}`,
          //   maxLength: props.maxLength,
          // }}
          // type='text'
          required={props.required}
        />
        {openDropDown && (
          <Card className="searchField-optionDiv">
            {filteredOptions?.length === 0 ? (
              <p className="noMatch-option" key={"no-options"}>
                No match found.
              </p>
            ) : (
              <Fragment>
                {filteredOptions?.map((option) => (
                  <p
                    className="searchField-option mb-1 pe-cursor"
                    key={option.contactId}
                    onClick={() => {
                      close();
                      handleClickOption(option.organisation, option.contactId);
                    }}
                  >
                    {option.organisation}
                  </p>
                ))}
              </Fragment>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export const SearchableRepresentativeDropDown = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );
  // const [original, setOriginal] = useState(props.fieldVal);

  // useEffect(() => {
  //   if (original !== props.fieldVal) {
  //     if (props.fieldVal) {
  //       filterOptionArray(props.fieldVal);
  //     } else {
  //       setFilteredOptions(props.optionArray);
  //     }
  //     setOriginal(props.fieldVal);
  //     setSearchVal(props.fieldVal ? props.fieldVal : '');
  //   }
  // }, [props.fieldVal, props.optionArray]);

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    filterOptionArray(props.fieldVal);
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        (option.firstName + " " + option.lastName)
          ?.toLowerCase()
          .includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    const filteredData = props.optionArray?.filter((option) =>
      (option.firstName + " " + option.lastName)
        ?.toLowerCase()
        .includes(e.target.value?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val, id) => {
    setSearchVal(val);
    props.setOrganizationDetails({
      ...props.organizationDetails,
      [props.name]: val === "None" || val === "none" ? null : id,
    });
    if (props.update) {
      props.handleUpdate(props.name, id);
    }
    const filteredData = props.optionArray?.filter((option) =>
      (option.firstName + " " + option.lastName)
        ?.toLowerCase()
        .includes(val?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div className="" ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="">
        <BootstrapInput
          {...props}
          fullWidth
          autoComplete="off"
          // label={
          //   searchVal.length === props.maxLength ||
          //   (props.value && props.value?.length === props.maxLength)
          //     ? `${props.label} (Maximum limit reached)`
          //     : props.label
          // }
          label={props.label}
          placeholder={props.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          // style={{
          //   width: 256,
          //   height: 50,
          //   // marginRight: 7,
          //   marginLeft: 9,
          //   // marginBottom: 10,
          //   outline: "none",
          // }}
          // InputLabelProps={{
          //   style: {
          //     fontSize: 14,
          //     fontFamily: "inherit",
          //     // color: 'rgb(94, 94, 94)',
          //     // color: `${
          //     //   props.value && props.value?.length === props.maxLength ? 'red' : ''
          //     // }`,
          //     marginLeft: 10,
          //   },
          // }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {openDropDown ? (
                  <ExpandLessIcon
                    onClick={close}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <ExpandMoreIcon
                    onClick={open}
                    style={{ cursor: "pointer" }}
                  />
                )}
              </InputAdornment>
            ),
          }}
          // inputProps={{
          //   style: {
          //     fontSize: 14,
          //     fontFamily: "inherit",
          //     color: "rgb(94, 94, 94)",
          //     marginLeft: 10,
          //     cursor: "pointer",
          //   },
          //   inputMode: `${props.type ? props.type : "text"}`,
          //   // maxLength: props.maxLength,
          // }}
          // type='text'
          required={props.required}
        />
        {openDropDown && (
          <Card className="searchField-optionDiv">
            {filteredOptions?.length === 0 ? (
              <p className="noMatch-option" key={"no-options"}>
                No match found.
              </p>
            ) : (
              <Fragment>
                {filteredOptions.map((option) => (
                  <p
                    className="searchField-option mb-1 pe-cursor"
                    key={option.contactId}
                    onClick={() => {
                      close();
                      handleClickOption(
                        `${option.firstName} ${option.lastName}`,
                        option.contactId
                      );
                    }}
                  >
                    {`${option.firstName} ${option.lastName}`}
                  </p>
                ))}
              </Fragment>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export const SearchableAddressDropDown = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          // toast.warning('You clicked outside of me!');
          close();
        }
      };

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    }
  }, [openDropDown]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter(
        (option) =>
          option?.locality?.toLowerCase()?.includes(val?.toLowerCase()) ||
          option?.postCode?.toString()?.includes(val)
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    props.setTempSearchField({
      ...props.tempSearchField,
      [props.name]: e.target.value,
    });
    filterOptionArray(e.target.value);
  };

  const handleOptionClick = (val) => {
    setSearchVal(val.locality);
    setFilteredOptions(props.optionArray);
    props.handleSelectSuburb(props.name, val);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div className="" ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group">
        <Input
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          label={
            props?.maxLength &&
            props?.value &&
            props?.value?.length === props?.maxLength
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          onClick={() => {
            if (props.name === "mailingCity") {
              if (!props.sameaddress) {
                if (!openDropDown) {
                  return open();
                }
              }
            } else {
              if (!openDropDown) {
                open();
              }
            }
          }}
          onChange={handleChange}
          value={props.sameaddress ? props.details.mailingCity : searchVal}
          required={props.required}
          style={{ height: "2.344rem" }}
          className="form-control"
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                    // props.handleSelectOption(props.name, option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === `${option.locality}${option.postCode}`
                      ? "selected-option"
                      : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.locality}</p>
                  <p className="mb-0 py-1">{option.postCode}</p>
                </div>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableState = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          // toast.warning('You clicked outside of me!');
          close();
        }
      };

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    // filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    // filterOptionArray(props.fieldVal);
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    }
  }, [openDropDown]);

  useEffect(() => {
    setSearchVal(props.fieldVal ? props.fieldVal : "");
    setFilteredOptions(props.optionArray);
  }, []);

  const filterOptionArray = (val) => {
    const filteredData = props.optionArray?.filter((option) =>
      option?.stateName?.toLowerCase()?.includes(val?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    props.setTempSearchField({
      ...props.tempSearchField,
      [props.name]: e.target.value,
    });
    filterOptionArray(e.target.value);
  };

  const handleOptionClick = (val) => {
    setSearchVal(val.stateName);
    // filterOptionArray(val.stateName);
    setFilteredOptions(props.optionArray);
    props.handleSelectCountryAndState(props.name, val.stateName);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group">
        <Input
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          label={
            props?.maxLength &&
            props?.value &&
            props?.value?.length === props?.maxLength
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          onClick={() => {
            if (props.name === "mailingState") {
              if (!props.sameaddress) {
                if (!openDropDown) {
                  open();
                  return;
                }
              }
            } else {
              if (!openDropDown) {
                open();
                return;
              }
            }
          }}
          onChange={handleChange}
          value={props.sameaddress ? props.details.mailingState : searchVal}
          required={props.required}
          style={{ height: "2.344rem" }}
          className="form-control"
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                    // props.handleSelectOption(props.name, option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === option.stateName ? "selected-option" : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.stateName}</p>
                </div>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableMailingState = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          // toast.warning('You clicked outside of me!');
          close();
        }
      };

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    filterOptionArray(props.fieldVal);
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.stateName?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    props.setTempSearchField({
      ...props.tempSearchField,
      [props.name]: e.target.value,
    });
    filterOptionArray(e.target.value);
  };

  const handleOptionClick = (val) => {
    setSearchVal(val.stateName);
    filterOptionArray(val.stateName);
    props.handleSelectCountryAndState(props.name, val.stateName);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div className="" ref={wrapperRef}>
      <div className="input-group">
        <input
          {...props}
          autoComplete="off"
          inputProps={{
            autoComplete: "off",
          }}
          label={
            props?.maxLength &&
            props?.value &&
            props?.value?.length === props?.maxLength
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          onClick={() => {
            if (props.name === "mailingState") {
              if (!props.sameaddress) {
                if (!openDropDown) {
                  return open();
                }
              }
            } else {
              if (!openDropDown) {
                open();
              }
            }
          }}
          onChange={handleChange}
          value={props.sameaddress ? props.details.mailingState : searchVal}
          style={{ height: "2.344rem" }}
          required={props.required}
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                    // props.handleSelectOption(props.name, option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === option.stateName ? "selected-option" : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.stateName}</p>
                </div>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableCountry = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          // toast.warning('You clicked outside of me!');
          close();
        }
      };

      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    }
  }, [openDropDown]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.countryName?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    props.setTempSearchField({
      ...props.tempSearchField,
      [props.name]: e.target.value,
    });
    filterOptionArray(e.target.value);
  };

  const handleOptionClick = (val) => {
    setSearchVal(val.countryName);
    setFilteredOptions(props.optionArray);
    props.handleSelectCountryAndState(props.name, val.countryName);
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div className="" ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group">
        <input
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          label={
            props?.value &&
            props?.maxLength &&
            props?.value?.length === props?.maxLength
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          onClick={() => {
            if (props.name === "mailingCountry") {
              if (!props.sameaddress) {
                if (!openDropDown) {
                  return open();
                }
              }
            } else {
              if (!openDropDown) {
                return open();
              }
            }
          }}
          onChange={handleChange}
          value={props.sameaddress ? props.details.mailingCountry : searchVal}
          required={props.required}
          style={{ height: "2.344rem" }}
          className="form-control"
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                    // props.handleSelectOption(props.name, option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === option.countryName
                      ? "selected-option"
                      : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.countryName}</p>
                </div>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const CustomTextInput = (props) => {
  return (
    <CssTextField
      {...props}
      label={
        props?.value &&
        props?.maxLength &&
        props?.value?.length === props?.maxLength
          ? `${props.label} (Maximum limit reached)`
          : props.label
      }
      style={{
        width: props.width ? props.width : 256,
        height: 50,
        marginRight: 7,
        marginLeft: 9,
        marginBottom: 10,
        outline: "none",
      }}
      InputLabelProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          // color: 'rgb(94, 94, 94)',
          color: `${
            props?.value &&
            props?.maxLength &&
            props?.value?.length === props?.maxLength
              ? "red"
              : ""
          }`,
          marginLeft: 10,
        },
      }}
      inputProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          color: "rgb(94, 94, 94)",
          marginLeft: 10,
        },
        inputMode: `${props.type ? props.type : "text"}`,
        maxLength: `${props.maxLength >= 0 ? props.maxLength : null}`,
      }}
      // type='text'
      required={props.required}
    />
  );
};

export const CustomDateText = (props) => {
  return (
    <CssTextField
      {...props}
      type={props.type ? props.type : "text"}
      label={
        props?.value &&
        props?.maxLength &&
        props?.value?.length === props?.maxLength
          ? `${props.label} (Maximum limit reached)`
          : props.label
      }
      style={{
        width: props.width ? props.width : 256,
        height: 50,
        marginRight: 7,
        marginLeft: 9,
        marginBottom: 10,
        outline: "none",
      }}
      InputLabelProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          // color: 'rgb(94, 94, 94)',
          color: `${
            props?.value &&
            props?.maxLength &&
            props?.value?.length === props?.maxLength
              ? "red"
              : ""
          }`,
          marginLeft: 10,
        },
        shrink: true,
      }}
      inputProps={{
        style: {
          fontSize: 14,
          fontFamily: "inherit",
          color: "rgb(94, 94, 94)",
          marginLeft: 10,
          marginRight: 10,
        },
        inputMode: `${props.type ? props.type : "text"}`,
        maxLength: `${props.maxLength >= 0 ? props.maxLength : null}`,
      }}
      // type='text'
      required={props.required}
    />
  );
};

export const CustomDropDown = (props) => {
  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  useEffect(() => {
    setFilteredOptions(props.optionArray);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    setSearchVal(props.fieldVal);
  }, [props.fieldVal]);

  const resetList = () => {
    if (props?.optionArray?.length > 0) {
      setFilteredOptions(props.optionArray);
    }
  };

  useEffect(() => {
    if (openDropDown) {
      let ele = document.querySelector(".selected-option");
      if (ele) {
        let a = document.getElementById("option-container");
        if (a) {
          a.scrollTop = ele.offsetTop;
        }
      }
    } else {
      if (searchVal !== props.selected && props.selected) {
        setSearchVal(props.fieldVal);
      }
      setTimeout(() => {
        resetList();
      }, 1);
    }
  }, [openDropDown]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.display?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    setSearchVal(e.target.value);
    const filteredData = props.optionArray?.filter((option) =>
      option?.display?.toLowerCase()?.includes(e.target.value?.toLowerCase())
    );

    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val) => {
    setSearchVal(val.display);
    if (props.onSelectFunc) {
      props.onSelectFunc(val);
    } else {
      props.setDetails({
        ...props.details,
        [props.name]:
          val.value === "None" || val.value === "none" ? null : val.value,
      });
    }

    if (props.update) {
      props.handleUpdate(props.name, val.value);
    }
    setFilteredOptions(props.optionArray);
  };

  const open = () => {
    if (!props.disabled) {
      setOpenDropDown(true);
      addRemoveStyle(true);
    }
  };

  const close = () => {
    addRemoveStyle(false);
    setOpenDropDown(false);
  };

  const addRemoveStyle = (val) => {
    // to add val = true, to remove val = false
    let body = document.querySelector("body");
    let ele = document.querySelector(".searchField-containerDiv");
    // if (val) {
    //   if (ele) {
    //     body.classList.add('oh');
    //     ele.classList.add('scrollable');
    //   }
    // } else {
    //   if (ele) {
    //     body.classList.remove('oh');
    //     ele.classList.remove('scrollabe');
    //   }
    // }
  };
  return (
    <div className={props?.classes || ""} ref={wrapperRef}>
      <label>{props.label}</label>
      <div className="input-group">
        <Input
          autoComplete="off"
          label={
            props?.maxLength &&
            (searchVal?.length === props?.maxLength ||
              (props?.value && props?.value?.length === props?.maxLength))
              ? `${props.label} (Maximum limit reached)`
              : props.label
          }
          placeholder={props?.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          required={props.required}
          style={{ height: "2.344rem" }}
        />
        <div className="input-group-append">
          <span
            className="input-group-text px-1"
            style={{ height: "2.344rem" }}
          >
            {openDropDown ? (
              <ExpandLessIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    close();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                style={{ cursor: "pointer" }}
              />
            )}
          </span>
        </div>
      </div>
      {openDropDown && (
        <Card
          className={`searchField-optionDiv ${props.small ? "smallWidth" : ""}`}
          id="option-container"
          style={{ ...props.optionStyles, zIndex: 999 }}
        >
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <Fragment>
              {filteredOptions?.map((option, i) => (
                <p
                  className={`searchField-option mb-1 pe-cursor ${
                    props.selected === option?.[props.valueKey ?? "value"]
                      ? "selected-option"
                      : ""
                  }`}
                  key={option.display + i}
                  onClick={() => {
                    close();
                    handleClickOption(option);
                  }}
                >
                  {option.display}
                </p>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};

export const ConfirmationAddressPopup = (props) => {
  const { warningData, setData, closeForm } = props;

  // const [enableButton, setEnableButton] = useState(true);

  const handleSubmit = () => {
    setData();
    setTimeout(() => {
      closeForm();
    }, 1);
  };

  return (
    <div className="">
      <div className="">
        {/* <div
          className="confirmation-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2
            className="confirmation-heading mb-0"
            style={{ color: "#fff" }}
          >
            Confirm Your Action
          </h2>
          <button
            className="close-form-btn"
            onClick={closeForm}
            disabled={!enableButton}
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}
        <div className="p-4">
          <p className="lh-base">
            {`${
              warningData?.length > 0
                ? warningData.join(", ")
                : "Suburb, Postcode, State or Country"
            } is/are not part of the system
            data. Are you sure you want to continue?`}
          </p>
        </div>
        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            onClick={closeForm}
            // disabled={!enableButton}
            color="danger"
          >
            No
          </Button>
          <Button
            className="mx-1"
            // disabled={!enableButton}
            onClick={handleSubmit}
            color="success"
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmationPersonPopup = (props) => {
  const { message, personList, closeForm, createPerson } = props;
  const [enableButton, setEnableButton] = useState(true);

  const handleCreatePerson = () => {
    createPerson();
    closeForm();
  };

  return (
    <div className="">
      <div className="">
        {/* <div
          className="confirmation-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2
            className="confirmation-heading mb-0"
            style={{ color: "#fff" }}
          >
            Confirm Your Action
          </h2>
          <button
            className="close-form-btn"
            onClick={closeForm}
            disabled={!enableButton}
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}

        <div className="p-4">
          <p>{message}</p>
        </div>

        <div className="existingPerson-div">
          <div className="existingPerson-header">
            <p className="existingPerson-name">FirstName</p>
            <p className="existingPerson-name">LastName</p>
            <p className="existingPerson-email">Email Address</p>
            <p className="existingPerson-name">Passport No.</p>
          </div>
          <div className="existingPerson-contentDiv">
            {personList?.map((person, index) => (
              <div className="existingPerson-content pe-cursor" key={index}>
                <p className="existingPerson-name">
                  {person.firstName ? person.firstName : ""}
                </p>
                <p className="existingPerson-name">
                  {person.lastName ? person.lastName : ""}
                </p>
                <p className="existingPerson-email">
                  {person.emailId1 ? person.emailId1 : ""}
                </p>
                <p className="existingPerson-name">
                  {person.passportNumber ? person.passportNumber : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmation-buttonDiv">
          <Button
            className="mx-1"
            color="warning"
            onClick={closeForm}
            disabled={!enableButton}
          >
            No
          </Button>
          <Button
            className="mx-1"
            color="success"
            disabled={!enableButton}
            onClick={handleCreatePerson}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmationCustodyPopup = (props) => {
  const { closeForm, message, type, handleFunc } = props;
  const [enableButton, setEnableButton] = useState(true);

  const handleYesBtn = () => {
    setEnableButton(false);
    handleFunc();
    // closeForm();
  };

  return (
    <div className="">
      <div className="">
        {/* <div
          className="confirmation-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2
            className="confirmation-heading mb-0"
            style={{ color: "#fff" }}
          >
            Confirm Your Action
          </h2>
          <button
            className="close-form-btn"
            onClick={closeForm}
            disabled={!enableButton}
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}

        <div className="p-4">
          <p>{message}</p>
        </div>

        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            color="danger"
            onClick={closeForm}
            disabled={!enableButton}
          >
            No
          </Button>
          <Button
            className="mx-1"
            color="success"
            disabled={!enableButton}
            onClick={handleYesBtn}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AlertPopup = (props) => {
  const {
    closeForm,
    message,
    btn1,
    btn2,
    handleFunc,
    handleNoFunc,
    heading = null,
  } = props;
  const [enableButton, setEnableButton] = useState(true);

  const handleYesBtn = () => {
    setEnableButton(false);
    if (handleFunc) {
      handleFunc();
    }
    closeForm();
  };

  return (
    <div className="">
      <div className="">
        {/* <div
          className="confirmation-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px",
          }}
        >
          <h2
            className="confirmation-heading mb-0"
            style={{ color: "#fff" }}
          >
            {heading ? heading : "Alert!"}
          </h2>
          <button
            className="close-form-btn"
            onClick={closeForm}
            disabled={!enableButton}
          >
            {" "}
            <img
              src={closeBtn}
              alt="close-btn"
            />
          </button>
        </div> */}

        <div className="p-4">
          <p>{message}</p>
        </div>

        <div className="d-flex align-items-center justify-content-end p-2 border-top">
          <Button
            className="mx-1"
            color="danger"
            onClick={handleNoFunc || closeForm}
            disabled={!enableButton}
          >
            {btn1}
          </Button>
          {btn2 && (
            <Button
              className="mx-1"
              color="success"
              disabled={!enableButton}
              onClick={handleYesBtn}
            >
              {btn2}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CustomModelBox = (props) => {
  const {
    closeForm,
    btn1,
    btn2,
    handleFunc,
    heading = null,
    autoClose = true,
    gridSize = "",
    needFooter = false,
  } = props;
  const [enableButton, setEnableButton] = useState(true);

  useEffect(() => {
    if (props.active) {
      toggleBodyScroll(true);
    } else {
      toggleBodyScroll(false);
    }
  }, [props.active]);

  const toggleBodyScroll = (arg) => {
    if (arg) {
      document.body.classList.add("oh");
    } else {
      document.body.classList.remove("oh");
    }
  };

  const handleYesBtn = () => {
    setEnableButton(false);
    handleFunc();
    setTimeout(() => {
      setEnableButton(true);
    }, 1);
    if (autoClose) {
      onClose();
    }
  };

  const onClose = () => {
    closeForm();
    setTimeout(() => {
      let ele = document.querySelector(".customToast-popup-container");
      if (ele) {
        ele.classList.remove("hide");
      }
    }, 1);
  };

  const wrprCls = () => {
    let rval = ["customToast-popup-container"];
    if (props.containerCls) {
      rval.push(props.containerCls);
    }

    return rval.join(" ");
  };

  const headerDiv = () => {
    if (props.customHeader) {
      return <div className="customToast-header">{props.customHeader()}</div>;
    } else {
      return (
        <div className="customToast-header">
          <h2 className="customToast-heading">
            {heading ? heading : "Alert!"}
          </h2>
          <div className="customToast-btns">
            {props.renderExtra && props.extraElement}
            <button
              className="close-form-btn"
              onClick={onClose}
              disabled={!enableButton}
            >
              {" "}
              <img src={closeBtn} alt="close-btn" />
            </button>
          </div>
        </div>
      );
    }
  };

  const body = () => {
    return (
      <div className="customToast-body" style={props.bodyStyle}>
        {props.body ? props.body() : ""}
      </div>
    );
  };

  const footer = () => {
    if (needFooter) {
      if (props.customFooter) {
        return (
          <div className="customToast-buttonDiv">{props.customFooter()}</div>
        );
      } else {
        return (
          <div className="customToast-buttonDiv">
            <button
              className="cancelButton"
              onClick={onClose}
              disabled={!enableButton}
            >
              {btn1}
            </button>
            <button
              className="addButton"
              disabled={!enableButton}
              onClick={handleYesBtn}
            >
              {btn2}
            </button>
          </div>
        );
      }
    } else {
      return <></>;
    }
  };

  const ui = () => {
    if (props.active) {
      return (
        <div className={wrprCls()}>
          <div
            className="customToast-popup-grid"
            style={{ width: gridSize ? gridSize : "" }}
          >
            {headerDiv()}
            {body()}
            {footer()}
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };

  return ui();
};

export const CustomToastWindow = (props) => {
  const {
    closeForm,
    btn1,
    btn2,
    handleFunc,
    heading = null,
    autoClose = true,
    gridSize = "",
  } = props;
  const [enableButton, setEnableButton] = useState(true);

  useEffect(() => {
    toggleBodyScroll(true);
    return () => toggleBodyScroll(false);
  }, []);

  const toggleBodyScroll = (arg) => {
    if (arg) {
      document.body.classList.add("oh");
    } else {
      document.body.classList.remove("oh");
    }
  };

  const handleYesBtn = () => {
    setEnableButton(false);
    handleFunc();
    setTimeout(() => {
      setEnableButton(true);
    }, 1);
    if (autoClose) {
      onClose();
    }
  };

  const onClose = () => {
    if (closeForm) {
      closeForm();
    }
    toggleBodyScroll(false);
    setTimeout(() => {
      let ele = document.querySelector(".customToast-popup-container");
      if (ele) {
        ele.classList.remove("hide");
      }
    }, 1);
  };

  const wrprCls = () => {
    let rval = ["customToast-popup-container"];
    if (props.containerCls) {
      rval.push(props.containerCls);
    }

    return rval.join(" ");
  };

  return (
    <div className={wrprCls()} style={{ zIndex: 999 }}>
      <div
        className="customToast-popup-grid"
        style={{ width: gridSize ? gridSize : "" }}
      >
        {/* <div className='customToast-header'> */}
        <div className="cst-header">
          <div
            className="cst-header-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "4px 8px",
            }}
          >
            <h2 className="confirmation-heading m-0" style={{ color: "#fff" }}>
              {heading ? heading : "Alert!"}
            </h2>
            <div className="customToast-btns">
              {props.renderExtra && props.extraElement}
              <button
                className="close-form-btn mb-0"
                onClick={onClose}
                disabled={!enableButton}
              >
                {" "}
                <img src={closeBtn} alt="close-btn" />
              </button>
            </div>
          </div>
        </div>
        <div className="customToast-body" style={props.bodyStyle}>
          {props.children}
        </div>
        <div className="customToast-buttonDiv">
          <Button
            color="danger"
            className="mx-1"
            onClick={onClose}
            disabled={!enableButton}
          >
            {btn1}
          </Button>
          <Button
            color="success"
            className="mx-1"
            disabled={!enableButton}
            onClick={handleYesBtn}
          >
            {btn2}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CustomSearchInput = (props) => {
  const wrapperRef = useRef(null);

  const [openDropDown, setOpenDropDown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(props.optionArray);
  const [searchVal, setSearchVal] = useState(
    props.fieldVal ? props.fieldVal : ""
  );

  const useOutsideAlerter = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          close();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  };

  useOutsideAlerter(wrapperRef);

  useEffect(() => {
    setFilteredOptions(props.optionArray);
    filterOptionArray(props.fieldVal);
  }, [props?.optionArray?.length]);

  useEffect(() => {
    filterOptionArray(props.fieldVal);
    setTimeout(() => {
      setSearchVal(props.fieldVal ? props.fieldVal : "");
      if (props.tempState) {
        props.tempState(props.fieldVal);
      }
    }, 10);
  }, [props.fieldVal]);

  useEffect(() => {
    if (!openDropDown) {
      if (props.fieldVal !== searchVal) {
        if (props.resetFunc) {
          handleRemove();
          props.resetFunc();
        }
      }
    }
  }, [openDropDown]);

  const filterOptionArray = (val) => {
    if (val) {
      const filteredData = props.optionArray?.filter((option) =>
        option?.display?.toLowerCase()?.includes(val?.toLowerCase())
      );
      setFilteredOptions(filteredData);
    } else {
      setFilteredOptions(props.optionArray);
    }
  };

  const handleChange = (e) => {
    let { value } = e.target;
    setSearchVal(value);
    if (props.tempState) {
      props.tempState(value);
    }
    const filteredData = props.optionArray?.filter((option) =>
      option?.display?.toLowerCase()?.includes(value?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleClickOption = (val) => {
    setSearchVal(val.display);
    if (props.tempState) {
      props.tempState(val.display);
    }
    if (props.onSelectFunc) {
      props.onSelectFunc(val);
    } else {
      props.setDetails({
        ...props.details,
        [props.name]:
          val.value === "None" || val.value === "none" ? null : val.value,
      });
    }

    if (props.update) {
      props.handleUpdate(props.name, val.value);
    }
    const filteredData = props.optionArray?.filter((option) =>
      option?.display?.toLowerCase()?.includes(val?.display?.toLowerCase())
    );
    setFilteredOptions(filteredData);
  };

  const handleRemove = () => {
    setSearchVal("");
    if (props.tempState) {
      props.tempState("");
    }
    setFilteredOptions(props.optionArray);
    if (props.onSelectFunc) {
      props.onSelectFunc({ display: "", value: "" });
    } else {
      props.setDetails({
        ...props.details,
        [props.name]: "",
      });
    }
  };

  const open = () => {
    setOpenDropDown(true);
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div className="searchField-containerDiv" ref={wrapperRef}>
      <div className="searchField-inputDiv">
        <div className="mx-1">
          <input
            type="text"
            onClick={open}
            onChange={handleChange}
            value={searchVal}
            placeholder={props.placeholder ?? ""}
          />
          {searchVal?.length > 0 && (
            <button className="custom-clsBtn" onClick={handleRemove}>
              <GrClose className="custom-clsIcon" />
            </button>
          )}
        </div>
      </div>

      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <Fragment>
              {filteredOptions?.map((option, i) => (
                <p
                  className="searchField-option mb-1 pe-cursor"
                  key={option.display + i}
                  onClick={() => {
                    close();
                    handleClickOption(option);
                  }}
                >
                  {option.display}
                </p>
              ))}
            </Fragment>
          )}
        </Card>
      )}
    </div>
  );
};
