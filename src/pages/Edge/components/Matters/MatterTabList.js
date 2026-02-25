import React, { useState, useEffect } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { matterTabName, listMap } from "../../utils/Constant";
import { checkHasPermission } from "pages/Edge/utils/utilFunc";
import { VIEWACCOUNTINGPANEL } from "pages/Edge/utils/RightConstants";

const MatterTabList = (props) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (props.list && props.list.length > 0) {
      setList(props.list);
      if (props.selected) {
        handleChange(props.selected);
      } else {
        handleChange(props.list?.[0] ? props.list?.[0] : "");
      }
    }
  }, [props.list]);

  const handleChange = (tab, manual = false) => {
    if (props.selectTab && manual) {
      props.selectTab(tab);
    }
  };

  const tabNameWithLength = (tab) => {
    let map = listMap[tab];
    let data = props.data;
    let name = matterTabName[tab] ? matterTabName[tab] : tab;

    if (map) {
      let len = data[map]?.length;

      if (len > 0) {
        name = `${name} (${len})`;
      }
    }

    return name;
  };

  const shoulShow = (tab) => {
    if (tab === "INVOICES") {
      return checkHasPermission(VIEWACCOUNTINGPANEL);
    } else {
      return true;
    }
  };

  return (
    <Nav tabs className="nav nav-tabs nav-tabs-custom nav-success m-4">
      {list.map((tab, idx) => {
        if (shoulShow(tab)) {
          return (
            <NavItem key={idx} className="py-2">
              <NavLink
                style={{ cursor: "pointer" }}
                className={classnames({
                  active: tab === props.selected,
                })}
                onClick={() => handleChange(tab, true)}
              >
                {tabNameWithLength(tab)}
              </NavLink>
              {/* {matterTabName[tab] ? matterTabName[tab] : tab} */}
            </NavItem>
          );
        } else {
          return null;
        }
      })}
      <div className="ms-auto d-flex align-items-center">
        {props.extraButtons}
      </div>
    </Nav>
  );
};

export default MatterTabList;
