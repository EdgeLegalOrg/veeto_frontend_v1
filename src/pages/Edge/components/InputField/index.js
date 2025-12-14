import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";
import { useEffect, useRef, useState } from "react";
import { GrClose } from "react-icons/gr";
import { Card, FormFeedback, FormGroup, Input, Label } from "reactstrap";

export const TextInputField = (props) => {
  const {
    label,
    className,
    containerClassName,
    name,
    placeholder,
    value,
    onChange,
    required,
    invalid,
    invalidMessage,
    type = "text",
    optionArray = [],
    skipValueCheck = false,
    ...rest
  } = props;

  return (
    <div className={`mb-3 ${containerClassName || ""}`}>
      {label && (
        <Label>
          {label} {required && <span className="input-error">*</span>}
        </Label>
      )}
      <Input
        className={className || ""}
        name={name}
        type={type}
        placeholder={placeholder}
        value={type === "date" ? formatDateFunc(value, "YYYY-MM-DD") : value}
        onChange={(e) => {
          e.preventDefault();
          onChange(e);
        }}
        onWheel={(e) => e.preventDefault()}
        invalid={invalid && (skipValueCheck || !value?.toString()?.trim())}
        {...rest}
      >
        {optionArray.map((option, idx) => (
          <option
            key={idx}
            value={option.value}
            disabled={option?.disabled}
            selected={option?.selected}
          >
            {option.label}
          </option>
        ))}
      </Input>
      {invalid && (skipValueCheck || !value?.toString()?.trim()) && (
        <FormFeedback>{invalidMessage}</FormFeedback>
      )}
    </div>
  );
};

export const SelectInputField = (props) => {
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
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          placeholder={props?.placeholder ?? ""}
          value={searchVal}
          onChange={handleChange}
          onClick={() => !openDropDown && open()}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          autoComplete="off"
          disabled={props.disabled}
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
                className="pe-pointer"
              />
            ) : (
              <ExpandMoreIcon
                onClick={() => {
                  if (!props.sameaddress) {
                    return open();
                  }
                }}
                className="pe-pointer"
              />
            )}
          </span>
        </div>
      </div>
      {props.invalid && !searchVal?.toString() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card
          className={`searchField-optionDiv ${props.small ? "smallWidth" : ""}`}
          id="option-container"
          style={{ ...props.optionStyles, zIndex: 999 }}
        >
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
              {filteredOptions?.map((option, i) => (
                <p
                  key={option.display + i}
                  className={`searchField-option mb-1 pe-cursor ${
                    props.selected === option?.[props.valueKey ?? "value"]
                      ? "selected-option"
                      : ""
                  }`}
                  onClick={() => {
                    close();
                    handleClickOption(option);
                  }}
                >
                  {option.display}
                </p>
              ))}
            </>
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
    if (props.handleUpdate) {
      props.handleUpdate(props.name, val);
    }
    setFilteredOptions(props.optionArray);
  };

  const handleOpen = () => {
    if (!props.disabled && !openDropDown) {
      setOpenDropDown(true);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };
  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          placeholder={props.placeholder ?? ""}
          onClick={() => handleOpen()}
          onChange={handleChange}
          value={searchVal}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          autoComplete="off"
          disabled={props.disabled}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableAddressDropDown = (props) => {
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
    if (!props.disabled) {
      setOpenDropDown(true);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
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
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          disabled={props.disabled}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableState = (props) => {
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
    setFilteredOptions(props.optionArray);
    props.handleSelectCountryAndState(props.name, val.stateName);
  };

  const open = () => {
    if (!props.disabled) {
      setOpenDropDown(true);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
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
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          disabled={props.disabled}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === option.stateName ? "selected-option" : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.stateName}</p>
                </div>
              ))}
            </>
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
    if (!props.disabled) {
      setOpenDropDown(true);
    }
  };

  const close = () => {
    setOpenDropDown(false);
  };

  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
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
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          disabled={props.disabled}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

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
    if (!props.disabled) {
      setOpenDropDown(true);
    }
  };

  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
          style={{ height: "2.344rem" }}
          disabled={props.disabled}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv" id="option-container">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
    </div>
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

  const addRemoveStyle = (val) => {};
  return (
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          autoComplete="off"
          placeholder={props?.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card
          className={`searchField-optionDiv ${props.small ? "smallWidth" : ""}`}
          id="option-container"
          style={{ ...props.optionStyles, zIndex: 999 }}
        >
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
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
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          name={props.name}
          type="text"
          onClick={open}
          onChange={handleChange}
          value={searchVal}
          placeholder={props.placeholder ?? ""}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
        />
        {searchVal?.length > 0 && (
          <div className="input-group-append">
            <span
              className="input-group-text px-1"
              style={{ height: "2.344rem" }}
            >
              <button className="custom-clsBtn" onClick={handleRemove}>
                <GrClose className="custom-clsIcon" />
              </button>
            </span>
          </div>
        )}
      </div>
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
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
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          {...props}
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <p
                  className={`searchField-option mb-1 pe-cursor ${
                    props.selected === option.contactId ? "selected-option" : ""
                  }`}
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
            </>
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
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          {...props}
          autoComplete="off"
          placeholder={props.placeholder ?? ""}
          onClick={() => !openDropDown && open()}
          onChange={handleChange}
          value={searchVal}
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="noMatch-option" key={"no-options"}>
              No match found.
            </p>
          ) : (
            <>
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
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export const SearchableMailingState = (props) => {
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
    <div ref={wrapperRef}>
      {props.label && (
        <Label>
          {props.label}{" "}
          {props.required && <span className="input-error">*</span>}
        </Label>
      )}
      <div className="input-group">
        <Input
          {...props}
          autoComplete="off"
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
          invalid={props.invalid && !searchVal?.toString()}
          required={false}
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
      {props.invalid && !searchVal?.toString()?.trim() && (
        <span className="input-error">{props.invalidMessage}</span>
      )}
      {openDropDown && (
        <Card className="searchField-optionDiv">
          {filteredOptions?.length === 0 ? (
            <p className="bg-light text-center mb-0">No match found.</p>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => {
                    close();
                    handleOptionClick(option);
                  }}
                  className={`searchField-option-div mb-1 pe-cursor ${
                    props.selected === option.stateName ? "selected-option" : ""
                  }`}
                >
                  <p className="mb-0 py-1">{option.stateName}</p>
                </div>
              ))}
            </>
          )}
        </Card>
      )}
    </div>
  );
};
