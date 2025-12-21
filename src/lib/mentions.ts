/**
 * @mentions utility functions
 */

// Regex to detect @mentions (alphanumeric + underscores)
export const MENTION_REGEX = /@(\w+)/g;

/**
 * Parse text to extract mentioned usernames
 */
export function parseMentions(text: string): string[] {
    const matches = text.matchAll(MENTION_REGEX);
    const mentions = new Set<string>();
    for (const match of matches) {
        mentions.add(match[1].toLowerCase());
    }
    return Array.from(mentions);
}

/**
 * Find users matching a partial username for autocomplete
 */
export function filterUsersForMention(
    users: { _id: string; name: string }[],
    query: string
): { _id: string; name: string }[] {
    const lowerQuery = query.toLowerCase();
    return users.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.name.toLowerCase().replace(/\s+/g, '').includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 suggestions
}

/**
 * Replace @username with a styled span in JSX
 * Returns an array of strings and JSX elements
 */
export function renderMentions(
    text: string,
    users: { _id: string; name: string }[]
): (string | { type: 'mention'; name: string; userId?: string })[] {
    const parts: (string | { type: 'mention'; name: string; userId?: string })[] = [];
    let lastIndex = 0;

    const matches = text.matchAll(MENTION_REGEX);

    for (const match of matches) {
        // Add text before the match
        if (match.index !== undefined && match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Find the user
        const mentionedName = match[1];
        const user = users.find(u =>
            u.name.toLowerCase().replace(/\s+/g, '') === mentionedName.toLowerCase()
        );

        parts.push({
            type: 'mention',
            name: mentionedName,
            userId: user?._id
        });

        lastIndex = match.index !== undefined ? match.index + match[0].length : lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
