import React, { useEffect, useState } from "react";
import { linkRoleToUser, userProfile } from "../../../apis";
import "../../../stylesheets/ManageUserPage.css";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { AiOutlineClose } from "react-icons/ai";
import {
  TextInputField,
} from "pages/Edge/components/InputField";

import UserAccessFields from "./UserAccessFields";

const UpdateUser = (props) => {
  const {
    handleCloseRight,
    userDetail,
    siteList,
    roleList,
    fetchUsers,
    linkedRoles,
    handleUpdateRole,
    templateList,
    updatedUserDetails,
  } = props;

  const [siteIds, setSiteIds] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [defaultTemplateId, setDefaultTemplateId] = useState("");

  // Initialise from persisted assignments, never from the order of the visible site list.
  useEffect(() => {
    const mappings = updatedUserDetails?.siteRoleList || linkedRoles || [];
    const existingRoles = [...new Set(mappings.map((mapping) => mapping.roleId).filter(Boolean))];
    setSiteIds((updatedUserDetails?.siteIds || mappings.map((mapping) => mapping.siteId)).map(Number));
    setRoleId(updatedUserDetails?.roleId ?? (!updatedUserDetails?.requiresRoleSelection && existingRoles.length === 1
      ? Number(existingRoles[0]) : ""));
    setDefaultTemplateId(updatedUserDetails?.defaultTemplateId || "");
    setSubmitted(false);
  }, [userDetail.id, updatedUserDetails, linkedRoles]);

  /** Saves a full membership replacement, with one role shared by every selected site. */
  const handleUpdate = async () => {
    if (saving) return;
    setSubmitted(true);
    const selectedRole = roleList.find((role) => Number(role.value) === Number(roleId));
    const hasActiveSite = siteList.some((site) => siteIds.includes(Number(site.value)));
    if (!selectedRole || (!selectedRole.accessAllSites && !hasActiveSite)) return;
    setSaving(true);
    try {
      const { data } = await linkRoleToUser({
        defaultTemplateId: defaultTemplateId ? Number(defaultTemplateId) : null,
        userId: userDetail.id, roleId: Number(roleId), siteIds,
      });
      if (data.success) {
        toast.success("User access updated successfully.");
        await fetchUsers();
        const currentUser = JSON.parse(window.localStorage.getItem("userDetails") || "{}");
        if (Number(currentUser.id) === Number(userDetail.id)) {
          // Refresh persisted UI data before reloading; reload alone would reuse stale localStorage.
          try {
            const profile = await userProfile();
            window.localStorage.setItem("userDetails", JSON.stringify(profile.data));
            window.dispatchEvent(new Event("siteChanged"));
            window.location.reload();
          } catch {
            toast.warning("Access was saved. Refresh the page to reload your permissions.");
          }
        } else {
          await handleUpdateRole(userDetail.id, true);
        }
      } else {
        toast.error(data.message || data.error?.message || "Unable to save access. Check the role and site selections.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save user access. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="addUser-container">
      <div className="bg-light p-2 d-flex border align-items-center justify-content-between">
        <h5 className="mb-0">{`${userDetail.firstName} ${userDetail.lastName}`}</h5>
        <Button
          color="danger"
          className="mx-2 d-flex"
          onClick={handleCloseRight} disabled={saving}
        >
          <AiOutlineClose size={18} />
        </Button>
      </div>
      <div className="addUser-bodyDiv">


        <div className="addUser-details">
          <label className="mb-0">Username : </label>
          <p className="mb-0">{userDetail.login}</p>
        </div>

        <div className="mt-3">
          <TextInputField
            type="select"
            name="defaultTemplateId"
            label="Default Letter Head"
            placeholder="Default Letter Head"
            value={defaultTemplateId}
            selected={defaultTemplateId}
            optionArray={[
              {
                label: "Use Site Default",
                value: "",
                selected: !defaultTemplateId,
              },
              ...templateList.map((d) => ({
                label: d.display,
                value: d.value,
                selected: d.value === defaultTemplateId,
              })),
            ]}
            onChange={({ target }) => {
              setDefaultTemplateId(target.value);
            }}
            // required={
            //   requiredFields.indexOf('defaultTemplateId') >= 0
            // }
            // invalid={
            //   submitted &&
            //   requiredFields.indexOf('defaultTemplateId') >= 0
            //     ? true
            //     : false
            // }
            // invalidMessage='Please enter a valid Default Letter Head'
          />
        </div>
        <UserAccessFields siteList={siteList} roleList={roleList} siteIds={siteIds} roleId={roleId}
          onSitesChange={setSiteIds} onRoleChange={setRoleId} submitted={submitted} disabled={saving}
          requiresRoleSelection={updatedUserDetails?.requiresRoleSelection} />
      </div>
      <div className="d-flex my-2 mx-3">
        <Button className="mx-1" color="success" onClick={handleUpdate} disabled={saving}>
          {saving ? "Saving..." : "Update User"}
        </Button>
        <Button className="mx-1" color="danger" onClick={handleCloseRight} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UpdateUser;
