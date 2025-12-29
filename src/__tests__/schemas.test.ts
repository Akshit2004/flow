import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskSchema } from '@/lib/schemas';

describe('Validation Schemas', () => {
    describe('createTaskSchema', () => {
        it('should validate valid form data', () => {
            const formData = new FormData();
            formData.append('title', 'New Task');
            formData.append('projectId', '123');
            formData.append('priority', 'HIGH');

            const result = createTaskSchema.safeParse(formData);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).toBe('New Task');
                expect(result.data.priority).toBe('HIGH');
                expect(result.data.status).toBe('TODO'); // Default
            }
        });

        it('should fail when title is missing', () => {
            const formData = new FormData();
            formData.append('projectId', '123');

            // Zod-form-data safeParse behavior
            const safeResult = createTaskSchema.safeParse(formData);
            expect(safeResult.success).toBe(false);
        });
    });

    describe('updateTaskSchema', () => {
        it('should validate partial updates', () => {
            const data = {
                title: 'Updated Title',
                status: 'DONE',
            };
            const result = updateTaskSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid enum values', () => {
            const data = {
                priority: 'SUPER_HIGH', // Invalid
            };
            const result = updateTaskSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
