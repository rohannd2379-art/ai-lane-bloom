import { LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AppSidebarProps {
  onToggleChat: () => void;
  chatOpen: boolean;
}

const AppSidebar = ({ onToggleChat, chatOpen }: AppSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="w-[72px] h-screen bg-sidebar flex flex-col items-center py-6 gap-2 shrink-0">
      {/* Logo */}
      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center mb-6">
        <LayoutDashboard className="w-5 h-5 text-sidebar-primary-foreground" />
      </div>

      {/* Nav items */}
      <NavItem
        icon={LayoutDashboard}
        label="Board"
        active={!chatOpen}
        onClick={() => {
          if (chatOpen) onToggleChat();
        }}
      />
      <NavItem
        icon={MessageSquare}
        label="AI Chat"
        active={chatOpen}
        onClick={onToggleChat}
      />

      <div className="flex-1" />

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-11 h-11 rounded-xl flex items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        title="Sign out"
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground mt-2">
        {initials}
      </div>
    </div>
  );
};

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
          : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

export default AppSidebar;
