import Dexie from 'dexie';
import type { Module, Item, Attempt, ReviewData, Bookmark } from '../types/schemas';

export class OffGridDB extends Dexie {
  modules!: Dexie.Table<Module>;
  items!: Dexie.Table<Item>;
  attempts!: Dexie.Table<Attempt>;
  reviewData!: Dexie.Table<ReviewData>;
  bookmarks!: Dexie.Table<Bookmark>;
  constructor() {
    super('OffGridEnglishDB');

    // Version 1: Original schema
    this.version(1).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp'
    });

    // Version 2: Added learning content fields to modules
    this.version(2).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp'
    }).upgrade(async tx => {
      // Clear old modules and force reload with new schema
      await tx.table('modules').clear();
      await tx.table('items').clear();
    });

    // Version 3: Force complete reload of all 7 modules
    this.version(3).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp'
    }).upgrade(async tx => {
      // Clear everything to force fresh load
      await tx.table('modules').clear();
      await tx.table('items').clear();
    });

    // Version 4: Updated item schema to support optional fields (type, subTopic, correction)
    this.version(4).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp'
    }).upgrade(async tx => {
      // Clear and reload with updated schema
      await tx.table('modules').clear();
      await tx.table('items').clear();
    });

    // Version 5: Made commonErrors.subTopic optional
    this.version(5).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp'
    }).upgrade(async tx => {
      // Clear and reload with updated schema
      await tx.table('modules').clear();
      await tx.table('items').clear();
    });

    // Version 6: Added reviewData table for spaced repetition
    this.version(6).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp',
      reviewData: 'itemId, nextReviewAt, lastReviewedAt'
    });

    // Version 7: Added bookmarks table
    this.version(7).stores({
      modules: 'id, category, module_version',
      items: 'id, moduleId, formType, transferType, item_version',
      attempts: 'id, itemId, moduleId, formType, transferType, timestamp',
      reviewData: 'itemId, nextReviewAt, lastReviewedAt',
      bookmarks: 'itemId, moduleId, bookmarkedAt'
    });
  }
}

export const db = new OffGridDB();

export async function resetDatabase() {
  await Promise.all([db.modules.clear(), db.items.clear(), db.attempts.clear(), db.reviewData.clear(), db.bookmarks.clear()]);
}

export async function hardResetApp() {
  await indexedDB.deleteDatabase('OffGridEnglishDB');
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }
  location.reload();
}
