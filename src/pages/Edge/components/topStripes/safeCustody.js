import React from "react";
import "../../stylesheets/stripes.css";

function SafeCustodystripe() {
  return (
    <div className="safestrip">
      <p>Safe Custody</p>
      <div className="safe_iconsDiv">
        <button className="safeadd">
          <span className="plusdiv">+</span> Add
        </button>
      </div>
    </div>
  );
}

export default SafeCustodystripe;
