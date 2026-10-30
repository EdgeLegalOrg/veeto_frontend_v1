import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";

import { PORTAL_BASE, readSession, signIn, writeSession } from "./adminPortalApi";
import { ErrorAlert } from "./shared";

const AdminPortalLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (readSession()) {
    return <Navigate to={PORTAL_BASE} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await signIn(username.trim(), password);
      writeSession(result);
      navigate(result.mustChangePassword ? `${PORTAL_BASE}/account` : PORTAL_BASE, { replace: true });
    } catch (e) {
      setError(e.message);
      setPassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ap-login">
      <div className="ap-login-card">
        <h1>System Admin Portal</h1>
        <p>For platform administrators only. This is separate from the Veeto application sign-in.</p>
        <ErrorAlert message={error} />
        <Form onSubmit={submit}>
          <FormGroup>
            <Label for="ap-username">Username</Label>
            <Input
              id="ap-username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="ap-password">Password</Label>
            <Input
              id="ap-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
          <Button color="primary" block disabled={busy || !username || !password}>
            {busy ? <Spinner size="sm" /> : "Sign in"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default AdminPortalLogin;
