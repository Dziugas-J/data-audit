IMAGE_FORMATS = {"jpg", "jpeg", "png", "gif", "bmp", "tiff"}
VIDEO_FORMATS = {"mp4", "avi", "mov", "mkv", "webm"}

LICENSES = {
    "non_commercial": ["non-commercial", "noncommercial", "by-nc", "nc-sa", "nc-nd"],
    "share_alike": ["by-sa", "gpl", "share-alike", "sharealike"],
    "attribution": ["mit", "apache", "bsd", "cc by", "cc-by"],
    "public_domain": ["cc0", "public domain", "unlicense"],
}

def classify_files(file_names):
    extensions = set()
    for name in file_names:
        if "." in name:
            extension = name.rsplit(".", 1)[-1].lower()
            extensions.add(extension)

    if extensions & VIDEO_FORMATS:
        return "Videos"
    if extensions & IMAGE_FORMATS:
        return "Images"
    if extensions:
        return "Structured data"
    return "Other"

def classify_license(license_name):
    if not license_name:
        return "unknown"
    name = license_name.lower()
    for class_name, keywords in LICENSES.items():
        if any(keyword in name for keyword in keywords):
            return class_name
    return "unknown"
