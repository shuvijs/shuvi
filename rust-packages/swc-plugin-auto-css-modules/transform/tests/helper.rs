use std::fs;
use std::path::PathBuf;
use tempfile::NamedTempFile;

/// Normalize content by trimming whitespace, replacing single quotes with double quotes,
/// and optionally normalizing line endings
///
/// # Arguments
/// * `content` - The content to normalize
/// * `normalize_line_endings` - Whether to normalize line endings
///
/// # Returns
/// The normalized content as a String
pub fn normalize_content(content: &str, normalize_line_endings: bool) -> String {
    let mut normalized = content.trim().replace("'", "\"");

    if normalize_line_endings {
        normalized = normalized.replace("\r\n", "\n").replace("\r", "\n");
    }

    normalized
}

/// Create a temporary file with normalized content
///
/// # Arguments
/// * `content` - The content to write to the temporary file
/// * `normalize_line_endings` - Whether to normalize line endings
///
/// # Returns
/// A temporary file with the normalized content written to it
pub fn create_temp_file_with_content(content: &str, normalize_line_endings: bool) -> NamedTempFile {
    let normalized_content = normalize_content(content, normalize_line_endings);
    let temp_file = NamedTempFile::new().unwrap();
    fs::write(&temp_file, normalized_content).unwrap();
    temp_file
}

/// Safely close and delete a temporary file
///
/// # Arguments
/// * `temp_file` - The temporary file to close
///
/// # Returns
/// Result indicating success or failure of the operation
pub fn cleanup_temp_file(temp_file: NamedTempFile) -> Result<(), std::io::Error> {
    temp_file.close()
}

/// Read file content and create a temporary file with normalized content
///
/// # Arguments
/// * `file_path` - Path to the file to read
/// * `normalize_line_endings` - Whether to normalize line endings
///
/// # Returns
/// A temporary file with the normalized content
pub fn read_and_create_temp_file(
    file_path: &PathBuf,
    normalize_line_endings: bool,
) -> NamedTempFile {
    let content = fs::read_to_string(file_path).unwrap();
    let normalized_content = normalize_content(&content, normalize_line_endings);
    create_temp_file_with_content(&normalized_content, normalize_line_endings)
}
