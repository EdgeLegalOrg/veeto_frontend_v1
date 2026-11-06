import React, { useEffect, useId, useState } from "react";
import Select from "react-select";
import moment from "moment-timezone";
import { fetchSiteTimezones } from "../../apis";

let choicesRequest;
const choices = () => {
  if (!choicesRequest)
    choicesRequest = fetchSiteTimezones()
      .then(({ data }) => {
        if (!data.success || !Array.isArray(data.data)) throw new Error("Timezone choices unavailable");
        return data.data.filter((name) => moment.tz.zone(name));
      })
      .catch((error) => {
        choicesRequest = null;
        throw error;
      });
  return choicesRequest;
};

/** Searchable named zones keep saved identifiers intact and share the server's supported timezone list. */
const TimezoneSelect = ({ value, onChange, disabled = false }) => {
  const inputId = useId();
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    setError(false);
    choices()
      .then((names) => {
        if (current) setZones(names);
      })
      .catch(() => {
        if (current) setError(true);
      });
    return () => {
      current = false;
    };
  }, [retry]);
  const selected = value || "Australia/Sydney";
  const label = (name) => `${name.replace(/_/g, " ")} ${moment.tz.zone(name) ? `(UTC${moment().tz(name).format("Z")})` : ""}`;
  const options = zones.map((name) => ({ value: name, label: label(name) }));
  return (
    <>
      <label className="form-label" htmlFor={inputId}>
        Timezone
      </label>
      <Select
        inputId={inputId}
        name="timeZone"
        isSearchable
        isDisabled={disabled || error}
        isLoading={!zones.length && !error}
        options={options}
        value={options.find((option) => option.value === selected) || { value: selected, label: label(selected) }}
        onChange={(option) => option && onChange({ target: { name: "timeZone", value: option.value } })}
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 10000 }) }}
      />
      <div className="small text-muted mt-1">Offsets shown are current. Daylight saving adjusts automatically.</div>
      {error && (
        <div className="text-danger small" role="status">
          Timezone choices could not be loaded.{" "}
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setRetry((n) => n + 1)}>
            Retry
          </button>
        </div>
      )}
    </>
  );
};
export default TimezoneSelect;
