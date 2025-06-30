use std::fs;
use std::path::PathBuf;
use tempfile::NamedTempFile;

/// Normalize content by trimming whitespace, replacing single quotes with double quotes,
/// and optionally normalizing line endings
pub fn normalize_content(content: &str, normalize_line_endings: bool) -> String {
    let mut normalized = content.trim().replace("'", "\"");

    if normalize_line_endings {
        normalized = normalized.replace("\r\n", "\n").replace("\r", "\n");
    }

    normalized
}

/// Create a temporary file with normalized content
pub fn create_temp_file_with_content(content: &str, normalize_line_endings: bool) -> NamedTempFile {
    let normalized_content = normalize_content(content, normalize_line_endings);
    let temp_file = NamedTempFile::new().unwrap();
    fs::write(&temp_file, normalized_content).unwrap();
    temp_file
}

/// Safely close and delete a temporary file
pub fn cleanup_temp_file(temp_file: NamedTempFile) -> Result<(), std::io::Error> {
    temp_file.close()
}

/// Read file content and create a temporary file with normalized content
pub fn read_and_create_temp_file(
    file_path: &PathBuf,
    normalize_line_endings: bool,
) -> NamedTempFile {
    let content = fs::read_to_string(file_path).unwrap();
    let normalized_content = normalize_content(&content, normalize_line_endings);
    create_temp_file_with_content(&normalized_content, normalize_line_endings)
}
