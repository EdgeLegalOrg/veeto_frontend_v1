import React, { useEffect } from "react";
import {
  userProfile,
  fetchMetaData,
  getContactRoles,
  fetchSuburbAndPostcode,
  fetchCountryAndStates,
  getRights,
  fetchEnums,
  fetchMetaTab,
  fetchMatterRole,
  fetchPaymentTypes,
  getCompanyInfo,
} from "../apis";
import LoadingPage from "../utils/LoadingPage.js";
import { toast } from "react-toastify";

const AppStarter = (props) => {
  const storeCookie = (data) => {
    let metaData = {};
    data.forEach((d) => {
      metaData = { ...metaData, [d.tableName]: d };
    });
    window.localStorage.setItem("metaData", JSON.stringify(metaData));
  };

  const loadMetaData = async () => {
    try {
      const { data } = await fetchMetaData();
      if (data && data.success) {
        storeCookie(data.data.tableDefinitionList);
      } else {
        console.error(data.data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await getContactRoles();
      window.localStorage.setItem(
        "roleList",
        JSON.stringify(data.data.contactRoleList)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPostalList = async () => {
    try {
      const { data } = await fetchSuburbAndPostcode();
      window.localStorage.setItem(
        "postalList",
        JSON.stringify(data.data.postCodeList)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data } = await fetchCountryAndStates();
      window.localStorage.setItem(
        "countryList",
        JSON.stringify(data.data.countryList)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRightList = async () => {
    try {
      const { data } = await getRights();
      if (data.success) {
        window.localStorage.setItem(
          "rightList",
          JSON.stringify(data?.data?.applicationRightListing)
        );
      } else {
        toast.error("There might some error in fetching rights.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const { data } = await getCompanyInfo();
      if (data.success) {
        window.localStorage.setItem("companyInfo", JSON.stringify(data?.data));
      } else {
        toast.error("There might some error in fetching Company Info.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMatterTab = async () => {
    try {
      const { data } = await fetchMetaTab();
      if (data.success) {
        window.localStorage.setItem(
          "matterTabs",
          JSON.stringify(data?.data?.matterTabsDisplayList)
        );
        parseMatterStatus(data?.data?.matterTabsDisplayList);
      } else {
        toast.error("There might some error in fetching rights.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEnumList = async () => {
    try {
      const { data } = await fetchEnums();
      if (data?.success) {
        parseEnumList(
          data?.data?.enumMetadataList ? data.data.enumMetadataList : []
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const parseEnumList = async (data) => {
    let enums = {};

    data.forEach((d) => {
      let enumKey = d.enumType;
      let keys = Object.keys(d.keyValuePair);
      let arr = [];
      keys.forEach((k) => {
        let obj = { display: d.keyValuePair[k], value: k };
        arr.push(obj);
      });
      enums = { ...enums, [enumKey]: arr };
    });
    window.localStorage.setItem("enumList", JSON.stringify(enums));

    setTimeout(() => {
      fetchMetaPaymentType();
    }, 10);
  };

  const parseMatterRole = async (list) => {
    let obj = {};
    list.forEach((a) => {
      if (obj[a.type]) {
        obj[a.type].subType.push({
          display: a.subTypeDisplay,
          value: a.subType,
        });
      } else {
        obj[a.type] = { display: a.typeDisplay, value: a.type, subType: [] };
        obj[a.type].subType.push({
          display: a.subTypeDisplay,
          value: a.subType,
        });
      }
    });

    let arr = [];
    for (let i in obj) {
      arr.push(obj[i]);
    }

    setTimeout(() => {
      window.localStorage.setItem("matterTypeList", JSON.stringify(arr));
    }, 10);
  };

  const helperForStatus = (obj) => {
    let arr = [];

    for (let a in obj) {
      arr.push({ display: obj[a], value: a });
    }

    return arr;
  };

  const parseMatterStatus = (list) => {
    let obj = {};

    list.forEach((l) => {
      let sb = l.subType;
      if (!obj[sb]) {
        obj[sb] = helperForStatus(l.statusToDisplay);
      }
    });

    window.localStorage.setItem("matterStatus", JSON.stringify(obj));
  };

  const fetchMatterContactRole = async () => {
    try {
      const { data } = await fetchMatterRole();
      if (data.success) {
        if (
          data?.data?.matterTypeList &&
          data?.data?.matterTypeList?.length > 0
        ) {
          window.localStorage.setItem(
            "matterContactRole",
            JSON.stringify(data.data.matterTypeList)
          );
          await parseMatterRole(data.data.matterTypeList);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const parsePaymentSubType = async (arg) => {
    let enumList = JSON.parse(window.localStorage.getItem("enumList"));
    let pt = enumList["PaymentType"];
    let obj = {};
    let newList = [];

    arg.forEach((t) => {
      let arr = [];
      let sub = t.subType;
      for (let a in sub) {
        arr.push({ display: sub[a], value: a });
      }

      obj[t.type] = arr;
    });

    for (let a in obj) {
      let type = pt.find((p) => p.value === a);
      let sub = obj[type.value];
      let temp = { ...type };
      temp["subType"] = sub;

      newList.push(temp);
    }

    enumList["PaymentType"] = newList;
    window.localStorage.setItem("enumList", JSON.stringify(enumList));
  };

  const fetchMetaPaymentType = async () => {
    try {
      const { data } = await fetchPaymentTypes();
      if (data.success) {
        if (
          data?.data?.paymentTypeList &&
          data?.data?.paymentTypeList?.length > 0
        ) {
          window.localStorage.setItem(
            "matterContactRole",
            JSON.stringify(data.data.paymentTypeList)
          );
          await parsePaymentSubType(data.data.paymentTypeList);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const findInLocalStorage = (itemName) => {
    let ls = JSON.parse(window.localStorage.getItem(itemName));

    if (ls) {
      return true;
    } else {
      return false;
    }
  };

  const startFetching = async () => {
    if (!findInLocalStorage("enumList")) {
      await fetchEnumList();
    }

    if (!findInLocalStorage("matterContactRole")) {
      await fetchMatterContactRole();
    }

    if (!findInLocalStorage("matterTabs")) {
      await fetchMatterTab();
    }
    if (!findInLocalStorage("roleList")) {
      await fetchRoles();
    }

    if (!findInLocalStorage("metaData")) {
      await loadMetaData();
    }

    if (!findInLocalStorage("postalList")) {
      await fetchPostalList();
    }
    if (!findInLocalStorage("countryList")) {
      await fetchCountries();
    }

    if (!findInLocalStorage("rightList")) {
      await fetchRightList();
    }

    if (!findInLocalStorage("companyInfo")) {
      await fetchCompanyInfo();
    }

    if (props.setIsLoading) {
      props.setIsLoading(false);
    }
  };

  useEffect(() => {
    startFetching();
  }, []);

  useEffect(() => {
    if (
      !window.localStorage.getItem("userDetails") ||
      Object.keys(JSON.parse(window.localStorage.getItem("userDetails")))
        ?.length === 0
    ) {
      userProfile()
        .then((response) => {
          window.localStorage.setItem(
            "userDetails",
            JSON.stringify(response.data)
          );
        })
        .catch((error) => {
          toast.error("Error in fetching user profile, please try later!");
        });
    }
  }, []);

  return <LoadingPage loadingText="Please wait..." />;
};

export default AppStarter;
