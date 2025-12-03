"use client";

import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function BrandkitMint() {
  const { authenticated } = useAuthState();
  const auth = useAuth();

  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [minting, setMinting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [price, setPrice] = useState("0.001");
  const [duration, setDuration] = useState("1");
  const [royalty, setRoyalty] = useState("10");
  const [parentId, setParentId] = useState("");
  const previewRef = useRef<HTMLPreElement>(null);

  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  const isValidJSON = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  };

  const mintBrandkit = async () => {
    if ((!content && !pdfFile) || !name) {
      alert("Please provide a name and either upload a file or enter JSON content.");
      return;
    }

    // Validate pricing parameters
    const priceFloat = parseFloat(price);
    const durationDays = parseFloat(duration);
    const royaltyPercent = parseFloat(royalty);

    if (isNaN(priceFloat) || priceFloat < 0.001) {
      alert("Price must be at least 0.001 CAMP");
      return;
    }

    if (isNaN(durationDays) || durationDays < 1) {
      alert("Duration must be at least 1 day");
      return;
    }

    if (isNaN(royaltyPercent) || royaltyPercent < 0 || royaltyPercent > 100) {
      alert("Royalty must be between 0% and 100%");
      return;
    }

    // Validate file type if file is uploaded
    if (pdfFile) {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
        'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg'
      ];

      if (!allowedTypes.includes(pdfFile.type)) {
        alert(`Unsupported file type: ${pdfFile.type}\n\nPlease upload an image, video, audio file, or PDF.`);
        return;
      }

      // Check file size (max 100MB for most files, 500MB for videos)
      const maxSize = pdfFile.type.startsWith('video/') ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
      if (pdfFile.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        alert(`File size exceeds the maximum allowed size of ${maxSizeMB}MB.\n\nYour file: ${(pdfFile.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
    }

    setMinting(true);
    try {
      let file: File;

      if (pdfFile) {
        // Use uploaded PDF file
        file = pdfFile;
      } else {
        // Create JSON file from content
        const jsonContent = JSON.stringify(
          { prompt: content, type: "Nanabanapro Brandkit" },
          null,
          2,
        );
        const blob = new Blob([jsonContent], { type: "application/json" });
        file = new File(
          [blob],
          `${name.replace(/\s+/g, "-").toLowerCase()}.json`,
          { type: "application/json" },
        );
      }

      // Calculate license terms from user input
      // Convert CAMP to wei (1 CAMP = 10^18 wei)
      const priceInWei = BigInt(Math.floor(priceFloat * 1e18));

      // Convert days to seconds
      const durationInSeconds = Math.floor(durationDays * 86400);

      // Convert percentage to basis points (1% = 100 basis points)
      const royaltyInBps = Math.floor(royaltyPercent * 100);

      const license = {
        price: priceInWei,
        duration: durationInSeconds,
        royaltyBps: royaltyInBps,
        paymentToken: "0x0000000000000000000000000000000000000000" as const,
      };

      // Determine file type for description
      const fileType = pdfFile
        ? pdfFile.type.startsWith('image/') ? 'Image'
        : pdfFile.type.startsWith('video/') ? 'Video'
        : pdfFile.type.startsWith('audio/') ? 'Audio'
        : pdfFile.type === 'application/pdf' ? 'PDF'
        : 'File'
        : 'JSON Prompt';

      const metadata = {
        name: `Brandkit: ${name}`,
        description: `Nanabanapro Brandkit ${fileType}`,
        price: priceFloat,
        duration: durationDays,
        royalty: royaltyPercent,
      };

      if (!auth.origin) {
        throw new Error("Origin SDK not initialized");
      }

      // Use mintFile with optional parentId for derivative works
      // The SDK expects an array of parent IDs
      const parentIds = parentId ? [BigInt(parentId)] : undefined;

      const result = await auth.origin.mintFile(
        file,
        metadata,
        license,
        parentIds
      );

      console.log("Mint result:", result);
      alert(`Brandkit minted successfully! Token ID: ${result}\n\nPrice: ${priceFloat} CAMP\nDuration: ${durationDays} day(s)\nRoyalty: ${royaltyPercent}%`);

      // Reset form
      setContent("");
      setName("");
      setPdfFile(null);
      setShowPreview(false);
      setPrice("0.001");
      setDuration("1");
      setRoyalty("10");
      setParentId("");
    } catch (e) {
      console.error("Error minting brandkit:", e);

      // Provide more helpful error messages
      let errorMessage = "Failed to mint brandkit.";

      if (e instanceof Error) {
        if (e.message.includes("unauthorized") || e.message.includes("authorization")) {
          errorMessage = "Authorization failed. Please ensure:\n\n1. You are connected to the correct wallet\n2. Your wallet has sufficient funds\n3. The CAMP_CLIENT_ID environment variable is properly configured\n4. Try disconnecting and reconnecting your wallet";
        } else if (e.message.includes("network") || e.message.includes("connection")) {
          errorMessage = "Network error. Please check your internet connection and try again.";
        } else if (e.message.includes("rejected") || e.message.includes("denied")) {
          errorMessage = "Transaction was rejected. Please try again and confirm the transaction in your wallet.";
        } else if (e.message.includes("insufficient")) {
          errorMessage = "Insufficient funds. Please ensure your wallet has enough balance for gas fees.";
        } else {
          errorMessage = `Error: ${e.message}\n\nPlease check all parameters and try again.`;
        }
      }

      alert(errorMessage);
    } finally {
      setMinting(false);
    }
  };

  const exportToPDF = async () => {
    if (!name) {
      alert("Please enter a Brandkit name first.");
      return;
    }

    setExportingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Brandkit: ${name}`, margin, yPosition);
      yPosition += 10;

      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text("Nanabanapro Brandkit - JSON Prompt", margin, yPosition);
      yPosition += 15;

      // Pricing Information Box
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition, pdfWidth - 2 * margin, 30, "FD");

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("Licensing Terms:", margin + 5, yPosition + 7);

      pdf.setFont("helvetica", "normal");
      pdf.text(`Price: ${price} CAMP`, margin + 5, yPosition + 14);
      pdf.text(`Duration: ${duration} day(s)`, margin + 5, yPosition + 21);
      pdf.text(`Royalty: ${royalty}%`, margin + 5, yPosition + 28);

      yPosition += 40;

      // JSON Content
      if (content && isValidJSON(content)) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("JSON Content:", margin, yPosition);
        yPosition += 7;

        // Format JSON for better display
        const formattedJSON = formatJSON(content);
        const lines = formattedJSON.split('\n');

        pdf.setFont("courier", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);

        for (let i = 0; i < lines.length; i++) {
          if (yPosition > pdfHeight - margin - 10) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines[i], margin, yPosition);
          yPosition += 5;
        }
      }

      // If there's a preview element, capture it as image too
      if (previewRef.current && showPreview) {
        try {
          const canvas = await html2canvas(previewRef.current, {
            backgroundColor: '#fafafa',
            scale: 2,
          });

          const imgData = canvas.toDataURL('image/png');

          // Add new page for visual preview
          pdf.addPage();
          yPosition = margin;

          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text("Visual Preview:", margin, yPosition);
          yPosition += 10;

          const imgWidth = pdfWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        } catch (imgError) {
          console.warn("Could not add preview image:", imgError);
        }
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Generated by xcampBanana - Page ${i} of ${pageCount}`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save(`${name.replace(/\s+/g, "-").toLowerCase()}-brandkit.pdf`);
      alert("PDF exported successfully!");
    } catch (e) {
      console.error("Error exporting PDF:", e);
      alert(`Failed to export PDF: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setExportingPdf(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-2xl font-bold mb-4 text-zinc-900">
          Sell Nanabanapro Brandkit
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Brandkit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
              placeholder="e.g. Cyberpunk Theme"
              required
            />
          </div>

          {/* Pricing Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Price (CAMP) *
              </label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
                placeholder="0.001"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum: 0.001 CAMP</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Duration (days) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
                placeholder="1"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum: 1 day</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-black">
                Royalty (%) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={royalty}
                onChange={(e) => setRoyalty(e.target.value)}
                className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
                placeholder="10"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">Range: 0-100%</p>
            </div>
          </div>

          {/* Optional Parent ID for Derivative Works */}
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Parent Token ID (Optional)
            </label>
            <input
              type="text"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
              placeholder="e.g. 12345 (for derivative works)"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Leave empty for original work. Specify parent token ID if this is a derivative.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-zinc-900">
              Upload File (Optional) or Create JSON Content Below
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.mkv,.mp3,.wav,.m4a,.ogg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPdfFile(file);
                  setContent(""); // Clear JSON content when file is uploaded
                }
              }}
              className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Supported formats: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, AVI, MKV), Audio (MP3, WAV, M4A, OGG), PDF
            </p>
            {pdfFile && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-zinc-600">File: {pdfFile.name}</span>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove File
                </button>
              </div>
            )}
          </div>
          
          {!pdfFile && (
            <div>
              <label className="block text-sm font-medium mb-1 text-zinc-900">
                JSON Prompt Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded-md h-32 bg-white border-zinc-300 font-mono text-sm text-black"
                placeholder='{"style": "cyberpunk", "colors": ["#ff00ff", "#00ffff"]}'
              />
              {content && !isValidJSON(content) && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ Invalid JSON format
                </p>
              )}
            </div>
          )}

          {content && isValidJSON(content) && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-zinc-900">
                  Preview (Formatted)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={exportToPDF}
                    disabled={exportingPdf || !name}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-2"
                  >
                    {exportingPdf ? "⏳ Exporting..." : "📄 Download PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 font-medium transition-colors text-sm"
                  >
                    {showPreview ? "👁️ Hide" : "👁️ Show"} Preview
                  </button>
                </div>
              </div>
              {showPreview && (
                <pre
                  ref={previewRef}
                  className="w-full p-4 border rounded-md bg-zinc-50 border-zinc-300 font-mono text-sm overflow-x-auto max-h-64 overflow-y-auto"
                >
                  <code className="text-zinc-800">{formatJSON(content)}</code>
                </pre>
              )}
            </div>
          )}

          {/* Export PDF Section - Always visible when content exists */}
          {content && isValidJSON(content) && !showPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Ready to Export
                  </h4>
                  <p className="text-xs text-blue-700">
                    Download your Brandkit as a formatted PDF with all licensing details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportToPDF}
                  disabled={exportingPdf || !name}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  {exportingPdf ? "⏳ Generating..." : "📄 Download PDF"}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={mintBrandkit}
            disabled={minting || (!content && !pdfFile) || !name || (content !== "" && !isValidJSON(content))}
            className="w-full py-3 bg-linear-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {minting ? "Minting..." : `Mint Brandkit ${pdfFile ? `(${pdfFile.name.split('.').pop()?.toUpperCase()})` : "(JSON)"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
