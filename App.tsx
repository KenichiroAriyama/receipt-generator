import { useState, useRef, useEffect } from "react";
import { ReceiptForm } from "./components/ReceiptForm";
import { ReceiptTemplate } from "./components/ReceiptTemplate";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download, Link2 } from "lucide-react";

interface ReceiptData {
  companyName: string;
  parkingLotName: string;
  phoneNumber: string;
  registrationNumber: string;
  parkingFee: number;
  discount: number;
  receiptDate: string;
  managementNumber: string;
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

// Encode receipt data to URL parameter
function encodeReceiptData(data: ReceiptData): string {
  const json = JSON.stringify(data);
  return btoa(encodeURIComponent(json));
}

// Decode receipt data from URL parameter
function decodeReceiptData(encoded: string): ReceiptData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
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
    companyName: "株式会社ランディット",
    parkingLotName: "綾瀬第2駐車場",
    phoneNumber: "0120511441",
    registrationNumber: "T9011001025282",
    parkingFee: 1000,
    discount: 100,
    receiptDate: "2024-04-03",
    managementNumber: "20240403001",
  });

  // Check URL parameters on mount and auto-download PDF
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const receiptParam = urlParams.get("receipt");
    
    if (receiptParam && !autoDownloadTriggered) {
      const decodedData = decodeReceiptData(receiptParam);
      if (decodedData) {
        setReceiptData(decodedData);
        setAutoDownloadTriggered(true);
        
        // Wait for fonts to load before generating PDF
        document.fonts.ready.then(() => {
          // Additional delay to ensure component is fully rendered
          setTimeout(() => {
            downloadPDF(decodedData);
          }, 1000);
        }).catch((error) => {
          console.error("Font loading failed:", error);
          // Try to generate PDF anyway after a longer delay
          setTimeout(() => {
            downloadPDF(decodedData);
          }, 2000);
        });
      }
    }
  }, [autoDownloadTriggered]);

  // Generate PDF and download
  const downloadPDF = async (data: ReceiptData) => {
    if (!receiptRef.current) {
      console.error("Receipt element not found");
      return;
    }

    try {
      // Wait a bit more to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: receiptRef.current.scrollWidth,
        windowHeight: receiptRef.current.scrollHeight,
      });

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
                      このURLを開くと自動的にPDFがダウンロードされます
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
                      このURLを開くと自動的にPDFがダウンロードされます
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
