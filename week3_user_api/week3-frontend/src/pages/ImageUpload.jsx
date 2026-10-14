import { useState } from "react";
import axios from "axios";
import { API_URL } from "../api";

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setUploadedUrl("");
    setMessage("");

    if (preview) URL.revokeObjectURL(preview);

    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setPreview("");
      setMessage("Select a JPG, PNG, or WEBP image");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setPreview("");
      setMessage("Image must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        `${API_URL}/api/images`,
        formData
      );

      setUploadedUrl(response.data.imageUrl);
      setMessage("Image uploaded successfully!");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Image upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card upload-card">
      <div className="card-icon" aria-hidden="true">↥</div>
      <p className="eyebrow">YOUR LIBRARY</p>
      <h1>Image upload</h1>
      <p className="card-intro">Choose an image to preview it before uploading.</p>

      <form className="form-stack" onSubmit={handleUpload}>
        <label htmlFor="image-file">Choose an image</label>
        <input
          id="image-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />

        {preview && (
          <div>
            <h3>Preview</h3>
            <img
              className="image-preview"
              src={preview}
              alt="Selected image preview"
            />
          </div>
        )}

        <button className="submit-button" type="submit" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {message && <p className="form-message" role="status">{message}</p>}

      {uploadedUrl && (
        <div>
          <h3>Uploaded Image</h3>
          <img
            className="image-preview"
            src={uploadedUrl}
            alt="Uploaded"
          />
          <p>
            <a href={uploadedUrl} target="_blank" rel="noreferrer">
              Open uploaded image
            </a>
          </p>
        </div>
      )}
    </section>
  );
}