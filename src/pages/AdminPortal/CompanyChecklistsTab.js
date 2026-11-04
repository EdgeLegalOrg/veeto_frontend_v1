import React, { useState } from "react";

import ChecklistGroupsPane from "./ChecklistGroupsPane";
import ChecklistLinksPane from "./ChecklistLinksPane";
import ChecklistTasksPane from "./ChecklistTasksPane";
import ChecklistTemplatesPane from "./ChecklistTemplatesPane";

const PANES = [
  { key: "templates", label: "Check lists", Pane: ChecklistTemplatesPane },
  { key: "tasks", label: "Tasks", Pane: ChecklistTasksPane },
  { key: "groups", label: "Task groups", Pane: ChecklistGroupsPane },
  { key: "links", label: "Link to matter", Pane: ChecklistLinksPane },
];

/** A company's checklists, in the four parts the company's own Admin menu has them. */
const CompanyChecklistsTab = ({ companyId }) => {
  const [pane, setPane] = useState("templates");
  const { Pane } = PANES.find((p) => p.key === pane);

  return (
    <div className="ap-card">
      <h2>Checklists</h2>
      <p className="ap-hint">
        What a matter's Workflow tab is built from. Tasks make up a check list, groups arrange them, and a matter type
        is linked to the check list it starts with.
      </p>
      <div className="ap-tabs">
        {PANES.map((p) => (
          <button key={p.key} type="button" className={pane === p.key ? "active" : ""} onClick={() => setPane(p.key)}>
            {p.label}
          </button>
        ))}
      </div>
      <Pane companyId={companyId} />
    </div>
  );
};

export default CompanyChecklistsTab;
