import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from "reactstrap";

/**
 * Loads data when the page opens and again on reload(). Keeps the last result
 * on screen while reloading so a table does not blank on every change.
 */
export const useLoad = (loader, deps = []) => {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await loader();
      if (alive.current) setState({ data, error: null, loading: false });
    } catch (e) {
      if (alive.current) setState((s) => ({ data: s.data, error: e.message, loading: false }));
    }
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
};

export const Loading = () => (
  <div className="ap-loading">
    <Spinner size="sm" /> <span>Loading…</span>
  </div>
);

export const ErrorAlert = ({ message, onClose }) =>
  message ? (
    <Alert color="danger" toggle={onClose} className="ap-alert">
      {message}
    </Alert>
  ) : null;

export const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
};

/**
 * Shows a temporary password exactly once. The server never returns it again,
 * so the dialog says so and does not close on a backdrop click.
 */
export const SecretModal = ({ title, intro, secret, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!secret) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <Modal isOpen centered backdrop="static" keyboard={false}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p>{intro}</p>
        <div className="ap-secret">
          <code>{secret}</code>
          <Button size="sm" color="light" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <Alert color="warning" className="mt-3 mb-0">
          This is shown once and cannot be retrieved again. Give it to the person through a channel you trust. They will
          be asked to choose a new password the first time they sign in.
        </Alert>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onClose}>
          I have copied it
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export const ConfirmModal = ({ isOpen, title, children, confirmLabel = "Confirm", danger, busy, onConfirm, onCancel }) => (
  <Modal isOpen={isOpen} centered toggle={busy ? undefined : onCancel}>
    <ModalHeader toggle={busy ? undefined : onCancel}>{title}</ModalHeader>
    <ModalBody>{children}</ModalBody>
    <ModalFooter>
      <Button color="light" onClick={onCancel} disabled={busy}>
        Cancel
      </Button>
      <Button color={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
        {busy ? <Spinner size="sm" /> : confirmLabel}
      </Button>
    </ModalFooter>
  </Modal>
);

export const StatusBadge = ({ ok, okText = "Active", badText = "Locked" }) => (
  <span className={`ap-badge ${ok ? "ap-badge-ok" : "ap-badge-bad"}`}>{ok ? okText : badText}</span>
);

/** The password rule for a system admin, shown wherever one is chosen. */
export const ADMIN_PASSWORD_HINT =
  "At least 12 characters, with upper and lower case letters, a number and a symbol.";

export const isStrongAdminPassword = (p) =>
  typeof p === "string" && p.length >= 12 && p.length <= 64 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9\s]/.test(p) && !/\s/.test(p);
