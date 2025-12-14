import React, { useState } from "react";
import "./style.css";
import folderIcon from "../../icons/fileDirectory/folder.svg";
import rightArrow from "../../icons/fileDirectory/rightArrow.svg";
import downArrow from "../../icons/fileDirectory/downArrow.svg";
import { convertTitleCase } from "./helperFunction";

const FileItem = ({
  type,
  folder,
  selected,
  setSelected,
  setIsFile,
  setFiles,
}) => {
  const [expanded, setExpanded] = useState(false);
  const handleSelect = () => {
    const formObj = folder.children.find((item) => item.name === type);
    if (formObj) {
      setIsFile(true);
      setFiles(formObj.children);
    } else {
      let excludedNames = ["NORMAL", "LETTER", "FORM"].filter(
        (y) => y !== type
      );
      const isExist = folder.children.filter((element) =>
        excludedNames.includes(element.name)
      );
      console.error(isExist);
      console.error(folder.children);
      if (isExist.length || !folder.children.length) {
        setIsFile(true);
        setFiles([]);
      } else {
        setIsFile(false);
        setFiles(folder.children);
      }
    }
  };

  if (folder?.children?.length === 0) {
    return (
      <div
        className={`file_directory_align-center ${
          folder.id === selected ? "file_directory_active" : ""
        }`}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setExpanded(!expanded);
          setSelected(folder.id);
          handleSelect();
        }}
      >
        <img
          className="file_directory_folder-icon-arrow"
          style={{ visibility: "hidden" }}
          src={rightArrow}
          alt="right arrow"
        />
        <img
          className="file_directory_folder-icon"
          src={folderIcon}
          alt="folder"
        />{" "}
        {convertTitleCase(folder.name)}
      </div>
    );
  }

  return (
    <div className="file_directory_folder-item">
      <span
        className={`file_directory_align-center ${
          folder.id === selected ? "file_directory_active" : ""
        }`}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setExpanded(!expanded);
          setSelected(folder.id);
          handleSelect();
        }}
      >
        {expanded ? (
          <>
            <img
              className="file_directory_folder-icon-down-arrow"
              src={downArrow}
              style={{ visibility: "hidden" }}
              alt="right arrow"
            />
            <img
              className="file_directory_folder-icon"
              src={folderIcon}
              alt="folder"
            />
          </>
        ) : (
          <>
            <img
              className="file_directory_folder-icon-arrow"
              src={rightArrow}
              style={{ visibility: "hidden" }}
              alt="right arrow"
            />
            <img
              className="file_directory_folder-icon"
              src={folderIcon}
              alt="folder"
            />
          </>
        )}
        {convertTitleCase(folder.name)}
      </span>
      <div
        className={
          expanded
            ? "file_directory_indendFolder"
            : "file_directory_nonIndentFolder"
        }
        style={{ display: expanded ? "block" : "none" }}
      >
        {folder?.children?.map((folder) => {
          if (["NORMAL", "LETTER", "FORM"].includes(folder.name)) {
            return null;
          }
          return (
            <FileItem
              key={folder.id}
              folder={folder}
              type={type}
              setIsFile={setIsFile}
              setSelected={setSelected}
              setFiles={setFiles}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FileItem;
