import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface ParkingProfile {
  id: string;
  name: string;
  companyName: string;
  parkingLotName: string;
  phoneNumber: string;
  registrationNumber: string;
}

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

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
  onGenerateURL: () => void;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c9aa4dc3`;

export function ReceiptForm({ data, onChange, onGenerateURL }: ReceiptFormProps) {
  const [profiles, setProfiles] = useState<ParkingProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/profiles`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        setProfiles(responseData.profiles || []);
      }
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ReceiptData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      onChange({
        ...data,
        companyName: profile.companyName,
        parkingLotName: profile.parkingLotName,
        phoneNumber: profile.phoneNumber,
        registrationNumber: profile.registrationNumber,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>領収書情報入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Selection */}
        {profiles.length > 0 && (
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg border">
            <Label htmlFor="profile-select" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              登録済みプロファイルを選択
            </Label>
            <select
              id="profile-select"
              value={selectedProfileId}
              onChange={(e) => handleSelectProfile(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">プロファイルを選択してください</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} - {profile.parkingLotName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="ランディット株式会社"
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="recipientName">宛名</Label>
            <Input
              id="recipientName"
              value={data.recipientName}
              onChange={(e) => handleChange("recipientName", e.target.value)}
              placeholder="山田太郎 様"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parkingFee">駐車料金（円）</Label>
            <Input
              id="parkingFee"
              type="number"
              value={data.parkingFee || ""}
              onChange={(e) => handleChange("parkingFee", parseInt(e.target.value) || 0)}
              placeholder="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">割引料金（円）</Label>
            <Input
              id="discount"
              type="number"
              value={data.discount || ""}
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
            共有URLを生成
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>合計金額: ¥{(data.parkingFee - data.discount).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
