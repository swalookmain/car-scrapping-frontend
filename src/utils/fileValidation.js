import toast from 'react-hot-toast';

/** Maximum file size for uploads: 5 MB (matches backend limit) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Human-readable label for the max size */
export const MAX_FILE_SIZE_LABEL = '5 MB (Max Allowed)';

/**
 * Validate a single file's size.
 * Shows a toast error and returns false if the file exceeds the limit.
 * @param {File} file
 * @returns {boolean} true if valid
 */
export function validateFileSize(file) {
  if (!file) return true;
  if (file.size > MAX_FILE_SIZE) {
    toast.error(`"${file.name}" exceeds the 5 MB limit. Max 5 MB allowed.`);
    return false;
  }
  return true;
}

/**
 * Validate multiple files' sizes.
 * Shows toast for each invalid file. Returns false if any file is invalid.
 * @param {FileList|File[]} files
 * @returns {boolean}
 */
export function validateFilesSizes(files) {
  if (!files || files.length === 0) return true;
  let allValid = true;
  for (const file of files) {
    if (!validateFileSize(file)) allValid = false;
  }
  return allValid;
}
