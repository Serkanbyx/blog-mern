/**
 * Escapes regex special characters to prevent ReDoS attacks
 * when building RegExp from user input.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
