import { useState, useRef } from "react";
import { ReceiptForm } from "./components/ReceiptForm";
import { ReceiptTemplate } from "./components/ReceiptTemplate";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

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

export default function App() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");

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

  const handleGenerateURL = async () => {
    if (!receiptRef.current) return;

    setIsGenerating(true);
    setActiveTab("preview");

    // Wait for tab change to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
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
      
      // Create Blob and URL
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (downloadUrl) {
      navigator.clipboard.writeText(downloadUrl);
      alert("URLをコピーしました");
    }
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
            <div className="flex justify-center">
              <ReceiptForm
                data={receiptData}
                onChange={setReceiptData}
                onGenerateURL={handleGenerateURL}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleGenerateURL}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? "URL生成中..." : "PDFダウンロードURLを生成"}
                </Button>

                {downloadUrl && (
                  <div className="w-full max-w-2xl space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={downloadUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button onClick={handleCopyUrl} variant="outline">
                        コピー
                      </Button>
                      <Button
                        onClick={() => window.open(downloadUrl, "_blank")}
                        variant="outline"
                      >
                        開く
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      URLを開くとPDFがダウンロードされます
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <div className="bg-white max-w-4xl">
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
