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
                            className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
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
                                    <span className="badge bg-light-subtle fs-13"> {unreadCount} New</span>
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
                                        {notification.body && (
                                            <div className="fs-13 text-muted">
                                                <p className="mb-1">{notification.body}</p>
                                            </div>
                                        )}
                                        <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                            {notification.matterReference && (
                                                <span className="me-2">
                                                    <i className="mdi mdi-folder-outline"></i>{" "}
                                                    <a
                                                        href={matterHref(notification)}
                                                        onClick={(e) => handleMatterClick(e, notification)}
                                                    >
                                                        {notification.matterReference}
                                                    </a>
                                                </span>
                                            )}
                                            {notification.targetDate && (
                                                <span>
                                                    <i className="mdi mdi-clock-outline"></i>{" "}
                                                    {formatDateFunc(notification.targetDate)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="px-2 fs-15">
                                            <span className="badge bg-danger-subtle text-danger">New</span>
                                        </div>
                                    )}
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
