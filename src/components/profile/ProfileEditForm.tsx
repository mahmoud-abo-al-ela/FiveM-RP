import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

interface ProfileEditFormProps {
  formData: {
    display_name: string;
    bio: string;
    in_game_name: string;
  };
  onFormChange: (data: any) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function ProfileEditForm({ formData, onFormChange, onSubmit, isPending }: ProfileEditFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/30 border-white/5">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) =>
                onFormChange({ ...formData, display_name: e.target.value })
              }
              className="bg-background/50 border-white/10"
            />
          </div>

          <div>
            <Label htmlFor="in_game_name">In-Game Name</Label>
            <Input
              id="in_game_name"
              value={formData.in_game_name}
              onChange={(e) =>
                onFormChange({ ...formData, in_game_name: e.target.value })
              }
              className="bg-background/50 border-white/10"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                onFormChange({ ...formData, bio: e.target.value })
              }
              className="bg-background/50 border-white/10 min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
