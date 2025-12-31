"use client";

import { useState } from "react";
import { Nav } from "../components/nav";

// Import all components from @blocksai/ui
import { Button, getButtonClassName } from "@blocksai/ui/button";
import { Badge } from "@blocksai/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@blocksai/ui/card";
import { Input, Textarea } from "@blocksai/ui/input";
import { Checkbox } from "@blocksai/ui/checkbox";
import { Switch } from "@blocksai/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@blocksai/ui/select";
import { RadioGroup, RadioItem } from "@blocksai/ui/radio";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@blocksai/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel
} from "@blocksai/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@blocksai/ui/tooltip";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@blocksai/ui/accordion";
import { Progress } from "@blocksai/ui/progress";
import { Slider } from "@blocksai/ui/slider";
import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem
} from "@blocksai/ui/menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@blocksai/ui/popover";
import { LoadingDots } from "@blocksai/ui/loading-dots";
import { CopyButton } from "@blocksai/ui/copy-button";
import { Banner } from "@blocksai/ui/banner";
import { CodeBlock } from "@blocksai/ui/code-block";

function Section({
  title,
  description,
  children,
  isBaseUI = false
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  isBaseUI?: boolean;
}) {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        <Badge variant={isBaseUI ? "info" : "secondary"} size="sm">
          {isBaseUI ? "Base UI" : "Custom"}
        </Badge>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{description}</p>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        {children}
      </div>
    </section>
  );
}

