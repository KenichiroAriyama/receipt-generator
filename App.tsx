import { useState, useRef, useEffect } from "react";
import { ReceiptForm } from "./components/ReceiptForm";
import { ReceiptTemplate } from "./components/ReceiptTemplate";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Link2 } from "lucide-react";
import pako from "pako";

interface ReceiptData {
  companyName: string;
  parkingLotName: string;
  phoneNumber: string;
  registrationNumber: string;
  parkingFee: number;
  discount: number;
  receiptDate: string;
  managementNumber: string;
  recipientName: string;
}

// Helper function to format date value to Japanese format
function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

// Encode receipt data to URL parameter with compression
function encodeReceiptData(data: ReceiptData): string {
  try {
    // Create compact array format (omit empty/zero values)
    const compact = [
      data.companyName || "",
      data.parkingLotName || "",
      data.phoneNumber || "",
      data.registrationNumber || "",
      data.parkingFee || 0,
      data.discount || 0,
      data.receiptDate || "",
      data.managementNumber || "",
      data.recipientName || "",
    ];
    
    const json = JSON.stringify(compact);
    
    // Compress using pako
    const compressed = pako.deflate(json);
    
    // Convert to base64
    const binary = String.fromCharCode.apply(null, Array.from(compressed));
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, ""); // URL-safe base64
  } catch (error) {
    console.error("Failed to encode receipt data:", error);
    throw error;
  }
}

// Decode receipt data from URL parameter
function decodeReceiptData(encoded: string): ReceiptData | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    
    // Decode base64
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // Decompress
    const decompressed = pako.inflate(bytes, { to: "string" });
    const compact = JSON.parse(decompressed);
    
    // Reconstruct full object
    return {
      companyName: compact[0] || "",
      parkingLotName: compact[1] || "",
      phoneNumber: compact[2] || "",
      registrationNumber: compact[3] || "",
      parkingFee: compact[4] || 0,
      discount: compact[5] || 0,
      receiptDate: compact[6] || "",
      managementNumber: compact[7] || "",
      recipientName: compact[8] || "",
    };
  } catch (error) {
    console.error("Failed to decode receipt data:", error);
    return null;
  }
}

export default function App() {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Check if URL has receipt parameter and set initial tab accordingly
  const urlParams = new URLSearchParams(window.location.search);
  const hasReceiptParam = urlParams.get("receipt") !== null;
  
  const [activeTab, setActiveTab] = useState<string>(hasReceiptParam ? "preview" : "form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<string>("");
  const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);

  const [receiptData, setReceiptData] = useState<ReceiptData>({
    companyName: "",
    parkingLotName: "",
    phoneNumber: "",
    registrationNumber: "",
    parkingFee: 0,
    discount: 0,
    receiptDate: "",
    managementNumber: "",
    recipientName: "",
  });

  // Check URL parameters on mount and load receipt data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const receiptParam = urlParams.get("receipt");
    
    if (receiptParam) {
      const decodedData = decodeReceiptData(receiptParam);
      if (decodedData) {
        setReceiptData(decodedData);
      }
    }
  }, []);

  // Generate PDF and download
  const downloadPDF = async (data: ReceiptData) => {
    if (!receiptRef.current) {
      console.error("Receipt element not found");
      return;
    }

    try {
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Additional delay to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Generating PDF from element:", receiptRef.current);
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
      });

      console.log("Canvas created:", canvas.width, "x", canvas.height);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      
      // Download PDF
      const fileName = `領収書_${data.managementNumber || 'receipt'}.pdf`;
      pdf.save(fileName);
      
      console.log("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF生成に失敗しました。もう一度お試しください。");
    }
  };

  const handleGenerateURL = () => {
    setIsGenerating(true);
    
    try {
      // Generate shareable URL with encoded data
      const encoded = encodeReceiptData(receiptData);
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?receipt=${encoded}`;
      setShareableUrl(url);
      
      // Switch to preview tab to show the URL
      setActiveTab("preview");
    } catch (error) {
      console.error("URL generation failed:", error);
      alert("URL生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (shareableUrl) {
      navigator.clipboard.writeText(shareableUrl);
      alert("URLをコピーしました");
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    await downloadPDF(receiptData);
    setIsGenerating(false);
  };

  // Format data for display
  const formattedData = {
    ...receiptData,
    receiptDate: formatDate(receiptData.receiptDate),
  };

  // Check if this is a download-only page (has receipt parameter in URL)
  const isDownloadPage = hasReceiptParam;

  // If this is a download page, show only the download button
  if (isDownloadPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-[2.5rem] font-[var(--font-weight-medium)]">領収書</h1>
            <p className="text-muted-foreground">
              下記のボタンをクリックして領収書をダウンロードしてください
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>管理番号: {receiptData.managementNumber}</p>
              <p>駐車場: {receiptData.parkingLotName}</p>
              <p>合計金額: ¥{(receiptData.parkingFee - receiptData.discount).toLocaleString()}</p>
            </div>

            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="lg"
              className="w-full gap-2"
            >
              <Download className="w-5 h-5" />
              {isGenerating ? "PDFを生成中..." : "領収書をダウンロード"}
            </Button>
          </div>

          {/* Hidden receipt template for PDF generation */}
          <div className="fixed left-[-9999px] top-0 bg-white">
            <div ref={receiptRef} style={{ width: '794px' }}>
              <ReceiptTemplate data={formattedData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal app interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-[2.5rem] font-[var(--font-weight-medium)]">領収書PDFジェネレーター</h1>
          <p className="text-muted-foreground">
            駐車場領収書の情報を入力してPDFを生成できます
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="form">入力フォーム</TabsTrigger>
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-center">
                <ReceiptForm
                  data={receiptData}
                  onChange={setReceiptData}
                  onGenerateURL={handleGenerateURL}
                />
              </div>

              {shareableUrl && (
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl space-y-3 bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Link2 className="w-4 h-4" />
                      <span>共有用URL</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={shareableUrl}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button onClick={handleCopyUrl} variant="outline">
                        コピー
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      このURLを開くとダウンロードボタンが表示されます
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateURL}
                    disabled={isGenerating}
                    size="lg"
                    className="gap-2"
                  >
                    <Link2 className="w-4 h-4" />
                    {isGenerating ? "URL生成中..." : "共有URLを生成"}
                  </Button>
                  
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {isGenerating ? "生成中..." : "PDFダウンロード"}
                  </Button>
                </div>

                {shareableUrl && (
                  <div className="w-full max-w-2xl space-y-3 bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Link2 className="w-4 h-4" />
                      <span>共有用URL</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={shareableUrl}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button onClick={handleCopyUrl} variant="outline">
                        コピー
                      </Button>
                      <Button
                        onClick={() => window.open(shareableUrl, "_blank")}
                        variant="outline"
                      >
                        開く
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      このURLを開くとダウンロードボタンが表示されます
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="bg-white max-w-4xl shadow-lg">
                  <div ref={receiptRef}>
                    <ReceiptTemplate data={formattedData} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
