import React, { useCallback, useEffect, useState } from "react";
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
  const [filteredFoldersForMainContent, setFilteredFoldersForMainContent] =
    useState([]);
  const [filteredFilesForMainContent, setFilteredFilesForMainContent] =
    useState([]);
  const [filesBySelection, setFilesBySelection] = useState([]);
  const [templateList, setTemplateList] = useState([]);
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
    setInitLoad(false);
    setFiles([]);
    onClose();
    setPrecedent({});
    setSearchTermForMainContent("");
    setModal({ name: "", type: "" });
    setSelectedFile(null);
  };

  // function to tranform data from object to array
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
    if (!event.target.value && !selected) updateInitialFiles();
    // else if (!event.target.value && selected) setIsFile(true);
    if (isFile && event.target.value) setIsFile(false);
    setSearchTermForMainContent(event.target.value || "");
  };

  // Seacrh function for left side search(to search through folders)
  const filterData = (items, term, exact = false) => {
    const _items = items?.filter((item) => !item.isFile);
    let result = [];
    if (!exact) {
      result = _items.filter((item) => {
        // Ignore underscores in the search term and name property
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
    } else {
      _items.forEach((item) => {
        // Ignore underscores in the search term and name property
        const formattedSearchTerm = term?.toLowerCase();
        const formattedName = item?.name?.replace(/_/g, " ")?.toLowerCase();
        const type = ["letter", "form", "normal"];
        if (
          formattedName?.includes(formattedSearchTerm) &&
          !type?.includes(formattedName)
        ) {
          result.push(item);
        }
        if (item.children && item.children?.length > 0) {
          const filteredChildren = filterData(item.children, term, exact);
          if (filteredChildren.length > 0) {
            result = [...result, ...filteredChildren];
          }
        }
      });
    }

    return result;
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

  useEffect(() => {
    const data = selected ? files : transformedData;
    if (searchTermForMainContent && !isFile && data && data?.length > 0) {
      const _folders = filterData(data, searchTermForMainContent, true);
      setFilteredFoldersForMainContent(_folders);
    } else {
      setFilteredFoldersForMainContent([]);
    }
  }, [searchTermForMainContent, isFile, files, transformedData, selected]);

  const initFunc = async () => {
    try {
      const userResp = await userProfile();
      window.localStorage.setItem("userDetails", JSON.stringify(userResp.data));

      fetchTemplate();
      getDefaultTemplateId();
    } catch (error) {
      console.error(error);
    }
  };

  const getDefaultTemplateId = () => {
    const userDetails = JSON.parse(window.localStorage.getItem("userDetails"));

    setSelectedBaseTemplate(userDetails?.defaultTemplateId || null);
  };

  const parseList = (data) => {
    let arr = [];

    data.forEach((d) => {
      arr.push({ display: d.name, value: d.id });
    });

    setTemplateList(arr);
  };

  const fetchTemplate = async () => {
    try {
      const { data } = await getAllBaseTemplates();
      if (data.success) {
        parseList(data.data.templateList);
      } else {
        toast.error("Something went wrong in fetching templates.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * function to seprate files for initiall popup load
   *
   * @param {data} data is data  folder api data
   * @param {name} name is the folder name type liek for example 'FORM'
   * it will return all the files  related to second parameter procided that is'FORM' 'NORMAL'
   */

  const filterFilesBySearchTerm = (files, term) => {
    return files?.filter((item) => {
      // Ignore underscores in the search term and name property
      const formattedSearchTerm = term?.replace(/_/g, " ")?.toLowerCase();
      const formattedName = item.contentName?.replace(/_/g, " ")?.toLowerCase();
      const fileFormatType = item.contentType?.toLowerCase();
      const fileFormatTypeWithDot = "." + fileFormatType;
      const fullName = formattedName + "." + fileFormatType;
      if (
        formattedName?.includes(formattedSearchTerm) ||
        fileFormatType?.includes(formattedSearchTerm) ||
        fileFormatTypeWithDot?.includes(formattedSearchTerm) ||
        fullName?.includes(formattedSearchTerm)
      ) {
        return true;
      }
      return false;
    });
  };

  const findFilesByName = (data, name) => {
    const results = [];
    const search = (node) => {
      if (node[name]) {
        Object.values(node[name]).forEach((item) => {
          if (item.isFile && item.isFile === true) {
            results.push(item);
          } else {
            search(item);
          }
        });
      }
      Object.values(node).forEach((child) => {
        if (typeof child === "object" && !Array.isArray(child)) {
          search(child);
        }
      });
    };
    search(data);
    return results;
  };

  const findFiles = (f = [], type) => {
    let result = [];
    f.forEach((d) => {
      if (d.name === type && d?.children?.length) {
        result = [...result, ...d?.children];
      } else if (d?.children && d.children.length) {
        const _result = findFiles(d?.children, type);
        result = [...result, ..._result];
      } else if (d?.isFile && d?.isTypeExist) {
        result = [...result, d];
      }
    });
    return result;
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

  useEffect(() => {
    if (files.length) {
      const _files = findFiles(files, modal.type);
      setFilesBySelection(_files);
    } else {
      setFilesBySelection([]);
    }
  }, [modal?.type, files, selected]);

  //useEffect to show all the files in right side initially
  useEffect(() => {
    updateInitialFiles();
  }, [modal?.type, updateInitialFiles, reset]);

  useEffect(() => {
    if (selected && searchTermForMainContent && filesBySelection?.length > 0) {
      const _files = filterFilesBySearchTerm(
        filesBySelection,
        searchTermForMainContent
      );
      setFilteredFilesForMainContent(_files);
    } else if (!selected && files?.length > 0) {
      const _files = filterFilesBySearchTerm(files, searchTermForMainContent);
      setFilteredFilesForMainContent(_files);
    } else {
      setFilteredFilesForMainContent([]);
    }
  }, [filesBySelection, searchTermForMainContent, selected, files]);

  const generatePrecedent = async () => {
    setLoading(true);
    setSubmitted(true);
    if (!selectedBaseTemplate) {
      setLoading(false);
      return;
    }
    if (selectedFile) {
      let obj = {
        matterId: matterData?.id,
        docId: selectedFile.id,
        basePrecedentId: selectedBaseTemplate,
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
        toast.error("An error occured. Unable to download file.");
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
          <div className="file_directory_modal-header">
            <p>
              <img src={resetIcon} alt="close" onClick={handleReset} />
              {modal.name}
            </p>
            <img src={closeIcon} alt="close" onClick={onClosehandler} />
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
                    placeholder="Search in Main Content"
                    value={searchTermForMainContent}
                    onChange={handleSearchChangeForMainContent}
                  />
                </div>
                <div className="file_directory_folder-directory">
                  {searchTermForMainContent &&
                    !isFile &&
                    filteredFoldersForMainContent?.length > 0 &&
                    filteredFoldersForMainContent?.map((folder) => (
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
                  {!searchTermForMainContent &&
                    !isFile &&
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
                  {searchTermForMainContent &&
                    !isFile &&
                    filteredFilesForMainContent?.length > 0 && (
                      <Files
                        files={filteredFilesForMainContent}
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                      />
                    )}

                  {isFile && (
                    <Files
                      files={files}
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="file_directory_modal-btns">
              <button
                className="file_directory_select-button"
                onClick={generatePrecedent}
              >
                Generate
              </button>
              <button
                className="file_directory_cancel-button"
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
