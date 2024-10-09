"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"

const settingsFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  siteDescription: z.string().max(500, {
    message: "Site description must not be longer than 500 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  enableNotifications: z.boolean().default(false),
  analyticsId: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

const defaultValues: Partial<SettingsFormValues> = {
  siteName: "Maksab Admin",
  siteDescription: "Admin dashboard for Maksab application",
  contactEmail: "admin@maksab.site",
  enableNotifications: true,
}

export function SettingsForm() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  })

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: "Settings updated",
      description: "Your settings have been updated successfully.",
    })
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="Maksab Admin" {...field} />
              </FormControl>
              <FormDescription>
                This is the name that will be displayed in the browser tab and various places throughout the admin panel.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Admin dashboard for Maksab application"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This description will be used for SEO purposes and may appear in search results.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input placeholder="admin@maksab.site" {...field} />
              </FormControl>
              <FormDescription>
                This email will be used for system notifications and user support inquiries.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enableNotifications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Enable Notifications
                </FormLabel>
                <FormDescription>
                  Receive notifications about important system events and user activities.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="analyticsId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analytics ID</FormLabel>
              <FormControl>
                <Input placeholder="UA-XXXXXXXXX-X" {...field} />
              </FormControl>
              <FormDescription>
                Enter your Google Analytics tracking ID to enable website analytics.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
}