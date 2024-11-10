'use client'

import { useState } from 'react'
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
import { toast } from "@/hooks/use-toast"
import { BankDetails, updateBankDetails } from './actions'

const bankDetailsSchema = z.object({
    iban: z.string().min(1, "IBAN is required"),
    bankName: z.string().min(1, "Bank name is required"),
    swiftCode: z.string().min(8, "SWIFT code must be at least 8 characters"),
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    branchAddress: z.string().min(1, "Branch address is required"),
})

type SettingsFormValues = z.infer<typeof bankDetailsSchema>

interface SettingsFormProps {
    initialData: BankDetails
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(bankDetailsSchema),
        defaultValues: initialData,
    })

    async function onSubmit(data: SettingsFormValues) {
        setIsLoading(true)
        try {
            await updateBankDetails(data)
            toast({
                title: "Settings updated",
                description: "Your bank details have been updated successfully.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update bank details. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Algeria National Bank" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the full name of the bank.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="swiftCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SWIFT Code</FormLabel>
                            <FormControl>
                                <Input placeholder="ALGBNK123" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the SWIFT (BIC) code of the bank.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="accountName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Maksab Ltd." {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the name associated with the bank account.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                                <Input placeholder="123456789" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the bank account number.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="branchAddress"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Banking Street, Algiers, Algeria" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the address of the bank branch.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                </Button>
            </form>
        </Form>
    )
}