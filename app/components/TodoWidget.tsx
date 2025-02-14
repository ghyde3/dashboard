"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Check, Plus, Trash2, Calendar as CalendarIcon, ArrowUpDown, Flag,
  Pencil, Settings, Clock, Star, CalendarDays, ListTodo, CheckCircle2, Circle
} from "lucide-react";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

type SortOption = 'createdAt' | 'dueDate' | 'priority';

const STORAGE_KEY = 'weather-app-todos';
const PRIORITY_COLORS = {
  low: 'text-blue-500',
  medium: 'text-yellow-500',
  high: 'text-red-500'
};

// Utility functions for localStorage
const loadTodos = (): Todo[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
    }));
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
};

const saveTodos = (todos: Todo[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

export function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<Date>();
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDueDate, setEditDueDate] = useState<Date>();
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = loadTodos();
    setTodos(storedTodos);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: newTodo,
      completed: false,
      createdAt: new Date(),
      priority,
      dueDate,
    };

    setTodos([todo, ...todos]);
    setNewTodo("");
    setDueDate(undefined);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const sortTodos = (todosToSort: Todo[]) => {
    return [...todosToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate);
  };

  const saveEdit = () => {
    if (!editingTodo || !editTitle.trim()) return;

    setTodos(todos.map(todo => 
      todo.id === editingTodo.id 
        ? { 
            ...todo, 
            title: editTitle.trim(),
            priority: editPriority,
            dueDate: editDueDate
          } 
        : todo
    ));
    setEditingTodo(null);
  };

  const deleteCompleted = () => {
    const completedCount = todos.filter(todo => todo.completed).length;
    if (completedCount === 0) return;
    
    setTodos(todos.filter(todo => !todo.completed));
    setShowDeleteDialog(false);
  };

  const markAllCompleted = () => {
    const incompleteCount = todos.filter(todo => !todo.completed).length;
    if (incompleteCount === 0) return;
    
    setTodos(todos.map(todo => ({ ...todo, completed: true })));
    setShowCompleteDialog(false);
  };

  const cyclePriority = () => {
    const priorities: ('low' | 'medium' | 'high')[] = ['medium', 'high', 'low'];
    const currentIndex = priorities.indexOf(priority);
    setPriority(priorities[(currentIndex + 1) % 3]);
  };

  return (
    <Card className="col-span-1">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center space-x-2 border rounded-lg px-3 py-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={cyclePriority}
                    className="p-0 h-auto"
                  >
                    <Flag className={cn("h-4 w-4", PRIORITY_COLORS[priority])} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle priority</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
              placeholder="Add a new todo..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              className="border-0 p-0 focus-visible:ring-0"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn("p-0 h-auto", dueDate && "text-primary")}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={addTodo} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const incompleteCount = todos.filter(todo => !todo.completed).length;
                      if (incompleteCount > 0) setShowCompleteDialog(true);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark all completed</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const completedCount = todos.filter(todo => todo.completed).length;
                      if (completedCount > 0) setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete completed</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortBy('createdAt')}
                    className={cn(sortBy === 'createdAt' && "bg-accent")}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sort by creation date</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortBy('priority')}
                    className={cn(sortBy === 'priority' && "bg-accent")}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sort by priority</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortBy('dueDate')}
                    className={cn(sortBy === 'dueDate' && "bg-accent")}
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sort by due date</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={toggleSortDirection}>
                    <ArrowUpDown className={cn(
                      "h-4 w-4 transition-transform",
                      sortDirection === 'desc' && "rotate-180"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle sort direction</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('all')}
                    className={cn(activeTab === 'all' && "bg-accent")}
                  >
                    <ListTodo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>All todos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('active')}
                    className={cn(activeTab === 'active' && "bg-accent")}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Active todos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('completed')}
                    className={cn(activeTab === 'completed' && "bg-accent")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Completed todos</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="space-y-2">
          {sortTodos(
            todos.filter(todo => 
              activeTab === 'all' ? true : 
              activeTab === 'active' ? !todo.completed :
              todo.completed
            )
          ).map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "h-6 w-6 rounded-full",
                    todo.completed && "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {todo.completed && <Check className="h-4 w-4 text-white" />}
                </Button>
                <div className={cn(
                  "flex flex-col",
                  todo.completed && "line-through text-muted-foreground"
                )}>
                  <span className="flex items-center">
                    <Flag className={cn("h-4 w-4 mr-2", PRIORITY_COLORS[todo.priority])} />
                    {todo.title}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-muted-foreground">
                      Due: {format(todo.dueDate, 'PPP')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(todo)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Todo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Todo title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <Select value={editPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setEditPriority(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <span className="flex items-center">
                      <Flag className={cn("h-4 w-4 mr-2", PRIORITY_COLORS.low)} />
                      Low
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center">
                      <Flag className={cn("h-4 w-4 mr-2", PRIORITY_COLORS.medium)} />
                      Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="high">
                    <span className="flex items-center">
                      <Flag className={cn("h-4 w-4 mr-2", PRIORITY_COLORS.high)} />
                      High
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-full justify-start text-left font-normal",
                    !editDueDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editDueDate ? format(editDueDate, 'PPP') : <span>Due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={editDueDate}
                    onSelect={setEditDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingTodo(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Completed Todos</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete all completed todos? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteCompleted}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark All as Completed</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to mark all todos as completed?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={markAllCompleted}>
                Mark All Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 