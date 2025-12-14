import React, { useEffect, useState } from "react";
import { getPrecedents } from "../../apis";
import LoadingPage from "../../utils/LoadingPage";
import { CustomModelBox } from "../customComponents/CustomComponents";
import PrecedentFolder from "./PrecedentFolder";

import "../../stylesheets/PrecedentTree.css";
import PrecendentFileContainer from "./PrecendentFileContainer";
import { parseData } from "./parseData";
import { toast } from "react-toastify";

const PrecedentTreeContainer = (props) => {
  const [active, setActive] = useState(false);
  const [precedent, setPrecedent] = useState({});
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({
    folder: {
      parent: "",
      child: "",
    },
    files: [],
    selectedFiles: [],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let params = props.acceptedType || [];
      const { data } = await getPrecedents(params);
      if (data.success) {
        let d = parseData(data?.data?.contentRoot);
        setPrecedent(d);
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong, please check console.");
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setActive(props.active);
    if (props.active) {
      fetchData();
    }
  }, [props.active]);

  const getFiles = (arg) => {
    let mp = arg?.map;
    let arr = mp.split(".");

    let rv = { ...selected };

    if (arr?.length === 1) {
      rv.folder = {};
      rv.folder["parent"] = arg.uid;
      rv.folder["child"] = "";
      rv["files"] = arg.files;
    } else {
      rv.folder["child"] = arg.uid;
      rv["files"] = arg.files;
    }
    setSelected(rv);
  };

  const body = () => {
    return (
      <div className="tree-popup">
        <div className="tree-struc">
          <PrecedentFolder
            data={precedent}
            onExpand={getFiles}
            selected={selected}
          />
        </div>
        <div className="tree-right">
          <PrecendentFileContainer data={selected} />
        </div>
      </div>
    );
  };

  const handleClose = () => {
    setSelected({ folder: {}, files: [], selectedFiles: [] });

    if (props.close) {
      props.close();
    }
  };

  const ui = () => {
    if (loading) {
      return <LoadingPage />;
    } else {
      return (
        <CustomModelBox
          active={active}
          needFooter={false}
          closeForm={handleClose}
          body={body}
          heading="Precedents"
          bodyStyle={{ margin: "25px 0px" }}
        />
      );
    }
  };

  return ui();
};

export default PrecedentTreeContainer;
