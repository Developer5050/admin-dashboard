// TODO: Replace all Supabase client calls with Node.js backend API calls

import { Notification } from "./types";

export async function fetchNotifications({
  staffId,
}: {
  staffId: string;
}): Promise<Notification[]> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?staffId=${staffId}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Failed to fetch notifications');
  // return await response.json();

  return [];
}

export async function deleteNotification({
  notificationId,
}: {
  notificationId: string;
}) {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`,
  //   {
  //     method: 'DELETE',
  //     credentials: 'include',
  //   }
  // );
  // if (!response.ok) throw new Error('Could not dismiss the notification.');

  return;
}

export async function fetchNotificationsCount({
  staffId,
}: {
  staffId: string;
}): Promise<number> {
  // TODO: Replace with Node.js backend API call
  // Example:
  // const response = await fetch(
  //   `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/count?staffId=${staffId}`,
  //   { credentials: 'include' }
  // );
  // if (!response.ok) throw new Error('Could not fetch notification count.');
  // const data = await response.json();
  // return data.count;

  return 0;
}
