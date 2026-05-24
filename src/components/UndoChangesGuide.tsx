
import { AlertCircle, ArrowLeft, GitBranch, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UndoChangesGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <RotateCcw className="h-4 w-4" />
          <span>Undo Changes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Undo Changes</DialogTitle>
          <DialogDescription>
            Learn how to revert changes and restore previous versions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Always save your work regularly to create recovery points you can return to.
            </AlertDescription>
          </Alert>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="local-changes">
              <AccordionTrigger>Reverting Unsaved Changes</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">To undo changes that haven't been saved yet:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the browser's back button to return to the previous page</li>
                  <li>Refresh the page to discard all unsaved changes</li>
                  <li>Click "Cancel" in any open editing forms</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="saved-changes">
              <AccordionTrigger>Reverting Saved Changes</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">For changes that have been saved:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the version history feature to view previous versions</li>
                  <li>Select the version you want to restore</li>
                  <li>Click "Restore this version" to revert to that point</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: Version history is only available in professional plans
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="contact-support">
              <AccordionTrigger>Contact Support</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">
                  If you need to restore data or undo major changes, our support team can help:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email: support@hexawinds.com</li>
                  <li>Phone: (555) 123-4567</li>
                  <li>Live chat: Available in the bottom right corner</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button type="button" variant="outline" className="gap-1">
            <GitBranch className="h-4 w-4" />
            View Version History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
  