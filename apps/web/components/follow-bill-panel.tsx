// apps/web/components/follow-bill-panel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

import {
  followBill,
  getMyFollows,
  unfollowBill,
  type AuthUser,
} from "../lib/api-client";
import { AuthPanel, getStoredToken } from "./auth-panel";

type FollowBillPanelProps = {
  billId: string;
};

export function FollowBillPanel({ billId }: FollowBillPanelProps) {
  const [token, setToken] = useState<string | null>(null);
  const [_user, setUser] = useState<AuthUser | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshFollowState = useCallback(async (activeToken: string) => {
    setIsCheckingFollow(true);

    try {
      const follows = await getMyFollows(activeToken);
      setIsFollowing(follows.some((follow) => follow.billId === billId));
    } finally {
      setIsCheckingFollow(false);
    }
  }, [billId]);

  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      return;
    }

    setToken(storedToken);
    void refreshFollowState(storedToken);
  }, [refreshFollowState]);

const handleAuthChange = useCallback(
  async (nextToken: string | null, nextUser: AuthUser | null) => {
    setToken(nextToken);
    setUser(nextUser);

    if (nextToken) {
      await refreshFollowState(nextToken);
    } else {
      setIsFollowing(false);
    }
  },
  [refreshFollowState]
);

  async function handleToggleFollow() {
    if (!token) {
      setMessage("Log in before following this bill.");
      return;
    }

    setMessage(null);
    setIsSaving(true);

    try {
      if (isFollowing) {
        await unfollowBill(billId, token);
        setIsFollowing(false);
        setMessage("Bill removed from your followed list.");
      } else {
        await followBill(billId, token);
        setIsFollowing(true);
        setMessage("Bill added to your followed list.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update follow status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="follow-stack">
      <AuthPanel onAuthChange={handleAuthChange} />

      <section className="card follow-panel">
        <div>
          <p className="eyebrow">Bill alerts</p>
          <h3>{isFollowing ? "Following this bill" : "Follow this bill"}</h3>
          <p className="muted">
            Followed bills will appear in your saved list and can be used for notifications later.
          </p>
        </div>

        <button
          className={isFollowing ? "button button--ghost" : "button"}
          type="button"
          onClick={handleToggleFollow}
          disabled={isSaving || isCheckingFollow}
        >
          {isFollowing ? <BellOff size={16} /> : <Bell size={16} />}
          {isSaving
            ? "Saving..."
            : isCheckingFollow
              ? "Checking..."
              : isFollowing
                ? "Unfollow"
                : "Follow"}
        </button>

        {message ? <p className="muted">{message}</p> : null}
      </section>
    </div>
  );
}