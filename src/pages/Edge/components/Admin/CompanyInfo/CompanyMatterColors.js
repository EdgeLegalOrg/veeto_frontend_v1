import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Row, Col, Input, Badge } from "reactstrap";
import { toast } from "react-toastify";
import { getCompanyMatterColors, updateCompanyMatterColors } from "../../../apis";

function CompanyMatterColors() {
  const [typesWithSubtypes, setTypesWithSubtypes] = useState([]);
  const [colorMap, setColorMap] = useState({});
  const [initialColorMap, setInitialColorMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSubtypesAndColors();
  }, []);

  const loadSubtypesAndColors = async () => {
    setLoading(true);
    try {
      // 1. Load sub-types from localStorage
      const typeListStr = window.localStorage.getItem("matterTypeList");
      let typeList = [];
      if (typeListStr) {
        try {
          typeList = JSON.parse(typeListStr);
        } catch (e) {
          console.error("Error parsing matterTypeList from localStorage", e);
        }
      }
      setTypesWithSubtypes(Array.isArray(typeList) ? typeList : []);

      // 2. Load configured colors from backend
      const res = await getCompanyMatterColors();
      if (res?.data?.success && Array.isArray(res?.data?.data)) {
        const map = {};
        res.data.data.forEach((item) => {
          if (item.matterSubType && item.colorCode) {
            map[item.matterSubType] = item.colorCode;
          }
        });
        setColorMap(map);
        setInitialColorMap(map);
      }
    } catch (err) {
      console.error("Failed to load matter sub-type colors:", err);
      toast.error("Failed to load matter sub-type color configurations.");
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (subTypeValue, color) => {
    setColorMap((prev) => ({
      ...prev,
      [subTypeValue]: color,
    }));
  };

  const handleClearColor = (subTypeValue) => {
    setColorMap((prev) => {
      const updated = { ...prev };
      delete updated[subTypeValue];
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allSubtypes = [];
      typesWithSubtypes.forEach((t) => {
        if (Array.isArray(t.subType)) {
          t.subType.forEach((st) => {
            if (st.value && !allSubtypes.includes(st.value)) {
              allSubtypes.push(st.value);
            }
          });
        }
      });

      const payload = allSubtypes.map((stValue) => ({
        matterSubType: stValue,
        colorCode: colorMap[stValue] || "",
      }));

      const res = await updateCompanyMatterColors(payload);
      if (res?.data?.success) {
        toast.success("Matter sub-type colors updated successfully!");
        setInitialColorMap({ ...colorMap });
      } else {
        toast.error(res?.data?.error?.message || "Failed to save colors.");
      }
    } catch (err) {
      console.error("Error saving matter sub-type colors:", err);
      toast.error("Error saving colors. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredTypes = typesWithSubtypes
    .map((typeGroup) => {
      const filteredSubs = (typeGroup.subType || []).filter(
        (st) =>
          !searchQuery ||
          (st.display && st.display.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (st.value && st.value.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return { ...typeGroup, filteredSubs };
    })
    .filter((tg) => tg.filteredSubs.length > 0);

  const hasChanges = JSON.stringify(colorMap) !== JSON.stringify(initialColorMap);

  return (
    <Card className="mt-4 border shadow-sm">
      <CardHeader className="bg-light d-flex justify-content-between align-items-center py-3">
        <div>
          <h5 className="mb-0 text-primary font-weight-bold">Matter Sub-Type Color Coding</h5>
          <small className="text-muted">
            Configure custom highlight colors for matter sub-types across all matters.
          </small>
        </div>
        <div className="d-flex align-items-center">
          <Input
            type="text"
            placeholder="Search sub-type..."
            className="form-control-sm me-3"
            style={{ width: "200px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            color="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || loading || !hasChanges}
            className="px-3"
          >
            {saving ? "Saving..." : "Save Colors"}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-3">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading color configurations...</div>
        ) : filteredTypes.length === 0 ? (
          <div className="text-center py-4 text-muted">No matter sub-types found.</div>
        ) : (
          <div>
            {filteredTypes.map((typeGroup, gIdx) => (
              <div key={gIdx} className="mb-4">
                <h6 className="text-dark font-weight-bold border-bottom pb-2 mb-3">
                  {typeGroup.display || typeGroup.type}
                </h6>
                <Row className="g-3">
                  {typeGroup.filteredSubs.map((st, idx) => {
                    const currentColor = colorMap[st.value];
                    return (
                      <Col key={idx} md={6} lg={4} className="mb-2">
                        <div
                          className="p-3 rounded d-flex align-items-center justify-content-between shadow-sm"
                          style={{
                            backgroundColor: currentColor ? `${currentColor}22` : "#ffffff",
                            border: currentColor ? `1px solid ${currentColor}66` : "1px solid #e9ebec",
                            borderLeft: currentColor ? `5px solid ${currentColor}` : "5px solid transparent",
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <div className="me-2 text-truncate" style={{ flex: 1 }}>
                            <div className="d-flex align-items-center">
                              {currentColor && (
                                <span
                                  className="me-2 flex-shrink-0"
                                  style={{
                                    display: "inline-block",
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "50%",
                                    backgroundColor: currentColor,
                                  }}
                                />
                              )}
                              <span
                                className="text-dark d-block text-truncate"
                                title={st.display}
                                style={{ fontWeight: 600 }}
                              >
                                {st.display}
                              </span>
                            </div>
                            <small
                              className="text-muted d-block font-monospace"
                              style={{ fontSize: "11px", marginTop: "2px" }}
                            >
                              {st.value}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <div
                              className="position-relative me-2 d-flex align-items-center justify-content-center"
                              style={{
                                border: "1px solid #ced4da",
                                padding: "2px",
                                borderRadius: "6px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              }}
                            >
                              <input
                                type="color"
                                value={currentColor || "#ffffff"}
                                onChange={(e) => handleColorChange(st.value, e.target.value)}
                                className="form-control form-control-color border-0 p-0"
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  display: "block",
                                }}
                                title="Pick custom color"
                              />
                            </div>
                            {currentColor ? (
                              <Button
                                color="light"
                                size="sm"
                                className="btn-sm p-1 text-danger border"
                                style={{
                                  fontSize: "14px",
                                  width: "28px",
                                  height: "28px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => handleClearColor(st.value)}
                                title="Reset to default"
                              >
                                &times;
                              </Button>
                            ) : (
                              <Badge color="light" className="text-muted border py-1 px-2" style={{ fontWeight: 500 }}>
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default CompanyMatterColors;
