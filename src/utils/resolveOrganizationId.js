/** Normalize organizationId from API/user rows (string, ObjectId-like, or populated doc). */
export function resolveOrganizationId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value._id) return String(value._id);
    if (typeof value.toString === 'function' && value.toString() !== '[object Object]') {
      return value.toString();
    }
  }
  return String(value);
}

export default resolveOrganizationId;
