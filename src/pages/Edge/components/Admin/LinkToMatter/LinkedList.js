import React, { useState, useEffect } from "react";
import LinkToMatterForm from "./LinkToMatterForm";
import LoadingPage from "../../../utils/LoadingPage";
import {
  fetchMatterDefaultChecklist,
  getCheckList,
  linkCheckListToMatterDefault,
  updateLinkCheckListToMatterDefault,
} from "../../../apis";
import { findDisplayname } from "../../../utils/utilFunc";
import {
  Card,
  CardBody,
  CardHeader,
  Container,
  Button,
  Table,
  Input,
} from "reactstrap";
import BreadCrumb from "../../../../../Components/Common/BreadCrumb";
import { toast } from "react-toastify";
import {
  TextInputField,
  CustomDropDown,
} from "pages/Edge/components/InputField";

const initialFilter = {
  type: "",
  subType: "",
  checklistTemplateId: "",
};

const LinkedList = (props) => {
  document.title = "Link Checklist to Matter | EdgeLegal";
  const [add, setAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allCombination, setAllCombinations] = useState([]);
  const [type, setType] = useState([]);
  const [filterInput, setFilterInput] = useState(initialFilter);
  const [filteredOption, setFilteredOption] = useState({
    type: [],
    subType: [],
  });
  const [filteredList, setFilteredList] = useState([]);
  const [checkList, setCheckList] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCheckList();
    fetchEnums();
  }, []);

  const parseCheckList = (arg) => {
    let newArr = [{ display: "None", value: null }];

    if (arg && arg.length > 0) {
      arg.forEach((a) => {
        newArr.push({ display: a.name, value: a.id });
      });
      setCheckList(newArr);
    }
  };

  const fetchCheckList = async () => {
    try {
      const { data } = await getCheckList();
      if (data.success) {
        parseCheckList(data.data.templateList);
      } else {
        toast.warning("Something went wrong, please try later.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.warning("Something went wrong, please try later.");
      setLoading(false);
    }
  };

  const parseAllList = (arg) => {
    let newArr = [];

    if (arg && arg.length > 0) {
      arg.forEach((a) => {
        newArr.push({ ...a, checklistTemplateId: "" });
      });
    }

    handleFetchDefaults(newArr);
  };

  const fetchEnums = () => {
    const allList = JSON.parse(
      window.localStorage.getItem("matterContactRole")
    );

    const enumList = JSON.parse(window.localStorage.getItem("enumList"));
    let typeList = JSON.parse(window.localStorage.getItem("matterTypeList"));

    if (typeList && typeList.length > 0) {
      setType(typeList);
    }

    if (allList && allList.length > 0) {
      parseAllList(allList);
    }

    if (enumList["MatterType"] && enumList["MatterType"].length > 0) {
      setFilteredOption({ ...filteredOption, type: enumList["MatterType"] });
    }
  };

  const filterListFunc = (obj) => {
    const newData = allCombination?.filter(
      (data) =>
        (obj["type"] !== ""
          ? data["type"]?.toLowerCase()?.includes(obj["type"]?.toLowerCase())
          : true) &&
        (obj["subType"] !== ""
          ? data["subType"]
              ?.toLowerCase()
              ?.includes(obj["subType"]?.toLowerCase())
          : true) &&
        (obj["checklistTemplateId"] !== ""
          ? data["checklistTemplateId"] == obj["checklistTemplateId"]
          : true)
    );
    setFilteredList(newData);
  };

  const handleChangeType = (e) => {
    const { name, value } = e.target;

    let temp = { ...filterInput, [name]: value };

    if (name === "type") {
      if (!value) {
        temp.subType = "";
      }
      let obj = type.find((t) => t.value === value);

      if (obj && obj.subType && obj.subType.length > 0) {
        setFilteredOption({ ...filteredOption, subType: obj.subType });
      } else {
        setFilteredOption({ ...filteredOption, subType: [] });
      }
    }

    setFilterInput(temp);

    filterListFunc(temp);
  };

  const handleSelect = (rval, arg, i) => {
    let newData = { ...formData };
    let allList = [...allCombination];
    let obj = {
      matterTypeId: rval.id,
      checklistTemplateId: arg.value,
      alreadyLinked: rval.alreadyLinked || false,
    };

    if (rval.linkedId) {
      obj.id = rval.linkedId;
    }

    if (rval.checksum) {
      obj.checksum = rval.checksum;
    }

    newData[i] = obj;

    for (let a in allList) {
      if (allList[a].id === rval.id) {
        allList[a].checklistTemplateId = arg.value;
      }
    }

    setAllCombinations(allList);
    setFormData(newData);
  };

  const updateCheckIds = (arg, list) => {
    let tempList = [...list];
    if (arg && arg.length > 0) {
      for (let a in arg) {
        let item = arg[a];

        for (let b in tempList) {
          if (tempList[b].id === item.matterTypeId) {
            tempList[b].checklistTemplateId = item.checklistTemplateId;
            tempList[b].alreadyLinked = true;
            tempList[b].linkedId = item.id;
            tempList[b].checksum = item.checksum;
          }
        }
      }

      setAllCombinations(tempList);
      setFilteredList(tempList);
    }
  };

  const handleFetchDefaults = async (list) => {
    setLoading(true);
    try {
      const { data } = await fetchMatterDefaultChecklist();
      if (data.success) {
        updateCheckIds(data.data.matterChecklistList, list);
      } else {
        toast.warning("Something went wrong, please try later!");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("error", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let newArr = [];
    let updatedArr = [];

    for (let a in formData) {
      let temp = { ...formData[a] };
      if (temp.alreadyLinked) {
        delete temp.alreadyLinked;
        updatedArr.push(temp);
      } else {
        delete temp.alreadyLinked;
        newArr.push(temp);
      }
    }

    try {
      let resp1 = { data: { success: true } };
      let resp2 = { data: { success: true } };
      if (newArr.length > 0) {
        resp1 = await linkCheckListToMatterDefault({
          matterTypeList: newArr,
        });
      }

      if (updatedArr.length > 0) {
        resp2 = await updateLinkCheckListToMatterDefault({
          matterTypeList: updatedArr,
        });
      }

      if (resp1.data.success && resp2.data.success) {
        await handleFetchDefaults(allCombination);
        setFormData({});
      } else {
        setLoading(false);
        toast.warning("Something went wrong, please try later.");
      }
    } catch (error) {
      console.error("error", error);
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb
          title="Link Checklist to Matter"
          pageTitle="Link Checklist to Matter"
        />
        <Card>
          <CardHeader>
            <div className="d-flex align-items-center justify-content-between mx-2">
              <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                Link Checklist to Matter
              </h5>
              <Button color="success" onClick={handleSave}>
                Save
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <Table responsive={true} striped={true} hover={true}>
              <thead className="mb-2 bg-light">
                <tr>
                  <th>
                    <p className="mb-0">Matter Type</p>
                    <Input
                      type="select"
                      name="type"
                      value={filterInput.type}
                      onChange={handleChangeType}
                    >
                      <option value="">All</option>
                      {filteredOption?.type?.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.display}
                        </option>
                      ))}
                    </Input>
                  </th>
                  <th>
                    <p className="mb-0">Matter Subtype</p>
                    <Input
                      type="select"
                      name="subType"
                      value={filterInput.subType}
                      onChange={handleChangeType}
                      disabled={filteredOption?.subType?.length === 0}
                    >
                      <option value="">All</option>
                      {filteredOption?.subType?.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.display}
                        </option>
                      ))}
                    </Input>
                  </th>
                  <th>
                    <p className="mb-0">Checklist Template</p>
                    <Input
                      type="select"
                      name="checklistTemplateId"
                      value={filterInput.checklistTemplateId}
                      onChange={handleChangeType}
                    >
                      <option value="">All</option>
                      {checkList?.map((t) => {
                        if (t.value !== null) {
                          return (
                            <option key={t.value} value={t.value}>
                              {t.display}
                            </option>
                          );
                        } else {
                          return <></>;
                        }
                      })}
                    </Input>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((data, i) => (
                  <tr key={i} className="pe-cursor">
                    <td>
                      <p className="mb-0">{data.typeDisplay}</p>
                    </td>
                    <td>
                      <p className="mb-0">{data.subTypeDisplay}</p>
                    </td>
                    <td>
                      <CustomDropDown
                        name="checklistTemplateId"
                        label="Checklist Template"
                        optionStyles={{ maxHeight: "200px" }}
                        value={findDisplayname(
                          checkList,
                          data.checklistTemplateId
                        )}
                        optionArray={checkList}
                        details={formData}
                        onSelectFunc={(val) => handleSelect(data, val, i)}
                        selected={data.checklistTemplateId}
                        fieldVal={findDisplayname(
                          checkList,
                          data.checklistTemplateId
                        )}
                        maxLength={null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {add && <LinkToMatterForm close={() => setAdd(false)} />}
            {loading && <LoadingPage />}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default LinkedList;
