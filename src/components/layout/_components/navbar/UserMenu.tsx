import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserMenuProps {
  user: any;
  isAdmin: boolean;
  canAccessPublicPages: boolean;
  getDiscordAvatarUrl: () => string | null;
  onSignOut: () => void;
}

export function UserMenu({ 
  user, 
  isAdmin, 
  canAccessPublicPages, 
  getDiscordAvatarUrl, 
  onSignOut 
}: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/50 hover:ring-primary transition-all">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getDiscordAvatarUrl() || undefined} alt={user?.user_metadata?.full_name || user?.email || "User"} />
            <AvatarFallback className="bg-primary text-white">
              {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-md border-white/10" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {isAdmin ? "Administrator" : user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        {canAccessPublicPages && (
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem 
          onClick={onSignOut}
          className="cursor-pointer text-red-400 focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
