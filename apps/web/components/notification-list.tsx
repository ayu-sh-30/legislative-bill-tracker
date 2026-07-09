"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ExternalLink, RefreshCw } from "lucide-react";

import {
  getMyNotifications,
  markNotificationRead,
  type NotificationRecord,
} from "../lib/api-client";
import { getStoredToken } from "./auth-panel";

function formatDate(value: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function NotificationList() {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  async function loadNotifications(activeToken: string, mode: "initial" | "refresh") {
    if (mode === "initial") {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const result = await getMyNotifications(activeToken);
      setNotifications(result);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load notifications."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const storedToken = getStoredToken();
    setToken(storedToken);

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    void loadNotifications(storedToken, "initial");
  }, []);

  async function handleRefresh() {
    if (!token) {
      return;
    }

    await loadNotifications(token, "refresh");
  }

  async function handleMarkRead(notificationId: string) {
    if (!token) {
      return;
    }

    setSavingId(notificationId);
    setError(null);

    try {
      const updatedNotification = await markNotificationRead(notificationId, token);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === updatedNotification.id
            ? {
                ...notification,
                readAt: updatedNotification.readAt,
                updatedAt: updatedNotification.updatedAt,
              }
            : notification
        )
      );
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Could not mark notification as read."
      );
    } finally {
      setSavingId(null);
    }
  }

  if (!token) {
    return (
      <section className="card notification-shell">
        <div>
          <p className="eyebrow">Notifications</p>
          <h2>Sign in required</h2>
          <p className="muted">
            Log in from the home page to view updates for bills you follow.
          </p>
        </div>

        <Link className="button" href="/">
          Go to login
        </Link>
      </section>
    );
  }

  return (
    <section className="notification-page">
      <div className="notification-header card">
        <div>
          <p className="eyebrow">Followed bill alerts</p>
          <h2>Notifications</h2>
          <p className="muted">
            Stage changes for bills you follow will appear here.
          </p>
        </div>

        <div className="notification-header__actions">
          <span className="status-pill">{unreadCount} unread</span>
          <button
            className="button button--ghost"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {isLoading ? (
        <div className="card loading-state">
          <div className="loading-spinner" />
          <div>
            <h2>Loading notifications</h2>
            <p className="muted">Checking followed bill updates.</p>
          </div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((notification) => {
            const isUnread = !notification.readAt;

            return (
              <article
                className={
                  isUnread
                    ? "card notification-card notification-card--unread"
                    : "card notification-card"
                }
                key={notification.id}
              >
                <div className="notification-card__icon">
                  <Bell size={18} aria-hidden="true" />
                </div>

                <div className="notification-card__body">
                  <div className="notification-card__topline">
                    <span className="status-pill">
                      {isUnread ? "Unread" : "Read"}
                    </span>
                    <span className="muted">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>

                  <div className="notification-card__meta">
                    <span>{notification.billStage.stage}</span>
                    {notification.billStage.house ? (
                      <span>{notification.billStage.house}</span>
                    ) : null}
                    <span>{formatDate(notification.billStage.stageDate)}</span>
                  </div>

                  <div className="notification-card__actions">
                    <Link
                      className="button button--ghost"
                      href={`/bills/${notification.billId}`}
                    >
                      <ExternalLink size={16} aria-hidden="true" />
                      Open bill
                    </Link>

                    {isUnread ? (
                      <button
                        className="button"
                        type="button"
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={savingId === notification.id}
                      >
                        <CheckCheck size={16} aria-hidden="true" />
                        {savingId === notification.id
                          ? "Saving..."
                          : "Mark as read"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state">
          <Bell size={26} aria-hidden="true" />
          <h2>No notifications yet</h2>
          <p className="muted">
            Follow a bill, then ingest a new stage for that bill to create an
            alert.
          </p>
        </div>
      )}
    </section>
  );
}