import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  ChevronDown,
  Users,
  LogOut,
  Plus,
  User
} from "lucide-react";
import { Button } from "../ui/button";

// Mock workspace data
const MOCK_WORKSPACES = [
  { id: "finance-team", name: "Finance Team", members: 5 },
  { id: "research-group", name: "Research Group", members: 3 },
  { id: "quarterly-reporting", name: "Quarterly Reporting", members: 4 },
];

export function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState(MOCK_WORKSPACES[0]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleWorkspaceSelect = (workspace) => {
    setCurrentWorkspace(workspace);
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Get user information from localStorage
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  // Use a default displayName if name is not available
  const displayName = user.name || user.username || "User";
  // Get user initials or default to "U"
  const userInitials = displayName.includes(" ")
    ? displayName.split(" ").map(n => n[0]).join("")
    : displayName[0] || "U";

  return (
    <div className="flex h-16 w-full items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">

        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            className="flex items-center gap-2 pl-2 pr-1"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <span className="font-medium">{currentWorkspace.name}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </Button>

          {showDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-md border bg-card p-2 shadow-lg">
              <div className="mb-1.5 px-2 py-1 text-xs font-medium text-muted-foreground">
                YOUR WORKSPACES
              </div>

              {MOCK_WORKSPACES.map((workspace) => (
                <button
                  key={workspace.id}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary ${workspace.id === currentWorkspace.id ? "bg-secondary" : ""
                    }`}
                  onClick={() => handleWorkspaceSelect(workspace)}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{workspace.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {workspace.members} members
                    </div>
                  </div>
                </button>
              ))}

              <div className="my-1 border-t" />

              <button
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span className="flex-1 text-left font-medium">Create New Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border px-2 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {userInitials}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 