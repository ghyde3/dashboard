"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, Pencil, Trash, Maximize2, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [dialogNote, setDialogNote] = useState<Note | null>(null);
  const [isDialogEditing, setIsDialogEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem("dashboard-notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem("dashboard-notes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
    };

    saveNotes([note, ...notes]);
    setNewNote({ title: "", content: "" });
    setIsDialogOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotes(updatedNotes);
    if (expandedNoteId === id) setExpandedNoteId(null);
    setIsDialogOpen(false);
  };

  const handleDialogEdit = () => {
    if (!dialogNote || !newNote.title || !newNote.content) return;

    const updatedNotes = notes.map((note) =>
      note.id === dialogNote.id
        ? {
            ...note,
            title: newNote.title,
            content: newNote.content,
          }
        : note
    );

    saveNotes(updatedNotes);
    setNewNote({ title: "", content: "" });
    setIsDialogEditing(false);
    setDialogNote(updatedNotes.find((note) => note.id === dialogNote.id) || null);
  };

  const openNewNoteDialog = () => {
    setDialogNote(null);
    setNewNote({ title: "", content: "" });
    setIsDialogEditing(true);
    setIsDialogOpen(true);
  };

  const openNoteDialog = (note: Note) => {
    setDialogNote(note);
    setIsDialogEditing(false);
    setNewNote({ title: note.title, content: note.content });
    setIsDialogOpen(true);
  };

  const toggleNoteExpansion = (id: string) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Notes</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={openNewNoteDialog}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-start justify-between pb-4">
              <DialogTitle className="flex-1">
                {!isDialogEditing && dialogNote ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold">{dialogNote.title}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDialogEditing(true)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNote(dialogNote.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <Input
                    value={newNote.title}
                    onChange={(e) =>
                      setNewNote({ ...newNote, title: e.target.value })
                    }
                    placeholder="Note Title"
                    className="text-xl"
                  />
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {isDialogEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={newNote.content}
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
                    placeholder="Write your note in markdown..."
                    className="min-h-[50vh]"
                  />
                  <div className="flex justify-end gap-2 py-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (dialogNote) {
                          setIsDialogEditing(false);
                          setNewNote({
                            title: dialogNote.title,
                            content: dialogNote.content,
                          });
                        } else {
                          setIsDialogOpen(false);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={dialogNote ? handleDialogEdit : handleCreateNote}>
                      {dialogNote ? "Save Changes" : "Create Note"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-code:text-blue-600 prose-pre:bg-gray-800 prose-pre:text-gray-100 dark:prose-a:text-blue-400 dark:prose-code:text-blue-400">
                    <ReactMarkdown>{dialogNote?.content || ""}</ReactMarkdown>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last updated: {dialogNote?.createdAt ? new Date(dialogNote.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border rounded-lg p-3 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    {expandedNoteId === note.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <h3 className="font-medium">{note.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8"
                      onClick={() => openNoteDialog(note)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8"
                      onClick={() => {
                        openNoteDialog(note);
                        setIsDialogEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 h-8 w-8"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {expandedNoteId === note.id && (
                  <>
                    <div className="prose prose-sm dark:prose-invert mt-2 pl-6">
                      <ReactMarkdown>{note.content}</ReactMarkdown>
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 