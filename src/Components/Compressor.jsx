import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faDownload,
  faUpload,
  faHistory,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { compress } from "image-conversion";
import "./Compressor.css";
import logo from "../assets/image.png";
function CompressorComp() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalLink, setOriginalLink] = useState("");
  const [compressedLink, setCompressedLink] = useState("");
  const [outputFileName, setOutputFileName] = useState("");
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressionPercent, setCompressionPercent] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (originalImage) {
      setCompressedLink("");
      setCompressedSize(0);
    }
  }, [originalImage]);

  const uploadImageHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOriginalImage(file);
    setOriginalLink(URL.createObjectURL(file));
    setOriginalSize(file.size);
    setOutputFileName(
      file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg"
    );
  };

  const compressImage = async () => {
    if (!originalImage) return alert("Upload image first");

    try {
      setLoading(true);

      const compressed = await compress(originalImage, {
        quality: compressionQuality,
        width: 800,
        height: 800,
      });

      const link = URL.createObjectURL(compressed);

      setCompressedLink(link);
      setCompressedSize(compressed.size);

      const percentSaved =
        ((originalSize - compressed.size) / originalSize) * 100;

      setCompressionPercent(percentSaved.toFixed(1));

      setHistory((prev) => [
        {
          name: outputFileName,
          link,
          saved: percentSaved.toFixed(1),
        },
        ...prev,
      ]);
    } catch (err) {
      alert("Compression failed");
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setOriginalImage(null);
    setOriginalLink("");
    setCompressedLink("");
    setOriginalSize(0);
    setCompressedSize(0);
  };

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="header">
        <h2>
     <img src={logo} alt="ImgCrush Logo" className="logo" /> ImgCrush
        </h2>
        <FontAwesomeIcon
          icon={faHistory}
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
        />
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* LEFT - UPLOAD */}
        <div className="card glass">
          <h4>Upload Image</h4>
          {originalLink ? (
            <img src={originalLink} alt="Original" />
          ) : (
            <div className="upload-placeholder">
              <FontAwesomeIcon icon={faUpload} size="3x" />
              <p>Select Image</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={uploadImageHandler} />
        </div>

        {/* CENTER - CONTROLS */}
        <div className="card glass">
          <h4>Compression Settings</h4>

          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={compressionQuality}
            onChange={(e) =>
              setCompressionQuality(parseFloat(e.target.value))
            }
          />

          <p>Original: {(originalSize / 1024).toFixed(2)} KB</p>
          <p>Compressed: {(compressedSize / 1024).toFixed(2)} KB</p>

          {compressionPercent > 0 && (
            <p className="saved-text">
              🎉 {compressionPercent}% size reduced
            </p>
          )}

          <div className="btn-group">
            <button onClick={compressImage} disabled={loading}>
              {loading ? "Compressing..." : "Compress"}
            </button>
            <button className="danger" onClick={resetApp}>
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT - OUTPUT */}
        <div className="card glass">
          <h4>Compressed Image</h4>

          {compressedLink && (
            <>
              <img
                src={compressedLink}
                alt="Compressed"
                onClick={() => setModalShow(true)}
              />

              <a href={compressedLink} download={outputFileName}>
                <FontAwesomeIcon icon={faDownload} /> Download
              </a>
            </>
          )}
        </div>
      </div>

      {/* HISTORY SIDEBAR */}
      <div className={`history-panel ${showHistory ? "show" : ""}`}>
        <h4>Compression History</h4>

        {history.length === 0 && <p>No history yet</p>}

        {history.map((item, index) => (
          <div key={index} className="history-item">
            <span>{item.name}</span>
            <small>{item.saved}% saved</small>
            <a href={item.link} download>
              <FontAwesomeIcon icon={faDownload} />
            </a>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal show={modalShow} onHide={() => setModalShow(false)} size="lg">
        <Modal.Body>
          <img src={compressedLink} alt="Preview" className="img-fluid" />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CompressorComp;