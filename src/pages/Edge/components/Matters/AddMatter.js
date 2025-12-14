import React from "react";
import { CustomToastWindow } from "../customComponents/CustomComponents";

const AddMatter = (props) => {
  return (
    <div>
      <CustomToastWindow
        closeForm={props.close}
        btn1={"Cancel"}
        btn2="Add"
        heading="Add new matter"
        handleFunc={() => {}}
        autoClose={false}
      >
        <div>Hello</div>
      </CustomToastWindow>
    </div>
  );
};

export default AddMatter;
