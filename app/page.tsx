import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherWidget } from "./components/WeatherWidget";

export default function Home() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Calendar Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Calendar widget coming soon...</p>
          </CardContent>
        </Card>

        {/* Todo Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Todo List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Todo list coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
