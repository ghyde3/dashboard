import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherWidget } from "./components/WeatherWidget";
import { CalendarWidget } from "./components/CalendarWidget";
import { TodoWidget } from "./components/TodoWidget";

export default function Home() {
  return (
    <main className="p-8 space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Calendar Widget */}
        <CalendarWidget />

        {/* Todo Widget */}
        <TodoWidget />
      </div>
    </main>
  );
}
