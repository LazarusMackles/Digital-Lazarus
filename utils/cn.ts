/**
 * A utility function to conditionally join class names together.
 * This is a lightweight alternative to libraries like clsx.
 *
 * @param inputs - A list of class values. Can be strings, numbers, booleans,
 * objects with boolean values, or arrays of other class values.
 * @returns A single string of space-separated class names.
 */
type ClassValue = string | number | null | boolean | undefined | { [key: string]: boolean | null | undefined };

export function cn(...inputs: ClassValue[]): string {
    const classList: string[] = [];

    for (const input of inputs) {
        if (!input) continue;

        if (typeof input === 'string' || typeof input === 'number') {
            classList.push(String(input));
        } else if (typeof input === 'object') {
            if (Array.isArray(input)) {
                // Recursively call for arrays
                const nestedClass = cn(...input);
                if (nestedClass) {
                    classList.push(nestedClass);
                }
            } else {
                // Handle objects
                for (const key in input) {
                    if (Object.prototype.hasOwnProperty.call(input, key) && input[key]) {
                        classList.push(key);
                    }
                }
            }
        }
    }

    return classList.join(' ');
}
