export const CATEGORY_KINDS = ['expense', 'income'] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export const CATEGORY_TYPES: ReadonlyArray<{ slug: CategoryKind; label: string; icon: string }> = [
    { slug: 'expense', label: 'Expense', icon: '💸' },
    { slug: 'income', label: 'Income', icon: '💵' },
];

export const CATEGORY_ICONS: ReadonlyArray<{ slug: string; label: string; icon: string }> = [
    { slug: 'food', label: 'Food', icon: '🍔' },
    { slug: 'coffee', label: 'Coffee', icon: '☕' },
    { slug: 'grocery', label: 'Grocery', icon: '🛒' },
    { slug: 'transport', label: 'Transport', icon: '🚗' },
    { slug: 'fuel', label: 'Fuel', icon: '⛽' },
    { slug: 'shopping', label: 'Shopping', icon: '🛍️' },
    { slug: 'clothes', label: 'Clothes', icon: '👕' },
    { slug: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { slug: 'game', label: 'Game', icon: '🎮' },
    { slug: 'travel', label: 'Travel', icon: '✈️' },
    { slug: 'health', label: 'Health', icon: '💊' },
    { slug: 'gym', label: 'Gym', icon: '🏋️' },
    { slug: 'bills', label: 'Bills', icon: '🏠' },
    { slug: 'electric', label: 'Electric', icon: '💡' },
    { slug: 'water', label: 'Water', icon: '🚰' },
    { slug: 'internet', label: 'Internet', icon: '🌐' },
    { slug: 'phone', label: 'Phone', icon: '📱' },
    { slug: 'education', label: 'Education', icon: '📚' },
    { slug: 'gift', label: 'Gift', icon: '🎁' },
    { slug: 'pet', label: 'Pet', icon: '🐶' },
    { slug: 'salary', label: 'Salary', icon: '💰' },
    { slug: 'freelance', label: 'Freelance', icon: '💻' },
    { slug: 'investment', label: 'Investment', icon: '📈' },
    { slug: 'saving', label: 'Saving', icon: '🏦' },
    { slug: 'other', label: 'Other', icon: '📦' },
];

export const YEAR_MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
