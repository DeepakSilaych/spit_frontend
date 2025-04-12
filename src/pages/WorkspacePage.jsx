import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  MessageSquare,
  Upload,
  Clock,
  User,
  Users,
  FileText,
  Plus,
  UserPlus
} from "lucide-react";

// Mock workspace data
const MOCK_WORKSPACES = [
  { id: "finance-team", name: "Finance Team", members: 5 },
  { id: "research-group", name: "Research Group", members: 3 },
  { id: "quarterly-reporting", name: "Quarterly Reporting", members: 4 },
];

// Mock data for a single workspace
const getMockWorkspace = (id) => {
  return {
    id,
    name: MOCK_WORKSPACES.find(w => w.id === id)?.name || "Workspace",
    members: [
      { id: 1, name: "John Doe", email: "john@example.com", avatar: "JD" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: "JS" },
      { id: 3, name: "Robert Johnson", email: "robert@example.com", avatar: "RJ" },
      { id: 4, name: "Emily Davis", email: "emily@example.com", avatar: "ED" },
    ],
    activity: [
      { id: 1, type: "chat", user: "John Doe", content: "Created chat about Q3 financial forecast", time: "2 hours ago" },
      { id: 2, type: "upload", user: "Jane Smith", content: "Uploaded Q3 earnings report", time: "Yesterday" },
      { id: 3, type: "chat", user: "Robert Johnson", content: "Added comment on market analysis", time: "2 days ago" },
    ],
  };
};

// Activity item component
const ActivityItem = ({ item }) => {
  const icons = {
    chat: <MessageSquare className="h-4 w-4" />,
    upload: <Upload className="h-4 w-4" />,
    comment: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="flex items-start gap-3 rounded-md p-3 hover:bg-secondary/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icons[item.type]}
      </div>
      <div className="flex-1">
        <p className="font-medium">{item.user}</p>
        <p className="text-sm text-muted-foreground">{item.content}</p>
        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {item.time}
        </p>
      </div>
    </div>
  );
};

// Member item component
const MemberItem = ({ member }) => {
  return (
    <div className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {member.avatar}
      </div>
      <div className="flex-1">
        <p className="font-medium">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.email}</p>
      </div>
    </div>
  );
};

export function WorkspacePage() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(getMockWorkspace(workspaceId || "finance-team"));
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Mock adding a new member
    const newMember = {
      id: workspace.members.length + 1,
      name: "New User",
      email: inviteEmail,
      avatar: "NU",
    };

    setWorkspace({
      ...workspace,
      members: [...workspace.members, newMember],
    });

    setInviteEmail("");
    setShowInvite(false);
  };

  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-muted-foreground">
            {workspace.members.length} members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowInvite(!showInvite)}
          >
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
          <Button className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Start Group Chat
          </Button>
        </div>
      </div>

      {showInvite && (
        <div className="mb-6 rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Invite User</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
            <Button type="submit">Invite</Button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Workspaces list */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Workspaces</h2>
          <div className="space-y-2">
            {MOCK_WORKSPACES.map((ws) => (
              <Link
                key={ws.id}
                to={`/workspace/${ws.id}`}
                className={`flex items-center justify-between rounded-md p-2 ${ws.id === (workspaceId || "finance-team")
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{ws.name}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" /> {ws.members}
                </span>
              </Link>
            ))}
            <Button variant="ghost" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {workspace.activity.map((activity) => (
              <ActivityItem key={activity.id} item={activity} />
            ))}
          </div>
        </div>

        {/* Members list */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Members</h2>
          <div className="space-y-2">
            {workspace.members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 