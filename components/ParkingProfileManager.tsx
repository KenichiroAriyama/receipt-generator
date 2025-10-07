import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export interface ParkingProfile {
  id: string;
  name: string;
  companyName: string;
  parkingLotName: string;
  phoneNumber: string;
  registrationNumber: string;
}

interface ParkingProfileManagerProps {
  onSelectProfile: (profile: ParkingProfile) => void;
}

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c9aa4dc3`;

export function ParkingProfileManager({ onSelectProfile }: ParkingProfileManagerProps) {
  const [profiles, setProfiles] = useState<ParkingProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newProfile, setNewProfile] = useState<Omit<ParkingProfile, "id">>({
    name: "",
    companyName: "",
    parkingLotName: "",
    phoneNumber: "",
    registrationNumber: "",
  });

  // Load profiles from Supabase on mount
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

      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }

      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (error) {
      console.error("Failed to load profiles:", error);
      alert("プロファイルの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      onSelectProfile(profile);
    }
  };

  const handleAddProfile = async () => {
    if (!newProfile.name || !newProfile.companyName || !newProfile.parkingLotName) {
      alert("プロファイル名、会社名、駐車場名は必須です");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${SERVER_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile");
      }

      // Reload profiles from server
      await loadProfiles();

      setNewProfile({
        name: "",
        companyName: "",
        parkingLotName: "",
        phoneNumber: "",
        registrationNumber: "",
      });
      setIsAddingNew(false);
    } catch (error) {
      console.error("Failed to add profile:", error);
      alert("プロファイルの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("このプロファイルを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/profiles/${profileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      // Reload profiles from server
      await loadProfiles();

      if (selectedProfileId === profileId) {
        setSelectedProfileId("");
      }
    } catch (error) {
      console.error("Failed to delete profile:", error);
      alert("プロファイルの削除に失敗しました");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>駐車場プロファイル管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">プロファイルを読み込み中...</span>
          </div>
        )}

        {/* Profile Selection */}
        {!isLoading && (
          <div className="space-y-2">
            <Label htmlFor="profile-select">登録済みプロファイルを選択</Label>
            <div className="flex gap-2">
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
              <Button
                onClick={() => setIsAddingNew(!isAddingNew)}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* New Profile Form */}
        {isAddingNew && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium">新しいプロファイルを追加</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-profile-name">プロファイル名 *</Label>
                <Input
                  id="new-profile-name"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="例：綾瀬第2駐車場"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-company-name">会社名 *</Label>
                <Input
                  id="new-company-name"
                  value={newProfile.companyName}
                  onChange={(e) => setNewProfile({ ...newProfile, companyName: e.target.value })}
                  placeholder="ランディット株式会社"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-parking-lot-name">駐車場名 *</Label>
                <Input
                  id="new-parking-lot-name"
                  value={newProfile.parkingLotName}
                  onChange={(e) => setNewProfile({ ...newProfile, parkingLotName: e.target.value })}
                  placeholder="綾瀬第2駐車場"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-phone-number">電話番号</Label>
                <Input
                  id="new-phone-number"
                  value={newProfile.phoneNumber}
                  onChange={(e) => setNewProfile({ ...newProfile, phoneNumber: e.target.value })}
                  placeholder="0120511441"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="new-registration-number">登録番号</Label>
                <Input
                  id="new-registration-number"
                  value={newProfile.registrationNumber}
                  onChange={(e) => setNewProfile({ ...newProfile, registrationNumber: e.target.value })}
                  placeholder="T9011001025282"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddProfile} className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "プロファイルを保存"
                )}
              </Button>
              <Button onClick={() => setIsAddingNew(false)} variant="outline" className="flex-1" disabled={isSaving}>
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {/* Saved Profiles List */}
        {profiles.length > 0 && (
          <div className="space-y-2">
            <Label>保存済みプロファイル</Label>
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.companyName} - {profile.parkingLotName}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteProfile(profile.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
