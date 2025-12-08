import { describe, it, expect, vi } from 'vitest';
import { db, OffGridDB } from './database';

describe('OffGridDB', () => {
    it('should be an instance of OffGridDB', () => {
        expect(db).toBeInstanceOf(OffGridDB);
    });

    it('should have the correct database name', () => {
        expect(db.name).toBe('OffGridEnglishDB');
    });

    it('should have all required tables defined', () => {
        const tables = [
            'modules',
            'items',
            'attempts',
            'reviewData',
            'bookmarks',
            'mistakes',
            'flags',
            'users',
            'classrooms'
        ];

        tables.forEach(table => {
            expect(db).toHaveProperty(table);
        });
    });

    it('should define the correct schema version', () => {
        // Dexie versions are 1-indexed and cumulative.
        // We just check if the current version is at least 1.
        expect(db.verno).toBeGreaterThanOrEqual(1);
    });
});
