"use client"

import { useState } from "react"
import { Organization } from "@clerk/nextjs/server"
import { useRouter } from "next/navigation"
import { updateOrganization } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getNames } from "country-list"
import currencyCodes from "currency-codes"

type OrganizationViewProps = {
  organization: {
    id: string;
    name: string | null;
    slug: string | null;
    maxAllowedMemberships: number | null;
    publicMetadata: Record<string, unknown>;
    privateMetadata: Record<string, unknown>;
  }
}

type SubscriptionPlan = "free" | "economic" | "premium" | "vip"

export default function OrganizationView({ organization }: OrganizationViewProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(organization.name ?? "")
  const [slug, setSlug] = useState(organization.slug ?? "")
  const [maxAllowedMemberships, setMaxAllowedMemberships] = useState(organization.maxAllowedMemberships || 5)
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>(
    (organization.publicMetadata?.subscriptionPlan as SubscriptionPlan) || "free"
  )
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | undefined>(
    organization.publicMetadata?.subscriptionEndDate
      ? new Date(organization.publicMetadata.subscriptionEndDate as string)
      : undefined
  )
  const [nif, setNif] = useState((organization.publicMetadata?.nif as string) || "")
  const [email, setEmail] = useState((organization.publicMetadata?.email as string) || "")
  const [address, setAddress] = useState((organization.publicMetadata?.address as string) || "")
  const [country, setCountry] = useState((organization.publicMetadata?.country as string) || "")
  const [currency, setCurrency] = useState((organization.publicMetadata?.currency as string) || "")
  const [onboarding, setOnboarding] = useState((organization.publicMetadata?.onboarding as boolean) || false)
  const [hasHadFreeTrial, setHasHadFreeTrial] = useState(
    (organization.privateMetadata?.hasHadFreeTrial as boolean) || false
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError(null)

    try {
      await updateOrganization({
        organizationId: organization.id,
        name,
        slug,
        maxAllowedMemberships,
        publicMetadata: {
          subscriptionPlan,
          subscriptionEndDate: subscriptionEndDate?.toISOString() ?? null,
          nif,
          email,
          address,
          country,
          currency,
          onboarding,
        },
        privateMetadata: {
          hasHadFreeTrial,
        },
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating organization:", error)
      setError("Failed to update organization. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const countries = getNames().map((name, index) => ({ name, code: Object.keys(getNames())[index] }))
  const currencies = currencyCodes.codes().map(code => ({
    code,
    name: currencyCodes.code(code)?.currency ?? code,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Organization Details</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
        </div>
        <div>
          <Label htmlFor="maxAllowedMemberships">Max Allowed Memberships</Label>
          <Input
            id="maxAllowedMemberships"
            type="number"
            min="1"
            max="5"
            value={maxAllowedMemberships}
            onChange={(e) => setMaxAllowedMemberships(parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Subscription</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subscriptionPlan">Plan</Label>
            <Select value={subscriptionPlan} onValueChange={(value: SubscriptionPlan) => setSubscriptionPlan(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="economic">Economic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {subscriptionPlan !== "vip" && (
            <div>
              <Label htmlFor="subscriptionEndDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !subscriptionEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionEndDate ? format(subscriptionEndDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={subscriptionEndDate}
                    onSelect={setSubscriptionEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Public Metadata</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nif">NIF</Label>
            <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="onboarding" checked={onboarding} onCheckedChange={setOnboarding} />
            <Label htmlFor="onboarding">Onboarding Complete</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Private Metadata</h2>
        <div className="flex items-center space-x-2">
          <Switch id="hasHadFreeTrial" checked={hasHadFreeTrial} onCheckedChange={setHasHadFreeTrial} />
          <Label htmlFor="hasHadFreeTrial">Has Had Free Trial</Label>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Organization"}
      </Button>
    </form>
  )
}