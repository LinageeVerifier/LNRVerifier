import React from "react";
import "./TokenToggle.css";

const TokenToggle = ({ toggleIsTrue, setToggleIsTrue }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={toggleIsTrue} onChange={setToggleIsTrue}/>
      <span className="Lslider" />
    </label>
  );
};

export default TokenToggle;
