import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Input,
} from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import LoadingPage from "../../utils/LoadingPage";
import { globalSearch } from "../../apis";
import {
  pushSearchHistory,
  resultHref,
  SECTION_ICON,
} from "../../../../Components/Common/globalSearch";

// Deeper than the header dropdown, which is the point of this page.
const PAGE_LIMIT = 50;

const MIN_TERM_LENGTH = 2;

const SearchResults = () => {
  document.title = "Search | Veeto";

  const location = useLocation();
  const navigate = useNavigate();

  // The URL is the source of truth, so a result page can be linked or reloaded.
  const urlTerm = new URLSearchParams(location.search).get("q") || "";

  const [term, setTerm] = useState(urlTerm);
  const [sections, setSections] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (value) => {
    const trimmed = (value || "").trim();

    if (trimmed.length < MIN_TERM_LENGTH) {
      setSections([]);
      setTotalResults(0);
      setSearched(false);
      return;
    }

    setLoading(true);

    try {
      const { data } = await globalSearch(trimmed, PAGE_LIMIT);

      if (data.success) {
        setSections(data.data?.sections || []);
        setTotalResults(data.data?.totalResults || 0);
      }
    } catch (error) {
      console.error("error", error);
      setSections([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  // Driven by the URL rather than by the input, so back and forward work.
  useEffect(() => {
    setTerm(urlTerm);
    runSearch(urlTerm);

    if (urlTerm.trim().length >= MIN_TERM_LENGTH) {
      pushSearchHistory(urlTerm);
    }
  }, [urlTerm, runSearch]);

  const submit = (e) => {
    e.preventDefault();

    if (term.trim().length >= MIN_TERM_LENGTH) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleResultClick = (e, result) => {
    e.preventDefault();
    navigate(resultHref(result, term));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Search Results" pageTitle="Search" />

        <Card>
          <CardHeader>
            <form
              className="d-flex align-items-center gap-2"
              onSubmit={submit}
            >
              <Input
                type="text"
                placeholder="Search matters, contacts, property..."
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
              <Button color="primary" type="submit">
                Search
              </Button>
            </form>
          </CardHeader>
          <CardBody>
            {searched && (
              <p className="text-muted fs-13">
                {totalResults === 0
                  ? `Nothing matched "${term.trim()}".`
                  : `${totalResults} result${totalResults === 1 ? "" : "s"} for "${term.trim()}"`}
              </p>
            )}

            {!searched && !loading && (
              <p className="text-muted fs-13 mb-0">
                Type at least {MIN_TERM_LENGTH} characters and press Search.
              </p>
            )}

            {sections.map((section) => (
              <div className="mb-4" key={`section-${section.section}`}>
                <h5 className="fs-15 mb-3">
                  <i
                    className={`${SECTION_ICON[section.section] || "ri-search-line"} align-middle text-muted me-2`}
                  />
                  {section.label}
                  <span className="text-muted fw-normal fs-13">
                    {" "}
                    ({section.returnedCount}
                    {section.hasMore ? "+" : ""})
                  </span>
                </h5>

                <div className="list-group">
                  {section.results.map((result) => (
                    <a
                      href={resultHref(result, term)}
                      key={`${section.section}-${result.id}`}
                      className="list-group-item list-group-item-action"
                      onClick={(e) => handleResultClick(e, result)}
                    >
                      <span className="fw-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-muted fs-13 ms-2">
                          {result.subtitle}
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                {section.hasMore && (
                  <p className="text-muted fs-12 mt-2 mb-0">
                    Showing the first {PAGE_LIMIT}. Narrow the search to see
                    more.
                  </p>
                )}
              </div>
            ))}
          </CardBody>
        </Card>

        {loading && <LoadingPage />}
      </Container>
    </div>
  );
};

export default SearchResults;