export default function StyleguidePage() {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState(50);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Nav />

      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Styleguide
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            All components from <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">@blocksai/ui</code>
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">Base UI</Badge>
              <span className="text-slate-600 dark:text-slate-400">Built on Base UI primitives</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" size="sm">Custom</Badge>
              <span className="text-slate-600 dark:text-slate-400">Custom styled components</span>
            </div>
          </div>
        </div>
      </div>

      {/* Components */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Buttons */}
        <Section
          title="Button"
          description="Buttons for actions and navigation. Multiple variants and sizes available."
          isBaseUI={false}
        >
          <div className="space-y-8">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Enabled</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* Badge */}
        <Section
          title="Badge"
          description="Small labels for status, categories, and version indicators."
          isBaseUI={false}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Status Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Version Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="major">major</Badge>
                <Badge variant="minor">minor</Badge>
                <Badge variant="patch">patch</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm">Small</Badge>
                <Badge variant="primary" size="md">Medium</Badge>
                <Badge variant="primary" size="lg">Large</Badge>
              </div>
            </div>
          </div>
        </Section>

        {/* Input */}
        <Section
          title="Input"
          description="Text input fields and text areas for forms."
          isBaseUI={false}
        >
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Text Input
              </label>
              <Input
                placeholder="Enter your name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Disabled Input
              </label>
              <Input placeholder="Disabled" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Textarea
              </label>
              <Textarea placeholder="Write something..." rows={3} />
            </div>
          </div>
        </Section>

        {/* Checkbox */}
        <Section
          title="Checkbox"
          description="Toggle selection for individual options."
          isBaseUI={true}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={checkboxChecked}
              onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
            />
            <span className="text-slate-700 dark:text-slate-300">
              {checkboxChecked ? "Checked" : "Unchecked"}
            </span>
          </div>
        </Section>

        {/* Switch */}
        <Section
          title="Switch"
          description="Toggle for on/off states."
          isBaseUI={true}
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
            <span className="text-slate-700 dark:text-slate-300">
              {switchChecked ? "On" : "Off"}
            </span>
          </div>
        </Section>

        {/* Select */}
        <Section
          title="Select"
          description="Dropdown selection from a list of options."
          isBaseUI={true}
        >
          <div className="max-w-xs">
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* Radio */}
        <Section
          title="Radio Group"
          description="Single selection from multiple options."
          isBaseUI={true}
        >
          <RadioGroup value={radioValue} onValueChange={setRadioValue}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <RadioItem value="option1" />
                <span className="text-slate-700 dark:text-slate-300">Option 1</span>
              </div>
              <div className="flex items-center gap-3">
                <RadioItem value="option2" />
                <span className="text-slate-700 dark:text-slate-300">Option 2</span>
              </div>
              <div className="flex items-center gap-3">
                <RadioItem value="option3" />
                <span className="text-slate-700 dark:text-slate-300">Option 3</span>
              </div>
            </div>
          </RadioGroup>
        </Section>

        {/* Slider */}
        <Section
          title="Slider"
          description="Range input for selecting numeric values."
          isBaseUI={true}
        >
          <div className="max-w-sm space-y-4">
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
            />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Value: {sliderValue}
            </p>
          </div>
        </Section>

        {/* Progress */}
        <Section
          title="Progress"
          description="Visual indicator for task completion."
          isBaseUI={true}
        >
          <div className="space-y-4 max-w-sm">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">25%</p>
              <Progress value={25} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">50%</p>
              <Progress value={50} />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">75%</p>
              <Progress value={75} />
            </div>
          </div>
        </Section>

        {/* Dialog */}
        <Section
          title="Dialog"
          description="Modal dialogs for important interactions."
          isBaseUI={true}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog built on Base UI. It handles focus trapping,
                keyboard navigation, and accessibility automatically.
              </DialogDescription>
              <div className="flex justify-end gap-3 mt-6">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="primary">Confirm</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </Section>

        {/* Tabs */}
        <Section
          title="Tabs"
          description="Organize content into switchable panels."
          isBaseUI={true}
        >
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Account</TabsTrigger>
              <TabsTrigger value="tab2">Settings</TabsTrigger>
              <TabsTrigger value="tab3">Notifications</TabsTrigger>
            </TabsList>
            <TabsPanel value="tab1" className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-600 dark:text-slate-400">Account settings and profile information.</p>
            </TabsPanel>
            <TabsPanel value="tab2" className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-600 dark:text-slate-400">Application preferences and configuration.</p>
            </TabsPanel>
            <TabsPanel value="tab3" className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-slate-600 dark:text-slate-400">Notification preferences and alerts.</p>
            </TabsPanel>
          </Tabs>
        </Section>

        {/* Accordion */}
        <Section
          title="Accordion"
          description="Expandable content sections."
          isBaseUI={true}
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="item1">
              <AccordionTrigger>What is Blocks?</AccordionTrigger>
              <AccordionContent>
                Blocks is a domain-driven validation framework for human-AI collaboration
                with semantic guardrails.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item2">
              <AccordionTrigger>How does validation work?</AccordionTrigger>
              <AccordionContent>
                Blocks uses multi-layer validation: schema validation, shape validation,
                and AI-powered semantic analysis.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item3">
              <AccordionTrigger>Is it production ready?</AccordionTrigger>
              <AccordionContent>
                We are currently in the discovery phase, exploring what Blocks should be
                through practical examples.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        {/* Tooltip */}
        <Section
          title="Tooltip"
          description="Contextual information on hover."
          isBaseUI={true}
        >
          <TooltipProvider>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me (top)</Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Tooltip on top
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Hover me (bottom)</Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Tooltip on bottom
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </Section>

        {/* Menu */}
        <Section
          title="Menu"
          description="Dropdown menus for actions."
          isBaseUI={true}
        >
          <Menu>
            <MenuTrigger asChild>
              <Button variant="outline">
                Open Menu
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem onSelect={() => alert("Edit clicked")}>Edit</MenuItem>
              <MenuItem onSelect={() => alert("Duplicate clicked")}>Duplicate</MenuItem>
              <MenuItem onSelect={() => alert("Delete clicked")}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </Section>

        {/* Popover */}
        <Section
          title="Popover"
          description="Floating content triggered by click."
          isBaseUI={true}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-900 dark:text-white">Popover Title</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  This is a popover with some content. It can contain any elements.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </Section>

        {/* Card */}
        <Section
          title="Card"
          description="Container for related content."
          isBaseUI={false}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader
                title="Feature Card"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              <CardContent>
                Cards can contain headers, content, and footers for structured layouts.
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm">Learn More</Button>
              </CardFooter>
            </Card>
            <Card hover>
              <CardHeader title="Hoverable Card" />
              <CardContent>
                This card has a hover effect. Add the hover prop to enable it.
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Banner */}
        <Section
          title="Banner"
          description="Attention-grabbing announcements."
          isBaseUI={false}
        >
          <div className="space-y-4">
            <Banner variant="info">
              This is an informational banner.
            </Banner>
            <Banner variant="success">
              Success! Your changes have been saved.
            </Banner>
            <Banner variant="warning">
              Warning: This action cannot be undone.
            </Banner>
            <Banner variant="error">
              Error: Something went wrong.
            </Banner>
          </div>
        </Section>

        {/* LoadingDots */}
        <Section
          title="Loading Dots"
          description="Animated loading indicator."
          isBaseUI={false}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-slate-500 mb-2">Small</p>
                <LoadingDots size="sm" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Medium</p>
                <LoadingDots size="md" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Large</p>
                <LoadingDots size="lg" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">With Label</p>
              <LoadingDots label="Loading..." />
            </div>
          </div>
        </Section>

        {/* CopyButton */}
        <Section
          title="Copy Button"
          description="Click to copy text to clipboard."
          isBaseUI={false}
        >
          <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-md">
            <code className="flex-1 text-sm">npm install @blocksai/cli</code>
            <CopyButton text="npm install @blocksai/cli" />
          </div>
        </Section>

        {/* CodeBlock */}
        <Section
          title="Code Block"
          description="Syntax-highlighted code display with copy button."
          isBaseUI={false}
        >
          <CodeBlock
            code={`import { Button } from "@blocksai/ui/button";

export function MyComponent() {
  return (
    <Button variant="primary">
      Click me
    </Button>
  );
}`}
            language="tsx"
          />
        </Section>

      </div>
    </div>
  );
}
