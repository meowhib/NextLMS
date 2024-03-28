import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default function CoursesPage({
  params: { slug },
}: {
  params: {
    slug: string;
  };
}) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="flex-none col-span-4 space-y-4 rounded-lg">
          <AspectRatio
            ratio={16 / 9}
            className="bg-muted rounded-lg bg-gray-500"
          ></AspectRatio>
          <h1 className="text-3xl font-semibold">{slug}</h1>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Notes:</h1>
            <Textarea className="w-full" />
          </div>
        </div>
        <div className="p-2 col-span-2 bg-gray-100 rounded-lg max-h-lvh relative">
          <ScrollArea className="flex-1 bg-white rounded-lg h-full fixed">
            <Accordion type="single" collapsible>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
                (item, index) => (
                  <AccordionItem
                    key={item}
                    value={item.toString()}
                    className="px-4"
                  >
                    <AccordionTrigger>Is it accessible?</AccordionTrigger>
                    <AccordionContent>
                      {[1, 2, 3, 4, 5].map((item, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardDescription>Card Description</CardDescription>
                          </CardHeader>
                        </Card>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </ScrollArea>
        </div>
      </div>
    </main>
  );
}
