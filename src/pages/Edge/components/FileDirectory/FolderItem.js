import React, { useState, useEffect } from "react";
import "./style.css";
import folderIcon from "../../icons/fileDirectory/folder.svg";
import rightArrow from "../../icons/fileDirectory/rightArrow.svg";
import downArrow from "../../icons/fileDirectory/downArrow.svg";
import { convertTitleCase } from "./helperFunction";

const FolderItem = ({
  type,
  folder,
  selected,
  setSelected,
  setIsFile,
  setFiles,
  matterData,
  initLoad,
  setInitLoad,
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (matterData?.type === folder?.id && initLoad) {
      setInitLoad(false);
      setExpanded(true);
      if (folder?.children?.length) {
        const name = `${matterData.type}_${matterData.subType}`;
        const filterFolder = folder.children.filter(({ id }) => id === name)[0];
        if (filterFolder) {
          setSelected(name);
          setTimeout(() => {
            handleSelect(filterFolder);
          }, 0);
        } else {
          setSelected(matterData.type);
          setTimeout(() => {
            handleSelect(folder);
          }, 0);
        }
      } else {
        setSelected(matterData.type);
        setTimeout(() => {
          handleSelect(folder);
        }, 0);
      }
    }
  }, [matterData?.type, folder, setSelected]);

  const shouldApplyStyle = (children) => {
    return children.some((child) =>
      ["LETTER", "FORM", "NORMAL"].includes(child.name)
    );
  };

  const handleSelect = (folder) => {
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
      if (isExist.length || !folder?.children?.length) {
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
        onClick={() => {
          setExpanded(!expanded);
          setSelected(folder.id);
          handleSelect(folder);
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
        onClick={() => {
          setExpanded(!expanded);
          setSelected(folder.id);
          handleSelect(folder);
        }}
      >
        {expanded ? (
          <>
            <img
              className="file_directory_folder-icon-down-arrow"
              src={downArrow}
              style={
                shouldApplyStyle(folder.children)
                  ? { visibility: "hidden" }
                  : {}
              }
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
              style={
                shouldApplyStyle(folder.children)
                  ? { visibility: "hidden" }
                  : {}
              }
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
        {folder.children.map((folder) => {
          if (["NORMAL", "LETTER", "FORM"].includes(folder.name)) {
            return null;
          }
          return (
            <FolderItem
              key={folder.id}
              type={type}
              folder={folder}
              selected={selected}
              setSelected={setSelected}
              setIsFile={setIsFile}
              setFiles={setFiles}
              matterData={matterData}
              initLoad={initLoad}
              setInitLoad={setInitLoad}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FolderItem;
