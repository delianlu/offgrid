import Dexie from 'dexie';
import type { Module, Item, Attempt, ReviewData, Bookmark, MistakeJournalEntry, Flag, UserProfile, Classroom } from '../types/schemas';

export class OffGridDB extends Dexie {
  modules!: Dexie.Table<Module>;
  items!: Dexie.Table<Item>;
  attempts!: Dexie.Table<Attempt>;
  reviewData!: Dexie.Table<ReviewData>;
  bookmarks!: Dexie.Table<Bookmark>;
  mistakes!: Dexie.Table<MistakeJournalEntry>;
  flags!: Dexie.Table<Flag>;
  users!: Dexie.Table<UserProfile>;
  classrooms!: Dexie.Table<Classroom>;
  constructor() {
    super('OffGridEnglishDB');

    // ... (previous versions)

    // Consolidated Schema (Version 1)
    this.version(1).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      userProgress: 'id, userId, itemId, status',
      userState: 'userId',
      achievements: 'id',
      reviewData: 'itemId, userId, nextReviewAt, lastReviewedAt',
      bookmarks: 'itemId, userId, moduleId, bookmarkedAt',
      mistakes: 'id, userId, itemId, moduleId, timestamp, resolved, lastSeenAt',
      flags: 'id, userId, itemId, moduleId, status, timestamp',
      users: 'id, name, role',
      classrooms: 'id, teacherId, code',
      attempts: 'id, userId, moduleId, formType, itemId'
    });

    // Version 2: Add compound index for mistakes table
    this.version(2).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      userProgress: 'id, userId, itemId, status',
      userState: 'userId',
      achievements: 'id',
      reviewData: 'itemId, userId, nextReviewAt, lastReviewedAt',
      bookmarks: 'itemId, userId, moduleId, bookmarkedAt',
      mistakes: 'id, userId, itemId, moduleId, [itemId+studentAnswer], timestamp, resolved, lastSeenAt',
      flags: 'id, userId, itemId, moduleId, status, timestamp',
      users: 'id, name, role',
      classrooms: 'id, teacherId, code',
      attempts: 'id, userId, moduleId, formType, itemId'
    });
  }
}

export const db = new OffGridDB();

export async function resetDatabase() {
  await Promise.all([db.modules.clear(), db.items.clear(), db.attempts.clear(), db.reviewData.clear(), db.bookmarks.clear(), db.mistakes.clear()]);
}

export async function hardResetApp() {
  await indexedDB.deleteDatabase('OffGridEnglishDB');
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  location.reload();
}
