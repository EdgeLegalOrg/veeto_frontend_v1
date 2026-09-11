import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./style.css";
import FolderItem from "./FolderItem";
import closeIcon from "../../icons/fileDirectory/close.svg";
import searchFolder from "../../icons/fileDirectory/search-folder.svg";
import searchFile from "../../icons/fileDirectory/search-file.svg";
import Files from "./Files";
import FileItem from "./FileItem";
import resetIcon from "../../icons/fileDirectory/home.svg";
import {
  generatePrecedentApi,
  getAllBaseTemplates,
  getPrecedents,
  userProfile,
} from "../../apis";
import LoadingPage from "./../../utils/LoadingPage";
import { toast } from "react-toastify";
import { TextInputField } from "../InputField";
import { convertTitleCase } from "./helperFunction";

const FileDirectoryModal = ({
  modal,
  isOpen,
  onClose,
  setModal,
  matterData,
}) => {
  const [loading, setLoading] = useState(false);
  const [precedent, setPrecedent] = useState({});
  const [selected, setSelected] = useState("");
  const [files, setFiles] = useState([]);
  const [isFile, setIsFile] = useState(false);
  const [transformedData, setTransformedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermForMainContent, setSearchTermForMainContent] = useState("");
  const [templateList, setTemplateList] = useState([]);
  const [defaultTemplateList, setDefaultTemplateList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBaseTemplate, setSelectedBaseTemplate] = useState(null);
  const [reset, setReset] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectForFolders = (folderId) => {
    setSelected(folderId);
    if (searchTermForMainContent) setSearchTermForMainContent("");
  };

  const handleReset = () => {
    setReset(true);
    setSelected("");
    setInitLoad(false);
    setSearchTerm("");
    setSearchTermForMainContent("");
  };

  const onClosehandler = () => {
    setSelected("");
    setSelectedBaseTemplate(null);
    setDefaultTemplateList([]);
    setInitLoad(false);
    setFiles([]);
    onClose();
    setPrecedent({});
    setSearchTermForMainContent("");
    setModal({ name: "", type: "" });
    setSelectedFile(null);
  };

  // function to transform data from object to array
  function generateRecursiveArray(data, parentID = null) {
    const result = [];
    for (const key in data) {
      const uniqueID = parentID ? `${parentID}_${key}` : key;
      const isTypeExist = modal?.type === key ? key : "";
      const isFolderType = modal?.type === key;
      const item = {
        id: uniqueID,
        name: key,
        children: [],
        isTypeExist: isTypeExist,
        isFolderType: isFolderType,
      };
      if (typeof data[key] === "object" && Object.keys(data[key])?.length > 0) {
        if (!isNaN(parseInt(Object.keys(data[key])[0]))) {
          // If the object has numeric keys, convert it to an array
          item.children = Object.keys(data[key])?.map((numKey) => {
            const obj = data[key][numKey];
            return {
              id: `${uniqueID}_${numKey}`,
              name: numKey,
              isTypeExist: isTypeExist,
              isFolderType: isFolderType,
              ...obj,
            };
          });
        } else {
          // Otherwise, continue with the recursion
          item.children = generateRecursiveArray(data[key], uniqueID);
        }
      }
      result.push(item);
    }
    setReset(false);
    return result;
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchChangeForMainContent = (event) => {
    setSearchTermForMainContent(event.target.value || "");
  };

  // Search function for left side search (to search through folders)
  const filterData = (items, term) => {
    const _items = items?.filter((item) => !item.isFile);
    let result = [];
    result = _items.filter((item) => {
      const formattedSearchTerm = term.toLowerCase();
      const formattedName = item?.name?.replace(/_/g, " ").toLowerCase();
      if (formattedName?.includes(formattedSearchTerm)) {
        return true;
      }
      if (item.children && item.children?.length > 0) {
        const filteredChildren = filterData(item.children, term);
        return filteredChildren?.length > 0;
      }
      return false;
    });

    return result;
  };

  const getAllFilesWithBreadcrumbs = (data, targetType, currentPath = []) => {
    let results = [];
    if (!data || typeof data !== "object") return results;

    if (data[targetType] && typeof data[targetType] === "object") {
      Object.values(data[targetType]).forEach((item) => {
        if (item && item.isFile) {
          const breadcrumb = currentPath.map(convertTitleCase).join(" / ");
          results.push({
            ...item,
            breadcrumb,
          });
        }
      });
    }

    Object.keys(data).forEach((key) => {
      if (["NORMAL", "FORM", "LETTER"].includes(key)) return;
      const child = data[key];
      if (child && typeof child === "object" && !Array.isArray(child)) {
        results = results.concat(
          getAllFilesWithBreadcrumbs(child, targetType, [...currentPath, key])
        );
      }
    });

    return results;
  };

  const filterFilesBySearchTerm = (filesList, term) => {
    return filesList?.filter((item) => {
      const formattedSearchTerm = term?.replace(/_/g, " ")?.toLowerCase();
      const formattedName = item.contentName?.replace(/_/g, " ")?.toLowerCase();
      const fileFormatType = item.contentType?.toLowerCase() || "";
      const fileFormatTypeWithDot = "." + fileFormatType;
      const fullName = formattedName + "." + fileFormatType;
      return (
        formattedName?.includes(formattedSearchTerm) ||
        fileFormatType?.includes(formattedSearchTerm) ||
        fileFormatTypeWithDot?.includes(formattedSearchTerm) ||
        fullName?.includes(formattedSearchTerm)
      );
    });
  };

  const findFilesByName = (data, name) => {
    const results = [];
    const search = (node) => {
      if (!node || typeof node !== "object") {
        return;
      }
      if (node?.[name] && typeof node[name] === "object") {
        Object.values(node[name]).forEach((item) => {
          if (!item) return;

          if (item.isFile === true) {
            results.push(item);
          } else {
            search(item);
          }
        });
      }
      Object.values(node).forEach((child) => {
        if (child && typeof child === "object" && !Array.isArray(child)) {
          search(child);
        }
      });
    };
    search(data);
    return results;
  };

  const updateInitialFiles = useCallback(() => {
    const filesWithIsFileTrue = findFilesByName(precedent, modal?.type);
    setFiles(filesWithIsFileTrue);
    setIsFile(true);
  }, [modal?.type, precedent]);

  const filteredData = filterData(transformedData, searchTerm);

  useEffect(() => {
    if (isOpen) {
      setInitLoad(true);
      initFunc();
    }
  }, [isOpen]);

  const initFunc = async () => {
    try {
      const userResp = await userProfile();
      window.localStorage.setItem("userDetails", JSON.stringify(userResp.data));
      const userDefaultTemplateId = userResp.data?.defaultTemplateId || null;
      fetchTemplate(userDefaultTemplateId);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTemplate = async (userDefaultTemplateId = null) => {
    try {
      const { data } = await getAllBaseTemplates();
      if (data.success) {
        const matterSubType = matterData?.subType;
        const allTemplates = data.data.templateList;

        const specific = matterSubType
          ? allTemplates.filter((d) => {
              const subTypes = Array.isArray(d.subTypes) ? d.subTypes : [];
              return subTypes.includes(matterSubType);
            })
          : [];

        const defaults = allTemplates.filter((d) => {
          const subTypes = Array.isArray(d.subTypes) ? d.subTypes : [];
          return subTypes.length === 0;
        });

        const arr = [];
        specific.forEach((d) => arr.push({ display: d.name, value: d.id }));
        if (defaults.length > 0) {
          arr.push({
            display: "Defaults",
            value: "__separator__",
            disabled: true,
          });
          defaults.forEach((d) => arr.push({ display: d.name, value: d.id }));
        }

        setTemplateList(arr);

        if (specific.length > 0) {
          setSelectedBaseTemplate(specific[0].id);
        }
      } else {
        toast.error("Something went wrong in fetching templates.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let arr = [];
      arr.push(modal?.type);
      let params = ["NORMAL", "LETTER", "FORM"].includes(modal?.type)
        ? arr
        : [];
      const { data } = await getPrecedents(params);
      if (data.success) {
        let d = data?.data?.contentRoot;
        let recursiveArray = generateRecursiveArray(d);
        setTransformedData(recursiveArray);
        setPrecedent(d);
        updateInitialFiles();
      } else {
        toast.error("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong, please check console.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasFiles = !!files.find((item) => item?.isFile);
    if (!isFile && hasFiles && !searchTermForMainContent) setIsFile(hasFiles);
  }, [files, searchTermForMainContent]);

  // UseEffect to fetch data
  useEffect(() => {
    if (modal?.type) fetchData();
  }, [reset, modal?.type]);

  // useEffect to show all the files in right side initially
  useEffect(() => {
    updateInitialFiles();
  }, [modal?.type, updateInitialFiles, reset]);

  // Global search across all folders when searchTermForMainContent length >= 2
  const isGlobalSearch = searchTermForMainContent.trim().length >= 2;

  const globalSearchResults = useMemo(() => {
    if (!isGlobalSearch || !precedent) return [];
    const allFiles = getAllFilesWithBreadcrumbs(precedent, modal?.type);
    return filterFilesBySearchTerm(allFiles, searchTermForMainContent);
  }, [isGlobalSearch, precedent, modal?.type, searchTermForMainContent]);

  const generatePrecedent = async () => {
    setLoading(true);
    setSubmitted(true);
    const isForm = modal?.type === "FORM";
    if (!isForm && !selectedBaseTemplate) {
      setLoading(false);
      toast.error("No base template found.");
      return;
    }
    if (selectedFile) {
      let obj = {
        matterId: matterData?.id,
        docId: selectedFile.id,
        basePrecedentId: isForm ? "" : (selectedBaseTemplate || ""),
        isForm: isForm,
      };
      try {
        const { data } = await generatePrecedentApi(obj);
        const downloadLink = document.createElement("a");
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = `${selectedFile.contentName}.${selectedFile.contentType}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("file downloaded successfully");
        onClosehandler();
        setLoading(false);
        setSubmitted(false);
      } catch (error) {
        console.error("error", error);
        toast.error("An error occurred. Unable to download file.");
        setLoading(false);
      }
    } else {
      toast.warning("Please select any document.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`file_directory_modal ${
        modal.type === "FORM" ? "form-modal" : ""
      }`}
    >
      {loading ? (
        <LoadingPage />
      ) : (
        <div className="file_directory_modal-content">
          <div className="file_directory_modal-header bg-light p-3 border-bottom">
            <p>
              <img
                src={resetIcon}
                alt="reset"
                onClick={handleReset}
                title="Reset to root folder"
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
              {modal.name}
            </p>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClosehandler}
            ></button>
          </div>
          <div className="file_directory_modal-file-folder-content">
            {modal.type === "NORMAL" && (
              <div className="col-md-4 mt-3">
                <TextInputField
                  type="select"
                  name="defaultTemplateId"
                  label="Default Letter Head"
                  placeholder="Default Letter Head"
                  value={selectedBaseTemplate}
                  selected={selectedBaseTemplate}
                  optionArray={[
                    {
                      label: "Select",
                      value: "",
                      disabled: true,
                      selected: !selectedBaseTemplate,
                    },
                    ...templateList.map((d) => ({
                      label: d.display,
                      value: d.value,
                    })),
                    ...(defaultTemplateList.length > 0
                      ? [
                          {
                            label: "── Defaults ──",
                            value: "__separator__",
                            disabled: true,
                          },
                          ...defaultTemplateList.map((d) => ({
                            label: d.display,
                            value: d.value,
                          })),
                        ]
                      : []),
                  ]}
                  onChange={({ target }) => {
                    setSubmitted(false);
                    setSelectedBaseTemplate(target.value);
                  }}
                  required={true}
                  invalid={submitted}
                  invalidMessage="Please select a valid Default Letter Head"
                />
              </div>
            )}

            <div className="file_directory_modal-flex">
              <div className="file_directory_sidebar">
                <div className="file_directory_search-box">
                  <img src={searchFolder} alt="folder search" />
                  <input
                    className="file_directory_search-bar"
                    type="text"
                    placeholder="Search for folder"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="file_directory_folder-directory">
                  {!reset &&
                    filteredData?.map((folder) => (
                      <FolderItem
                        key={folder.id}
                        isOpen={isOpen}
                        type={modal.type}
                        folder={folder}
                        selected={selected}
                        setSelected={handleSelectForFolders}
                        setIsFile={setIsFile}
                        setFiles={setFiles}
                        matterData={matterData}
                        initLoad={initLoad}
                        setInitLoad={setInitLoad}
                      />
                    ))}
                </div>
              </div>
              <div className="file_directory_main-content">
                <div className="file_directory_search-box">
                  <img src={searchFile} alt="file search" />
                  <input
                    className="file_directory_search-bar"
                    type="text"
                    placeholder="Search across all files..."
                    value={searchTermForMainContent}
                    onChange={handleSearchChangeForMainContent}
                  />
                </div>
                <div className="file_directory_folder-directory">
                  {isGlobalSearch ? (
                    <Files
                      files={globalSearchResults}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  ) : (
                    <>
                      {!isFile &&
                        selected &&
                        files?.length > 0 &&
                        files?.map((folder) => (
                          <FileItem
                            key={folder.id}
                            type={modal.type}
                            folder={folder}
                            selected={selected}
                            setSelected={handleSelectForFolders}
                            setIsFile={setIsFile}
                            setFiles={setFiles}
                          />
                        ))}

                      {isFile && (
                        <Files
                          files={files}
                          selectedFile={selectedFile}
                          setSelectedFile={setSelectedFile}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="file_directory_modal-btns mt-3">
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={generatePrecedent}
              >
                Generate
              </button>
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={onClosehandler}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDirectoryModal;
