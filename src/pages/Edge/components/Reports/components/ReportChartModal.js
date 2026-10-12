import React, { useState, useEffect, useMemo } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Card, CardBody } from "reactstrap";
import ReactApexChart from "react-apexcharts";
import { getCompanyMatterColors } from "../../../apis";

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "$0.00";
  return (
    "$" +
    Number(val).toLocaleString("en-AU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const formatCompactCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "$0";
  const num = Number(val);
  if (Math.abs(num) >= 1000000) {
    return `$${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `$${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `$${Math.round(num)}`;
};

const formatCompactNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "0";
  const num = Number(val);
  if (Math.abs(num) >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(num) >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${Math.round(num)}`;
};

const shortenPracticeArea = (name) => {
  if (!name) return "";
  const upper = name.toUpperCase().trim();

  if (upper.includes("WILLS") && (upper.includes("ATTORNEY") || upper.includes("GUARDIAN"))) {
    return "Wills / POA";
  }
  if (upper.includes("COMPANIES") || upper.includes("PARTNERSHIP")) {
    return "Companies / Trusts";
  }
  if (upper.includes("INSOLVENCY") || upper.includes("LIQUIDATION")) {
    return "Insolvency";
  }
  if (upper.includes("LITIGATION GENERALLY") || upper === "LITIGATION GENERALLY") {
    return "Litigation";
  }
  if (upper.includes("BUSINESS") && (upper.includes("SALE") || upper.includes("PURCHASE"))) {
    return "Business Sale/Pur.";
  }
  if (upper.includes("REVENUE NSW")) {
    return "Revenue NSW";
  }
  if (upper.includes("CONVEYANCING STRATA")) {
    return "Conv. Strata";
  }
  if (upper.startsWith("CONVEYANCING ")) {
    return upper.replace("CONVEYANCING ", "Conv. ");
  }

  if (name.length > 15) {
    return name.slice(0, 14) + "…";
  }
  return name;
};

const DEFAULT_PALETTE = [
  "#405189", "#0ab39c", "#f7b84b", "#f06548", "#299cdb",
  "#6559cc", "#ffbe38", "#212529", "#3577f1", "#45cb85",
];

const resolveMatterColor = (label, colorMap, fallbackIndex = 0) => {
  if (!label || !colorMap) return DEFAULT_PALETTE[fallbackIndex % DEFAULT_PALETTE.length];

  const cleanLabel = String(label || "").trim();
  const normalized = cleanLabel.toUpperCase().replace(/[\s\-_,\/]+/g, "");

  // 1. Direct key match (e.g. SALE, PURCHASE, etc.)
  if (colorMap[cleanLabel]) return colorMap[cleanLabel];
  const underscoreKey = cleanLabel.toUpperCase().replace(/\s+/g, "_");
  if (colorMap[underscoreKey]) return colorMap[underscoreKey];

  // 2. Case-insensitive and normalized match against keys in colorMap
  for (const [k, color] of Object.entries(colorMap)) {
    if (!color) continue;
    const normK = k.toUpperCase().replace(/[\s\-_,\/]+/g, "");
    if (normK === normalized || normK.includes(normalized) || normalized.includes(normK)) {
      return color;
    }
  }

  return DEFAULT_PALETTE[fallbackIndex % DEFAULT_PALETTE.length];
};

const ReportChartModal = ({
  isOpen,
  toggle,
  title = "Visual Analytics",
  reportType = "MATTERS", // "MATTERS" | "FEES"
  siteBreakdowns = [], // [{ siteName, items: [{ type, value }] }]
  aggregatedTypes = {}, // { [type]: value }
  isMultiSite = false,
}) => {
  const isFees = reportType === "FEES";
  const [colorMap, setColorMap] = useState({});

  // Fetch matter colors directly from the API (no localStorage fetch)
  useEffect(() => {
    let isCurrent = true;

    const fetchColors = async () => {
      try {
        const res = await getCompanyMatterColors();
        if (isCurrent && res?.data?.success && Array.isArray(res?.data?.data)) {
          const map = {};
          res.data.data.forEach((item) => {
            if (item.matterSubType && item.colorCode) {
              map[item.matterSubType] = item.colorCode;
            }
          });
          setColorMap(map);
        }
      } catch (err) {
        console.error("Failed to load matter colors from API:", err);
      }
    };

    fetchColors();

    return () => {
      isCurrent = false;
    };
  }, []);

  const hasCustomColors = useMemo(() => {
    return Boolean(colorMap && Object.keys(colorMap).length > 0);
  }, [colorMap]);

  // 1. Donut Chart Data: Distribution across Practice Areas
  const donutData = useMemo(() => {
    const rawKeys = Object.keys(aggregatedTypes);
    const labels = rawKeys.map((k) => k.replace(/_/g, " "));
    const series = Object.values(aggregatedTypes).map((v) => Number(v) || 0);

    const total = series.reduce((acc, curr) => acc + curr, 0);

    const donutColors = hasCustomColors
      ? rawKeys.map((k, idx) => resolveMatterColor(k, colorMap, idx))
      : DEFAULT_PALETTE;

    const options = {
      chart: {
        type: "donut",
        toolbar: { show: true },
      },
      labels,
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
          return opts.w.globals.series[opts.seriesIndex] ? `${val.toFixed(1)}%` : "";
        },
      },
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
        style: {
          fontSize: "12px",
        },
        y: {
          formatter: (val) => (isFees ? formatCurrency(val) : `${val} matters`),
        },
      },
      colors: donutColors,
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              total: {
                show: true,
                label: isFees ? "Total Fees" : "Total Matters",
                formatter: () => (isFees ? formatCurrency(total) : `${total}`),
              },
            },
          },
        },
      },
    };

    return { options, series, total };
  }, [aggregatedTypes, isFees, colorMap, hasCustomColors]);

  // 2. Bar Chart Data: Site Comparison or Category Breakdown
  const barData = useMemo(() => {
    if (isMultiSite && siteBreakdowns.length > 0) {
      // Compare sites
      const siteNames = siteBreakdowns.map((s) => s.siteName || "Unknown");
      const siteTotals = siteBreakdowns.map((s) =>
        (s.items || []).reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
      );

      const options = {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "45%",
            borderRadius: 4,
            dataLabels: { position: "top" },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => (isFees ? formatCompactCurrency(val) : val),
          offsetY: -20,
          style: { fontSize: "11px", colors: ["#304758"] },
        },
        xaxis: {
          categories: siteNames,
        },
        yaxis: {
          tickAmount: 5,
          labels: {
            formatter: (val) => (isFees ? formatCompactCurrency(val) : formatCompactNumber(val)),
          },
        },
        colors: ["#405189"],
        tooltip: {
          y: {
            formatter: (val) => (isFees ? formatCurrency(val) : `${val} matters`),
          },
        },
      };

      const series = [
        {
          name: isFees ? "Fees Billed (Excl. GST)" : "Matters Opened",
          data: siteTotals,
        },
      ];

      return { options, series };
    } else {
      // Single site: horizontal bar chart of types
      const sortedEntries = Object.entries(aggregatedTypes)
        .map(([k, v]) => ({
          rawKey: k,
          label: k.replace(/_/g, " "),
          value: Number(v) || 0,
        }))
        .sort((a, b) => b.value - a.value);

      const categories = sortedEntries.map((e) => shortenPracticeArea(e.label));
      const values = sortedEntries.map((e) => e.value);

      const barColors = hasCustomColors
        ? sortedEntries.map((e, idx) => resolveMatterColor(e.rawKey, colorMap, idx))
        : ["#0ab39c"];

      const options = {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            distributed: hasCustomColors,
            borderRadius: 4,
            dataLabels: { position: "top" },
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => (isFees ? formatCurrency(val) : val),
          offsetX: 30,
          style: { fontSize: "11px", colors: ["#304758"] },
        },
        xaxis: {
          categories,
          tickAmount: 5,
          labels: {
            formatter: (val) => (isFees ? formatCompactCurrency(val) : formatCompactNumber(val)),
          },
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              fontSize: "11px",
              fontWeight: 500,
            },
            maxWidth: 130,
          },
        },
        grid: {
          padding: {
            left: 5,
            right: 45,
          },
        },
        colors: barColors,
        tooltip: {
          theme: "dark",
          fillSeriesColor: false,
          x: {
            formatter: (val, opts) => {
              const fullLabel = sortedEntries[opts.dataPointIndex]?.label;
              return fullLabel || val;
            },
          },
          y: {
            formatter: (val) => (isFees ? formatCurrency(val) : `${val} matters`),
          },
        },
      };

      const series = [
        {
          name: isFees ? "Fees (Excl. GST)" : "Matters Count",
          data: values,
        },
      ];

      return { options, series };
    }
  }, [isMultiSite, siteBreakdowns, aggregatedTypes, isFees, colorMap, hasCustomColors]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered>
      <ModalHeader
        toggle={toggle}
        className="bg-light p-3"
        style={{ backgroundColor: "#f3f6f9", color: "#212529" }}
      >
        <span className="fw-semibold text-dark fs-15 d-flex align-items-center">
          <i className="ri-pie-chart-2-fill text-primary me-2 fs-18"></i>
          {title}
        </span>
      </ModalHeader>
      <ModalBody className="p-4 bg-light">
        <Row className="g-3">
          {/* Donut Chart: Overall Practice Area Breakdown */}
          <Col lg={6} md={12}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <h5 className="card-title text-muted fs-14 text-uppercase mb-3">
                  Practice Area Distribution
                </h5>
                {donutData.series.length > 0 && donutData.total > 0 ? (
                  <ReactApexChart
                    options={donutData.options}
                    series={donutData.series}
                    type="donut"
                    height={340}
                  />
                ) : (
                  <div className="text-center py-5 text-muted">No data available for chart</div>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Bar Chart: Multi-Site Comparison or Ranked Breakdown */}
          <Col lg={6} md={12}>
            <Card className="h-100 border-0 shadow-sm">
              <CardBody>
                <h5 className="card-title text-muted fs-14 text-uppercase mb-3">
                  {isMultiSite ? "Office / Branch Comparison" : "Practice Area Volume"}
                </h5>
                {barData.series[0]?.data?.length > 0 ? (
                  <ReactApexChart
                    options={barData.options}
                    series={barData.series}
                    type="bar"
                    height={340}
                  />
                ) : (
                  <div className="text-center py-5 text-muted">No data available for chart</div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="bg-light p-3 border-top" style={{ backgroundColor: "#f3f6f9" }}>
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="text-muted fs-13">
            <span className="fw-semibold">Total: </span>
            {isFees ? formatCurrency(donutData.total) : `${donutData.total} matters`} across{" "}
            {Object.keys(aggregatedTypes).length} practice areas
          </div>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ReportChartModal;
