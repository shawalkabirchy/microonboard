"use client";

import { useState } from "react";
import {
  Folder,
  CheckSquare,
  Users,
  Settings,
  Plus,
  Search,
  ArrowUpRight,
  Globe,
  Palette,
  Smartphone,
  Layers,
  Check,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

const initialProjects = [
  {
    name: "Website refresh",
    description: "A fresh home for our next chapter.",
    tag: "Marketing",
    updated: "2 days ago",
    icon: Globe,
    color: "violet",
  },
  {
    name: "Brand guidelines",
    description: "A single source of truth for our brand.",
    tag: "Design",
    updated: "5 days ago",
    icon: Palette,
    color: "green",
  },
  {
    name: "Mobile experience",
    description: "Thoughtful details. A smaller screen.",
    tag: "Product",
    updated: "1 week ago",
    icon: Smartphone,
    color: "orange",
  },
];
const navigation = [
  { id: "projects", label: "Projects", icon: Folder },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "team", label: "Team", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Workspace() {
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"project" | "invite" | null>(null);
  const [name, setName] = useState("");
  const [team, setTeam] = useState([
    "Jamie Davis",
    "Alex Morgan",
    "Sam Taylor",
  ]);
  const [workspaceName, setWorkspaceName] = useState("Acme Studio");
  const [message, setMessage] = useState("");
  const [tasks, setTasks] = useState([false, true, false]);
  const [opened, setOpened] = useState<string | null>(null);
  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  function openModal(value: "project" | "invite") {
    setName("");
    setModal(value);
  }
  return (
    <div className="workspace">
      <div className="workspace-top">
        <div className="workspace-wordmark">
          <Layers aria-hidden="true" />
          <span>{workspaceName}</span>
        </div>
        {tab === "projects" ? (
          <div className="workspace-search">
            <Search aria-hidden="true" />
            <Input
              aria-label="Search projects"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a project…"
            />
          </div>
        ) : null}
        <div className="workspace-person" aria-label="Sample user Jamie Davis">
          JD
        </div>
      </div>
      <div className="workspace-body">
        <nav
          className="workspace-sidebar"
          aria-label="Example workspace navigation"
        >
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              data-tour-id={id}
              aria-label={label}
              className={cn("workspace-nav-item", tab === id && "is-active")}
              aria-pressed={tab === id}
              onClick={() => {
                setTab(id);
                setMessage("");
              }}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
          <div className="workspace-sidebar-bottom">
            <span className="mini-avatar">JD</span>
            <div>
              <strong>Jamie Davis</strong>
              <small>Sample workspace</small>
            </div>
          </div>
        </nav>
        <div className="workspace-main">
          <div className="workspace-heading">
            <div>
              <h2>
                {tab === "projects"
                  ? "Your projects"
                  : tab === "tasks"
                    ? "A little focus goes a long way."
                    : tab === "team"
                      ? "Good work starts with good people."
                      : "Make yourself at home."}
              </h2>
              <p>
                {tab === "projects"
                  ? "Good ideas deserve a place to grow."
                  : "An interactive example. Nothing is sent to a server."}
              </p>
            </div>
            <div className="workspace-header-actions">
              <Button
                variant="outline"
                size="icon-lg"
                data-tour-id="invite"
                aria-label="Invite teammate"
                onClick={() => openModal("invite")}
              >
                <UserPlus />
              </Button>
              <Button
                data-tour-id="new-project"
                onClick={() => openModal("project")}
              >
                <Plus data-icon="inline-start" />
                New project
              </Button>
            </div>
          </div>
          {message ? (
            <p className="workspace-message" role="status">
              <Check aria-hidden="true" />
              {message}
            </p>
          ) : null}
          {tab === "projects" ? (
            <>
              <div className="project-table">
                <div className="project-table-heading">
                  <span>Project</span>
                  <span>Last updated</span>
                </div>
                {filtered.map((project, index) => (
                  <button
                    type="button"
                    className="project-row"
                    key={`${project.name}-${index}`}
                    onClick={() => setOpened(project.name)}
                  >
                    <span
                      className={cn(
                        "project-icon",
                        `project-icon-${project.color}`,
                      )}
                    >
                      <project.icon aria-hidden="true" />
                    </span>
                    <span className="project-info">
                      <strong>{project.name}</strong>
                      <small>{project.description}</small>
                    </span>
                    <span className="project-updated">{project.updated}</span>
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                ))}
                {!filtered.length ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No matching projects</EmptyTitle>
                      <EmptyDescription>
                        Try another name or create a new sample project.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : null}
              </div>
              <div className="workspace-tip">
                <span className="tip-dot" />A fresh space for your team&apos;s
                next big thing.
              </div>
            </>
          ) : null}
          {tab === "tasks" ? (
            <div className="task-list">
              {[
                "Explore the project workspace",
                "Bring the first idea to life",
                "Share a little progress with the team",
              ].map((task, index) => (
                <label key={task} className="task-row">
                  <input
                    type="checkbox"
                    checked={tasks[index]}
                    onChange={() =>
                      setTasks((current) =>
                        current.map((value, i) =>
                          i === index ? !value : value,
                        ),
                      )
                    }
                  />
                  <span>{task}</span>
                </label>
              ))}
            </div>
          ) : null}
          {tab === "team" ? (
            <div className="team-list">
              {team.map((person, index) => (
                <div className="team-row" key={`${person}-${index}`}>
                  <span className="mini-avatar">
                    {person
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <strong>{person}</strong>
                  <span>Sample member</span>
                </div>
              ))}
            </div>
          ) : null}
          {tab === "settings" ? (
            <form
              className="workspace-settings"
              onSubmit={(event) => {
                event.preventDefault();
                setMessage("Workspace name updated for this example session.");
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="workspace-name">
                    Workspace name
                  </FieldLabel>
                  <Input
                    id="workspace-name"
                    maxLength={80}
                    required
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                  />
                </Field>
                <Button type="submit">Save workspace name</Button>
              </FieldGroup>
            </form>
          ) : null}
        </div>
      </div>
      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) setModal(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === "project"
                ? "A new idea starts here"
                : "Bring someone along"}
            </DialogTitle>
            <DialogDescription>
              {modal === "project"
                ? "Create a sample project in this browser session."
                : "Add a sample teammate. No invitation or email is sent."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim()) return;
              if (modal === "project") {
                setProjects((current) => [
                  ...current,
                  {
                    name: name.trim(),
                    description: "Ready for your next great idea.",
                    tag: "New",
                    updated: "Just now",
                    icon: Folder,
                    color: "violet",
                  },
                ]);
                setTab("projects");
                setMessage("Sample project created.");
              } else {
                setTeam((current) => [...current, name.trim()]);
                setTab("team");
                setMessage("Sample teammate added. No invitation was sent.");
              }
              setModal(null);
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sample-name">
                  {modal === "project" ? "Project name" : "Teammate name"}
                </FieldLabel>
                <Input
                  id="sample-name"
                  autoComplete="off"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={
                    modal === "project"
                      ? "Something worth making"
                      : "Avery Chen"
                  }
                />
              </Field>
              <DialogFooter>
                <Button type="submit">
                  {modal === "project"
                    ? "Create sample project"
                    : "Add sample teammate"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{opened}</DialogTitle>
            <DialogDescription>
              This sample project is ready for its next chapter. Open Tasks to
              try the example checklist, or create another project.
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              setTab("tasks");
              setOpened(null);
            }}
          >
            View tasks
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
