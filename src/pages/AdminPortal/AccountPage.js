import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import { toast } from "react-toastify";

import { PORTAL_BASE, changeOwnPassword, readSession, writeSession } from "./adminPortalApi";
import { ADMIN_PASSWORD_HINT, ErrorAlert, isStrongAdminPassword } from "./shared";

const AccountPage = () => {
  const navigate = useNavigate();
  const session = readSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const forced = session && session.mustChangePassword;
  const valid = current && isStrongAdminPassword(next) && next === confirm && next !== current;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // The change ends every token held before it, so the reply carries a new one.
      const result = await changeOwnPassword(current, next);
      writeSession(result);
      toast.success("Password changed");
      navigate(PORTAL_BASE, { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="ap-title">
        <div>
          <h1>{forced ? "Choose a new password" : "Your account"}</h1>
          <p>
            {forced
              ? "You must choose your own password before you can use the portal."
              : `Signed in as ${session.admin.userName}.`}
          </p>
        </div>
      </div>
      <div className="ap-card" style={{ maxWidth: 480 }}>
        <h2>Change password</h2>
        <ErrorAlert message={error} onClose={() => setError(null)} />
        <Form onSubmit={submit}>
          <FormGroup>
            <Label for="ap-current">Current password</Label>
            <Input
              id="ap-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="ap-new">New password</Label>
            <Input
              id="ap-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              invalid={next.length > 0 && !isStrongAdminPassword(next)}
            />
            <div className="ap-hint">{ADMIN_PASSWORD_HINT}</div>
          </FormGroup>
          <FormGroup>
            <Label for="ap-confirm">Confirm new password</Label>
            <Input
              id="ap-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              invalid={confirm.length > 0 && confirm !== next}
            />
          </FormGroup>
          <Button color="primary" disabled={!valid || busy}>
            {busy ? <Spinner size="sm" /> : "Change password"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AccountPage;
