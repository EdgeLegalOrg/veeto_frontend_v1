import React, { useCallback, useEffect, useState } from 'react';
import { Col, Dropdown, DropdownMenu, DropdownToggle, Row } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

//SimpleBar
import SimpleBar from "simplebar-react";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

import { updateFormStatusAction } from "slices/layouts/reducer";
import {
    dismissNotification,
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "pages/Edge/apis";
import { formatDateFunc } from "pages/Edge/utils/utilFunc";

// The bell polls rather than holding a socket open; alerts are raised by a
// once-a-day job, so this only needs to be timely, not instant.
const POLL_INTERVAL_MS = 5 * 60 * 1000;

/**
 * The request interceptor logs the user out when it sees an expired token. A
 * background poll must not be what trips that, or an idle user gets bounced the
 * moment their session lapses instead of on their next interaction - so the
 * bell checks the token itself and simply goes quiet.
 */
const hasLiveSession = () => {
    try {
        const token = Cookies.get("userJWT");

        return !!token && jwtDecode(token).exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
};

const NotificationDropdown = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { formStatus } = useSelector((state) => state.Layout);

    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async () => {
        if (!hasLiveSession()) {
            return;
        }

        try {
            const { data } = await fetchNotifications();

            if (data.success) {
                setNotifications(data.data?.notificationList || []);
                setUnreadCount(data.data?.unreadCount || 0);
            }
        } catch (error) {
            // The bell is ambient - a failure here should never surface a toast.
            console.error("error", error);
        }
    }, []);

    useEffect(() => {
        loadNotifications();

        const timer = setInterval(loadNotifications, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [loadNotifications]);

    const toggleNotificationDropdown = () => {
        if (formStatus.isFormChanged) {
            return dispatch(
                updateFormStatusAction({
                    key: "isShowModal",
                    value: true,
                    callback: () => setIsNotificationDropdown(!isNotificationDropdown),
                })
            );
        }

        // Refresh as it opens so the list is current when the user looks at it.
        if (!isNotificationDropdown) {
            loadNotifications();
        }

        setIsNotificationDropdown(!isNotificationDropdown);
    };

    const handleMarkRead = async (notification) => {
        if (notification.isRead) {
            return;
        }

        try {
            const { data } = await markNotificationRead(notification.id);

            if (data.success) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    /**
     * Deep link onto the matter, opening the tab the alert's date relates to.
     * Real href so it can be copied or opened in a new tab; MatterList reads
     * these params on load.
     */
    const matterHref = (notification) =>
        `/Matters?matterId=${notification.matterId}&tab=${notification.matterTab || "BASIC"}`;

    const handleMatterClick = (e, notification) => {
        e.preventDefault();
        e.stopPropagation();

        // Following the link counts as reading it.
        handleMarkRead(notification);
        setIsNotificationDropdown(false);

        navigate(matterHref(notification));
    };

    /**
     * The body is server-rendered HTML, so its matter anchor is not a React
     * element and cannot carry its own handler. Catch the click on the way up
     * and route it, rather than letting the browser do a full page load.
     */
    const handleBodyClick = (e, notification) => {
        const anchor = e.target.closest("a[href]");

        if (!anchor) {
            return;
        }

        const href = anchor.getAttribute("href");

        // Only intercept in-app links; anything absolute is left alone.
        if (!href || !href.startsWith("/")) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        handleMarkRead(notification);
        setIsNotificationDropdown(false);

        navigate(href);
    };

    const handleDismiss = async (e, notification) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const { data } = await dismissNotification(notification.id);

            if (data.success) {
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

                if (!notification.isRead) {
                    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const { data } = await markAllNotificationsRead();

            if (data.success) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    return (
        <React.Fragment>
            <Dropdown isOpen={isNotificationDropdown} toggle={toggleNotificationDropdown} className="topbar-head-dropdown ms-1 header-item">
                <DropdownToggle type="button" tag="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                    <i className='bx bx-bell fs-22'></i>
                    {unreadCount > 0 && (
                        <span
                            className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger text-white">
                            {unreadCount}
                            <span className="visually-hidden">unread notifications</span>
                        </span>
                    )}
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
                    <div className="dropdown-head bg-primary bg-pattern rounded-top">
                        <div className="p-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h6 className="m-0 fs-16 fw-semibold text-white"> Notifications </h6>
                                </Col>
                                <div className="col-auto dropdown-tabs">
                                    {/*
                                      bg-light-subtle is near white and the header sets
                                      white text, so the count has to state its own
                                      colour or it disappears in light mode.
                                    */}
                                    <span
                                        className={`badge bg-light-subtle fs-13 ${unreadCount > 0 ? "text-danger" : "text-dark"}`}
                                    >
                                        {unreadCount} New
                                    </span>
                                </div>
                            </Row>
                        </div>
                    </div>

                    <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                        {notifications.length === 0 && (
                            <div className="text-center p-4">
                                <div className="avatar-md mx-auto mb-3">
                                    <div className="avatar-title bg-info-subtle text-info fs-24 rounded-circle">
                                        <i className="bx bx-bell"></i>
                                    </div>
                                </div>
                                <h6 className="fs-15 mb-1">No notifications</h6>
                                <p className="mb-0 fs-13 text-muted">
                                    You are all caught up.
                                </p>
                            </div>
                        )}

                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`text-reset notification-item d-block dropdown-item position-relative ${notification.isRead ? "" : "unread-message"}`}
                                onClick={() => handleMarkRead(notification)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="d-flex">
                                    <div className="avatar-xs me-3 flex-shrink-0">
                                        <span className="avatar-title bg-info-subtle text-info rounded-circle fs-16">
                                            <i className="bx bx-calendar-event"></i>
                                        </span>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="mt-0 mb-1 fs-13 fw-semibold">
                                            {notification.title}
                                        </h6>
                                        {/*
                                          The body is HTML built server side, where every
                                          literal and every substituted value is escaped
                                          and the only markup emitted is the matter
                                          anchor. Clicks on those anchors are caught
                                          below rather than followed, so the router
                                          handles them and the alert is marked read.
                                        */}
                                        <div
                                            className="fs-13 text-muted notification-body"
                                            onClick={(e) => handleBodyClick(e, notification)}
                                            dangerouslySetInnerHTML={{ __html: notification.body || "" }}
                                        />
                                        {/* The matter link lives in the body text above. */}
                                        <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                            {notification.targetDate && (
                                                <span>
                                                    <i className="mdi mdi-clock-outline"></i>{" "}
                                                    {formatDateFunc(notification.targetDate)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="d-flex align-items-start flex-shrink-0">
                                        {!notification.isRead && (
                                            <span className="badge bg-danger-subtle text-danger me-2">New</span>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-ghost-secondary p-0 px-1 lh-1"
                                            title="Dismiss this notification"
                                            aria-label="Dismiss this notification"
                                            onClick={(e) => handleDismiss(e, notification)}
                                        >
                                            <i className="ri-close-line fs-16"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </SimpleBar>

                    {notifications.length > 0 && unreadCount > 0 && (
                        <div className="p-2 border-top border-top-dashed text-center">
                            <button
                                type="button"
                                className="btn btn-sm btn-link text-decoration-none"
                                onClick={handleMarkAllRead}
                            >
                                Mark all as read
                            </button>
                        </div>
                    )}
                </DropdownMenu>
            </Dropdown>
        </React.Fragment>
    );
};

export default NotificationDropdown;
