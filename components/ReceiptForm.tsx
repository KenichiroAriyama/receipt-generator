import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  onGenerateURL: () => void;
}

export function ReceiptForm({ data, onChange, onGenerateURL }: ReceiptFormProps) {
  const handleChange = (field: keyof ReceiptData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>領収書情報入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="株式会社ランディット"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingLotName">駐車場名</Label>
            <Input
              id="parkingLotName"
              value={data.parkingLotName}
              onChange={(e) => handleChange("parkingLotName", e.target.value)}
              placeholder="綾瀬第2駐車場"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">電話番号</Label>
            <Input
              id="phoneNumber"
              value={data.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="0120511441"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="registrationNumber">登録番号</Label>
            <Input
              id="registrationNumber"
              value={data.registrationNumber}
              onChange={(e) => handleChange("registrationNumber", e.target.value)}
              placeholder="T9011001025282"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingFee">駐車料金（円）</Label>
            <Input
              id="parkingFee"
              type="number"
              value={data.parkingFee}
              onChange={(e) => handleChange("parkingFee", parseInt(e.target.value) || 0)}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">割引料金（円）</Label>
            <Input
              id="discount"
              type="number"
              value={data.discount}
              onChange={(e) => handleChange("discount", parseInt(e.target.value) || 0)}
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptDate">領収書発行日</Label>
            <Input
              id="receiptDate"
              type="date"
              value={data.receiptDate}
              onChange={(e) => handleChange("receiptDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="managementNumber">管理番号</Label>
            <Input
              id="managementNumber"
              value={data.managementNumber}
              onChange={(e) => handleChange("managementNumber", e.target.value)}
              placeholder="20240403001"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onGenerateURL} className="w-full">
            PDFダウンロードURLを生成
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>合計金額: ¥{(data.parkingFee - data.discount).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
