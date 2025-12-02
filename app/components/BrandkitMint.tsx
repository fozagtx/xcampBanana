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
    if (!content || !name) return;
    setMinting(true);
    try {
      const jsonContent = JSON.stringify(
        { prompt: content, type: "Nanabanapro Brandkit" },
        null,
        2,
      );
      const blob = new Blob([jsonContent], { type: "application/json" });
      const file = new File(
        [blob],
        `${name.replace(/\s+/g, "-").toLowerCase()}.json`,
        { type: "application/json" },
      );

      const license = {
        price: 1000000000000000n,
        duration: 0,
        royaltyBps: 1000,
        paymentToken: "0x0000000000000000000000000000000000000000" as const,
      };

      const metadata = {
        name: `Brandkit: ${name}`,
        description: "Nanabanapro Brandkit JSON Prompt",
      };

      if (!auth.origin) {
        throw new Error("Origin SDK not initialized");
      }

      const result = await auth.origin.mintFile(file, metadata, license);
      console.log("Mint result:", result);
      alert(`Brandkit minted successfully! Token ID: ${result}`);
      setContent("");
      setName("");
      setShowPreview(false);
    } catch (e) {
      console.error("Error minting brandkit:", e);
      alert("Failed to mint brandkit.");
    } finally {
      setMinting(false);
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current || !name) return;
    
    setExportingPdf(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#fafafa',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 200;
      const imgX = (pdfWidth - imgWidth * ratio / 200) / 2;
      const imgY = 10;
      
      pdf.setFontSize(16);
      pdf.text(`Brandkit: ${name}`, pdfWidth / 2, 20, { align: 'center' });
      
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY + 10,
        imgWidth * ratio / 200,
        imgHeight * ratio / 200
      );
      
      pdf.save(`${name.replace(/\s+/g, "-").toLowerCase()}-brandkit.pdf`);
    } catch (e) {
      console.error("Error exporting PDF:", e);
      alert("Failed to export PDF.");
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
            <label className="block text-sm font-medium mb-1 tex-black">
              Brandkit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-md bg-white border-zinc-300 text-black"
              placeholder="e.g. Cyberpunk Theme"
            />
          </div>
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
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingPdf ? "📄 Exporting..." : "📄 Export PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
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

          <button
            onClick={mintBrandkit}
            disabled={minting || !content || !name || !isValidJSON(content)}
            className="w-full py-3 bg-linear-to-r from-yellow-600 to-orange-600 text-white font-medium rounded-lg hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {minting ? "Minting..." : "Mint Brandkit"}
          </button>
        </div>
      </div>
    </div>
  );
}
