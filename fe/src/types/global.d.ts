import { ZodError } from 'zod-validation-error';

export {};

/**
 * Global types
 * **/
declare global {
    /**
     * The type supplied or **null**
     */
    type Nullable<T> = T | null;

    /**
     * The type of the given array's elements
     */
    type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

    /**
     * Data parsed from ZOD
     */

    type ParsedData = { success: true; data: T; } | { success: false; error: ZodError; };
}
