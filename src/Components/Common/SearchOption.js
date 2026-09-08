import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import SimpleBar from 'simplebar-react';

import { globalSearch } from 'pages/Edge/apis';
import {
    pushSearchHistory,
    readSearchHistory,
    resultHref,
    SECTION_ICON,
} from './globalSearch';

// Long enough that a keystroke does not fire a query, short enough to feel live.
const DEBOUNCE_MS = 300;

// Matches the server's own floor - below two characters a search matches most
// of the database.
const MIN_TERM_LENGTH = 2;

const DROPDOWN_LIMIT = 5;

const SearchOption = () => {
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [sections, setSections] = useState([]);
    const [totalResults, setTotalResults] = useState(0);
    const [history, setHistory] = useState(readSearchHistory());
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const timerRef = useRef(null);
    // Guards against a slow earlier request landing after a later one.
    const requestRef = useRef(0);

    const runSearch = useCallback(async (value) => {
        const trimmed = value.trim();

        if (trimmed.length < MIN_TERM_LENGTH) {
            setSections([]);
            setTotalResults(0);
            setSearching(false);
            return;
        }

        const requestId = ++requestRef.current;
        setSearching(true);

        try {
            const { data } = await globalSearch(trimmed, DROPDOWN_LIMIT);

            if (requestId !== requestRef.current) {
                return;
            }

            if (data.success) {
                setSections(data.data?.sections || []);
                setTotalResults(data.data?.totalResults || 0);
            }
        } catch (error) {
            if (requestId === requestRef.current) {
                setSections([]);
                setTotalResults(0);
            }
            console.error('error', error);
        } finally {
            if (requestId === requestRef.current) {
                setSearching(false);
            }
        }
    }, []);

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => runSearch(term), DEBOUNCE_MS);

        return () => clearTimeout(timerRef.current);
    }, [term, runSearch]);

    const go = (href, searched) => {
        // Only remember searches the user acted on, so the history reflects
        // intent rather than every keystroke that happened to be debounced.
        setHistory(pushSearchHistory(searched));
        setOpen(false);
        navigate(href);
    };

    const handleResultClick = (e, result) => {
        e.preventDefault();
        go(resultHref(result, term), term);
    };

    const handleViewAll = () => go(`/search?q=${encodeURIComponent(term.trim())}`, term);

    const handleHistoryClick = (entry) => {
        setTerm(entry);
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && term.trim().length >= MIN_TERM_LENGTH) {
            handleViewAll();
        }

        if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const showResults = term.trim().length >= MIN_TERM_LENGTH;

    return (
        <React.Fragment>
            <Dropdown
                isOpen={open}
                toggle={() => setOpen(!open)}
                className="topbar-head-dropdown ms-1 header-item app-search d-none d-md-block"
            >
                <DropdownToggle tag="div" className="position-relative">
                    <Input
                        type="text"
                        className="form-control"
                        placeholder="Search matters, contacts, property..."
                        value={term}
                        onChange={(e) => {
                            setTerm(e.target.value);
                            setOpen(true);
                        }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                    />
                    <span className="mdi mdi-magnify search-widget-icon"></span>
                    {term && (
                        <span
                            className="mdi mdi-close-circle search-widget-icon search-widget-icon-close"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setTerm('');
                                setSections([]);
                                setTotalResults(0);
                            }}
                        ></span>
                    )}
                </DropdownToggle>

                <DropdownMenu className="dropdown-menu-lg dropdown-menu-start p-0">
                    <SimpleBar style={{ maxHeight: '360px' }}>
                        {!showResults && (
                            <div className="p-3">
                                {history.length > 0 ? (
                                    <>
                                        <h6 className="text-overflow text-muted mb-2 text-uppercase fs-12">
                                            Recent Searches
                                        </h6>
                                        {history.map((entry) => (
                                            <button
                                                type="button"
                                                key={`history-${entry}`}
                                                className="btn btn-soft-secondary btn-sm btn-rounded me-1 mb-1"
                                                onClick={() => handleHistoryClick(entry)}
                                            >
                                                {entry}
                                                <i className="mdi mdi-magnify ms-1"></i>
                                            </button>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-muted mb-0 fs-13">
                                        Type at least {MIN_TERM_LENGTH} characters to search.
                                    </p>
                                )}
                            </div>
                        )}

                        {showResults && searching && sections.length === 0 && (
                            <div className="p-3 text-muted fs-13">Searching...</div>
                        )}

                        {showResults && !searching && totalResults === 0 && (
                            <div className="p-4 text-center">
                                <i className="mdi mdi-magnify-close d-block fs-24 text-muted"></i>
                                <h6 className="mt-2 fs-14">No results found</h6>
                                <p className="text-muted mb-0 fs-13">
                                    Nothing matched &quot;{term.trim()}&quot;.
                                </p>
                            </div>
                        )}

                        {showResults &&
                            sections.map((section) => (
                                <div key={`section-${section.section}`}>
                                    <div className="dropdown-header mt-2">
                                        <h6 className="text-overflow text-muted mb-1 text-uppercase fs-12">
                                            {section.label}
                                            <span className="text-muted fw-normal">
                                                {' '}
                                                ({section.returnedCount}
                                                {section.hasMore ? '+' : ''})
                                            </span>
                                        </h6>
                                    </div>
                                    {section.results.map((result) => (
                                        <a
                                            href={resultHref(result, term)}
                                            key={`${section.section}-${result.id}`}
                                            className="dropdown-item notify-item"
                                            onClick={(e) => handleResultClick(e, result)}
                                        >
                                            <i
                                                className={`${SECTION_ICON[section.section] || 'ri-search-line'} align-middle fs-16 text-muted me-2`}
                                            ></i>
                                            <span>{result.title}</span>
                                            {result.subtitle && (
                                                <span className="text-muted fs-12 ms-1">
                                                    &mdash; {result.subtitle}
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            ))}
                    </SimpleBar>

                    {showResults && totalResults > 0 && (
                        <div className="text-center pt-2 pb-2 border-top border-top-dashed">
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={handleViewAll}
                            >
                                View All Results
                                <i className="ri-arrow-right-line ms-1"></i>
                            </button>
                        </div>
                    )}
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default SearchOption;
