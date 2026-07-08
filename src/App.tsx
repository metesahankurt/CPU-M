import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>CPU-M</CardTitle>
          <CardDescription>Design system smoke test</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>It works</Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
